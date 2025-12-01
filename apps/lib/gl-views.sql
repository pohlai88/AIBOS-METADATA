-- GL Helper Views for Playground and Inspection
-- These views make it easy to see Tier 1/2 finance concepts and account mappings

-- ===========================================
-- View: Tier 1/2 Finance Concepts
-- ===========================================

CREATE OR REPLACE VIEW v_finance_tier12_concepts AS
SELECT
  c.id,
  c.tenant_id,
  c.canonical_key,
  c.label,
  c.domain,
  c.concept_type,
  c.governance_tier,
  p.code AS standard_pack_code,
  p.name AS standard_pack_name,
  p.authority_level,
  c.standard_ref,
  c.description
FROM mdm_concept c
LEFT JOIN mdm_standard_pack p
  ON c.standard_pack_id_primary = p.id
WHERE c.domain = 'FINANCE'
  AND c.governance_tier <= 2
  AND c.is_active = true
ORDER BY c.canonical_key;

-- ===========================================
-- View: Account ↔ Concept Mapping
-- ===========================================

CREATE OR REPLACE VIEW v_accounts_with_concepts AS
SELECT
  a.id AS account_id,
  a.tenant_id,
  a.code AS account_code,
  a.name AS account_name,
  a.account_type,
  a.governance_tier,
  c.canonical_key AS concept_key,
  c.label AS concept_label,
  c.governance_tier AS concept_governance_tier,
  p.code AS pack_code,
  p.authority_level
FROM accounts a
LEFT JOIN mdm_concept c
  ON a.mdm_concept_id = c.id
LEFT JOIN mdm_standard_pack p
  ON c.standard_pack_id_primary = p.id
ORDER BY a.code;

-- ===========================================
-- Grant permissions (if needed)
-- ===========================================

-- GRANT SELECT ON v_finance_tier12_concepts TO PUBLIC;
-- GRANT SELECT ON v_accounts_with_concepts TO PUBLIC;

