# 📘 Controlled Vocabulary - Developer Guide

**MANDATORY FOR ALL DEVELOPERS**

Metadata is the **central nervous system** of AIBOS. Only approved terminology from the Business Glossary can be used in code.

---

## 🎯 Why Controlled Vocabulary?

### The Problem (Without Control)

```typescript
// ❌ BAD: Different developers use different terms for same concept
const totalSales = 1000;      // Developer A calls it "sales"
const totalRevenue = 1000;    // Developer B calls it "revenue"  
const totalIncome = 1000;     // Developer C calls it "income"

// Result: Confusion, errors, data quality issues! ❌
```

### The Solution (With Control)

```typescript
// ✅ GOOD: Everyone uses the SAME approved term
import { APPROVED_FINANCE_TERMS } from "@aibos/types";

const totalRevenue = 1000;  // ✅ Everyone uses "revenue" (IFRS term)
```

---

## 🚀 How to Use Approved Terms

### Step 1: Import Approved Terms

```typescript
import { 
  APPROVED_FINANCE_TERMS,
  type ApprovedFinanceTerm 
} from "@aibos/types";
```

### Step 2: Use ONLY Approved Terms

```typescript
// ✅ GOOD: Using approved term
const accountType: ApprovedFinanceTerm = APPROVED_FINANCE_TERMS.revenue;

// ❌ BAD: Using unapproved term
const accountType = "sales"; // ❌ TypeScript error!
//  Type '"sales"' is not assignable to type 'ApprovedFinanceTerm'
```

### Step 3: Get Autocomplete for Approved Terms

```typescript
// Just type APPROVED_FINANCE_TERMS. and your IDE shows ALL approved terms!
const term = APPROVED_FINANCE_TERMS. 
//            ↑ IDE autocomplete shows:
//            - revenue
//            - expense
//            - asset
//            - liability
//            - equity
//            - grossProfit
//            - ... (all approved terms)
```

---

## ✅ Approved Terms by Domain

### Finance Domain

```typescript
import { APPROVED_FINANCE_TERMS } from "@aibos/types";

// Core Financial Statements
APPROVED_FINANCE_TERMS.revenue              // ✅ Use this
APPROVED_FINANCE_TERMS.expense              // ✅ Use this
APPROVED_FINANCE_TERMS.asset                // ✅ Use this
APPROVED_FINANCE_TERMS.liability            // ✅ Use this
APPROVED_FINANCE_TERMS.equity               // ✅ Use this

// Income Statement
APPROVED_FINANCE_TERMS.grossProfit          // ✅ Use this
APPROVED_FINANCE_TERMS.operatingIncome      // ✅ Use this
APPROVED_FINANCE_TERMS.netIncome            // ✅ Use this
APPROVED_FINANCE_TERMS.ebitda               // ✅ Use this

// Balance Sheet
APPROVED_FINANCE_TERMS.currentAssets        // ✅ Use this
APPROVED_FINANCE_TERMS.nonCurrentAssets     // ✅ Use this
APPROVED_FINANCE_TERMS.currentLiabilities   // ✅ Use this
APPROVED_FINANCE_TERMS.nonCurrentLiabilities // ✅ Use this

// Cash Flow
APPROVED_FINANCE_TERMS.operatingCashFlow    // ✅ Use this
APPROVED_FINANCE_TERMS.investingCashFlow    // ✅ Use this
APPROVED_FINANCE_TERMS.financingCashFlow    // ✅ Use this

// IFRS-Specific
APPROVED_FINANCE_TERMS.propertyPlantEquipment // ✅ Use this (IAS 16)
APPROVED_FINANCE_TERMS.inventory             // ✅ Use this (IAS 2)
APPROVED_FINANCE_TERMS.tradeReceivables      // ✅ Use this
APPROVED_FINANCE_TERMS.tradePayables         // ✅ Use this
```

### HR Domain

```typescript
import { APPROVED_HR_TERMS } from "@aibos/types";

APPROVED_HR_TERMS.employee     // ✅ Use this
APPROVED_HR_TERMS.contractor   // ✅ Use this
APPROVED_HR_TERMS.department   // ✅ Use this
APPROVED_HR_TERMS.position     // ✅ Use this
APPROVED_HR_TERMS.salary       // ✅ Use this
APPROVED_HR_TERMS.benefits     // ✅ Use this
```

### Operations Domain

```typescript
import { APPROVED_OPERATIONS_TERMS } from "@aibos/types";

APPROVED_OPERATIONS_TERMS.product    // ✅ Use this
APPROVED_OPERATIONS_TERMS.service    // ✅ Use this
APPROVED_OPERATIONS_TERMS.customer   // ✅ Use this
APPROVED_OPERATIONS_TERMS.supplier   // ✅ Use this
APPROVED_OPERATIONS_TERMS.order      // ✅ Use this
APPROVED_OPERATIONS_TERMS.shipment   // ✅ Use this
```

---

## ❌ Blocked Terms (Do NOT Use!)

### Common Mistakes

```typescript
// ❌ WRONG: Using "sales" (ambiguous)
const total = "sales"; 
// ✅ CORRECT: Use "revenue" (IFRS term)
const total = APPROVED_FINANCE_TERMS.revenue;

// ❌ WRONG: Using "income" (ambiguous - which income?)
const amount = "income";
// ✅ CORRECT: Be specific!
const amount = APPROVED_FINANCE_TERMS.netIncome; // or grossProfit, operatingIncome

// ❌ WRONG: Using "profit" (ambiguous - which profit?)
const value = "profit";
// ✅ CORRECT: Be specific!
const value = APPROVED_FINANCE_TERMS.grossProfit; // or netIncome, operatingIncome

// ❌ WRONG: Using abbreviations
const acc = "AR";  // ❌ What is AR?
// ✅ CORRECT: Use full term
const acc = APPROVED_FINANCE_TERMS.tradeReceivables;

// ❌ WRONG: Using abbreviations
const ppe = "PPE";  // ❌ Not everyone knows PPE
// ✅ CORRECT: Use full IFRS term
const ppe = APPROVED_FINANCE_TERMS.propertyPlantEquipment;
```

---

## 📝 Real-World Examples

### Example 1: Creating an Account

```typescript
import { APPROVED_FINANCE_TERMS, type ApprovedFinanceTerm } from "@aibos/types";

// ❌ WRONG: Manual string (no validation)
function createAccount(accountType: string) {
  // Danger: accountType could be ANYTHING!
  // "revenue", "sales", "money", "stuff" all allowed ❌
}

// ✅ CORRECT: Using controlled vocabulary
function createAccount(accountType: ApprovedFinanceTerm) {
  // accountType can ONLY be an approved term ✅
  // TypeScript enforces this at compile time!
}

// Usage:
createAccount(APPROVED_FINANCE_TERMS.revenue);  // ✅ OK
createAccount("sales");  // ❌ TypeScript error!
```

### Example 2: Filtering Financial Data

```typescript
import { APPROVED_FINANCE_TERMS } from "@aibos/types";

// ❌ WRONG: Using unapproved terms
const accounts = data.filter(acc => 
  acc.type === "sales" || acc.type === "income"  // ❌ Ambiguous!
);

// ✅ CORRECT: Using approved terms
const accounts = data.filter(acc =>
  acc.type === APPROVED_FINANCE_TERMS.revenue  // ✅ Clear and standard!
);
```

### Example 3: React Component

```typescript
import { APPROVED_FINANCE_TERMS, type ApprovedFinanceTerm } from "@aibos/types";

// ✅ CORRECT: Type-safe props with approved terms only
interface AccountCardProps {
  accountType: ApprovedFinanceTerm;
  amount: number;
}

export function AccountCard({ accountType, amount }: AccountCardProps) {
  return (
    <div>
      <h3>{accountType}</h3>
      <p>{amount}</p>
    </div>
  );
}

// Usage:
<AccountCard 
  accountType={APPROVED_FINANCE_TERMS.revenue}  // ✅ OK
  amount={1000} 
/>

<AccountCard 
  accountType="sales"  // ❌ TypeScript error!
  amount={1000} 
/>
```

### Example 4: API Route

```typescript
import { APPROVED_FINANCE_TERMS, ApprovedFinanceTermSchema } from "@aibos/types";
import { z } from "zod";

// ✅ CORRECT: Validate request with approved terms only
const CreateAccountSchema = z.object({
  accountType: ApprovedFinanceTermSchema,  // ✅ Only approved terms allowed
  amount: z.number(),
});

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate - will throw error if unapproved term used
  const { accountType, amount } = CreateAccountSchema.parse(body);
  
  // accountType is guaranteed to be an approved term ✅
}
```

---

## 🔍 How to Find the Right Term

### Method 1: Use IDE Autocomplete

```typescript
import { APPROVED_FINANCE_TERMS } from "@aibos/types";

// Just type the object and dot:
APPROVED_FINANCE_TERMS.
//                     ↑ Your IDE shows ALL approved terms with descriptions
```

### Method 2: Check the Glossary

```typescript
import { ControlledVocabulary } from "@aibos/types";

// Log all approved terms
console.log('Approved Finance Terms:', ControlledVocabulary.finance);
console.log('Approved HR Terms:', ControlledVocabulary.hr);
console.log('Approved Operations Terms:', ControlledVocabulary.operations);
```

### Method 3: Use Validation Function

```typescript
import { validateTerm, getSuggestion } from "@aibos/types";

try {
  validateTerm("sales");  // ❌ Will throw error
} catch (error) {
  console.error(error.message);
  // ❌ Term "sales" is not approved. Use "revenue" (IFRS term)
}

// Get suggestion for blocked term
const suggestion = getSuggestion("AR");
console.log(suggestion);
// Output: Use "trade_receivables" (full term)
```

---

## 🚨 What Happens if You Use Unapproved Terms?

### Compile-Time Error (TypeScript)

```typescript
import { type ApprovedFinanceTerm } from "@aibos/types";

// ❌ This will NOT compile:
const term: ApprovedFinanceTerm = "sales";
//    ^^^^ TypeScript error: 
//    Type '"sales"' is not assignable to type 'ApprovedFinanceTerm'
```

### Runtime Error (Zod Validation)

```typescript
import { ApprovedFinanceTermSchema } from "@aibos/types";

// ❌ This will throw error at runtime:
ApprovedFinanceTermSchema.parse("sales");
// ZodError: Invalid enum value. Expected 'revenue' | 'expense' | ..., received 'sales'
```

### ESLint Warning (Optional)

*Coming soon: ESLint rules to flag unapproved terms*

---

## 📋 Checklist for Developers

Before committing code, verify:

- [ ] ✅ Imported approved terms from `@aibos/types`
- [ ] ✅ Used `ApprovedFinanceTerm` type for type safety
- [ ] ✅ Did NOT use hardcoded strings for domain terms
- [ ] ✅ Did NOT use abbreviations (AR, AP, PPE, etc.)
- [ ] ✅ Did NOT use ambiguous terms (sales, income, profit)
- [ ] ✅ TypeScript compilation passes (no type errors)
- [ ] ✅ Code review approved by team

---

## 🎓 Training New Developers

### Quick Start for New Team Members

1. **Read this guide** 📖
2. **Install IDE extensions** (TypeScript, ESLint)
3. **Import approved terms** from `@aibos/types`
4. **Let autocomplete guide you** - don't type manually!
5. **Ask questions** if you can't find the right term

### Common Questions

**Q: What if the term I need isn't in the approved list?**  
A: Request it through the Metadata Governance team. Don't make up your own!

**Q: Can I use abbreviations like AR, AP?**  
A: No! Use full terms: `trade_receivables`, `trade_payables`

**Q: Why is "sales" blocked?**  
A: It's ambiguous. IFRS uses "revenue". Be specific!

**Q: Can I use "profit"?**  
A: No! Be specific: `gross_profit`, `operating_income`, or `net_income`

---

## 🔄 How to Request New Terms

If you need a term that's not approved:

1. **Don't make it up!** ❌
2. **Check if a similar approved term exists** ✅
3. **Request through Metadata Governance team**
4. **Provide**:
   - Proposed term
   - Business definition
   - IFRS/standard reference (if applicable)
   - Why existing terms don't work
5. **Wait for approval before using**

---

## 📊 Benefits

### For Developers
- ✅ **Autocomplete** shows exactly what you can use
- ✅ **Type safety** catches errors at compile time
- ✅ **No guessing** - clear approved terms
- ✅ **Consistent** across entire codebase

### For the Codebase
- ✅ **Standardized** terminology everywhere
- ✅ **Searchable** - one term, easy to find
- ✅ **Maintainable** - change in one place
- ✅ **Auditable** - compliance-ready

### For the Business
- ✅ **Data quality** - consistent naming
- ✅ **IFRS compliance** - using standard terms
- ✅ **Onboarding** - new devs learn faster
- ✅ **Reporting** - accurate financial reports

---

## 🎯 Summary

**The Rules:**
1. ✅ Only use terms from `APPROVED_*_TERMS`
2. ❌ Never use hardcoded strings for domain terms
3. ✅ Let TypeScript enforce compliance
4. ✅ Use autocomplete to find terms
5. ✅ Request new terms through governance

**The Benefits:**
- Type-safe code
- Consistent terminology
- Better data quality
- IFRS compliance
- Easier maintenance

**Remember:** Metadata is the central nervous system. Use only approved terminology!

---

**Last Updated:** December 1, 2025  
**Maintained By:** Metadata Governance Team  
**Questions?** Ask in #metadata-governance channel

