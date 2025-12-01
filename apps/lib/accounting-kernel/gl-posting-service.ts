/**
 * GL Posting Service
 * 
 * Production-ready GL posting service using PostingGuard.
 * This ensures the ledger literally cannot escape IFRS.
 * 
 * Domain: GL (General Ledger)
 * Integration Point: Journal Entry Posting
 */

import { postJournal, validateJournalBeforePost, type JournalEntry as PostingGuardJournalEntry } from '../postingGuard';

/**
 * GL Posting Service
 * 
 * Production-ready service that uses PostingGuard to ensure IFRS compliance.
 * All journals must pass metadata validation before posting.
 */
export class GLPostingService {
  /**
   * Validate journal entry before posting
   * 
   * Uses PostingGuard to check:
   * - Debits = credits
   * - Standard pack exists and is ACTIVE
   * - Tier 1/2 accounts have LAW-level pack anchors
   */
  async validatePosting(
    journal: PostingGuardJournalEntry
  ) {
    return await validateJournalBeforePost(journal);
  }
  
  /**
   * Post a journal entry (with full PostingGuard validation)
   * 
   * This is the main entry point for posting journals.
   * It will reject any journal that doesn't comply with IFRS.
   */
  async postJournalEntry(
    journal: PostingGuardJournalEntry
  ) {
    const result = await postJournal(journal);
    
    if (result.status !== 'posted') {
      throw new Error(
        `Journal posting failed: ${result.errors?.join(', ') || 'Unknown error'}`
      );
    }
    
    return {
      status: result.status,
      journalId: result.journalId,
    };
  }
}

// Export singleton instance
export const glPostingService = new GLPostingService();

/**
 * Example usage:
 * 
 * ```ts
 * const entry = {
 *   tenant_id: tenantId,
 *   standard_pack_id: ifrsCorePackId,
 *   amount_concept_id: glJournalAmountConceptId,
 *   account_concept_id: glAccountConceptId,
 *   journal_date: new Date(),
 *   amount: 1000.00,
 *   account_code: 'REV-001',
 *   description: 'Revenue recognition',
 *   created_by: userId
 * };
 * 
 * const posted = await glPostingService.postJournalEntry(tenantId, entry);
 * ```
 */

