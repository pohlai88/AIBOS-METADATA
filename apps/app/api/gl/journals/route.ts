/**
 * GL Journals API Handler
 * 
 * Handles journal posting with code-to-ID resolution and PostingGuard validation.
 * 
 * This endpoint:
 * 1. Resolves soTPackCode → so_t_pack_id (UUID)
 * 2. Resolves accountCode → account_id (UUID)
 * 3. Runs PostingGuard validation
 * 4. Posts journal with metadata snapshots
 * 
 * Route: POST /api/gl/journals
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../lib/db';
import { postJournal, validateJournalBeforePost, type JournalEntry } from '../../../../lib/postingGuard';
import { randomUUID } from 'crypto';

/**
 * Journal Draft Payload (from agent)
 * 
 * Agents send codes (strings) not IDs (UUIDs).
 * Backend resolves codes → IDs before validation.
 */
type JournalDraftPayload = {
  tenantId: string;
  soTPackCode: string;  // e.g., "IFRS_CORE", "IAS_21_FX"
  postingDate: string;  // ISO date: "2025-01-31"
  description?: string;
  journalNumber?: string;
  lines: {
    id?: string;
    accountCode: string;  // e.g., "4000", "1300"
    debit: number;
    credit: number;
    businessTerm?: string;  // e.g., "Revenue", "Inventory Cost"
    description?: string;
    lineNumber?: number;
  }[];
};

/**
 * POST /api/gl/journals
 * 
 * Post a journal entry with code-to-ID resolution.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as JournalDraftPayload;

    // ===========================================
    // 1. Resolve pack code → id
    // ===========================================

    const packRows = await sql`
      SELECT id, code, status, authority_level
      FROM mdm_standard_pack
      WHERE code = ${payload.soTPackCode}
      LIMIT 1
    `;

    if (!packRows || packRows.length === 0) {
      return NextResponse.json(
        {
          status: 'rejected',
          journalId: null,
          errors: [`Unknown standard pack code: ${payload.soTPackCode}`],
        },
        { status: 400 }
      );
    }

    const pack = packRows[0] as { id: string; code: string; status: string; authority_level: string };

    if (pack.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          status: 'rejected',
          journalId: null,
          errors: [`Standard pack ${payload.soTPackCode} is not ACTIVE (status=${pack.status})`],
        },
        { status: 400 }
      );
    }

    // ===========================================
    // 2. Resolve accountCode → accountId
    // ===========================================

    const accountCodes = [...new Set(payload.lines.map((l) => l.accountCode))];

    const accountRows = await sql`
      SELECT 
        id, 
        code, 
        tenant_id, 
        name,
        mdm_concept_id, 
        governance_tier
      FROM accounts
      WHERE tenant_id = ${payload.tenantId}::uuid
        AND code = ANY(${accountCodes}::text[])
    `;

    const accountByCode = new Map(
      accountRows.map((a: any) => [a.code, a])
    );

    // Check all accounts exist
    const missingAccounts = accountCodes.filter((code) => !accountByCode.has(code));
    if (missingAccounts.length > 0) {
      return NextResponse.json(
        {
          status: 'rejected',
          journalId: null,
          errors: [`Unknown account codes: ${missingAccounts.join(', ')}`],
        },
        { status: 400 }
      );
    }

    // ===========================================
    // 3. Build journal entry (with IDs)
    // ===========================================

    const journalLines = payload.lines.map((l, index) => {
      const acc = accountByCode.get(l.accountCode);
      if (!acc) {
        throw new Error(`Account ${l.accountCode} not found`); // Should not happen
      }

      return {
        id: l.id ?? randomUUID(),
        accountId: acc.id,
        debit: l.debit,
        credit: l.credit,
        description: l.description,
        lineNumber: l.lineNumber ?? index + 1,
      };
    });

    const journal: JournalEntry = {
      id: randomUUID(),
      tenantId: payload.tenantId,
      postingDate: payload.postingDate,
      soTPackId: pack.id,
      description: payload.description,
      journalNumber: payload.journalNumber,
      lines: journalLines,
    };

    // ===========================================
    // 4. Run PostingGuard validation
    // ===========================================

    const validation = await validateJournalBeforePost(journal);

    if (!validation.valid) {
      return NextResponse.json(
        {
          status: 'rejected',
          journalId: journal.id,
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    // ===========================================
    // 5. Post journal (with validation snapshots)
    // ===========================================

    const result = await postJournal(journal);

    if (result.status !== 'posted') {
      return NextResponse.json(
        {
          status: 'error',
          journalId: journal.id,
          errors: result.errors || ['Unknown error during posting'],
        },
        { status: 500 }
      );
    }

    // ===========================================
    // 6. Return success
    // ===========================================

    return NextResponse.json(
      {
        status: 'posted',
        journalId: result.journalId,
        postedAt: new Date().toISOString(),
        snapshots: validation.snapshots, // Return snapshots for audit
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error posting journal:', error);
    return NextResponse.json(
      {
        status: 'error',
        journalId: null,
        errors: [error.message || 'Unknown error'],
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gl/journals
 * 
 * List journals (optional - for testing)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId query parameter is required' },
        { status: 400 }
      );
    }

    const journals = await sql`
      SELECT 
        je.id,
        je.journal_number,
        je.posting_date,
        je.description,
        je.status,
        je.created_at,
        sp.code AS standard_pack_code,
        sp.name AS standard_pack_name
      FROM journal_entries je
      LEFT JOIN mdm_standard_pack sp ON je.so_t_pack_id = sp.id
      WHERE je.tenant_id = ${tenantId}::uuid
      ORDER BY je.posting_date DESC, je.created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      journals: journals || [],
      count: journals?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching journals:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

