# [MCP Tool Name]

> **MCP Tool Documentation**  
> **Tool:** `[tool_name]`  
> **Server:** [Server Name]  
> **Version:** 1.0.0

---

## Overview

[Brief description of what this MCP tool does]

### Purpose
[Why this tool exists and what problem it solves]

### Use Cases
- [Use case 1]
- [Use case 2]

---

## Input Schema

```typescript
interface ToolInput {
  field1: string;
  field2?: number;
  field3?: boolean;
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `field1` | `string` | ✅ | [Description] |
| `field2` | `number` | ❌ | [Description] |
| `field3` | `boolean` | ❌ | [Description] |

---

## Output Schema

```typescript
interface ToolOutput {
  status: "success" | "error";
  data?: DataType;
  error?: ErrorType;
}
```

### Success Response
```json
{
  "status": "success",
  "data": {}
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

---

## Examples

### Example 1: [Use Case]
```json
{
  "input": {
    "field1": "value1",
    "field2": 42
  },
  "output": {
    "status": "success",
    "data": {}
  }
}
```

### Example 2: [Use Case]
[Similar structure]

---

## Validation

### Input Validation
- [Validation rule 1]
- [Validation rule 2]

### Output Validation
- [Validation rule 1]
- [Validation rule 2]

---

## Integration

### MCP Client Usage
```typescript
import { mcpClient } from '@aibos/mcp';

const result = await mcpClient.callTool('[tool_name]', {
  field1: 'value1'
});
```

### CLI Usage
```bash
aibos mcp [tool_name] --field1 value1
```

---

## Related Tools
- [Related Tool 1]
- [Related Tool 2]

---

**Maintained By:** [MCP Team]  
**Last Updated:** [Date]  
**Server:** [Server Name]

