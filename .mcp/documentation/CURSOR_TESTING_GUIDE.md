# 🧪 Cursor Testing Guide - Documentation MCP Server

> **How to Test MCP Tools via Cursor**  
> **Date:** 2025-11-24

---

## ✅ Pre-Testing Verification

### **1. Server Status**
- ✅ Server file: `.mcp/documentation/server.mjs` exists
- ✅ Configuration: Added to `.cursor/mcp.json`
- ✅ Dependencies: Installed
- ✅ Token reference: Already generated (110 tokens found)

### **2. Generated Files**
- ✅ `docs/09-reference/tokens/auto/tokens-reference.md` exists
- ✅ Contains 110 tokens categorized (Typography, Colors, Spacing, etc.)

---

## 🧪 Testing via Cursor

### **Test 1: validate_docs**

**Command in Cursor:**
```
Validate the documentation structure using the aibos-documentation MCP server
```

**Or:**
```
Check if the documentation follows the manifest structure
```

**Expected Result:**
- Structure validation report
- Template compliance check
- Manifest compliance check
- Governance metadata with risk level

**Verify:**
- Response includes `valid: true/false`
- Governance metadata present
- Risk level indicated (SAFE_TO_AUTO, REQUIRES_REVIEW, etc.)

---

### **Test 2: update_token_reference**

**Command in Cursor:**
```
Generate token reference documentation from globals.css using aibos-documentation MCP
```

**Or:**
```
Update the token reference documentation
```

**Expected Result:**
- Token extraction from `packages/ui/src/design/globals.css`
- Semantic categorization
- Output to `docs/09-reference/tokens/auto/tokens-reference.md`
- Backup created (if file exists)
- Governance metadata

**Verify:**
- Check `docs/09-reference/tokens/auto/tokens-reference.md` updated
- Check `.mcp-backups/` for backup file
- Response includes `tokensGenerated` count
- Response includes `categories` array

---

### **Test 3: sync_nextra**

**Command in Cursor:**
```
Sync documentation to Nextra using aibos-documentation MCP
```

**Or:**
```
Run the Nextra documentation sync
```

**Expected Result:**
- Runs `apps/docs/scripts/sync-docs.ts`
- Syncs `docs/` to `apps/docs/pages/`
- File locking prevents concurrent syncs
- Governance metadata

**Verify:**
- Check `apps/docs/pages/` updated
- Response includes `success: true`
- No lock file left behind (`.mcp-docs.lock`)

---

### **Test 4: generate_from_template**

**Command in Cursor:**
```
Generate documentation from erp-module template using aibos-documentation MCP with module name "Test Module" and description "A test module"
```

**Or:**
```
Create a new ERP module documentation file using the template
```

**Expected Result:**
- Template schema validation
- Placeholder replacement
- Output file creation
- Backup created (if file exists)
- Validation warnings/errors if data missing

**Verify:**
- Check output file created
- Check `.mcp-backups/` for backup
- Response includes `success: true`
- Response includes `warnings` if any

---

## 🔍 Verification Checklist

### **After Each Test:**

- [ ] Response includes governance metadata
- [ ] Response includes risk level
- [ ] Response includes timestamp
- [ ] No errors in response
- [ ] File operations completed (if applicable)
- [ ] Backups created (if file existed)
- [ ] Lock files cleaned up

### **Check Files:**

```bash
# Check token reference
cat docs/09-reference/tokens/auto/tokens-reference.md

# Check backups
ls -la docs/.mcp-backups/

# Check lock file (should not exist after operation)
ls -la docs/.mcp-docs.lock
```

### **Check Event Logs:**

Watch Cursor's MCP server logs (stderr) for structured JSON events:
- `*_started` events
- `*_completed` events
- `*_failed` events (if any)

---

## 📊 Expected Test Results

### **Test 1: validate_docs**
```json
{
  "valid": true,
  "results": {
    "structure": { "valid": true, "errors": [] },
    "templates": { "valid": true, "errors": [] },
    "links": { "valid": true, "errors": [] },
    "manifest": { "valid": true, "errors": [] }
  },
  "governance": {
    "riskLevel": "safe_to_auto",
    "timestamp": "2025-11-24T..."
  }
}
```

### **Test 2: update_token_reference**
```json
{
  "success": true,
  "outputPath": "docs/09-reference/tokens/auto/tokens-reference.md",
  "tokensGenerated": 110,
  "categories": ["colors", "spacing", "typography"],
  "backup": { "path": ".mcp-backups/..." },
  "governance": {
    "riskLevel": "safe_to_auto",
    "timestamp": "2025-11-24T..."
  }
}
```

### **Test 3: sync_nextra**
```json
{
  "success": true,
  "output": "Syncing documentation...",
  "message": "Nextra sync completed successfully",
  "governance": {
    "riskLevel": "safe_to_auto",
    "timestamp": "2025-11-24T..."
  }
}
```

### **Test 4: generate_from_template**
```json
{
  "success": true,
  "outputPath": "docs/03-modules/test-module/overview.md",
  "template": "erp-module",
  "sections": ["overview", "business-rules", "api", "database", "use-cases"],
  "backup": null,
  "warnings": [],
  "governance": {
    "riskLevel": "safe_to_auto",
    "timestamp": "2025-11-24T..."
  }
}
```

---

## ⚠️ Troubleshooting

### **Tool Not Found**
- **Issue:** Cursor doesn't recognize the tool
- **Solution:** 
  1. Verify `.cursor/mcp.json` has `aibos-documentation` entry
  2. Restart Cursor completely
  3. Check server file exists at `.mcp/documentation/server.mjs`

### **Rate Limit Error**
- **Issue:** "Rate limit exceeded" error
- **Solution:** Wait 1 minute and retry (10 requests per minute limit)

### **Lock File Error**
- **Issue:** "Lock already acquired" error
- **Solution:** 
  1. Check if another operation is running
  2. Wait for completion
  3. If stuck, manually delete `.mcp-docs.lock` (stale lock cleanup after 5 minutes)

### **Template Not Found**
- **Issue:** "Template not found" error
- **Solution:** 
  1. Check template exists in `docs/.templates/`
  2. Verify template name in `docs/ui-docs.manifest.json`
  3. Use correct template name from manifest

---

## 📝 Test Report Template

After testing, document results:

```markdown
## Test Results - [Date]

### Test 1: validate_docs
- ✅/❌ Status
- Response: [Summary]
- Governance: [Risk level]

### Test 2: update_token_reference
- ✅/❌ Status
- Tokens Generated: [Count]
- Backup Created: Yes/No

### Test 3: sync_nextra
- ✅/❌ Status
- Files Synced: [Count]
- Errors: None/[List]

### Test 4: generate_from_template
- ✅/❌ Status
- File Created: [Path]
- Warnings: None/[List]
```

---

**Last Updated:** 2025-11-24  
**Status:** ✅ Ready for Testing

