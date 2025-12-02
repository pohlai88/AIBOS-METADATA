# 🎯 Controlled Vocabulary - Quick Reference

**Print this and keep it at your desk!**

---

## ✅ DO THIS

```typescript
import { 
  APPROVED_FINANCE_TERMS,
  type ApprovedFinanceTerm 
} from "@aibos/types";

// ✅ Use approved terms
const type: ApprovedFinanceTerm = APPROVED_FINANCE_TERMS.revenue;

// ✅ Let IDE autocomplete guide you
APPROVED_FINANCE_TERMS.  // ← Type this and see all approved terms!
```

---

## ❌ DON'T DO THIS

```typescript
// ❌ NO hardcoded strings
const type = "sales";  // WRONG!

// ❌ NO abbreviations
const type = "AR";  // WRONG!

// ❌ NO ambiguous terms
const type = "income";  // WRONG! (Which income?)
```

---

## 📝 Common Replacements

| ❌ Don't Use | ✅ Use Instead |
|-------------|---------------|
| `"sales"` | `APPROVED_FINANCE_TERMS.revenue` |
| `"income"` | `APPROVED_FINANCE_TERMS.netIncome` (be specific!) |
| `"profit"` | `APPROVED_FINANCE_TERMS.grossProfit` (be specific!) |
| `"AR"` | `APPROVED_FINANCE_TERMS.tradeReceivables` |
| `"AP"` | `APPROVED_FINANCE_TERMS.tradePayables` |
| `"PPE"` | `APPROVED_FINANCE_TERMS.propertyPlantEquipment` |
| `"money"` | Use specific term (cash, revenue, etc.) |

---

## 🚀 Quick Start (3 Steps)

### 1. Import

```typescript
import { APPROVED_FINANCE_TERMS } from "@aibos/types";
```

### 2. Use Autocomplete

```typescript
APPROVED_FINANCE_TERMS.  // ← Your IDE shows all approved terms
```

### 3. Let TypeScript Enforce

```typescript
const term: ApprovedFinanceTerm = APPROVED_FINANCE_TERMS.revenue;  // ✅
const term: ApprovedFinanceTerm = "sales";  // ❌ Compile error!
```

---

## 📋 All Approved Finance Terms

```typescript
APPROVED_FINANCE_TERMS.revenue
APPROVED_FINANCE_TERMS.expense
APPROVED_FINANCE_TERMS.asset
APPROVED_FINANCE_TERMS.liability
APPROVED_FINANCE_TERMS.equity
APPROVED_FINANCE_TERMS.grossProfit
APPROVED_FINANCE_TERMS.operatingIncome
APPROVED_FINANCE_TERMS.netIncome
APPROVED_FINANCE_TERMS.ebitda
APPROVED_FINANCE_TERMS.currentAssets
APPROVED_FINANCE_TERMS.nonCurrentAssets
APPROVED_FINANCE_TERMS.currentLiabilities
APPROVED_FINANCE_TERMS.nonCurrentLiabilities
APPROVED_FINANCE_TERMS.operatingCashFlow
APPROVED_FINANCE_TERMS.investingCashFlow
APPROVED_FINANCE_TERMS.financingCashFlow
APPROVED_FINANCE_TERMS.propertyPlantEquipment
APPROVED_FINANCE_TERMS.inventory
APPROVED_FINANCE_TERMS.tradeReceivables
APPROVED_FINANCE_TERMS.tradePayables
```

---

## ❓ Need Help?

**Can't find the term you need?**
1. Check autocomplete: `APPROVED_FINANCE_TERMS.`
2. Ask in #metadata-governance Slack channel
3. Request new term through governance process

**Don't know which term to use?**
1. Check this guide
2. Check IFRS standard
3. Ask senior developer

---

**Remember:** Metadata is the central nervous system!  
**Only use approved terms!** ✅

