// packages/contracts/src/metadata-openapi.ts

/**
 * OpenAPI Document Generation for Metadata API
 * 
 * This generates a complete OpenAPI 3.0 spec for the Metadata API,
 * derived from Zod schemas.
 * 
 * Usage:
 * ```typescript
 * import { createMetadataOpenApiDocument } from '@aibos/contracts/metadata-openapi';
 * 
 * const openApiDoc = createMetadataOpenApiDocument();
 * // Serve at GET /openapi.json
 * ```
 */

import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import {
  MetadataConceptSchema,
  ConceptFilterSchema,
  ResolveAliasInputSchema,
  ResolveAliasResultSchema,
  NamingVariantSchema,
  StandardPackSchema,
  AliasRecordSchema,
  ResolveNameInputSchema,
} from './metadata';

/**
 * Create OpenAPI document for Metadata API
 * 
 * @returns Complete OpenAPI 3.0 document
 */
export function createMetadataOpenApiDocument() {
  const registry = new OpenAPIRegistry();

  // Register all schemas as components
  registry.register('MetadataConcept', MetadataConceptSchema);
  registry.register('AliasRecord', AliasRecordSchema);
  registry.register('NamingVariant', NamingVariantSchema);
  registry.register('StandardPack', StandardPackSchema);
  registry.register('ConceptFilter', ConceptFilterSchema);
  registry.register('ResolveAliasInput', ResolveAliasInputSchema);
  registry.register('ResolveAliasResult', ResolveAliasResultSchema);
  registry.register('ResolveNameInput', ResolveNameInputSchema);

  // =========================================================================
  // GET /metadata/concepts/{canonicalKey}
  // =========================================================================
  
  registry.registerPath({
    method: 'get',
    path: '/metadata/concepts/{canonicalKey}',
    tags: ['Metadata'],
    summary: 'Get a single metadata concept by canonical key',
    description: 'Retrieve a canonical business concept from the metadata registry',
    request: {
      params: MetadataConceptSchema.pick({ canonicalKey: true }),
    },
    responses: {
      200: {
        description: 'Metadata concept found',
        content: {
          'application/json': {
            schema: MetadataConceptSchema.nullable(),
          },
        },
      },
      404: {
        description: 'Concept not found',
      },
    },
  });

  // =========================================================================
  // GET /metadata/concepts
  // =========================================================================
  
  registry.registerPath({
    method: 'get',
    path: '/metadata/concepts',
    tags: ['Metadata'],
    summary: 'List metadata concepts with optional filters',
    description: 'List canonical business concepts with filtering by domain, pack, tier, or search',
    request: {
      query: ConceptFilterSchema,
    },
    responses: {
      200: {
        description: 'Array of metadata concepts',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: MetadataConceptSchema,
            },
          },
        },
      },
    },
  });

  // =========================================================================
  // GET /metadata/aliases/resolve
  // =========================================================================
  
  registry.registerPath({
    method: 'get',
    path: '/metadata/aliases/resolve',
    tags: ['Metadata'],
    summary: 'Resolve a human alias to canonical concepts',
    description: 'Resolve business terms like "Sales" to canonical concepts based on context',
    request: {
      query: ResolveAliasInputSchema,
    },
    responses: {
      200: {
        description: 'Array of alias resolution results (alias + concept)',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: ResolveAliasResultSchema,
            },
          },
        },
      },
    },
  });

  // =========================================================================
  // GET /metadata/aliases/concept/{canonicalKey}
  // =========================================================================
  
  registry.registerPath({
    method: 'get',
    path: '/metadata/aliases/concept/{canonicalKey}',
    tags: ['Metadata'],
    summary: 'Get all aliases for a canonical concept',
    description: 'Retrieve all business term aliases that map to a specific concept',
    request: {
      params: MetadataConceptSchema.pick({ canonicalKey: true }),
    },
    responses: {
      200: {
        description: 'Array of alias records',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: AliasRecordSchema,
            },
          },
        },
      },
    },
  });

  // =========================================================================
  // GET /metadata/standard-packs
  // =========================================================================
  
  registry.registerPath({
    method: 'get',
    path: '/metadata/standard-packs',
    tags: ['Metadata'],
    summary: 'List all standard packs',
    description: 'List all standard packs (IFRS, MFRS, HL7, etc.)',
    request: {},
    responses: {
      200: {
        description: 'Array of standard packs',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: StandardPackSchema,
            },
          },
        },
      },
    },
  });

  // =========================================================================
  // GET /naming/resolve/{canonicalKey}
  // =========================================================================
  
  registry.registerPath({
    method: 'get',
    path: '/naming/resolve/{canonicalKey}',
    tags: ['Naming'],
    summary: 'Resolve naming variant for a concept in a given context',
    description: 'Convert canonical snake_case key to context-specific format (camelCase, PascalCase, etc.)',
    request: {
      params: MetadataConceptSchema.pick({ canonicalKey: true }),
      query: ResolveNameInputSchema.pick({ context: true }),
    },
    responses: {
      200: {
        description: 'Naming variant object or null if not defined',
        content: {
          'application/json': {
            schema: NamingVariantSchema.nullable(),
          },
        },
      },
    },
  });

  // =========================================================================
  // GET /metadata/glossary/search
  // =========================================================================
  
  registry.registerPath({
    method: 'get',
    path: '/metadata/glossary/search',
    tags: ['Metadata'],
    summary: 'Search for concepts and aliases',
    description: 'Full-text search across concepts and aliases',
    request: {
      query: ConceptFilterSchema.pick({ search: true }).required(),
    },
    responses: {
      200: {
        description: 'Array of alias resolution results matching search',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: ResolveAliasResultSchema,
            },
          },
        },
      },
    },
  });

  // Generate the OpenAPI document
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'AI-BOS Metadata API',
      version: '1.0.0',
      description: `
# Metadata SSOT API

Metadata Single Source of Truth (SSOT) API for concepts, aliases, and naming variants.

## Overview

This API provides governed access to:

- **Canonical Concepts**: Business concepts with snake_case keys (e.g., \`revenue_ifrs_core\`)
- **Aliases**: Context-aware mappings of business terms (e.g., "Sales" → canonical concepts)
- **Naming Variants**: Technical name conversions (snake_case → camelCase, PascalCase, etc.)
- **Standard Packs**: Groupings of concepts (IFRS, MFRS, HL7, etc.)

## Governance

All types are derived from Zod schemas - **Zod is the Constitution**.

- Runtime validation: All API responses match these schemas
- Compile-time types: SDK types are derived via \`z.infer\`
- Zero drift: Backend + SDK + OpenAPI all share the same contract

## Authentication

All endpoints require:
- \`x-tenant-id\` header (UUID)
- Optional \`x-api-key\` header for service-to-service calls
      `.trim(),
      contact: {
        name: 'AIBOS Team',
        email: 'metadata@aibos.ai',
      },
    },
    servers: [
      {
        url: 'http://localhost:8787',
        description: 'Development server',
      },
      {
        url: 'https://api.aibos.ai',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Metadata',
        description: 'Canonical concepts, aliases, and standard packs',
      },
      {
        name: 'Naming',
        description: 'Naming variant resolution (snake_case → camelCase, etc.)',
      },
    ],
  });
}

