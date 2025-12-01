-- Add Tier Enforcement Constraint
-- 
-- This ensures Tier 1/2 FINANCE concepts must have LAW-level standard packs
-- at the database level (defense in depth)

-- Create a function to validate Tier 1/2 FINANCE concepts
CREATE OR REPLACE FUNCTION validate_tier_enforcement()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a Tier 1/2 FINANCE concept
  IF NEW.domain = 'FINANCE' AND (NEW.governance_tier = 1 OR NEW.governance_tier = 2) THEN
    -- Must have a standard pack
    IF NEW.standard_pack_id_primary IS NULL THEN
      RAISE EXCEPTION 'FINANCE concepts with governance tier % must have a standard_pack_id_primary pointing to a LAW-level pack', NEW.governance_tier;
    END IF;
    
    -- Verify the pack exists and is LAW-level
    IF NOT EXISTS (
      SELECT 1 FROM mdm_standard_pack 
      WHERE id = NEW.standard_pack_id_primary 
        AND authority_level = 'LAW'
        AND status = 'ACTIVE'
    ) THEN
      RAISE EXCEPTION 'FINANCE concepts with governance tier % must reference a LAW-level ACTIVE standard pack', NEW.governance_tier;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce on INSERT and UPDATE
DROP TRIGGER IF EXISTS enforce_tier_validation ON mdm_concept;
CREATE TRIGGER enforce_tier_validation
  BEFORE INSERT OR UPDATE ON mdm_concept
  FOR EACH ROW
  EXECUTE FUNCTION validate_tier_enforcement();

-- Add comment
COMMENT ON FUNCTION validate_tier_enforcement() IS 
  'Enforces that Tier 1/2 FINANCE concepts must have LAW-level standard packs';

