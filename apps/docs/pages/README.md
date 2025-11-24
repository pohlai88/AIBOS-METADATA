# AI-BOS Platform Documentation

> **Comprehensive ERP Documentation System**  
> **Single Source of Truth (SSOT)** for all AI-BOS platform knowledge

This directory contains the complete documentation for the AI-BOS enterprise ERP platform, covering all aspects from foundation principles to end-user guides.

---

## 📚 Documentation Structure

```
docs/
├── 01-foundation/          # System philosophy, conventions, and core rules
├── 02-architecture/         # Technical blueprint of AI-BOS
├── 03-modules/              # All ERP modules (functional & technical)
├── 04-developer/            # Developer portal (UI, Backend, DB, MCP)
├── 05-operations/           # DevOps, Infrastructure, Security
├── 06-users/                # End-user help center (role-based)
├── 07-mcp/                  # AI, Agents, Tools, Automation
├── 08-governance/           # Compliance, Audits, Workflows
├── 09-reference/            # Auto-generated reference (MCP-only)
└── 99-archive/              # Historical documentation
```

---

## 🎯 Documentation Sections

### 01-Foundation
**Purpose:** System philosophy, conventions, and core rules  
**Audience:** All team members  
**Contents:**
- Philosophy (principles, design language, platform vision)
- Conventions (naming, folder structure, coding standards)
- Metadata (governance, lifecycle, dictionary)
- UI System (tokens, colors, typography, spacing, accessibility)
- Glossary (common terms, domain definitions)

### 02-Architecture
**Purpose:** Technical blueprint of AI-BOS  
**Audience:** Developers, Architects  
**Contents:**
- System overview and diagrams
- Frontend architecture (App Router, components, design system)
- Backend architecture (services, BFF, auth, security)
- Database architecture (schema, migrations, multi-tenant)
- Integrations (third-party, webhooks, payments)
- AI Engine (LLM architecture, prompt engineering, agent flows)

### 03-Modules
**Purpose:** ERP module documentation  
**Audience:** Developers, Product Consultants, End Users  
**Contents:**
- Accounting, Inventory, Manufacturing, Procurement
- Sales, CRM, HR & Payroll, Retail POS
- Franchise, Plantation, Central Kitchen, Logistics
- Each module includes: overview, business rules, API, database mapping

### 04-Developer
**Purpose:** Developer portal  
**Audience:** Developers  
**Contents:**
- UI (components, patterns, layouts, examples)
- API (endpoints, REST/GraphQL guidelines, examples)
- Backend (domain services, BFF, job queue, workers)
- Database (schema reference, migrations, constraints)
- CLI Tools (aibos-cli, scripts, automation)
- Testing (unit tests, E2E tests, mocking)

### 05-Operations
**Purpose:** DevOps, Infrastructure, Security  
**Audience:** Ops, SRE, Security, Compliance  
**Contents:**
- Deployment (environment setup, pipeline, versioning, rollback)
- Monitoring (logs, health checks, metrics, alerts)
- Security (SOC2, HIPAA, access control, key management)
- Performance (caching, scalability, benchmarks)
- Support (incident response, postmortems, troubleshooting)

### 06-Users
**Purpose:** End-user help center  
**Audience:** End Users  
**Contents:**
- Staff (beginners guide, orders, inventory, expenses)
- Managers (dashboards, approvals, reports, role management)
- Executives (analytics, financial reports, forecasting)
- Customers (portal guide, FAQ)

### 07-MCP
**Purpose:** AI, Agents, Tools, Automation  
**Audience:** Developers, AI Engineers  
**Contents:**
- MCP architecture and client-server model
- MCP servers (filesystem, supabase, github, ui-generator)
- MCP tools (generate-docs, update-tokens, sync-figma, validate-docs)
- Prompts (system prompts, tool prompts, AI patterns)

### 08-Governance
**Purpose:** Compliance, Audits, Workflows  
**Audience:** Management, Compliance Teams  
**Contents:**
- Documentation governance
- Audit trails
- Review process
- Versioning policy
- Branching strategy
- Escalation matrix

### 09-Reference
**Purpose:** Auto-generated reference (MCP-only)  
**Audience:** Developers, AI Agents  
**Contents:**
- API reference (auto-generated)
- Database schema (auto-generated)
- UI component API (auto-generated)
- Token reference (auto-generated)
- Figma mapping (auto-generated)
- Schema reference (auto-generated)

**⚠️ Important:** Files in `09-reference/auto/` are **MCP-only**. Do not edit manually.

### 99-Archive
**Purpose:** Historical documentation  
**Audience:** Reference only  
**Contents:**
- Archived proposals, decisions, summaries, outdated docs
- Organized by date for historical reference

---

## 🔍 Quick Navigation

### For Developers
- [Developer Portal](./04-developer/) - Complete developer documentation
- [Architecture](./02-architecture/) - Technical architecture
- [API Reference](./04-developer/api/) - API documentation
- [Component Library](./04-developer/ui/components/) - UI components

### For Designers
- [UI System](./01-foundation/ui-system/) - Design tokens, colors, typography
- [Component Philosophy](./01-foundation/ui-system/components-philosophy.md) - Design principles
- [Accessibility](./01-foundation/ui-system/a11y-guidelines.md) - Accessibility guidelines

### For Product Consultants
- [ERP Modules](./03-modules/) - All module documentation
- [Business Rules](./03-modules/) - Module-specific business logic
- [Use Cases](./03-modules/) - Module use cases

### For End Users
- [User Guides](./06-users/) - Role-based help center
- [Getting Started](./06-users/staff/beginners-guide.md) - Beginners guide
- [FAQ](./06-users/customers/faq.md) - Frequently asked questions

### For Operations
- [Operations Guide](./05-operations/) - DevOps and infrastructure
- [Security](./05-operations/security/) - Security and compliance
- [Monitoring](./05-operations/monitoring/) - Monitoring and alerts

### For Compliance
- [Governance](./08-governance/) - Documentation governance
- [Audit Trails](./08-governance/audit-trails.md) - Audit documentation
- [Security Controls](./05-operations/security/) - SOC2, HIPAA controls

---

## 📋 Documentation Standards

### Templates
All documentation uses standardized templates located in `docs/.templates/`:
- ERP Module Template
- Component Template
- API Template
- User Guide Template
- MCP Tool Template

### Validation
All documentation is validated against:
- ✅ Tailwind Tokens (via MCP)
- ✅ Figma Design System (via MCP)
- ✅ Next.js Best Practices
- ✅ Documentation Standards

### Governance
Documentation is governed by:
- **Documentation Steward:** Maintains structure and quality
- **Templates:** Ensures consistency
- **MCP Automation:** Auto-generates reference docs
- **Review Process:** All changes reviewed before merge

---

## 🔄 Documentation Lifecycle

1. **Create** → Use appropriate template
2. **Review** → Validate against MCP tools
3. **Approve** → Documentation Steward review
4. **Publish** → Added to documentation site
5. **Maintain** → Regular updates per governance rules

---

## 🚀 Getting Started

### For Contributors
1. Review [Documentation Standards](./01-foundation/conventions/documentation-standard.md)
2. Use appropriate template from `docs/.templates/`
3. Follow [Governance Rules](./08-governance/documentation-governance.md)
4. Validate against MCP tools before submitting

### For Readers
1. Use the navigation above to find relevant section
2. Check [Quick Navigation](#-quick-navigation) for your role
3. Use search in Nextra documentation site
4. Reference [Glossary](./01-foundation/glossary/) for terms

---

## 📊 Documentation Status

| Section | Status | Coverage |
|---------|--------|----------|
| **01-Foundation** | ✅ Complete | 100% |
| **02-Architecture** | 🟡 In Progress | 30% |
| **03-Modules** | 🔴 Not Started | 0% |
| **04-Developer** | 🟡 In Progress | 40% |
| **05-Operations** | 🔴 Not Started | 0% |
| **06-Users** | 🟡 In Progress | 20% |
| **07-MCP** | 🟡 In Progress | 50% |
| **08-Governance** | 🟡 In Progress | 60% |
| **09-Reference** | 🔴 Auto-Generated | MCP-only |

**Legend:**
- ✅ Complete
- 🟡 In Progress
- 🔴 Not Started / Placeholder

---

## 🔗 Related Resources

- **Documentation Site:** [Nextra Site](http://localhost:3001) (when running)
- **Templates:** `docs/.templates/`
- **Manifest:** `docs/ui-docs.manifest.json`
- **Migration Guide:** `docs/CONTENT_MAPPING.md`
- **Structure:** `docs/STRUCTURE_COMPLETE.md`

---

## 📝 Maintenance

**Documentation Steward:** [To be assigned]  
**Last Updated:** 2025-11-24  
**Version:** 2.0.0 (Comprehensive Structure)  
**Status:** ✅ Phase 2 Migration Complete

---

**For questions or contributions, see [Governance](./08-governance/documentation-governance.md)**
