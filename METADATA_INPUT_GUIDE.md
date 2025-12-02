# Metadata Input Guide

## Files Archived

The previous metadata files have been archived to:
- `_archive/metadata-backup-2025-12-02-035918/`

## Fresh Start - Where to Add Your Metadata

### 1. **Main Glossary Data**
📁 `metadata-studio/glossary/controlled-vocabulary.ts`

This is your **single source of truth** for metadata definitions. Add your terms here in the following format:

```typescript
{
  id: "unique-term-id",
  term: "Your Term Name",
  definition: "Clear definition of the term",
  category: "Category Name",
  aliases: ["Alternative Name 1", "Alternative Name 2"],
  tags: ["tag1", "tag2"],
  governance: {
    owner: "Team/Person Name",
    tier: "Tier 1",
    status: "approved"
  }
}
```

### 2. **Web Display Page**
📁 `apps/web/app/metadata/glossary/page.tsx`

This file displays your glossary on the web. The `glossaryTerms` array is where you add your terms for display.

## Quick Start Steps

1. **Open** `metadata-studio/glossary/controlled-vocabulary.ts`
2. **Add your terms** to the `CONTROLLED_VOCABULARY` array
3. **Define categories** in `METADATA_CATEGORIES`
4. **Set up governance tiers** in `GOVERNANCE_TIERS`
5. **Update the web page** at `apps/web/app/metadata/glossary/page.tsx` to use your data

## Example Metadata Structure

```typescript
// Example for a financial services company
{
  id: "account-balance",
  term: "Account Balance",
  definition: "The total amount of funds available in a customer account at a given point in time",
  category: "Financial Metrics",
  aliases: ["Balance", "Available Balance", "Account Value"],
  tags: ["finance", "reporting", "core-banking"],
  relatedTerms: ["account-id", "transaction", "ledger"],
  examples: [
    "Checking account balance: $1,234.56",
    "Savings account balance: $10,000.00"
  ],
  governance: {
    owner: "Finance Data Team",
    tier: "Tier 1",
    status: "approved"
  }
}
```

## Need Help?

The archived files are available for reference at:
`_archive/metadata-backup-2025-12-02-035918/`

---

**Ready to input your metadata!** 🚀

