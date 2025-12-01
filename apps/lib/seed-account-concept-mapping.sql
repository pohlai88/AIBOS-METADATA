-- Seed Account-to-Concept Mapping
-- Maps Chart of Accounts to canonical metadata concepts
-- 
-- Usage: Run this after creating accounts and seeding concepts
-- Adjust account codes to match your actual Chart of Accounts

-- ===========================================
-- Example: Map Revenue Accounts to 'revenue' concept
-- ===========================================

UPDATE accounts a
SET
  mdm_concept_id = c.id,
  governance_tier = 1
FROM mdm_concept c
WHERE
  a.code IN ('4000', '4100', '4200')  -- Adjust to your main revenue account codes
  AND c.canonical_key = 'revenue'
  AND c.tenant_id = a.tenant_id
  AND c.is_active = true;

-- ===========================================
-- Example: Map VAT/GST Payable Account to 'tax_liability'
-- ===========================================

UPDATE accounts a
SET
  mdm_concept_id = c.id,
  governance_tier = 1
FROM mdm_concept c
WHERE
  a.code IN ('2100', '2101')  -- Adjust to your VAT/GST Payable account codes
  AND c.canonical_key = 'tax_liability'
  AND c.tenant_id = a.tenant_id
  AND c.is_active = true;

-- ===========================================
-- Example: Map Inventory Account to 'inventory_cost'
-- ===========================================

UPDATE accounts a
SET
  mdm_concept_id = c.id,
  governance_tier = 1
FROM mdm_concept c
WHERE
  a.code IN ('1300', '1310')  -- Adjust to your Inventory account codes
  AND c.canonical_key = 'inventory_cost'
  AND c.tenant_id = a.tenant_id
  AND c.is_active = true;

-- ===========================================
-- Example: Map Deferred Revenue Account to 'deferred_revenue'
-- ===========================================

UPDATE accounts a
SET
  mdm_concept_id = c.id,
  governance_tier = 1
FROM mdm_concept c
WHERE
  a.code IN ('2200', '2201')  -- Adjust to your Deferred Revenue account codes
  AND c.canonical_key = 'deferred_revenue'
  AND c.tenant_id = a.tenant_id
  AND c.is_active = true;

-- ===========================================
-- Verify the mapping
-- ===========================================

SELECT 
  a.code,
  a.name,
  a.governance_tier,
  c.canonical_key,
  c.label,
  p.code AS standard_pack_code
FROM accounts a
LEFT JOIN mdm_concept c ON a.mdm_concept_id = c.id
LEFT JOIN mdm_standard_pack p ON c.standard_pack_id_primary = p.id
WHERE a.governance_tier <= 2
ORDER BY a.code;

