#!/usr/bin/env tsx
/**
 * Create Placeholders for Missing Documentation Sections
 * 
 * Creates placeholder files for all missing sections in the new structure
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";

const TARGET_DIR = join(process.cwd(), "docs");

interface Placeholder {
  path: string;
  title: string;
  description: string;
}

const PLACEHOLDERS: Placeholder[] = [
  // Foundation - Philosophy
  { path: "01-foundation/philosophy/design-language.md", title: "Design Language", description: "Design language and visual identity" },
  { path: "01-foundation/philosophy/platform-vision.md", title: "Platform Vision", description: "AI-BOS platform vision and goals" },
  { path: "01-foundation/philosophy/lego-vs-jenga.md", title: "Lego vs Jenga", description: "Composition philosophy" },
  
  // Foundation - Conventions
  { path: "01-foundation/conventions/naming.md", title: "Naming Conventions", description: "Naming conventions for code, files, and components" },
  { path: "01-foundation/conventions/folder-structure.md", title: "Folder Structure", description: "Standard folder structure conventions" },
  { path: "01-foundation/conventions/coding-standards.md", title: "Coding Standards", description: "Coding standards and best practices" },
  { path: "01-foundation/conventions/documentation-standard.md", title: "Documentation Standard", description: "Documentation writing standards" },
  
  // Foundation - Metadata
  { path: "01-foundation/metadata/metadata-governance.md", title: "Metadata Governance", description: "Metadata governance and management" },
  { path: "01-foundation/metadata/metadata-lifecycle.md", title: "Metadata Lifecycle", description: "Metadata lifecycle management" },
  { path: "01-foundation/metadata/metadata-dictionary.md", title: "Metadata Dictionary", description: "Complete metadata dictionary" },
  
  // Foundation - UI System
  { path: "01-foundation/ui-system/components-philosophy.md", title: "Components Philosophy", description: "Component design philosophy" },
  
  // Foundation - Glossary
  { path: "01-foundation/glossary/common-terms.md", title: "Common Terms", description: "Common terminology glossary" },
  { path: "01-foundation/glossary/domain-definitions.md", title: "Domain Definitions", description: "Domain-specific definitions" },
  
  // Architecture - Overview
  { path: "02-architecture/overview/system-overview.md", title: "System Overview", description: "AI-BOS system overview" },
  { path: "02-architecture/overview/architecture-diagrams.md", title: "Architecture Diagrams", description: "System architecture diagrams" },
  
  // Architecture - Frontend
  { path: "02-architecture/frontend/app-router-architecture.md", title: "App Router Architecture", description: "Next.js App Router architecture" },
  { path: "02-architecture/frontend/component-architecture.md", title: "Component Architecture", description: "Component architecture patterns" },
  { path: "02-architecture/frontend/design-system-architecture.md", title: "Design System Architecture", description: "Design system architecture" },
  { path: "02-architecture/frontend/rendering-strategy.md", title: "Rendering Strategy", description: "Rendering and performance strategy" },
  
  // Architecture - Backend
  { path: "02-architecture/backend/services-architecture.md", title: "Services Architecture", description: "Backend services architecture" },
  { path: "02-architecture/backend/bff-patterns.md", title: "BFF Patterns", description: "Backend for Frontend patterns" },
  { path: "02-architecture/backend/auth-architecture.md", title: "Authentication Architecture", description: "Authentication and authorization" },
  { path: "02-architecture/backend/rate-limiting.md", title: "Rate Limiting", description: "Rate limiting strategy" },
  { path: "02-architecture/backend/event-driven-architecture.md", title: "Event-Driven Architecture", description: "Event-driven patterns" },
  { path: "02-architecture/backend/error-handling.md", title: "Error Handling", description: "Error handling patterns" },
  { path: "02-architecture/backend/security-model.md", title: "Security Model", description: "Security architecture" },
  
  // Architecture - Database
  { path: "02-architecture/database/schema-overview.md", title: "Schema Overview", description: "Database schema overview" },
  { path: "02-architecture/database/db-design-principles.md", title: "Database Design Principles", description: "Database design principles" },
  { path: "02-architecture/database/migrations.md", title: "Migrations", description: "Database migration strategy" },
  { path: "02-architecture/database/indexing-strategy.md", title: "Indexing Strategy", description: "Database indexing strategy" },
  { path: "02-architecture/database/multi-tenant-model.md", title: "Multi-Tenant Model", description: "Multi-tenant architecture" },
  
  // Architecture - Integrations
  { path: "02-architecture/integrations/third-party-integrations.md", title: "Third-Party Integrations", description: "Third-party integration patterns" },
  { path: "02-architecture/integrations/webhooks.md", title: "Webhooks", description: "Webhook integration patterns" },
  { path: "02-architecture/integrations/payment-gateway-integration.md", title: "Payment Gateway Integration", description: "Payment gateway integration" },
  { path: "02-architecture/integrations/messaging-providers.md", title: "Messaging Providers", description: "Messaging provider integration" },
  
  // Architecture - AI Engine
  { path: "02-architecture/ai-engine/llm-architecture.md", title: "LLM Architecture", description: "LLM and AI architecture" },
  { path: "02-architecture/ai-engine/prompt-engineering.md", title: "Prompt Engineering", description: "Prompt engineering practices" },
  { path: "02-architecture/ai-engine/ai-agent-flows.md", title: "AI Agent Flows", description: "AI agent workflow patterns" },
  
  // Modules - All ERP modules (overview + api for each)
  ...["accounting", "inventory", "manufacturing", "procurement", "sales", "crm", "hr-payroll", "retail-pos", "franchise", "plantation", "central-kitchen", "logistics"].flatMap(module => [
    { path: `03-modules/${module}/overview.md`, title: `${module.charAt(0).toUpperCase() + module.slice(1)} Overview`, description: `${module} module overview` },
    { path: `03-modules/${module}/api.md`, title: `${module.charAt(0).toUpperCase() + module.slice(1)} API`, description: `${module} module API reference` },
  ]),
  
  // Additional module-specific files for accounting and inventory
  { path: "03-modules/accounting/chart-of-accounts.md", title: "Chart of Accounts", description: "Chart of accounts structure" },
  { path: "03-modules/accounting/journal-entries.md", title: "Journal Entries", description: "Journal entry processing" },
  { path: "03-modules/accounting/reporting.md", title: "Reporting", description: "Financial reporting" },
  { path: "03-modules/accounting/controls.md", title: "Controls", description: "Accounting controls" },
  { path: "03-modules/inventory/goods-receipt.md", title: "Goods Receipt", description: "Goods receipt process" },
  { path: "03-modules/inventory/stock-ledger.md", title: "Stock Ledger", description: "Stock ledger management" },
  { path: "03-modules/inventory/inventory-valuation.md", title: "Inventory Valuation", description: "Inventory valuation methods" },
  
  // Developer - UI
  { path: "04-developer/ui/patterns/README.md", title: "UI Patterns", description: "UI design patterns" },
  { path: "04-developer/ui/examples/README.md", title: "UI Examples", description: "UI component examples" },
  
  // Developer - API
  { path: "04-developer/api/endpoint-list.md", title: "Endpoint List", description: "Complete API endpoint list" },
  { path: "04-developer/api/rest-guidelines.md", title: "REST Guidelines", description: "REST API guidelines" },
  { path: "04-developer/api/graphql-guidelines.md", title: "GraphQL Guidelines", description: "GraphQL API guidelines" },
  { path: "04-developer/api/usage-examples.md", title: "Usage Examples", description: "API usage examples" },
  
  // Developer - Backend
  { path: "04-developer/backend/domain-services.md", title: "Domain Services", description: "Domain service patterns" },
  { path: "04-developer/backend/bff-guidelines.md", title: "BFF Guidelines", description: "Backend for Frontend guidelines" },
  { path: "04-developer/backend/job-queue.md", title: "Job Queue", description: "Job queue patterns" },
  { path: "04-developer/backend/workers.md", title: "Workers", description: "Background worker patterns" },
  
  // Developer - Database
  { path: "04-developer/database/schema-reference.md", title: "Schema Reference", description: "Database schema reference" },
  { path: "04-developer/database/migration-guide.md", title: "Migration Guide", description: "Database migration guide" },
  { path: "04-developer/database/constraints.md", title: "Constraints", description: "Database constraints" },
  { path: "04-developer/database/seed-data.md", title: "Seed Data", description: "Database seed data" },
  
  // Developer - CLI Tools
  { path: "04-developer/cli-tools/aibos-cli.md", title: "AIBOS CLI", description: "AIBOS command-line interface" },
  { path: "04-developer/cli-tools/scripts.md", title: "Scripts", description: "Development scripts" },
  { path: "04-developer/cli-tools/automation.md", title: "Automation", description: "Automation tools" },
  
  // Developer - Testing
  { path: "04-developer/testing/unit-tests.md", title: "Unit Tests", description: "Unit testing guidelines" },
  { path: "04-developer/testing/e2e-tests.md", title: "E2E Tests", description: "End-to-end testing" },
  { path: "04-developer/testing/mocking.md", title: "Mocking", description: "Mocking strategies" },
  
  // Operations - Deployment
  { path: "05-operations/deployment/environment-setup.md", title: "Environment Setup", description: "Environment configuration" },
  { path: "05-operations/deployment/deployment-pipeline.md", title: "Deployment Pipeline", description: "CI/CD pipeline" },
  { path: "05-operations/deployment/versioning.md", title: "Versioning", description: "Versioning strategy" },
  { path: "05-operations/deployment/rollback-guide.md", title: "Rollback Guide", description: "Rollback procedures" },
  
  // Operations - Monitoring
  { path: "05-operations/monitoring/logs.md", title: "Logs", description: "Logging strategy" },
  { path: "05-operations/monitoring/health-checks.md", title: "Health Checks", description: "Health check configuration" },
  { path: "05-operations/monitoring/prometheus-metrics.md", title: "Prometheus Metrics", description: "Prometheus metrics" },
  { path: "05-operations/monitoring/alerts.md", title: "Alerts", description: "Alerting configuration" },
  
  // Operations - Security
  { path: "05-operations/security/soc2-controls.md", title: "SOC2 Controls", description: "SOC2 compliance controls" },
  { path: "05-operations/security/hipaa-controls.md", title: "HIPAA Controls", description: "HIPAA compliance controls" },
  { path: "05-operations/security/access-control.md", title: "Access Control", description: "Access control patterns" },
  { path: "05-operations/security/key-management.md", title: "Key Management", description: "Key management strategy" },
  
  // Operations - Performance
  { path: "05-operations/performance/caching-strategy.md", title: "Caching Strategy", description: "Caching patterns" },
  { path: "05-operations/performance/scalability.md", title: "Scalability", description: "Scalability patterns" },
  { path: "05-operations/performance/performance-benchmarks.md", title: "Performance Benchmarks", description: "Performance benchmarks" },
  
  // Operations - Support
  { path: "05-operations/support/incident-response.md", title: "Incident Response", description: "Incident response procedures" },
  { path: "05-operations/support/postmortems.md", title: "Postmortems", description: "Postmortem process" },
  { path: "05-operations/support/troubleshooting-playbooks.md", title: "Troubleshooting Playbooks", description: "Troubleshooting guides" },
  
  // Users - Staff
  { path: "06-users/staff/how-to-create-orders.md", title: "How to Create Orders", description: "Order creation guide" },
  { path: "06-users/staff/inventory-workflow.md", title: "Inventory Workflow", description: "Inventory management workflow" },
  { path: "06-users/staff/submitting-expenses.md", title: "Submitting Expenses", description: "Expense submission guide" },
  
  // Users - Managers
  { path: "06-users/managers/dashboards.md", title: "Dashboards", description: "Manager dashboards" },
  { path: "06-users/managers/approvals.md", title: "Approvals", description: "Approval workflow" },
  { path: "06-users/managers/performance-reports.md", title: "Performance Reports", description: "Performance reporting" },
  { path: "06-users/managers/role-management.md", title: "Role Management", description: "Role and permission management" },
  
  // Users - Executives
  { path: "06-users/executives/analytics.md", title: "Analytics", description: "Executive analytics" },
  { path: "06-users/executives/financial-reports.md", title: "Financial Reports", description: "Financial reporting" },
  { path: "06-users/executives/forecasting.md", title: "Forecasting", description: "Forecasting and planning" },
  
  // Users - Customers
  { path: "06-users/customers/portal-guide.md", title: "Portal Guide", description: "Customer portal guide" },
  { path: "06-users/customers/faq.md", title: "FAQ", description: "Frequently asked questions" },
  
  // MCP - Overview
  { path: "07-mcp/overview/mcp-architecture.md", title: "MCP Architecture", description: "MCP architecture overview" },
  { path: "07-mcp/overview/client-server-model.md", title: "Client-Server Model", description: "MCP client-server model" },
  { path: "07-mcp/overview/mcp-governance.md", title: "MCP Governance", description: "MCP governance and standards" },
  
  // MCP - Servers
  { path: "07-mcp/servers/filesystem.md", title: "Filesystem Server", description: "Filesystem MCP server" },
  { path: "07-mcp/servers/supabase.md", title: "Supabase Server", description: "Supabase MCP server" },
  { path: "07-mcp/servers/github.md", title: "GitHub Server", description: "GitHub MCP server" },
  { path: "07-mcp/servers/ui-generator.md", title: "UI Generator Server", description: "UI Generator MCP server" },
  
  // MCP - Tools
  { path: "07-mcp/tools/generate-docs.md", title: "Generate Docs", description: "Documentation generation tool" },
  { path: "07-mcp/tools/update-tokens.md", title: "Update Tokens", description: "Token update tool" },
  { path: "07-mcp/tools/db-introspect.md", title: "DB Introspect", description: "Database introspection tool" },
  { path: "07-mcp/tools/validate-docs.md", title: "Validate Docs", description: "Documentation validation tool" },
  
  // MCP - Prompts
  { path: "07-mcp/prompts/system-prompts.md", title: "System Prompts", description: "MCP system prompts" },
  { path: "07-mcp/prompts/tool-prompts.md", title: "Tool Prompts", description: "MCP tool prompts" },
  { path: "07-mcp/prompts/ai-patterns.md", title: "AI Patterns", description: "AI pattern documentation" },
  
  // Governance
  { path: "08-governance/audit-trails.md", title: "Audit Trails", description: "Audit trail documentation" },
  { path: "08-governance/review-process.md", title: "Review Process", description: "Documentation review process" },
  { path: "08-governance/versioning-policy.md", title: "Versioning Policy", description: "Versioning and release policy" },
  { path: "08-governance/branching-strategy.md", title: "Branching Strategy", description: "Git branching strategy" },
  { path: "08-governance/escalation-matrix.md", title: "Escalation Matrix", description: "Escalation procedures" },
  
  // Reference - Auto-generated placeholders (will be filled by MCP)
  { path: "09-reference/api/auto/README.md", title: "API Reference", description: "Auto-generated API reference (MCP-only)" },
  { path: "09-reference/database/auto/README.md", title: "Database Schema", description: "Auto-generated database schema (MCP-only)" },
  { path: "09-reference/ui/auto/README.md", title: "UI Component API", description: "Auto-generated component API (MCP-only)" },
  { path: "09-reference/tokens/auto/README.md", title: "Token Reference", description: "Auto-generated token reference (MCP-only)" },
  { path: "09-reference/figma/auto/README.md", title: "Figma Mapping", description: "Auto-generated Figma mapping (MCP-only)" },
  { path: "09-reference/schemas/auto/README.md", title: "Schema Reference", description: "Auto-generated schema reference (MCP-only)" },
];

async function createPlaceholder(placeholder: Placeholder): Promise<void> {
  const fullPath = join(TARGET_DIR, placeholder.path);
  
  if (existsSync(fullPath)) {
    return; // Skip if already exists
  }
  
  await mkdir(dirname(fullPath), { recursive: true });
  
  const content = `# ${placeholder.title}

> **${placeholder.description}**

---

## Overview

[Content to be added]

---

**Status:** 📝 Placeholder  
**Last Updated:** 2025-11-24  
**Next Review:** TBD

`;

  await writeFile(fullPath, content, 'utf-8');
  console.log(`📝 Created: ${placeholder.path}`);
}

async function main() {
  console.log("📝 Creating placeholders for missing documentation sections...\n");
  
  let created = 0;
  let skipped = 0;
  
  for (const placeholder of PLACEHOLDERS) {
    const fullPath = join(TARGET_DIR, placeholder.path);
    if (existsSync(fullPath)) {
      skipped++;
      continue;
    }
    await createPlaceholder(placeholder);
    created++;
  }
  
  console.log(`\n✅ Placeholder creation complete!`);
  console.log(`📝 Created: ${created}`);
  console.log(`⏭️  Skipped (already exists): ${skipped}`);
  console.log(`📊 Total: ${PLACEHOLDERS.length}`);
}

main().catch(console.error);

