-- ============================================================
-- FieldOrtho 2.0.1 — Single front gate: dedicated role_codes table
-- Project: whwpkcdpahhaxexxmbwq (Field Ortho)
-- Authored 2026-06-25. ADDITIVE ONLY — invisible to live 1.0 clients.
-- ============================================================
-- WHY A NEW TABLE (not reuse organization_code):
--   Live 1.0's app-access gate reads `organization_code` with an UNGUARDED
--   `.limit(1).single()` and string-compares the one row it gets back. Adding
--   role-code rows there could make that read return a non-00000 row and lock
--   1.0 users out. So role codes get their OWN table that 1.0 never reads.
--   `organization_code` (and its single 00000 row) is left COMPLETELY untouched.
--
-- 2.0.1 MODEL: ONE gate, before login/signup. The user enters Sales123/Phys123;
--   the code is validated anon (check_role_code), remembered on-device, and the
--   matching org_role is stamped at signup (verify_org_code, authenticated).
-- ============================================================

-- ------------------------------------------------------------
-- 1. role_codes — physician/sales gateway codes (2.0.1 only)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_codes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text NOT NULL UNIQUE,
  role       text NOT NULL CHECK (role IN ('physician','sales')),
  label      text,
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.role_codes ENABLE ROW LEVEL SECURITY;

-- Admins/owners manage the codes through the in-app admin screen.
-- No anon/public SELECT policy: validation goes through the SECURITY DEFINER
-- RPC below so the full code list is never exposed to the client.
DROP POLICY IF EXISTS "Admins manage role codes" ON public.role_codes;
CREATE POLICY "Admins manage role codes" ON public.role_codes
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users
                 WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users
                 WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

-- ------------------------------------------------------------
-- 2. check_role_code(p_code) — anon-callable validator for the
--    PRE-LOGIN gate. Returns validity + role WITHOUT touching any
--    user (no session exists yet). Case-insensitive, active codes only.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_role_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role  text;
  v_label text;
BEGIN
  SELECT role, label INTO v_role, v_label
  FROM public.role_codes
  WHERE lower(code) = lower(btrim(p_code)) AND is_active = true
  LIMIT 1;

  IF v_role IS NULL THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  RETURN jsonb_build_object('valid', true, 'role', v_role, 'label', v_label);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_role_code(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.check_role_code(text) TO anon, authenticated;

-- ------------------------------------------------------------
-- 3. verify_org_code(p_code) — repointed to read role_codes.
--    Same signature + return shape as before, so the app code that
--    calls it is unchanged. Validates the remembered code server-side
--    and stamps org_role on the CALLER (auth.uid()). Authenticated only.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_org_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_role  text;
  v_label text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT role, label INTO v_role, v_label
  FROM public.role_codes
  WHERE lower(code) = lower(btrim(p_code)) AND is_active = true
  LIMIT 1;

  IF v_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid code');
  END IF;

  UPDATE public.users
     SET org_role = v_role,
         updated_at = now()
   WHERE id = v_uid;

  RETURN jsonb_build_object('success', true, 'role', v_role, 'label', v_label);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_org_code(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.verify_org_code(text) TO authenticated;

-- ------------------------------------------------------------
-- 4. Seed the two gateway codes. Idempotent.
-- ------------------------------------------------------------
INSERT INTO public.role_codes (code, role, label) VALUES
  ('Sales123', 'sales',     'Sales Team'),
  ('Phys123',  'physician', 'Physician')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 1.0 SAFETY: organization_code is NOT referenced anywhere above.
-- Its single 00000 row is untouched; live 1.0 access gate is unaffected.
-- ============================================================
