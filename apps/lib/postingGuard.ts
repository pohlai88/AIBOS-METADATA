/**
 * Posting Guard - The "IFRS Police"
 * 
 * Validates journal entries before posting to ensure:
 * 1. Basic accounting invariants (debits = credits)
 * 2. Standard pack exists and is ACTIVE
 * 3. Tier 1/2 finance accounts have LAW-level pack anchors
 * 4. Builds mdm_snapshot for journal_lines (time-travel capability)
 * 
 * This ensures the ledger literally cannot escape IFRS.
 */

import { sql } from './db';
import { metadataService } from './metadataService';

/**
 * Journal Entry Type
 */
export type JournalEntry = {
  id: string;
  tenantId: string;
  postingDate: string; // ISO date string
  soTPackId: string | null;
  lines: JournalLine[];
  description?: string;
  journalNumber?: string;
};

/**
 * Journal Line Type
 */
export type JournalLine = {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
  lineNumber?: number;
};

/**
 * Account Row Type
 */
export type AccountRow = {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  mdm_concept_id: string | null;
  governance_tier: number | null;
};

/**
 * Metadata Snapshot (stored in journal_lines.mdm_snapshot)
 */
export type MetadataSnapshot = {
  concept_key: string | null;
  standard_pack: string | null;
  standard_ref: string | null;
  governance_tier: number;
  validated_at: string; // ISO timestamp
};

/**
 * Validation Result
 */
export type ValidationResult = {
  valid: boolean;
  snapshots: Record<string, MetadataSnapshot>;
  errors: string[];
  warnings: string[];
};

/**
 * Use the main MetadataService which now includes these helper methods
 */

/**
 * Posting Guard - Validates journal before posting
 * 
 * This is the critical path that ensures IFRS compliance.
 */
export async function validateJournalBeforePost(
  journal: JournalEntry
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const snapshots: Record<string, MetadataSnapshot> = {};

  // ===========================================
  // 1. Basic Accounting Invariants
  // ===========================================

  const totalDebit = journal.lines.reduce((s, l) => s + (l.debit ?? 0), 0);
  const totalCredit = journal.lines.reduce((s, l) => s + (l.credit ?? 0), 0);

  // Round to 2 decimal places for comparison
  const roundedDebit = Math.round(totalDebit * 100) / 100;
  const roundedCredit = Math.round(totalCredit * 100) / 100;

  if (roundedDebit !== roundedCredit) {
    errors.push(
      `PostingGuard: Debits (${roundedDebit}) do not equal credits (${roundedCredit})`
    );
  }

  // Check for zero lines
  if (journal.lines.length === 0) {
    errors.push('PostingGuard: Journal entry has no lines');
  }

  // Check each line has either debit or credit (not both, not neither)
  for (const line of journal.lines) {
    const hasDebit = (line.debit ?? 0) > 0;
    const hasCredit = (line.credit ?? 0) > 0;
    
    if (hasDebit && hasCredit) {
      errors.push(
        `PostingGuard: Journal line ${line.id} has both debit and credit`
      );
    }
    if (!hasDebit && !hasCredit) {
      errors.push(
        `PostingGuard: Journal line ${line.id} has neither debit nor credit`
      );
    }
  }

  // ===========================================
  // 2. Standard Pack Check
  // ===========================================

  if (!journal.soTPackId) {
    errors.push(
      'PostingGuard: so_t_pack_id is required for all journal entries. ' +
      'Every journal must state which IFRS/MFRS law governs it.'
    );
  } else {
    const pack = await metadataService.getStandardPackById(journal.soTPackId);
    
    if (!pack) {
      errors.push(
        `PostingGuard: Standard pack ${journal.soTPackId} not found`
      );
    } else {
      if (pack.status !== 'ACTIVE') {
        errors.push(
          `PostingGuard: Standard pack ${pack.code} is not ACTIVE (status=${pack.status})`
        );
      }
    }
  }

  // ===========================================
  // 3. Load Accounts Used in This Journal
  // ===========================================

  const accountIds = [...new Set(journal.lines.map((l) => l.accountId))];

  if (accountIds.length === 0) {
    errors.push('PostingGuard: No account IDs found in journal lines');
  }

  const accounts = await sql<AccountRow[]>`
    SELECT 
      id, 
      tenant_id, 
      code, 
      name, 
      mdm_concept_id, 
      governance_tier
    FROM accounts
    WHERE id = ANY(${accountIds}::uuid[])
      AND tenant_id = ${journal.tenantId}::uuid
  `;

  const accountById = new Map(accounts.map((a) => [a.id, a]));

  // Check all accounts exist
  for (const accountId of accountIds) {
    if (!accountById.has(accountId)) {
      errors.push(
        `PostingGuard: Account ${accountId} not found or does not belong to tenant ${journal.tenantId}`
      );
    }
  }

  // ===========================================
  // 4. Tier 1/2 Accounts: Ensure LAW-Level Pack Anchors
  // ===========================================

  for (const line of journal.lines) {
    const acc = accountById.get(line.accountId);
    
    if (!acc) {
      // Already reported above
      continue;
    }

    const tier = acc.governance_tier ?? 3;
    const now = new Date().toISOString();

    // For Tier 1/2 accounts: enforce concept and LAW-level pack
    if (tier <= 2) {
      if (!acc.mdm_concept_id) {
        errors.push(
          `PostingGuard: Tier ${tier} finance account ${acc.code} / ${acc.name} ` +
          `has no mdm_concept_id. Tier 1/2 accounts must be anchored to a canonical concept.`
        );
        
        // Still create a snapshot (with error info)
        snapshots[line.id] = {
          concept_key: null,
          standard_pack: null,
          standard_ref: null,
          governance_tier: tier,
          validated_at: now,
        };
      } else {
        const concept = await metadataService.getConceptById(acc.mdm_concept_id);
        
        if (!concept) {
          errors.push(
            `PostingGuard: mdm_concept ${acc.mdm_concept_id} not found for account ${acc.code}`
          );
          
          snapshots[line.id] = {
            concept_key: null,
            standard_pack: null,
            standard_ref: null,
            governance_tier: tier,
            validated_at: now,
          };
        } else {
          // Ensure LAW-level pack for Tier 1/2 finance concepts
          if (concept.authority_level && concept.authority_level !== 'LAW') {
            errors.push(
              `PostingGuard: Tier ${tier} finance account ${acc.code} is anchored to ` +
              `non-LAW pack ${concept.pack_code} (authority_level=${concept.authority_level}). ` +
              `Tier 1/2 finance accounts must use LAW-level standard packs (IFRS/MFRS).`
            );
          }

          // Build snapshot for this journal line
          snapshots[line.id] = {
            concept_key: concept.canonical_key,
            standard_pack: concept.pack_code,
            standard_ref: concept.standard_ref,
            governance_tier: tier,
            validated_at: now,
          };
        }
      }
    } else {
      // For Tier 3+ accounts: looser requirements (still record snapshot)
      snapshots[line.id] = {
        concept_key: acc.mdm_concept_id ? 'unknown' : null,
        standard_pack: null,
        standard_ref: null,
        governance_tier: tier,
        validated_at: now,
      };
    }
  }

  // ===========================================
  // 5. Return Result
  // ===========================================

  return {
    valid: errors.length === 0,
    snapshots,
    errors,
    warnings,
  };
}

/**
 * Post Journal Entry (with PostingGuard)
 * 
 * This is the main entry point for posting journals.
 * It validates using PostingGuard before committing to database.
 */
export async function postJournal(
  journal: JournalEntry
): Promise<{ status: string; journalId: string; errors?: string[] }> {
  // 1. Run metadata + accounting guard
  const validation = await validateJournalBeforePost(journal);

  if (!validation.valid) {
    return {
      status: 'rejected',
      journalId: journal.id,
      errors: validation.errors,
    };
  }

  // 2. Persist journal + lines in a transaction
  try {
    await sql.begin(async (tx) => {
      // Insert journal entry
      await tx`
        INSERT INTO journal_entries (
          id, 
          tenant_id, 
          journal_number,
          posting_date, 
          description,
          so_t_pack_id,
          status,
          created_by
        )
        VALUES (
          ${journal.id}::uuid,
          ${journal.tenantId}::uuid,
          ${journal.journalNumber || `JE-${Date.now()}`},
          ${journal.postingDate}::date,
          ${journal.description || null},
          ${journal.soTPackId ? journal.soTPackId::uuid : null},
          'POSTED',
          null
        )
      `;

      // Insert journal lines with metadata snapshots
      for (const line of journal.lines) {
        await tx`
          INSERT INTO journal_lines (
            id,
            journal_id,
            account_id,
            debit,
            credit,
            description,
            line_number,
            mdm_snapshot
          )
          VALUES (
            ${line.id}::uuid,
            ${journal.id}::uuid,
            ${line.accountId}::uuid,
            ${line.debit || 0},
            ${line.credit || 0},
            ${line.description || null},
            ${line.lineNumber || 0},
            ${JSON.stringify(validation.snapshots[line.id] ?? {})}::jsonb
          )
        `;
      }
    });

    return {
      status: 'posted',
      journalId: journal.id,
    };
  } catch (error: any) {
    return {
      status: 'error',
      journalId: journal.id,
      errors: [error.message || 'Unknown error during posting'],
    };
  }
}

