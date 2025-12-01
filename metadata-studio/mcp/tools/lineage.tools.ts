/**
 * MCP Tools - Lineage
 * Wraps lineage service for MCP agent consumption
 */

import { lineageService } from '../../services/lineage.service';

export const lineageTools = {
  async lineage_get_upstream(args: { entityId: string; depth?: number }) {
    return await lineageService.getUpstream(args.entityId, args.depth || 5);
  },

  async lineage_get_downstream(args: { entityId: string; depth?: number }) {
    return await lineageService.getDownstream(args.entityId, args.depth || 5);
  },

  async lineage_get_full(args: { entityId: string; depth?: number }) {
    return await lineageService.getFullLineage(args.entityId, args.depth || 5);
  },

  async lineage_get_column(args: { columnId: string }) {
    return await lineageService.getColumnLineage(args.columnId);
  },

  async lineage_coverage() {
    return await lineageService.calculateLineageCoverage();
  },
};

