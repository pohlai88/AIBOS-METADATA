/**
 * MCP Tools - Metadata
 * Wraps metadata service for MCP agent consumption
 */

import { metadataService } from '../../services/metadata.service';

export const metadataTools = {
  async metadata_get(args: { id?: string; fqn?: string }) {
    if (args.id) {
      return await metadataService.getById(args.id);
    }
    if (args.fqn) {
      return await metadataService.getByFQN(args.fqn);
    }
    throw new Error('Either id or fqn must be provided');
  },

  async metadata_search(args: { query: string; filters?: any }) {
    return await metadataService.search(args.query, args.filters);
  },

  async metadata_create(args: { data: any }) {
    return await metadataService.create(args.data);
  },

  async metadata_update(args: { id: string; data: any }) {
    return await metadataService.update(args.id, args.data);
  },

  async metadata_resolve_alias(args: { alias: string }) {
    return await metadataService.resolveAlias(args.alias);
  },
};

