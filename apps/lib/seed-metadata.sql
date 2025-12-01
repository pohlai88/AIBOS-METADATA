-- Metadata Seed Data
-- Replace 00000000-0000-0000-0000-000000000001 with your real tenant_id
-- Run this after the main seed script

-- First, get the tenant_id (using admin user's ID as default tenant)
-- You can replace this with your actual tenant_id
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Get admin user ID as tenant_id
  SELECT id INTO v_tenant_id FROM users WHERE email = 'admin@aibos.com' LIMIT 1;
  
  -- If no admin user, use first user
  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_tenant_id FROM users LIMIT 1;
  END IF;
  
  -- If still no user, create a placeholder (you should replace this)
  IF v_tenant_id IS NULL THEN
    v_tenant_id := '00000000-0000-0000-0000-000000000001';
  END IF;
  
  -- Store for use in INSERT statements
  PERFORM set_config('app.tenant_id', v_tenant_id::text, false);
END $$;

-- Get the tenant_id we just set
-- Replace 00000000-0000-0000-0000-000000000001 below with the actual tenant_id
-- Or use: SELECT current_setting('app.tenant_id')::UUID;

