-- Metadata Kernel Views
-- Visual "lawbook" for humans and agents

-- View: All Tier 1/2 Finance Concepts with their IFRS references
-- This is your visual lawbook showing canonical concepts with their legal anchors
CREATE OR REPLACE VIEW v_finance_tier1_concepts AS
SELECT
  c.id,
  c.canonical_key,
  c.label,
  c.domain,
  c.concept_type,
  c.governance_tier,
  p.code  AS standard_pack_code,
  p.name  AS standard_pack_name,
  p.authority_level AS pack_authority_level,
  c.standard_ref,
  c.description,
  c.is_active,
  c.created_at,
  c.updated_at,
  -- Count aliases for this concept
  (SELECT COUNT(*) FROM mdm_alias a WHERE a.concept_id = c.id) AS alias_count
FROM mdm_concept c
LEFT JOIN mdm_standard_pack p
  ON c.standard_pack_id_primary = p.id
WHERE c.domain = 'FINANCE'
  AND c.governance_tier <= 2
  AND c.is_active = true
ORDER BY 
  c.governance_tier ASC,
  c.canonical_key ASC;

-- View: Concepts by Standard Pack (shows which concepts belong to which law)
CREATE OR REPLACE VIEW v_concepts_by_pack AS
SELECT
  p.code AS pack_code,
  p.name AS pack_name,
  p.authority_level,
  p.domain,
  p.status AS pack_status,
  COUNT(c.id) AS concept_count,
  COUNT(CASE WHEN c.governance_tier = 1 THEN 1 END) AS tier1_count,
  COUNT(CASE WHEN c.governance_tier = 2 THEN 1 END) AS tier2_count,
  ARRAY_AGG(c.canonical_key ORDER BY c.canonical_key) AS concept_keys
FROM mdm_standard_pack p
LEFT JOIN mdm_concept c ON p.id = c.standard_pack_id_primary
WHERE p.status = 'ACTIVE'
GROUP BY p.id, p.code, p.name, p.authority_level, p.domain, p.status
ORDER BY p.authority_level DESC, p.code ASC;

-- View: Concept usage summary (requires mdm_usage_log table)
-- Shows which concepts are being used by agents/humans
CREATE OR REPLACE VIEW v_concept_usage_summary AS
SELECT
  c.id AS concept_id,
  c.canonical_key,
  c.label,
  c.domain,
  c.governance_tier,
  COUNT(ul.id) AS usage_count,
  MAX(ul.used_at) AS last_used_at,
  COUNT(DISTINCT ul.tenant_id) AS tenant_count,
  COUNT(DISTINCT CASE WHEN ul.actor_type = 'AGENT' THEN ul.id END) AS agent_usage_count,
  COUNT(DISTINCT CASE WHEN ul.actor_type = 'HUMAN' THEN ul.id END) AS human_usage_count
FROM mdm_concept c
LEFT JOIN mdm_usage_log ul ON c.id = ul.concept_id
WHERE c.is_active = true
GROUP BY c.id, c.canonical_key, c.label, c.domain, c.governance_tier
ORDER BY usage_count DESC, c.canonical_key ASC;

-- View: Tier 1 concepts without LAW-level pack (governance gap)
CREATE OR REPLACE VIEW v_tier1_concepts_missing_law_pack AS
SELECT
  c.id,
  c.canonical_key,
  c.label,
  c.governance_tier,
  c.standard_pack_id_primary,
  p.code AS current_pack_code,
  p.authority_level AS current_pack_authority,
  c.standard_ref,
  'Tier 1 finance concepts must be anchored to a LAW-level standard pack' AS issue
FROM mdm_concept c
LEFT JOIN mdm_standard_pack p ON c.standard_pack_id_primary = p.id
WHERE c.domain = 'FINANCE'
  AND c.governance_tier = 1
  AND c.is_active = true
  AND (
    c.standard_pack_id_primary IS NULL
    OR p.authority_level != 'LAW'
  )
ORDER BY c.canonical_key ASC;

