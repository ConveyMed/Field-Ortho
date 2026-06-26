-- ============================================================
-- FieldOrtho 2.0 — Phase 2: Backend Logic (RPC + AI product link)
-- Project: whwpkcdpahhaxexxmbwq (Field Ortho) — applied to v2 branch first.
-- Authored 2026-06-20. ADDITIVE ONLY — invisible to live 1.0 clients.
-- ============================================================
-- DECISION (from reading supabase/functions/ai-chat/index.ts):
--   ai-chat is NOT modified. It answers for whatever `product` it is
--   given; which products a user may SELECT is a client-side concern
--   (Phase 4). Leaving the function untouched eliminates the biggest
--   1.0 breakage risk. The only backend support AI needs is a nullable
--   link from sub-product docs to a product line (below).
-- ============================================================

-- ------------------------------------------------------------
-- 1. product_docs.product_id — link each AI sub-product doc to a
--    product line so the 2.0 selector can filter by assignment.
--    Nullable; NULL = unlinked = behaves as today (shown to all).
-- ------------------------------------------------------------
ALTER TABLE public.product_docs
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.product_docs.product_id IS '2.0: product line this sub-product doc belongs to. NULL = unlinked (shown to all). Inert for 1.0.';
CREATE INDEX IF NOT EXISTS idx_product_docs_product_id ON public.product_docs(product_id);

-- ------------------------------------------------------------
-- 2. verify_org_code(p_code) — gateway-code -> role RPC.
--    Mirrors RemedyGo's verify_invite_code. Looks up the code in
--    organization_code, assigns the matching role to the CALLER
--    (auth.uid(), never a passed id), returns the role.
--    NULL role on a matched row = legacy shared gate code => 'sales'
--    (full access, identical to today's single-code behavior).
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

  -- Only codes that grant a role (physician/sales) are valid at the role gate.
  -- The shared app-access code (role IS NULL, e.g. 00000) is NOT accepted here.
  SELECT role, label INTO v_role, v_label
  FROM public.organization_code
  WHERE code = p_code AND role IS NOT NULL
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

-- Only signed-in users may call it; never anon/public.
REVOKE EXECUTE ON FUNCTION public.verify_org_code(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.verify_org_code(text) TO authenticated;

-- ============================================================
-- WATCH-POINT (handled at cutover, NOT here): adding physician/sales
-- code ROWS to organization_code can break 1.0's gate, which reads
-- `select('code').limit(1).single()` and assumes one code. We add the
-- RPC now (no new rows) — the coded rows are seeded at Phase 4/6 when
-- 1.0 is being retired, keeping the legacy shared row intact meanwhile.
-- ============================================================
