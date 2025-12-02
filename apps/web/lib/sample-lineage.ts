/**
 * Sample Lineage Data - Phase 2
 *
 * Realistic lineage graphs showing data flow from sources to destinations.
 */

import type { LineageNode, LineageEdge } from "@/components/metadata/LineageMiniGraph";

/**
 * Get lineage for a specific field
 */
export function getLineageForField(fieldName: string): {
  nodes: LineageNode[];
  edges: LineageEdge[];
} {
  const lineageMap: Record<string, { nodes: LineageNode[]; edges: LineageEdge[] }> = {
    customer_name: {
      nodes: [
        {
          id: "src-crm",
          label: "CRM Database",
          type: "source",
          nodeType: "database",
          status: "active",
        },
        {
          id: "tbl-customers",
          label: "customers.name",
          type: "source",
          nodeType: "table",
          status: "active",
        },
        {
          id: "etl-daily",
          label: "ETL: Daily Sync",
          type: "transform",
          nodeType: "etl",
          status: "active",
        },
        {
          id: "current",
          label: "customer_name",
          type: "current",
          nodeType: "table",
          status: "active",
        },
        {
          id: "api-customers",
          label: "GET /api/customers",
          type: "destination",
          nodeType: "api",
          status: "active",
        },
        {
          id: "rpt-sales",
          label: "Sales Dashboard",
          type: "destination",
          nodeType: "dashboard",
          status: "active",
        },
        {
          id: "rpt-ar-aging",
          label: "AR Aging Report",
          type: "destination",
          nodeType: "report",
          status: "active",
        },
      ],
      edges: [
        { from: "src-crm", to: "tbl-customers", type: "read", frequency: "realtime" },
        { from: "tbl-customers", to: "etl-daily", type: "read", frequency: "daily" },
        { from: "etl-daily", to: "current", type: "write", frequency: "daily" },
        { from: "current", to: "api-customers", type: "read", frequency: "realtime" },
        { from: "current", to: "rpt-sales", type: "read", frequency: "hourly" },
        { from: "current", to: "rpt-ar-aging", type: "read", frequency: "daily" },
      ],
    },
    revenue_gross: {
      nodes: [
        {
          id: "src-erp",
          label: "ERP Database",
          type: "source",
          nodeType: "database",
          status: "active",
        },
        {
          id: "tbl-invoices",
          label: "invoices.amount",
          type: "source",
          nodeType: "table",
          status: "active",
        },
        {
          id: "etl-aggregation",
          label: "ETL: Revenue Aggregation",
          type: "transform",
          nodeType: "etl",
          status: "active",
        },
        {
          id: "current",
          label: "revenue_gross",
          type: "current",
          nodeType: "table",
          status: "active",
        },
        {
          id: "rpt-pl",
          label: "P&L Statement",
          type: "destination",
          nodeType: "report",
          status: "active",
        },
        {
          id: "rpt-revenue-dashboard",
          label: "Revenue Dashboard",
          type: "destination",
          nodeType: "dashboard",
          status: "active",
        },
        {
          id: "ml-forecast",
          label: "Revenue Forecast Model",
          type: "destination",
          nodeType: "api",
          status: "active",
        },
        {
          id: "api-financials",
          label: "GET /api/financials",
          type: "destination",
          nodeType: "api",
          status: "active",
        },
      ],
      edges: [
        { from: "src-erp", to: "tbl-invoices", type: "read", frequency: "realtime" },
        { from: "tbl-invoices", to: "etl-aggregation", type: "read", frequency: "hourly" },
        { from: "etl-aggregation", to: "current", type: "write", frequency: "hourly" },
        { from: "current", to: "rpt-pl", type: "read", frequency: "daily" },
        { from: "current", to: "rpt-revenue-dashboard", type: "read", frequency: "hourly" },
        { from: "current", to: "ml-forecast", type: "read", frequency: "daily" },
        { from: "current", to: "api-financials", type: "read", frequency: "realtime" },
      ],
    },
    tax_code: {
      nodes: [
        {
          id: "src-master",
          label: "Master Data",
          type: "source",
          nodeType: "database",
          status: "active",
        },
        {
          id: "tbl-tax-codes",
          label: "tax_codes.code",
          type: "source",
          nodeType: "table",
          status: "active",
        },
        {
          id: "current",
          label: "tax_code",
          type: "current",
          nodeType: "table",
          status: "active",
        },
        {
          id: "api-tax",
          label: "GET /api/tax",
          type: "destination",
          nodeType: "api",
          status: "active",
        },
        {
          id: "rpt-tax-summary",
          label: "Tax Summary Report",
          type: "destination",
          nodeType: "report",
          status: "active",
        },
      ],
      edges: [
        { from: "src-master", to: "tbl-tax-codes", type: "read", frequency: "daily" },
        { from: "tbl-tax-codes", to: "current", type: "write", frequency: "daily" },
        { from: "current", to: "api-tax", type: "read", frequency: "realtime" },
        { from: "current", to: "rpt-tax-summary", type: "read", frequency: "daily" },
      ],
    },
  };

  // Return lineage for the field, or default empty lineage
  return lineageMap[fieldName] || { nodes: [], edges: [] };
}

/**
 * Check if a field has lineage data
 */
export function hasLineage(fieldName: string): boolean {
  const { nodes } = getLineageForField(fieldName);
  return nodes.length > 0;
}

