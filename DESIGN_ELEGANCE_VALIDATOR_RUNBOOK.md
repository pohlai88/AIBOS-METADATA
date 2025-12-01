# Design Elegance Validator MCP - Runbook

> **Version:** 1.0.0  
> **Purpose:** Complete guide for using the Design Elegance Validator MCP to validate and improve your design system  
> **Last Updated:** 2025-01-27

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Validation Process](#validation-process)
4. [Understanding Results](#understanding-results)
5. [Fixing Issues](#fixing-issues)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Integration Workflow](#integration-workflow)

---

## 🎯 Overview

The **Design Elegance Validator MCP** validates your design system against the **Cockpit Elegance Standards** to ensure:

- ✅ **Adaptive Luminance** - Colors adapt properly between light/dark modes (not just inverted)
- ✅ **Optical Physics** - Glass panels, animations, and visual effects are properly implemented
- ✅ **Semantic Colors** - Status, theme, and file type colors are defined
- ✅ **Unified System** - Consistent animation timing and design tokens

### What It Validates

1. **Adaptive Luminance (40 points)**
   - Light mode tokens exist and are readable on white backgrounds
   - Dark mode tokens exist and are "neon" enough to pop
   - Colors shift between modes (not identical)
   - Math-based luminance calculations

2. **Kinetic Physics (30 points)**
   - Tailwind animation configuration
   - Blob/Aurora animations
   - Backdrop blur support
   - Glass panel utilities

3. **Component Adoption (30 points)**
   - Components use elegant design primitives
   - Glass panels and colored icons are implemented
   - Design system is actually used in code

---

## 🚀 Quick Start

### 1. Verify MCP Server is Configured

Check `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aibos-design-elegance-validator": {
      "command": "node",
      "args": [".mcp/design-elegance-validator/server.mjs"],
      "cwd": "."
    }
  }
}
```

### 2. Run the Audit

**Via Cursor AI:**
```
Validate design system elegance using aibos-design-elegance-validator
```

**Or directly:**
```bash
# The MCP tool will be called automatically when you ask Cursor to validate
```

### 3. Review Results

The validator returns:
- **Status**: `OUTSTANDING` (100/100) or `NEEDS REFINEMENT` (< 100)
- **Score**: X/100 points
- **Detailed Audit**: Breakdown by category
- **Governance**: Approval status and next steps

---

## 🔍 Validation Process

### Step 1: File Discovery

The validator looks for:
- `packages/ui/src/design/globals.css` - Main design tokens
- `tailwind.config.js` or `tailwind.config.ts` - Animation configuration
- `packages/ui/src/components/**/*.tsx` - Component usage

### Step 2: Physics Validation

#### Adaptive Luminance Checks

For each critical token (icon-js, icon-ts, icon-error, icon-success):

1. **Existence Check**
   - ✅ Token exists in light mode
   - ✅ Token exists in dark mode

2. **Luminance Math**
   - Light mode: Luminance < 0.6 (readable on white)
   - Dark mode: Luminance > 0.4 (neon/glow effect)

3. **Shift Verification**
   - Light and dark tokens must be different
   - Prevents lazy "invert only" design

#### Kinetic Physics Checks

- ✅ `animation: {}` block exists in Tailwind config
- ✅ `blob:` animation defined
- ✅ `backdropBlur:` configuration present

#### Component Adoption

- Scans `.tsx` files for:
  - `ColoredMDIIcon` usage
  - `glass-panel` class usage
  - Elegant design primitives

---

## 📊 Understanding Results

### Example Output

```json
{
  "status": "NEEDS REFINEMENT",
  "score": "70/100",
  "audit": {
    "adaptiveLuminance": {
      "passed": false,
      "issues": [
        "PHYSICS FAIL (Dark): --icon-js (#D97706) is too dark. It won't 'pop' in dark mode.",
        "LAZY DESIGN: --icon-error is identical in Light and Dark mode. It must shift."
      ]
    },
    "kineticEngine": {
      "passed": false,
      "issues": [
        "Missing 'blob' animation (The Aurora Engine)"
      ]
    },
    "systemAdoption": {
      "passed": true,
      "stats": "5 components are using Nano Banana primitives."
    }
  },
  "governance": {
    "approvedBy": null,
    "nextStep": "Run 'get_fix_snippets'"
  }
}
```

### Score Breakdown

- **100/100**: `OUTSTANDING` - Approved by Nano Banana Council ✅
- **70-99**: `NEEDS REFINEMENT` - Close, but needs fixes
- **< 70**: `NEEDS REFINEMENT` - Significant work required

### Issue Types

1. **MISSING**: Token or configuration doesn't exist
2. **PHYSICS FAIL**: Luminance math doesn't meet standards
3. **LAZY DESIGN**: Light/dark tokens are identical (no adaptation)

---

## 🔧 Fixing Issues

### Get Fix Snippets

Use the `get_fix_snippets` tool to get code fixes:

**For Luminance Issues:**
```bash
# Ask Cursor: "Get fix snippets for luminance issues"
```

Returns:
```css
/* Recommended Fix for Adaptive Luminance */
:root {
  --icon-js: #D97706; /* Dark Amber for White BG */
}
.dark {
  --icon-js: #FCD34D; /* Neon Amber for Dark BG */
}
```

**For Physics Issues:**
```bash
# Ask Cursor: "Get fix snippets for physics issues"
```

Returns:
```javascript
// tailwind.config.js fix
extend: {
  animation: {
    blob: "blob 7s infinite",
  },
  keyframes: {
    blob: {
      "0%": { transform: "translate(0px, 0px) scale(1)" },
      "33%": { transform: "translate(30px, -50px) scale(1.1)" },
      "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
      "100%": { transform: "translate(0px, 0px) scale(1)" },
    },
  },
}
```

### Manual Fixes

#### 1. Fix Adaptive Luminance

**Problem**: Colors don't adapt properly between light/dark modes

**Solution**: Update `packages/ui/src/design/globals.css`

```css
:root {
  /* Light mode: Darker, richer colors for white backgrounds */
  --icon-js: #D97706;      /* Dark amber */
  --icon-ts: #2563EB;      /* Dark blue */
  --icon-error: #DC2626;   /* Dark red */
  --icon-success: #059669; /* Dark green */
}

.dark {
  /* Dark mode: Brighter, neon colors for dark backgrounds */
  --icon-js: #FCD34D;      /* Neon amber */
  --icon-ts: #60A5FA;      /* Neon blue */
  --icon-error: #F87171;   /* Neon red */
  --icon-success: #34D399; /* Neon green */
}
```

**Luminance Guidelines:**
- Light mode: Luminance < 0.6 (darker colors)
- Dark mode: Luminance > 0.4 (brighter, neon colors)

#### 2. Fix Kinetic Physics

**Problem**: Missing animations or backdrop blur

**Solution**: Update `tailwind.config.js` or `tailwind.config.ts`

```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        blob: "blob 7s infinite",
        aurora: "aurora 20s linear infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        aurora: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
};
```

#### 3. Fix Component Adoption

**Problem**: Components don't use elegant design primitives

**Solution**: Update components to use:
- `ColoredMDIIcon` for semantic icons
- `glass-panel` class for glass morphism
- Elegant animations and effects

---

## 🔍 Troubleshooting

### Issue: "globals.css not found"

**Symptoms:**
```
MCP error -32603: globals.css not found
```

**Solutions:**

1. **Verify file exists:**
   ```bash
   ls packages/ui/src/design/globals.css
   ```

2. **Check MCP configuration:**
   - Ensure `cwd: "."` is set in `.cursor/mcp.json`
   - Restart Cursor to reload MCP servers

3. **Verify workspace root:**
   - The server resolves paths from workspace root
   - File should be at: `packages/ui/src/design/globals.css`

4. **Manual path check:**
   ```bash
   # From workspace root
   node -e "console.log(require('path').resolve('packages/ui/src/design/globals.css'))"
   ```

### Issue: "tailwind.config.js not found"

**Solutions:**

1. **Check for TypeScript config:**
   - Server looks for both `.js` and `.ts` variants
   - Ensure file exists at root or in `apps/` directory

2. **Create minimal config:**
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: ["./apps/**/*.{js,ts,jsx,tsx}"],
     theme: {
       extend: {
         animation: {},
         keyframes: {},
       },
     },
   };
   ```

### Issue: MCP Server Not Responding

**Solutions:**

1. **Restart Cursor:**
   - MCP servers load on Cursor startup
   - Restart to reload configuration

2. **Check server logs:**
   ```bash
   cd .mcp/design-elegance-validator
   node server.mjs
   # Should see: "Nano Banana Pro Validator running..."
   ```

3. **Verify dependencies:**
   ```bash
   cd .mcp/design-elegance-validator
   pnpm install
   ```

4. **Check MCP configuration:**
   ```bash
   cat .cursor/mcp.json | grep -A 5 "aibos-design-elegance-validator"
   ```

---

## ✅ Best Practices

### 1. Regular Validation

Run the validator:
- ✅ Before committing design changes
- ✅ After adding new design tokens
- ✅ During design system reviews
- ✅ Before major releases

### 2. Incremental Improvements

Don't try to fix everything at once:
1. Fix **Adaptive Luminance** first (highest impact)
2. Add **Kinetic Physics** (animations, glass effects)
3. Improve **Component Adoption** (gradual migration)

### 3. Document Decisions

When fixing issues:
- Document why specific luminance values were chosen
- Explain animation timing decisions
- Note any design system constraints

### 4. Test Both Modes

Always test in:
- ✅ Light mode
- ✅ Dark mode
- ✅ System preference (auto-switch)

### 5. Use Fix Snippets

The `get_fix_snippets` tool provides:
- ✅ Pre-validated code
- ✅ Correct luminance values
- ✅ Best practice implementations

---

## 🔄 Integration Workflow

### Pre-Commit Validation

```bash
# 1. Run validator
# (via Cursor AI or MCP tool)

# 2. Review results
# Check score and issues

# 3. Fix critical issues
# Use get_fix_snippets for guidance

# 4. Re-validate
# Ensure score improves

# 5. Commit when ready
# Score should be 100/100 for production
```

### Design System Updates

1. **Add New Token:**
   ```css
   :root {
     --icon-new: #COLOR; /* Light mode */
   }
   .dark {
     --icon-new: #COLOR; /* Dark mode - must be different! */
   }
   ```

2. **Validate:**
   - Run validator
   - Check luminance math
   - Verify shift between modes

3. **Document:**
   - Update design tokens documentation
   - Add usage examples

### Component Migration

1. **Identify Components:**
   - Find components using old design patterns
   - Prioritize high-visibility components

2. **Migrate:**
   - Replace with elegant primitives
   - Use `ColoredMDIIcon`
   - Add glass panels where appropriate

3. **Validate:**
   - Run validator
   - Check component adoption score
   - Ensure no regressions

---

## 📈 Success Metrics

### Target Scores

- **Development**: 70+ / 100
- **Staging**: 85+ / 100
- **Production**: 100 / 100

### Key Indicators

- ✅ All critical tokens have light/dark variants
- ✅ Luminance math passes for all tokens
- ✅ Animations configured in Tailwind
- ✅ Components use elegant primitives
- ✅ No "lazy design" issues (identical light/dark)

---

## 🎯 Next Steps

1. **Run Initial Audit:**
   ```
   Validate design system elegance
   ```

2. **Review Results:**
   - Identify critical issues
   - Prioritize fixes

3. **Get Fix Snippets:**
   ```
   Get fix snippets for [luminance|physics|glass] issues
   ```

4. **Implement Fixes:**
   - Update `globals.css`
   - Configure Tailwind
   - Migrate components

5. **Re-validate:**
   - Run audit again
   - Verify improvements
   - Aim for 100/100

---

## 📚 Related Documentation

- [Design Elegance Validator README](.mcp/design-elegance-validator/README.md)
- [Design Tokens Guide](packages/ui/src/design/README.md)
- [Component Guidelines](packages/ui/src/components/README.md)

---

## 🆘 Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review MCP server logs
3. Verify file paths and configuration
4. Check Cursor MCP server status

---

**Status:** ✅ **Ready to Use**  
**Last Validated:** 2025-01-27  
**Version:** 1.0.0

