# MCP Configuration Guide for Convention Validation

> **Last Updated:** 2025-11-24  
> **Purpose:** Step-by-step guide to configure convention validation MCP server

---

## Overview

This guide provides step-by-step instructions to configure the `aibos-convention-validation` MCP server for automated convention validation.

---

## Step 1: Install Dependencies

**Location:** `.mcp/convention-validation/`

```bash
cd .mcp/convention-validation
pnpm install
```

**Expected Output:**
```
Scope: all 7 workspace projects
Done in X.Xs
```

---

## Step 2: Add to MCP Configuration

**File:** `.cursor/mcp.json`

**Add the following entry:**

```json
{
  "mcpServers": {
    "aibos-convention-validation": {
      "command": "node",
      "args": [".mcp/convention-validation/server.mjs"]
    }
  }
}
```

**Note:** If `mcpServers` already exists, add `aibos-convention-validation` to the existing object.

---

## Step 3: Restart Cursor

**Action Required:**
- Close and restart Cursor IDE
- This reloads MCP server configuration

**Verification:**
- Check Cursor MCP status
- Verify `aibos-convention-validation` appears in MCP servers list

---

## Step 4: Test Validation Tools

**Test Naming Validation:**
```typescript
// In Cursor, use MCP tool
await mcp_aibos-convention-validation_validate_naming({
  filePath: "packages/ui/src/components/button.tsx",
  componentName: "Button"
});
```

**Test Structure Validation:**
```typescript
await mcp_aibos-convention-validation_validate_folder_structure({
  directoryPath: "packages/ui",
  structureType: "package"
});
```

**Test Documentation Validation:**
```typescript
await mcp_aibos-convention-validation_validate_documentation_format({
  filePath: "docs/01-foundation/conventions/naming.md"
});
```

---

## Step 5: Setup Pre-Commit Hooks (Optional)

### Using Husky

**Install Husky:**
```bash
pnpm add -D husky
npx husky init
```

**Create Pre-Commit Hook:**
```bash
npx husky add .husky/pre-commit "node .mcp/convention-validation/scripts/validate-staged.mjs"
```

**Make Script Executable:**
```bash
chmod +x .mcp/convention-validation/scripts/validate-staged.mjs
```

### Manual Git Hook

**Create:** `.git/hooks/pre-commit`

```bash
#!/bin/sh
node .mcp/convention-validation/scripts/validate-staged.mjs
```

**Make Executable:**
```bash
chmod +x .git/hooks/pre-commit
```

---

## Step 6: Add CI/CD Workflow (Optional)

**File:** `.github/workflows/convention-validation.yml`

**Already Created:** ✅ See `docs/01-foundation/conventions/PHASE2_COMPLETE.md`

**Activation:**
- Workflow file is ready
- Update validation scripts when ready
- Workflow will run on PR and push

---

## Step 7: Add Package.json Scripts (Optional)

**File:** `package.json`

**Add Scripts:**
```json
{
  "scripts": {
    "mcp:validate-naming": "node .mcp/convention-validation/scripts/validate-all.mjs --naming",
    "mcp:validate-structure": "node .mcp/convention-validation/scripts/validate-all.mjs --structure",
    "mcp:validate-coding": "node .mcp/convention-validation/scripts/validate-all.mjs --coding",
    "mcp:validate-docs": "node .mcp/convention-validation/scripts/validate-all.mjs --docs",
    "mcp:validate-all": "node .mcp/convention-validation/scripts/validate-all.mjs"
  }
}
```

**Usage:**
```bash
# Validate naming
pnpm mcp:validate-naming

# Validate all conventions
pnpm mcp:validate-all
```

---

## Verification Checklist

- [ ] Dependencies installed in `.mcp/convention-validation/`
- [ ] Server added to `.cursor/mcp.json`
- [ ] Cursor restarted
- [ ] MCP server appears in Cursor MCP list
- [ ] Test validation tools work
- [ ] Pre-commit hooks configured (optional)
- [ ] CI/CD workflow added (optional)
- [ ] Package.json scripts added (optional)

---

## Troubleshooting

### Server Not Loading

**Issue:** MCP server doesn't appear in Cursor

**Solutions:**
1. Check `.cursor/mcp.json` syntax
2. Verify server path is correct
3. Restart Cursor
4. Check Cursor MCP logs

### Validation Errors

**Issue:** Validation fails unexpectedly

**Solutions:**
1. Check manifest files exist
2. Verify file paths are correct
3. Check file permissions
4. Review error messages

### Pre-Commit Hook Not Working

**Issue:** Hook doesn't run or fails

**Solutions:**
1. Verify hook is executable
2. Check hook path is correct
3. Test script manually
4. Check Git hook permissions

---

## Related Documentation

- [Convention Validation MCP README](../../../.mcp/convention-validation/README.md)
- [Enforcement Rules](./enforcement-rules.md)
- [MCP Governance Guide](./MCP_GOVERNANCE_GUIDE.md)

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS Platform Team

