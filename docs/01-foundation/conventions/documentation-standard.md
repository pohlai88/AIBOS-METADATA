# Documentation Standards

> **Last Updated:** 2025-11-24  
> **Status:** Active  
> **Scope:** All documentation in AI-BOS Platform

---

## Overview

This document defines standards for writing, formatting, and organizing documentation across the AI-BOS Platform.

---

## Markdown Format

### File Structure

**Required Elements:**
1. Title (H1)
2. Metadata block (optional)
3. Overview section
4. Main content
5. Related links section

**Template:**
```markdown
# Document Title

> **Last Updated:** YYYY-MM-DD  
> **Status:** Active | Draft | Archived  
> **Scope:** [Scope description]

---

## Overview

Brief description of the document's purpose and contents.

---

## Main Content

[Documentation content]

---

## Related Documentation

- [Related Doc 1](./related-doc-1.md)
- [Related Doc 2](../category/related-doc-2.md)

---

**Last Updated:** YYYY-MM-DD  
**Maintained By:** AI-BOS Platform Team
```

---

## Code Examples

### Inline Code

**Pattern:** Use backticks for inline code references

```markdown
Use the `Button` component for primary actions.
The `validateComponent` function checks component structure.
```

### Code Blocks

**Pattern:** Use fenced code blocks with language tags

```markdown
```typescript
export const Button = ({ children }: ButtonProps) => {
  return <button>{children}</button>;
};
```
```

### File References

**Pattern:** Use code references for existing code

```markdown
```12:18:packages/ui/src/components/button.tsx
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'solid', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('app-button-primary', className)}
        {...props}
      />
    );
  }
);
```
```

**Format:** `startLine:endLine:filepath`

---

## API Documentation

### Function Documentation

**Pattern:** Use JSDoc-style comments

```markdown
### `functionName(param1, param2)`

**Description:** Brief description of what the function does.

**Parameters:**
- `param1` (type): Description
- `param2` (type, optional): Description

**Returns:** Return type and description

**Example:**
\`\`\`typescript
const result = functionName('value1', 'value2');
\`\`\`
```

### Component Documentation

**Pattern:** Document props, usage, and examples

```markdown
### `ComponentName`

**Description:** Brief description of the component.

**Props:**
- `prop1` (type, required): Description
- `prop2` (type, optional): Description

**Usage:**
\`\`\`tsx
<ComponentName prop1="value1" prop2="value2">
  Content
</ComponentName>
\`\`\`
```

---

## Section Organization

### Headings Hierarchy

**Pattern:** Use consistent heading levels

```markdown
# Level 1 - Document Title
## Level 2 - Main Sections
### Level 3 - Subsections
#### Level 4 - Sub-subsections (use sparingly)
```

### Lists

**Pattern:** Use consistent list formatting

```markdown
- ✅ Correct item
- ✅ Another item
- ⚠️ Warning item
- ❌ Incorrect item
```

### Tables

**Pattern:** Use tables for structured data

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |
```

---

## Status Indicators

### Status Badges

**Pattern:** Use consistent status indicators

```markdown
- ✅ **Active** - Currently in use
- ⚠️ **Deprecated** - Still works but not recommended
- ❌ **Removed** - No longer available
- ⏳ **In Progress** - Under development
- 📋 **Planned** - Future work
```

### Version Information

**Pattern:** Include version in metadata

```markdown
> **Version:** 1.0.0  
> **Last Updated:** 2025-11-24  
> **Status:** Active
```

---

## Cross-References

### Internal Links

**Pattern:** Use relative paths for internal links

```markdown
- [Naming Conventions](./naming.md)
- [Folder Structure](./folder-structure.md)
- [Component Constitution](../../../packages/ui/constitution/components.yml)
```

### External Links

**Pattern:** Use descriptive link text

```markdown
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
```

---

## Code Documentation

### Inline Comments

**Pattern:** Use clear, concise comments

```typescript
// ✅ Good comment - explains why
// Use forwardRef to allow parent components to access the DOM node
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  // ...
);

// ❌ Bad comment - states the obvious
// This is a button component
export const Button = // ...
```

### JSDoc Comments

**Pattern:** Use JSDoc for public APIs

```typescript
/**
 * Validates a React component against best practices.
 * 
 * @param filePath - Path to the component file
 * @param componentName - Name of the component to validate
 * @returns Validation result with errors, warnings, and suggestions
 * 
 * @example
 * ```typescript
 * const result = validateComponent('button.tsx', 'Button');
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateComponent(
  filePath: string,
  componentName: string
): ValidationResult {
  // ...
}
```

---

## Documentation Types

### Getting Started Guides

**Structure:**
1. Overview
2. Prerequisites
3. Installation
4. Quick Start
5. Next Steps

### API Documentation

**Structure:**
1. Overview
2. Authentication (if applicable)
3. Endpoints/Methods
4. Request/Response Examples
5. Error Handling

### Component Documentation

**Structure:**
1. Overview
2. Props
3. Usage Examples
4. Variants
5. Accessibility
6. Related Components

### Architecture Documentation

**Structure:**
1. Overview
2. System Design
3. Components/Modules
4. Data Flow
5. Integration Points

---

## File Naming

### Documentation Files

**Pattern:** Use kebab-case, be descriptive

```markdown
✅ Correct:
- naming.md
- folder-structure.md
- component-architecture.md
- getting-started.md

❌ Incorrect:
- naming_conventions.md (use kebab-case)
- folder.md (too generic)
- arch.md (abbreviation)
```

### Directory Organization

**Pattern:** Use numbered prefixes for ordering

```markdown
✅ Correct:
- 01-foundation/
- 02-architecture/
- 07-mcp/
- 99-archive/

❌ Incorrect:
- foundation/ (no ordering)
- architecture/ (no ordering)
```

---

## Best Practices

### 1. Be Clear and Concise

- ✅ Use simple language
- ✅ Avoid jargon unless necessary
- ✅ Provide examples

### 2. Keep It Updated

- ✅ Update documentation when code changes
- ✅ Include last updated date
- ✅ Mark deprecated content

### 3. Use Examples

- ✅ Provide code examples
- ✅ Show common use cases
- ✅ Include error handling examples

### 4. Cross-Reference

- ✅ Link to related documentation
- ✅ Reference source code when relevant
- ✅ Link to external resources

---

## Documentation Workflow

### Creating New Documentation

1. **Choose Location:** Place in appropriate section
2. **Follow Template:** Use standard structure
3. **Add Metadata:** Include status, date, scope
4. **Write Content:** Follow formatting standards
5. **Add Links:** Cross-reference related docs
6. **Review:** Check for clarity and completeness

### Updating Documentation

1. **Update Content:** Make necessary changes
2. **Update Date:** Change last updated date
3. **Check Links:** Verify all links work
4. **Review:** Ensure consistency

---

## Related Documentation

- [Naming Conventions](./naming.md) - File naming standards
- [Folder Structure](./folder-structure.md) - Documentation organization
- [Documentation Governance](../../08-governance/documentation-governance.md) - Governance rules

---

**Last Updated:** 2025-11-24  
**Maintained By:** AI-BOS Platform Team
