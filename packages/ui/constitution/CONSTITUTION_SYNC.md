# Constitution Files Sync Status

> **Date:** 2025-11-24  
> **Purpose:** Ensure constitution YML files are synced with MCP server functionality

---

## 📋 Constitution Files Overview

### Files

1. **`tokens.yml`** - Token governance, immutability, RSC rules
2. **`rsc.yml`** - React Server Component boundary rules
3. **`components.yml`** - Component structure, API, accessibility rules

### Server Implementation

**Server:** `.mcp/component-generator/server.mjs`  
**Function:** `loadConstitution()` loads all three YML files

---

## ✅ Synced Rules

### **Component Constitution (components.yml)**

| Rule Category | YML Location | Server Implementation | Status |
|---------------|-------------|----------------------|--------|
| Component name validation | `structure.required` | `validateAgainstConstitution()` - Line 346 | ✅ Synced |
| Component type validation | `structure.patterns` | `validateAgainstConstitution()` - Line 357 | ✅ Synced |
| Radix UI boundaries | `structure.patterns.primitive` | `validateAgainstConstitution()` - Line 369 | ✅ Synced |
| Safe mode compatibility | `safe_mode.required` | `validateAgainstConstitution()` - Line 379 | ✅ Synced |
| Token alias mapping | `styling.token_alias_enforcement` | `validateAgainstConstitution()` - Line 387 | ✅ Synced |
| State machine requirements | `structure.state_machines` | `validateAgainstConstitution()` - Line 404 | ✅ Synced |
| Props structure | `props.required` | `validatePropsStructure()` - Line 532 | ✅ Synced |
| Styling rules | `styling.forbidden` | `validateStylingRules()` - Line 537 | ✅ Synced |
| Import validation | `imports.forbidden` | `validateImports()` - Line 544 | ✅ Synced |
| Radix boundaries | `imports.forbidden` | `validateRadixBoundaries()` - Line 550 | ✅ Synced |
| Semantic naming | `props.naming` | `validateSemanticNaming()` - Line 556 | ✅ Synced |
| Token alias mapping | `styling.token_alias_enforcement` | `validateTokenAliasMappings()` - Line 562 | ✅ Synced |
| Motion safety | `motion.reduced_motion` | `validateMotionSafety()` - Line 568 | ✅ Synced |
| Style drift | `visual_regression` | `validateStyleDrift()` - Line 574 | ✅ Synced |
| Keyboard navigation | `accessibility.keyboard` | `validateKeyboardNavigation()` - Line 600 | ✅ Synced |
| Focus trapping | `accessibility.focus` | `validateFocusTrapping()` - Line 711 | ✅ Synced |
| Semantic landmarks | `accessibility.required` | `validateSemanticLandmarks()` - Line 787 | ✅ Synced |
| Heading hierarchy | `accessibility.required` | `validateHeadingHierarchy()` - Line 871 | ✅ Synced |

### **RSC Constitution (rsc.yml)**

| Rule Category | YML Location | Server Implementation | Status |
|---------------|-------------|----------------------|--------|
| Server component forbidden APIs | `rules.server.forbidden` | `validateGeneratedCode()` - Line 452 (TODO) | ⚠️ TODO |
| Client component requirements | `rules.client.required` | `validateGeneratedCode()` - Line 452 (TODO) | ⚠️ TODO |
| Radix UI in RSC | `rules.radix_ui.rules` | `validateRadixBoundaries()` - Line 550 | ✅ Synced |

### **Token Constitution (tokens.yml)**

| Rule Category | YML Location | Server Implementation | Status |
|---------------|-------------|----------------------|--------|
| Token validation | `validation.required` | `validateAgainstConstitution()` - Line 332 (TODO) | ⚠️ TODO |
| Token alias mapping | `tokenCategories.color.rules` | `validateTokenAliasMappings()` - Line 562 | ✅ Synced |

---

## ⚠️ TODO: Rules Not Yet Implemented

### **1. Token Constitution Validation**

**Location:** `validateAgainstConstitution()` - Line 332  
**Status:** Placeholder implementation

```javascript
// Current (TODO)
const tokenValidation = { valid: true, violations: [] }; // TODO: Implement validation

// Should implement:
// - Check tokens exist in globals.css
// - Validate token naming conventions
// - Check contrast requirements
// - Validate tenant override boundaries
```

**Constitution Rules to Implement:**
- `tokens.yml` → `validation.required`
- `tokens.yml` → `tokenCategories.color.contrast`
- `tokens.yml` → `tenantOverrideBoundaries`

### **2. RSC Boundary Validation**

**Location:** `validateGeneratedCode()` - Line 452  
**Status:** Placeholder implementation

```javascript
// Current (TODO)
const rscValidation = { valid: true, violations: [] }; // TODO: Implement validation

// Should implement:
// - Check for browser globals in server components
// - Check for forbidden hooks
// - Check for forbidden imports
// - Validate async component side effects
```

**Constitution Rules to Implement:**
- `rsc.yml` → `rules.server.forbidden.browser_globals`
- `rsc.yml` → `rules.server.forbidden.hooks`
- `rsc.yml` → `rules.server.forbidden.imports`
- `rsc.yml` → `rules.async_server_components.side_effect_guard`

### **3. React Structure Validation**

**Location:** `validateGeneratedCode()` - Line 467  
**Status:** Placeholder implementation

```javascript
// Current (TODO)
const reactValidation = { valid: true, violations: [], errors: [], warnings: [] }; // TODO: Implement validation

// Should implement:
// - Component structure validation (forwardRef, displayName)
// - Props interface validation
// - Component type validation
```

**Note:** Some React validation is already implemented in separate functions, but not integrated here.

### **4. Accessibility Validation**

**Location:** `validateGeneratedCode()` - Line 487  
**Status:** Placeholder implementation

```javascript
// Current (TODO)
const a11yValidation = { valid: true, violations: [] }; // TODO: Implement validation

// Should implement:
// - Icon-only button aria-label check
// - Form input label association
// - Interactive element roles
// - Image alt text
// - Modal dialog roles
```

**Note:** Accessibility validation exists in `aibos-a11y-validation` MCP server, but not integrated here.

---

## 🔄 Integration Recommendations

### **Option 1: Call Other MCP Servers (Not Possible)**

❌ **MCP servers cannot call other MCP servers directly**

### **Option 2: Share Validation Functions**

✅ **Extract validation logic into shared modules:**

```
packages/ui/constitution/
├── validators/
│   ├── token-validator.mjs
│   ├── rsc-validator.mjs
│   ├── react-validator.mjs
│   └── a11y-validator.mjs
```

**Benefits:**
- ✅ Reusable validation logic
- ✅ Single source of truth
- ✅ Consistent validation across servers

### **Option 3: Implement Inline Validation**

✅ **Implement validation directly in component-generator:**

- Copy validation logic from other MCP servers
- Implement missing validations
- Ensure all constitution rules are checked

**Benefits:**
- ✅ Self-contained server
- ✅ No external dependencies
- ✅ Full control

---

## 📊 Current Implementation Status

### **Implemented Rules: 17/86 (20%)**

✅ **Fully Implemented:**
- Component name validation
- Component type validation
- Radix UI boundaries
- Safe mode compatibility
- Token alias mapping
- State machine requirements
- Props structure
- Styling rules
- Import validation
- Semantic naming
- Motion safety
- Style drift
- Keyboard navigation
- Focus trapping
- Semantic landmarks
- Heading hierarchy
- Radix boundaries

### **Partially Implemented: 4/86 (5%)**

⚠️ **Placeholder/TODO:**
- Token constitution validation
- RSC boundary validation
- React structure validation
- Accessibility validation

### **Not Implemented: 65/86 (75%)**

❌ **Missing:**
- Most token validation rules
- Most RSC boundary rules
- Most accessibility rules
- Visual regression rules
- Custom hooks documentation rules

---

## 🎯 Next Steps

### **Priority 1: Implement Core Validations**

1. **Token Validation** - Implement token existence and naming checks
2. **RSC Boundary** - Implement server/client component validation
3. **Accessibility** - Integrate or implement a11y validation
4. **React Structure** - Complete component structure validation

### **Priority 2: Enhance Existing Validations**

1. **Token Mapping** - Enhance variant-to-token mapping validation
2. **Style Drift** - Improve design-to-code comparison
3. **Motion Safety** - Enhance reduced motion validation

### **Priority 3: Add Missing Validations**

1. **Visual Regression** - Implement snapshot testing validation
2. **Custom Hooks** - Add documentation validation
3. **State Machines** - Enhance state machine validation

---

## 📝 Constitution File Updates Needed

### **tokens.yml**

✅ **No updates needed** - File is comprehensive and matches requirements

### **rsc.yml**

✅ **No updates needed** - File is comprehensive and matches requirements

### **components.yml**

✅ **No updates needed** - File is comprehensive and matches requirements

**Note:** Constitution files are the source of truth. Server implementation needs to be updated to match them.

---

## 🔍 Validation Checklist

### **Before Component Generation**

- [ ] Component name is PascalCase
- [ ] Component type is valid (primitive/composition/layout)
- [ ] Radix UI usage matches component type
- [ ] Safe mode compatibility checked
- [ ] Token alias mapping validated

### **After Code Generation**

- [ ] RSC boundary rules enforced
- [ ] React structure rules enforced
- [ ] Accessibility rules enforced
- [ ] Styling rules enforced
- [ ] Import rules enforced
- [ ] Motion safety rules enforced
- [ ] Style drift checked

---

**Last Updated:** 2025-11-24  
**Status:** Constitution files are comprehensive. Server implementation needs updates to match.

