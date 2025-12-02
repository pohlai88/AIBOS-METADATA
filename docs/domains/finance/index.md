# Finance Domain Wiki

## 🎯 Purpose

Documentation for Finance-specific business logic, statutory reporting, IFRS compliance, and financial workflows.

**Domain Owner:** Finance Team × CID

---

## 📚 Pages in This Domain

| Page | SSOT Refs | Status | Description |
|------|-----------|--------|-------------|
| [Revenue Reporting Playbook](./revenue-reporting-playbook.md) | `revenue_ifrs_core`, `other_income_ifrs` | 🔜 Planned | How to prepare statutory revenue reports |
| [KPI: Gross Margin](./kpi-gross-margin.md) | 🔜 TBD | 🔜 Planned | Gross margin calculation |
| [Month-End Close Procedures](./month-end-close.md) | 🔜 TBD | 🔜 Planned | Step-by-step close procedures |

---

## 🔗 SSOT References

This domain primarily uses these canonical concepts:

- [`revenue_ifrs_core`](../../metadata-ssot/finance-revenue-matrix.md#1-revenue_ifrs_core) - Statutory revenue
- [`other_income_ifrs`](../../metadata-ssot/finance-revenue-matrix.md#2-other_income_ifrs) - Non-operating income
- [`gain_ifrs_other`](../../metadata-ssot/finance-revenue-matrix.md#3-gain_ifrs_other) - Gains from disposal/revaluation

---

## 📊 Finance vs Operations

| Concern | Finance Uses | Operations Uses |
|---------|-------------|----------------|
| **Revenue** | `revenue_ifrs_core` (IFRS 15) | `sales_value_operational` (invoices) |
| **Timing** | When control transfers | When invoice raised |
| **Purpose** | Statutory P&L, tax | Dashboards, KPIs |
| **Speed** | Slower (compliance checks) | Faster (real-time) |

**See:** [Revenue SSOT Matrix](../../metadata-ssot/finance-revenue-matrix.md) for details

---

## 🚀 Quick Links

- [Metadata SSOT](../../metadata-ssot/index.md)
- [Revenue Matrix](../../metadata-ssot/finance-revenue-matrix.md)
- [ERP Engine Domain](../erp-engine/index.md)
- [Domain Wikis Home](../README.md)

---

**Owner:** Finance Team × CID  
**Last Updated:** 2025-12-02

