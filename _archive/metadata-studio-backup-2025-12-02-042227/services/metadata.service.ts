/**
 * Metadata Service
 * Business logic for metadata management
 */

import { metadataRepo } from '../db/metadata.repo';
import { MetadataEntity, MetadataEntitySchema } from '../schemas/mdm-global-metadata.schema';

export const metadataService = {
  async getById(id: string): Promise<MetadataEntity | null> {
    return await metadataRepo.findById(id);
  },

  async create(data: unknown): Promise<MetadataEntity> {
    const validated = MetadataEntitySchema.parse(data);
    return await metadataRepo.create(validated);
  },

  async update(id: string, data: unknown): Promise<MetadataEntity> {
    const validated = MetadataEntitySchema.partial().parse(data);
    return await metadataRepo.update(id, validated);
  },

  async delete(id: string): Promise<void> {
    await metadataRepo.delete(id);
  },

  async search(query: string, filters?: any): Promise<MetadataEntity[]> {
    return await metadataRepo.search(query, filters);
  },

  async getByFQN(fullyQualifiedName: string): Promise<MetadataEntity | null> {
    return await metadataRepo.findByFQN(fullyQualifiedName);
  },

  async resolveAlias(alias: string): Promise<MetadataEntity | null> {
    return await metadataRepo.findByAlias(alias);
  },
};

