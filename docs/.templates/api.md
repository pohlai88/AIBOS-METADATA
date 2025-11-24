# [API Endpoint Name]

> **API Documentation Template**  
> **Endpoint:** `[HTTP Method] /api/[path]`  
> **Version:** 1.0.0

---

## Overview

[Brief description of what this endpoint does]

### Authentication
- **Required:** ✅ Yes / ❌ No
- **Method:** [Bearer Token | API Key | OAuth]

### Rate Limiting
- **Limit:** [Number] requests per [Time]
- **Headers:** `X-RateLimit-*`

---

## Request

### Endpoint
```
[HTTP Method] /api/[path]
```

### Headers
```
Authorization: Bearer [token]
Content-Type: application/json
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `param1` | `string` | ✅ | [Description] |
| `param2` | `number` | ❌ | [Description] |

### Request Body
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

### Request Schema
```typescript
interface RequestBody {
  field1: string;
  field2?: number;
}
```

---

## Response

### Success Response
**Status:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "123",
    "name": "Example"
  },
  "meta": {
    "timestamp": "2025-11-24T00:00:00Z"
  }
}
```

### Response Schema
```typescript
interface Response {
  status: "success" | "error";
  data: DataType;
  meta?: MetaType;
}
```

---

## Errors

### Error Responses

#### `400 Bad Request`
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {}
  }
}
```

#### `401 Unauthorized`
```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### `500 Internal Server Error`
```json
{
  "status": "error",
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## Examples

### cURL
```bash
curl -X [METHOD] https://api.aibos.com/api/[path] \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"field1": "value1"}'
```

### JavaScript
```javascript
const response = await fetch('/api/[path]', {
  method: '[METHOD]',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    field1: 'value1'
  })
});
```

### TypeScript
```typescript
import { apiClient } from '@aibos/api';

const result = await apiClient.[endpoint]({
  field1: 'value1'
});
```

---

## Related Documentation
- [Related Endpoint 1]
- [Related Endpoint 2]
- [Authentication Guide]

---

**Maintained By:** [API Owner]  
**Last Updated:** [Date]  
**Version:** 1.0.0

