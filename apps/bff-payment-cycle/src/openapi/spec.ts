/**
 * OpenAPI Specification
 *
 * Auto-generated API documentation for bff-payment-cycle.
 */

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "BFF Payment Cycle API",
    version: "1.0.0",
    description: "Backend-for-Frontend service for Payment Cycle Orchestration",
    contact: {
      name: "AI-BOS Team",
    },
  },
  servers: [
    {
      url: "http://localhost:3002",
      description: "Local development",
    },
    {
      url: "/payment-cycle",
      description: "Via API Gateway",
    },
  ],
  tags: [
    { name: "Payments", description: "Payment request operations" },
    { name: "Approval", description: "Approval workflow operations" },
    { name: "Disbursement", description: "Treasury/Finance operations" },
    { name: "Health", description: "Service health checks" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: { description: "Service is healthy" },
          503: { description: "Service is degraded" },
        },
      },
    },
    "/payments": {
      get: {
        tags: ["Payments"],
        summary: "List payments",
        description: "Get payments with job-based lanes (my-requests, need-approval, ready-disburse)",
        parameters: [
          { name: "lane", in: "query", schema: { type: "string", enum: ["my-requests", "need-approval", "ready-disburse", "all"] } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          200: { description: "List of payments" },
        },
      },
      post: {
        tags: ["Payments"],
        summary: "Create payment request",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePayment" },
            },
          },
        },
        responses: {
          201: { description: "Payment created" },
          400: { description: "Validation error" },
        },
      },
    },
    "/payments/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get payment detail",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Payment detail with timeline" },
          404: { description: "Payment not found" },
        },
      },
      patch: {
        tags: ["Payments"],
        summary: "Update payment",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePayment" },
            },
          },
        },
        responses: {
          200: { description: "Payment updated" },
          400: { description: "Cannot edit in current status" },
        },
      },
      delete: {
        tags: ["Payments"],
        summary: "Cancel payment",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "reason", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Payment cancelled" },
        },
      },
    },
    "/payments/{id}/submit": {
      post: {
        tags: ["Approval"],
        summary: "Submit for approval",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  approverUserIds: { type: "array", items: { type: "string", format: "uuid" } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Payment submitted" },
        },
      },
    },
    "/payments/{id}/approve": {
      post: {
        tags: ["Approval"],
        summary: "Approve payment",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  comment: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Payment approved" },
        },
      },
    },
    "/payments/{id}/reject": {
      post: {
        tags: ["Approval"],
        summary: "Reject payment",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["reason"],
                properties: {
                  reason: { type: "string", minLength: 10 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Payment rejected" },
        },
      },
    },
    "/payments/{id}/disburse": {
      post: {
        tags: ["Disbursement"],
        summary: "Record disbursement",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RecordDisbursement" },
            },
          },
        },
        responses: {
          200: { description: "Disbursement recorded" },
        },
      },
    },
    "/payments/{id}/slip": {
      post: {
        tags: ["Disbursement"],
        summary: "Upload payment slip",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UploadSlip" },
            },
          },
        },
        responses: {
          200: { description: "Upload URL generated" },
        },
      },
    },
    "/payments/{id}/complete": {
      post: {
        tags: ["Disbursement"],
        summary: "Complete payment",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Payment completed" },
        },
      },
    },
  },
  components: {
    schemas: {
      CreatePayment: {
        type: "object",
        required: ["title", "amount", "currency"],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 255 },
          description: { type: "string" },
          amount: { type: "string", pattern: "^\\d+(\\.\\d{1,2})?$" },
          currency: { type: "string", minLength: 3, maxLength: 3, default: "MYR" },
          categoryCode: { type: "string" },
          payeeType: { type: "string", enum: ["VENDOR", "EMPLOYEE", "CONTRACTOR", "OTHER"] },
          payeeName: { type: "string" },
          payeeAccountRef: { type: "string" },
          dueDate: { type: "string", format: "date-time" },
          tags: { type: "array", items: { type: "string" } },
        },
      },
      UpdatePayment: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          amount: { type: "string" },
          currency: { type: "string" },
          categoryCode: { type: "string" },
          payeeType: { type: "string" },
          payeeName: { type: "string" },
          dueDate: { type: "string", format: "date-time" },
        },
      },
      RecordDisbursement: {
        type: "object",
        required: ["disbursedAmount", "disbursedCurrency", "disbursementDate", "method"],
        properties: {
          disbursedAmount: { type: "string", pattern: "^\\d+(\\.\\d{1,2})?$" },
          disbursedCurrency: { type: "string", default: "MYR" },
          disbursementDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          method: { type: "string", enum: ["BANK_TRANSFER", "CASH", "CHEQUE", "EWALLET", "OTHER"] },
          bankReference: { type: "string" },
          treasuryAccountRef: { type: "string" },
          cashflowProfileRef: { type: "string" },
        },
      },
      UploadSlip: {
        type: "object",
        required: ["fileName", "mimeType"],
        properties: {
          fileName: { type: "string" },
          mimeType: { type: "string" },
          fileSize: { type: "string" },
          locationRef: { type: "string", description: "Oracle/SAP-style location reference (e.g., C12)" },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

