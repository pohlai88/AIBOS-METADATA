/**
 * MCP Tools - Glossary
 * Wraps glossary service for MCP agent consumption
 */

import { glossaryService } from '../../services/glossary.service';

export const glossaryTools = {
  async glossary_get_all() {
    return await glossaryService.getAllTerms();
  },

  async glossary_get_term(args: { termId: string }) {
    return await glossaryService.getTermById(args.termId);
  },

  async glossary_create_term(args: { data: any }) {
    return await glossaryService.createTerm(args.data);
  },

  async glossary_search(args: { query: string }) {
    return await glossaryService.searchTerms(args.query);
  },

  async glossary_get_related(args: { termId: string }) {
    return await glossaryService.getRelatedTerms(args.termId);
  },
};

