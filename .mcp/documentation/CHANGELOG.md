# Changelog

## [2.0.0] - 2025-11-24

### 🚀 Enterprise-Grade Enhancements

#### Security & Governance
- ✅ **File Locking:** Prevents concurrent operations and race conditions
- ✅ **Rate Limiting:** Max 10 requests per minute per tool (prevents abuse)
- ✅ **Path Validation:** Strict validation of output paths (prevents path traversal)
- ✅ **Template Injection Protection:** Sanitizes template data to prevent XSS/injection
- ✅ **Risk Categories:** Enhanced governance metadata with risk levels (SAFE_TO_AUTO, REQUIRES_REVIEW, RISK_LOW, RISK_MEDIUM, RISK_HIGH)

#### Backup & Versioning
- ✅ **Automatic Backups:** Creates timestamped backups before overwriting files
- ✅ **Backup Directory:** `.mcp-backups/` stores all backup versions
- ✅ **Hash-based Naming:** Backups include content hash for deduplication

#### Template System
- ✅ **Schema Validation:** Validates template placeholders against required fields
- ✅ **Placeholder Detection:** Automatically detects all placeholders in templates
- ✅ **Unresolved Placeholder Detection:** Warns about missing template data
- ✅ **Section Validation:** Validates template sections against manifest

#### Token Parsing
- ✅ **Semantic Token Parsing:** Replaces primitive substring matching with semantic categorization
- ✅ **Category Detection:** Colors, spacing, typography, layout, effects
- ✅ **Subcategory Support:** Brand, semantic, safe, dark, light modes
- ✅ **Better Token Grouping:** Groups tokens by semantic meaning, not just name patterns

#### Observability
- ✅ **Event Emission:** Emits structured events for all operations
- ✅ **Event Types:** `*_started`, `*_completed`, `*_failed`, `tool_error`
- ✅ **Structured Logging:** JSON-formatted events to stderr (MCP standard)
- ✅ **Integration Ready:** Events ready for AppTelemetry integration

#### Operational Improvements
- ✅ **Stale Lock Detection:** Automatically removes locks older than 5 minutes
- ✅ **Process ID Tracking:** Locks include PID for debugging
- ✅ **Graceful Shutdown:** Releases all locks on SIGINT/SIGTERM
- ✅ **Timeout Protection:** 60-second timeout for shell commands
- ✅ **Error Recovery:** Better error handling and recovery paths

### 🔧 Technical Changes

- **Lock File:** `.mcp-docs.lock` prevents concurrent operations
- **Backup Directory:** `.mcp-backups/` for versioning
- **Rate Limit Window:** 60 seconds, 10 requests max
- **Lock Timeout:** 5 minutes (stale lock cleanup)

### 📊 Governance Metadata

All responses now include:
```json
{
  "governance": {
    "toolId": "aibos-documentation",
    "domain": "documentation_automation",
    "registryTable": "mdm_tool_registry",
    "category": "generation|validation|sync",
    "severity": "info|warning|error",
    "riskLevel": "safe_to_auto|requires_review|risk_low|risk_medium|risk_high",
    "timestamp": "2025-11-24T..."
  }
}
```

### 🎯 Breaking Changes

None - All changes are backward compatible.

### 📝 Migration Notes

- **No migration required** - Server is drop-in replacement
- **Backup directory created automatically** - No manual setup needed
- **Lock files auto-cleanup** - No manual intervention required

---

## [1.0.0] - 2025-11-24

### Initial Release

- ✅ Core MCP server implementation
- ✅ Manifest loader with caching
- ✅ 4 core tools: `validate_docs`, `update_token_reference`, `sync_nextra`, `generate_from_template`
- ✅ Basic governance metadata
- ✅ Token extraction from globals.css
- ✅ Template generation

---

**Last Updated:** 2025-11-24

