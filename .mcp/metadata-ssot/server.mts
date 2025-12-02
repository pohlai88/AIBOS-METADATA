#!/usr/bin/env node

/**
 * Metadata SSOT MCP Server
 * 
 * Guardian of concepts, aliases, and naming variants.
 * 
 * This MCP server exposes the Metadata SSOT to AI agents,
 * ensuring governed access to canonical concepts, context-aware aliases,
 * and naming conventions.
 * 
 * Architecture:
 * - MCP Server → HTTP → metadata-studio API
 * - Schemas defined inline (SSOT: metadata-studio is source of truth)
 * 
 * Tools:
 * - metadata-list-concepts: List concepts by domain/pack/tier/search
 * - metadata-get-concept: Get single concept by canonicalKey
 * - metadata-resolve-alias: Resolve "Sales" → canonical concepts
 * - metadata-resolve-name: Convert snake_case → camelCase/PascalCase/etc.
 * - metadata-search-glossary: Free-text search across concepts and aliases
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// =============================================================================
// Inline Schemas (SSOT: metadata-studio)
// These mirror metadata-studio schemas for MCP validation
// =============================================================================

const TierSchema = z.enum(['tier1', 'tier2', 'tier3', 'tier4', 'tier5']);

const MetadataConceptSchema = z.object({
  canonicalKey: z.string().min(1).regex(/^[a-z0-9]+(_[a-z0-9]+)*$/, 'canonicalKey must be snake_case'),
  label: z.string().min(1),
  domain: z.string().min(1),
  standardPackKey: z.string().min(1),
  semanticType: z.string().min(1),
  financialElement: z.string().nullable().optional(),
  tier: TierSchema,
  description: z.string().optional().default(''),
});

const ConceptFilterSchema = z.object({
  domain: z.string().optional(),
  standardPackKey: z.string().optional(),
  tier: TierSchema.optional(),
  search: z.string().optional(),
});

const ContextDomainSchema = z.enum([
  'FINANCIAL_REPORTING',
  'MANAGEMENT_REPORTING',
  'OPERATIONS',
  'STATUTORY_DISCLOSURE',
  'GENERIC_SPEECH',
]);

const AliasStrengthSchema = z.enum([
  'PRIMARY_LABEL',
  'SECONDARY_LABEL',
  'DISCOURAGED',
  'FORBIDDEN',
]);

const ResolveAliasInputSchema = z.object({
  aliasText: z.string().min(1),
  contextDomain: ContextDomainSchema.optional(),
  language: z.string().optional(),
});

const NamingContextSchema = z.enum(['db', 'typescript', 'graphql', 'api_path', 'const', 'bi', 'tax']);

const ResolveNameInputSchema = z.object({
  canonicalKey: z.string().min(1),
  context: NamingContextSchema,
});

// =============================================================================
// Simple HTTP Client (calls metadata-studio API)
// =============================================================================

class MetadataHttpClient {
  private baseUrl: string;
  private apiKey?: string;
  private tenantId: string;

  constructor(config: { baseUrl: string; apiKey?: string; tenantId: string }) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.tenantId = config.tenantId;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-tenant-id': this.tenantId,
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async listConcepts(filter: z.infer<typeof ConceptFilterSchema>): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (filter.domain) params.set('domain', filter.domain);
    if (filter.standardPackKey) params.set('standardPackKey', filter.standardPackKey);
    if (filter.tier) params.set('tier', filter.tier);
    if (filter.search) params.set('search', filter.search);

    const query = params.toString();
    return this.request<unknown[]>(`/metadata${query ? `?${query}` : ''}`);
  }

  async getConcept(canonicalKey: string): Promise<unknown | null> {
    try {
      return await this.request<unknown>(`/metadata/${canonicalKey}`);
    } catch {
      return null;
    }
  }

  async resolveAlias(input: z.infer<typeof ResolveAliasInputSchema>): Promise<unknown[]> {
    const params = new URLSearchParams({ alias: input.aliasText });
    if (input.contextDomain) params.set('context', input.contextDomain);
    if (input.language) params.set('language', input.language);

    return this.request<unknown[]>(`/glossary/resolve?${params.toString()}`);
  }

  async resolveNameForContext(input: z.infer<typeof ResolveNameInputSchema>): Promise<string> {
    const result = await this.request<{ value: string }>(
      `/naming/resolve?canonicalKey=${input.canonicalKey}&context=${input.context}`
    );
    return result.value;
  }

  async searchGlossary(query: string): Promise<unknown[]> {
    return this.request<unknown[]>(`/glossary/search?q=${encodeURIComponent(query)}`);
  }
}

// =============================================================================
// Server Setup
// =============================================================================

const server = new Server(
  {
    name: 'metadata-ssot-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// =============================================================================
// Metadata HTTP Client
// =============================================================================

const metadataClient = new MetadataHttpClient({
  baseUrl: process.env.METADATA_BASE_URL || 'http://localhost:8787',
  apiKey: process.env.METADATA_API_KEY,
  tenantId: process.env.METADATA_DEFAULT_TENANT_ID || '550e8400-e29b-41d4-a716-446655440000',
});

// =============================================================================
// Tool Definitions
// =============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'metadata-list-concepts',
      description: `
List metadata concepts filtered by domain, standard pack, tier, or search term.

Use this when you need to:
- Browse concepts in a specific domain (FINANCE, OPERATIONS, etc.)
- Find concepts in a standard pack (MFRS15_REVENUE, IFRS_OTHER_INCOME, etc.)
- List concepts by tier (tier1 = statutory, tier2 = management, etc.)
- Search concepts by label or description

Returns: Array of canonical concepts with all metadata.
      `.trim(),
      inputSchema: {
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            description: 'Filter by domain (FINANCE, OPERATIONS, etc.)',
          },
          standardPackKey: {
            type: 'string',
            description: 'Filter by standard pack (MFRS15_REVENUE, etc.)',
          },
          tier: {
            type: 'string',
            enum: ['tier1', 'tier2', 'tier3', 'tier4', 'tier5'],
            description: 'Filter by governance tier',
          },
          search: {
            type: 'string',
            description: 'Free-text search within concept label/description',
          },
        },
      },
    },
    {
      name: 'metadata-get-concept',
      description: `
Get a single canonical metadata concept by its canonicalKey (snake_case).

Use this when you:
- Know the exact canonical key (e.g., revenue_ifrs_core)
- Need full details about a specific concept
- Want to verify a concept exists

Returns: Full concept details or null if not found.
      `.trim(),
      inputSchema: {
        type: 'object',
        properties: {
          canonicalKey: {
            type: 'string',
            pattern: '^[a-z0-9]+(_[a-z0-9]+)*$',
            description: 'Snake_case canonical key (e.g., revenue_ifrs_core)',
          },
        },
        required: ['canonicalKey'],
      },
    },
    {
      name: 'metadata-resolve-alias',
      description: `
Resolve a human alias (e.g., "Sales", "Revenue", "Income") to canonical concept(s).

This is CONTEXT-AWARE:
- "Sales" in FINANCIAL_REPORTING → revenue_ifrs_core (SECONDARY_LABEL)
- "Sales" in MANAGEMENT_REPORTING → sales_value_operational (PRIMARY_LABEL)
- "Sales" in STATUTORY_DISCLOSURE → FORBIDDEN (too ambiguous)

Use this when:
- User uses business terms like "Sales", "Turnover", "Income"
- You need to know which canonical concept they mean
- You want to validate if a term is allowed in a specific context

Returns: Array of alias mappings with strength (PRIMARY_LABEL, SECONDARY_LABEL, DISCOURAGED, FORBIDDEN).
      `.trim(),
      inputSchema: {
        type: 'object',
        properties: {
          aliasText: {
            type: 'string',
            description: 'Human alias term to resolve (e.g., "Sales", "Revenue")',
          },
          contextDomain: {
            type: 'string',
            enum: [
              'FINANCIAL_REPORTING',
              'MANAGEMENT_REPORTING',
              'OPERATIONS',
              'STATUTORY_DISCLOSURE',
              'GENERIC_SPEECH',
            ],
            description: 'Business context domain filter',
          },
          language: {
            type: 'string',
            description: 'Language code (default: en)',
          },
        },
        required: ['aliasText'],
      },
    },
    {
      name: 'metadata-resolve-name',
      description: `
Resolve naming variant for a concept in a given context (technical naming).

This converts canonical snake_case to context-specific formats:
- revenue_ifrs_core + typescript → revenueIfrsCore
- revenue_ifrs_core + graphql → RevenueIfrsCore
- revenue_ifrs_core + api_path → revenue-ifrs-core
- revenue_ifrs_core + const → REVENUE_IFRS_CORE
- revenue_ifrs_core + db → revenue_ifrs_core

Use this when:
- Generating code (TypeScript, GraphQL, etc.)
- Creating API paths
- Building database schemas
- Ensuring naming consistency

Returns: The name variant value for the specified context.
      `.trim(),
      inputSchema: {
        type: 'object',
        properties: {
          canonicalKey: {
            type: 'string',
            pattern: '^[a-z0-9]+(_[a-z0-9]+)*$',
            description: 'Canonical concept key (snake_case)',
          },
          context: {
            type: 'string',
            enum: ['db', 'typescript', 'graphql', 'api_path', 'const', 'bi', 'tax'],
            description: 'Target naming context',
          },
        },
        required: ['canonicalKey', 'context'],
      },
    },
    {
      name: 'metadata-search-glossary',
      description: `
Search metadata glossary (aliases + concepts) by free-text query.

This searches across:
- Concept labels and descriptions
- Alias terms
- Standard pack names

Use this when:
- User searches for "revenue", "sales", "income", etc.
- You need to find related concepts
- Building glossary UI or documentation

Returns: Array of alias resolution results matching the search.
      `.trim(),
      inputSchema: {
        type: 'object',
        properties: {
          q: {
            type: 'string',
            description: 'Search query string',
          },
        },
        required: ['q'],
      },
    },
  ],
}));

// =============================================================================
// Tool Call Handlers
// =============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: argsRaw } = request.params;

  // MCP arguments are JSON; default to {} if null/undefined
  const args = (argsRaw ?? {}) as unknown;

  try {
    switch (name) {
      // -----------------------------------------------------------------------
      // metadata-list-concepts
      // -----------------------------------------------------------------------
      case 'metadata-list-concepts': {
        const input = ConceptFilterSchema.parse(args);
        const concepts = await metadataClient.listConcepts(input);
        const payload = z.array(MetadataConceptSchema).safeParse(concepts);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payload.success ? payload.data : concepts, null, 2),
            },
          ],
        };
      }

      // -----------------------------------------------------------------------
      // metadata-get-concept
      // -----------------------------------------------------------------------
      case 'metadata-get-concept': {
        const input = z.object({
          canonicalKey: z.string().min(1),
        }).parse(args);

        const concept = await metadataClient.getConcept(input.canonicalKey);

        if (!concept) {
          return {
            content: [
              {
                type: 'text',
                text: `Concept not found: ${input.canonicalKey}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(concept, null, 2),
            },
          ],
        };
      }

      // -----------------------------------------------------------------------
      // metadata-resolve-alias
      // -----------------------------------------------------------------------
      case 'metadata-resolve-alias': {
        const input = ResolveAliasInputSchema.parse(args);
        const results = await metadataClient.resolveAlias(input);

        if (!Array.isArray(results) || results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No aliases found for: "${input.aliasText}"${input.contextDomain ? ` in context ${input.contextDomain}` : ''}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      // -----------------------------------------------------------------------
      // metadata-resolve-name
      // -----------------------------------------------------------------------
      case 'metadata-resolve-name': {
        const input = ResolveNameInputSchema.parse(args);
        const resolved = await metadataClient.resolveNameForContext(input);

        const payload = {
          canonicalKey: input.canonicalKey,
          context: input.context,
          value: resolved,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      }

      // -----------------------------------------------------------------------
      // metadata-search-glossary
      // -----------------------------------------------------------------------
      case 'metadata-search-glossary': {
        const input = z.object({
          q: z.string().min(1),
        }).parse(args);

        const results = await metadataClient.searchGlossary(input.q);

        if (!Array.isArray(results) || results.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No results found for: "${input.q}"`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Metadata MCP error for tool "${name}": ${message}`,
        },
      ],
    };
  }
});

// =============================================================================
// Start Server
// =============================================================================

const transport = new StdioServerTransport();
await server.connect(transport);

console.error('Metadata SSOT MCP Server running on stdio');
