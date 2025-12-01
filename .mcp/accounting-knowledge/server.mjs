// server.mjs
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Neon SQL client (over HTTP, safe from SQL injection with template or params)
const sql = neon(process.env.DATABASE_URL);

// ------------------------------------------------------
// MCP Server setup
// ------------------------------------------------------
const server = new Server(
  {
    name: "aibos-accounting-knowledge",
    version: "1.0.0",
    description: "AIBOS Accounting Knowledge Base MCP Server - Track solutions, training, UI/UX, upgrades, bugs",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Utility: format a row into Markdown-ish text
function formatKnowledgeListItem(row, index) {
  const tags = Array.isArray(row.tags) ? row.tags.join(", ") : "";
  const priority = row.priority || "NONE";

  return [
    `#${index + 1} — [${row.category_name}] ${row.title}`,
    `ID: ${row.id}`,
    `Status: ${row.status} | Priority: ${priority} | Version: ${row.version}`,
    `Created: ${row.created_at?.toISOString?.() || row.created_at}`,
    tags ? `Tags: ${tags}` : "",
    row.description ? `Summary: ${row.description}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatKnowledgeDetail(row) {
  const tags = Array.isArray(row.tags) ? row.tags.join(", ") : "";
  const priority = row.priority || "NONE";

  const meta = row.metadata || {};

  return [
    `# ${row.title}`,
    ``,
    `Category: ${row.category_name}`,
    `Status: ${row.status} | Priority: ${priority} | Version: ${row.version}`,
    `ID: ${row.id}`,
    row.related_concept_id ? `Related Concept ID: ${row.related_concept_id}` : "",
    row.related_standard_pack_id
      ? `Related Standard Pack ID: ${row.related_standard_pack_id}`
      : "",
    tags ? `Tags: ${tags}` : "",
    "",
    row.description ? `## Summary\n\n${row.description}\n` : "",
    "## Content",
    "",
    row.content,
    "",
    "## Metadata",
    "",
    "```json",
    JSON.stringify(meta, null, 2),
    "```",
  ]
    .filter(Boolean)
    .join("\n");
}

// ------------------------------------------------------
// TOOL: list-accounting-knowledge
// ------------------------------------------------------
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list-accounting-knowledge",
        description: "List accounting knowledge entries filtered by category, status, priority, and search text.",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Category name, e.g. SOLUTION, TRAINING, UI_UX, UPGRADE, BUG",
            },
            status: {
              type: "string",
              enum: ["DRAFT", "REVIEW", "APPROVED", "ARCHIVED"],
              description: "Filter by lifecycle status",
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
              description: "Filter by priority",
            },
            search: {
              type: "string",
              description: "Optional search term for title/content (ILIKE)",
            },
            limit: {
              type: "number",
              description: "Maximum number of entries to return (1–50, default 10)",
              default: 10,
              minimum: 1,
              maximum: 50,
            },
          },
        },
      },
      {
        name: "get-accounting-knowledge",
        description: "Get full details of an accounting knowledge entry by ID or slug.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "UUID of the knowledge entry (preferred)",
            },
            slug: {
              type: "string",
              description: "Optional slug if you added one; if provided, id is ignored",
            },
          },
        },
      },
      {
        name: "create-accounting-knowledge",
        description: "Create a new accounting knowledge entry (stored as DRAFT by default).",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Category name, e.g. SOLUTION, TRAINING, UI_UX, UPGRADE, BUG",
            },
            title: {
              type: "string",
              description: "Short, human-readable title",
              minLength: 3,
            },
            content: {
              type: "string",
              description: "Full markdown content for the solution/training/bug, etc.",
              minLength: 10,
            },
            description: {
              type: "string",
              description: "Optional short summary or abstract",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of tags, e.g. ['GL', 'Closing', 'FX']",
            },
            status: {
              type: "string",
              enum: ["DRAFT", "REVIEW", "APPROVED", "ARCHIVED"],
              description: "Lifecycle status; defaults to DRAFT",
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
              description: "Optional priority",
            },
          },
          required: ["category", "title", "content"],
        },
      },
      {
        name: "update-accounting-knowledge-status",
        description: "Update the status and/or priority of an existing accounting knowledge entry.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "UUID of the knowledge entry to update",
            },
            status: {
              type: "string",
              enum: ["DRAFT", "REVIEW", "APPROVED", "ARCHIVED"],
              description: "New status (optional)",
            },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
              description: "New priority (optional)",
            },
          },
          required: ["id"],
        },
      },
    ],
  };
});

// ------------------------------------------------------
// TOOL HANDLERS
// ------------------------------------------------------
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list-accounting-knowledge": {
        const schema = z.object({
          category: z.string().optional(),
          status: z.enum(["DRAFT", "REVIEW", "APPROVED", "ARCHIVED"]).optional(),
          priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
          search: z.string().optional(),
          limit: z.number().int().min(1).max(50).default(10),
        });

        const { category, status, priority, search, limit } = schema.parse(args || {});

        const whereClauses = [];
        const params = [];
        let idx = 1;

        if (category) {
          whereClauses.push(`c.name = $${idx++}`);
          params.push(category);
        }
        if (status) {
          whereClauses.push(`ak.status = $${idx++}`);
          params.push(status);
        }
        if (priority) {
          whereClauses.push(`ak.priority = $${idx++}`);
          params.push(priority);
        }
        if (search) {
          whereClauses.push(
            `(ak.title ILIKE $${idx} OR ak.content ILIKE $${idx})`
          );
          params.push(`%${search}%`);
          idx++;
        }

        let query = `
          SELECT
            ak.id,
            ak.title,
            ak.description,
            ak.status,
            ak.priority,
            ak.version,
            ak.tags,
            ak.created_at,
            c.name AS category_name
          FROM accounting_knowledge ak
          JOIN accounting_knowledge_category c ON c.id = ak.category_id
        `;

        if (whereClauses.length > 0) {
          query += " WHERE " + whereClauses.join(" AND ");
        }

        query += ` ORDER BY ak.created_at DESC LIMIT $${idx}`;
        params.push(limit);

        const rows = await sql(query, params);

        if (rows.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No accounting knowledge entries found for the given filters.",
              },
            ],
          };
        }

        const body = rows
          .map((row, i) => formatKnowledgeListItem(row, i))
          .join("\n\n---\n\n");

        return {
          content: [
            {
              type: "text",
              text: body,
            },
          ],
        };
      }

      case "get-accounting-knowledge": {
        const schema = z.object({
          id: z.string().uuid().optional(),
          slug: z.string().optional(),
        });

        const { id, slug } = schema.parse(args || {});

        if (!id && !slug) {
          return {
            content: [
              {
                type: "text",
                text: "Please provide either an id or a slug.",
              },
            ],
          };
        }

        const params = [];
        let where = "";

        if (slug) {
          where = "ak.slug = $1";
          params.push(slug);
        } else {
          where = "ak.id = $1";
          params.push(id);
        }

        const query = `
          SELECT
            ak.*,
            c.name AS category_name
          FROM accounting_knowledge ak
          JOIN accounting_knowledge_category c ON c.id = ak.category_id
          WHERE ${where}
          LIMIT 1
        `;

        const rows = await sql(query, params);
        const row = rows[0];

        if (!row) {
          return {
            content: [
              {
                type: "text",
                text: "No matching accounting knowledge entry found.",
              },
            ],
          };
        }

        const text = formatKnowledgeDetail(row);

        return {
          content: [
            {
              type: "text",
              text,
            },
          ],
        };
      }

      case "create-accounting-knowledge": {
        const schema = z.object({
          category: z.string(),
          title: z.string().min(3),
          content: z.string().min(10),
          description: z.string().optional(),
          tags: z.array(z.string()).optional(),
          status: z.enum(["DRAFT", "REVIEW", "APPROVED", "ARCHIVED"]).optional(),
          priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
        });

        const {
          category,
          title,
          content,
          description,
          tags,
          status,
          priority,
        } = schema.parse(args || {});

        const effectiveStatus = status || "DRAFT";

        // Resolve category_id from name
        const catRows = await sql(
          `SELECT id FROM accounting_knowledge_category WHERE name = $1`,
          [category]
        );
        const catRow = catRows[0];

        if (!catRow) {
          return {
            content: [
              {
                type: "text",
                text: `Category '${category}' does not exist. Please create it or use one of the seeded categories: SOLUTION, TRAINING, UI_UX, UPGRADE, BUG.`,
              },
            ],
          };
        }

        const categoryId = catRow.id;

        const insertRows = await sql(
          `
          INSERT INTO accounting_knowledge (
            category_id,
            title,
            description,
            content,
            tags,
            status,
            priority
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
          RETURNING id, status, priority
        `,
          [
            categoryId,
            title,
            description || null,
            content,
            tags && tags.length ? tags : null,
            effectiveStatus,
            priority || null,
          ]
        );

        const row = insertRows[0];

        if (!row) {
          return {
            content: [
              {
                type: "text",
                text: "Failed to create accounting knowledge entry (no row returned).",
              },
            ],
          };
        }

        const summary = [
          `Created accounting knowledge entry:`,
          `ID: ${row.id}`,
          `Title: ${title}`,
          `Category: ${category}`,
          `Status: ${row.status}`,
          `Priority: ${row.priority || "NONE"}`,
        ].join("\n");

        return {
          content: [
            {
              type: "text",
              text: summary,
            },
          ],
        };
      }

      case "update-accounting-knowledge-status": {
        const schema = z.object({
          id: z.string().uuid(),
          status: z.enum(["DRAFT", "REVIEW", "APPROVED", "ARCHIVED"]).optional(),
          priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
        });

        const { id, status, priority } = schema.parse(args || {});

        if (!status && !priority) {
          return {
            content: [
              {
                type: "text",
                text: "Nothing to update: please provide status and/or priority.",
              },
            ],
          };
        }

        const sets = [];
        const params = [];
        let idx = 1;

        if (status) {
          sets.push(`status = $${idx++}`);
          params.push(status);
        }
        if (priority) {
          sets.push(`priority = $${idx++}`);
          params.push(priority);
        }

        // Ensure updated_at is maintained
        sets.push(`updated_at = NOW()`);

        const query = `
          UPDATE accounting_knowledge
          SET ${sets.join(", ")}
          WHERE id = $${idx}
          RETURNING id, status, priority, updated_at
        `;
        params.push(id);

        const rows = await sql(query, params);
        const row = rows[0];

        if (!row) {
          return {
            content: [
              {
                type: "text",
                text: `No knowledge entry found with id: ${id}`,
              },
            ],
          };
        }

        const text = [
          `Updated accounting knowledge entry:`,
          `ID: ${row.id}`,
          `Status: ${row.status}`,
          `Priority: ${row.priority || "NONE"}`,
          `Updated at: ${row.updated_at?.toISOString?.() || row.updated_at}`,
        ].join("\n");

        return {
          content: [
            {
              type: "text",
              text,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ------------------------------------------------------
// Main: connect via stdio
// ------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIBOS Accounting Knowledge MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in MCP server:", error);
  process.exit(1);
});
