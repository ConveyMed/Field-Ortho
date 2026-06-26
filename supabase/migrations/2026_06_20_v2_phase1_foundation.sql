-- ============================================================
-- FieldOrtho 2.0 — Phase 1: Additive Backend Foundation
-- Project: whwpkcdpahhaxexxmbwq (Field Ortho)
-- Authored 2026-06-20. ADDITIVE ONLY — invisible to live 1.0 clients.
-- ============================================================
-- SAFETY CONTRACT (see V2_PHASED_PLAN.md):
--   * Every change here is additive, nullable, and defaulted to
--     today's behavior. A 1.0 app using `select('*')` simply ignores
--     the new columns/tables.
--   * NO existing column is renamed/dropped/made NOT NULL.
--   * NO existing RLS policy is altered. New tables get their own
--     permissive policies only.
--   * Content/role/product FILTERING is done CLIENT-SIDE in 2.0;
--     RLS stays open so un-updated 1.0 phones see no change.
--   * Idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS) so it can
--     run on staging then prod without divergence.
-- ============================================================

-- ============================================================
-- 1. PRODUCTS — dynamic catalog, admin-managed (create on demand)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  sort_order  integer DEFAULT 0,
  is_active   boolean DEFAULT true,
  created_by  uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

-- ============================================================
-- 2. USER_PRODUCTS — per-user product assignment (Manage Users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_products (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_products_user_id    ON public.user_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_products_product_id ON public.user_products(product_id);

ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

-- A user reads their OWN assignments (to self-filter); admins read all.
DROP POLICY IF EXISTS "Users view own product assignments" ON public.user_products;
CREATE POLICY "Users view own product assignments" ON public.user_products
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users
               WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

DROP POLICY IF EXISTS "Admins manage product assignments insert" ON public.user_products;
CREATE POLICY "Admins manage product assignments insert" ON public.user_products
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

DROP POLICY IF EXISTS "Admins manage product assignments delete" ON public.user_products;
CREATE POLICY "Admins manage product assignments delete" ON public.user_products
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

-- ============================================================
-- 3. CONTENT_PRODUCTS — which product line(s) a content item belongs to
--    Absence of rows = unscoped = visible to all (today's behavior).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_products (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (content_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_content_products_content_id ON public.content_products(content_id);
CREATE INDEX IF NOT EXISTS idx_content_products_product_id ON public.content_products(product_id);

ALTER TABLE public.content_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view content products" ON public.content_products;
CREATE POLICY "Anyone can view content products" ON public.content_products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins insert content products" ON public.content_products;
CREATE POLICY "Admins insert content products" ON public.content_products
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

DROP POLICY IF EXISTS "Admins delete content products" ON public.content_products;
CREATE POLICY "Admins delete content products" ON public.content_products
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

-- ============================================================
-- 4. POST_PRODUCTS — which product line(s) a post belongs to
--    Absence of rows = unscoped = visible to all (today's behavior).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.post_products (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_post_products_post_id    ON public.post_products(post_id);
CREATE INDEX IF NOT EXISTS idx_post_products_product_id ON public.post_products(product_id);

ALTER TABLE public.post_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post products" ON public.post_products;
CREATE POLICY "Anyone can view post products" ON public.post_products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins insert post products" ON public.post_products;
CREATE POLICY "Admins insert post products" ON public.post_products
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

DROP POLICY IF EXISTS "Admins delete post products" ON public.post_products;
CREATE POLICY "Admins delete post products" ON public.post_products
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND (users.is_admin = true OR users.is_owner = true)));

-- ============================================================
-- 5. USERS — additive role column for the gateway (physician | sales)
--    NOTE: we deliberately do NOT add a `role` text column — recon found
--    ManageUsers.js already references a non-existent `user.role`; we keep
--    admin on the existing `is_admin` boolean and use a distinct name here.
--    NULL = no gateway role yet (handled by 2.0 default view).
-- ============================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS org_role text;
COMMENT ON COLUMN public.users.org_role IS '2.0 gateway role: physician | sales. NULL = unassigned (default view).';

-- all_products: explicit "this rep sees ALL product lines (incl. future)" flag,
-- so admins don't have to tick every product. NULL/false = scoped to user_products.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS all_products boolean DEFAULT false;
COMMENT ON COLUMN public.users.all_products IS '2.0: when true, rep sees ALL product lines, bypassing per-product assignment. Inert for 1.0.';

-- ============================================================
-- 6. ORGANIZATION_CODE — extend single shared code -> code-per-role.
--    Existing 1.0 reads `select('code').limit(1).single()`; adding a
--    nullable column does not affect that read. New rows are added later
--    (Phase 4); limit(1) keeps the 1.0 read from erroring.
-- ============================================================
ALTER TABLE public.organization_code ADD COLUMN IF NOT EXISTS role  text;
ALTER TABLE public.organization_code ADD COLUMN IF NOT EXISTS label text;
COMMENT ON COLUMN public.organization_code.role IS '2.0: which gateway role this code grants (physician | sales).';

-- ============================================================
-- 7. POSTS — physician visibility toggle ("Physicians can see")
--    Inert for 1.0 (no client-side filtering exists in 1.0).
--    Default false = opt-in to physician visibility (configurable choice).
-- ============================================================
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS visible_to_physicians boolean DEFAULT false;
COMMENT ON COLUMN public.posts.visible_to_physicians IS '2.0: when true, physicians see this post. Inert for 1.0.';

-- ============================================================
-- 8. CONTENT_ITEMS — per-item "Hide from Physician View" exception.
--    Default false = physicians see brochures/surgical/videos by default,
--    minus items explicitly flagged. Training is hidden by topic (client).
-- ============================================================
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS hide_from_physician boolean DEFAULT false;
COMMENT ON COLUMN public.content_items.hide_from_physician IS '2.0: when true, hidden from physician view even within a physician-visible topic. Inert for 1.0.';

-- ============================================================
-- 9. VIDEOS 4th key-topic — widen the content_categories.type CHECK to
--    allow 'videos'. (Caught in Phase 5 QA: a CHECK constraint hardcoded
--    the original 3 types and rejected type='videos'.) Widening an allowed
--    set is additive-safe — all existing rows still conform.
--    Videos categories themselves are created as type='videos' via the admin
--    UI (Phase 3); 1.0 Resources only renders its 3 hardcoded tabs, so they
--    are invisible to 1.0.
-- ============================================================
ALTER TABLE public.content_categories DROP CONSTRAINT IF EXISTS content_categories_type_check;
ALTER TABLE public.content_categories ADD CONSTRAINT content_categories_type_check
  CHECK (type::text = ANY ((ARRAY['brochures','surgical_techniques','training','videos'])::text[]));

-- ============================================================
-- END Phase 1. No existing object altered destructively.
-- Verify-after-apply checklist:
--   * 1.0 web/iOS/Android still loads posts, content, profile (no errors).
--   * select('*') on posts/users/content_items returns new cols, ignored by 1.0.
--   * New tables visible to admins, writeable only by admin/owner.
-- ============================================================
