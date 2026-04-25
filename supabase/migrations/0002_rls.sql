-- =============================================================================
-- Knitd – 0002_rls.sql
-- Row Level Security policies (idempotent)
-- Run AFTER 0001_init.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enable RLS on all public tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- profiles
-- =============================================================================

-- SELECT: own row or admin
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- UPDATE (self): user can update own row but cannot change their own role
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- role must stay the same; admin role changes must come via admin policy below
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- UPDATE (admin): admins can update any row including role
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- INSERT: blocked for direct client inserts; the handle_new_user() trigger
-- (running as SECURITY DEFINER) handles profile creation automatically.
-- No INSERT policy = no insert allowed under RLS.

-- =============================================================================
-- products
-- =============================================================================

-- SELECT: anon/authenticated may read active products; admins see everything
DROP POLICY IF EXISTS "products_select_active" ON public.products;
CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  USING (status = 'active' OR public.is_admin());

-- INSERT / UPDATE / DELETE: admin only
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- product_variants
-- =============================================================================

-- SELECT: parent product must be active (or viewer is admin)
DROP POLICY IF EXISTS "product_variants_select" ON public.product_variants;
CREATE POLICY "product_variants_select"
  ON public.product_variants FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_variants.product_id AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "product_variants_insert_admin" ON public.product_variants;
CREATE POLICY "product_variants_insert_admin"
  ON public.product_variants FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "product_variants_update_admin" ON public.product_variants;
CREATE POLICY "product_variants_update_admin"
  ON public.product_variants FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "product_variants_delete_admin" ON public.product_variants;
CREATE POLICY "product_variants_delete_admin"
  ON public.product_variants FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- product_images
-- =============================================================================

-- SELECT: parent product must be active (or viewer is admin)
DROP POLICY IF EXISTS "product_images_select" ON public.product_images;
CREATE POLICY "product_images_select"
  ON public.product_images FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_images.product_id AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "product_images_insert_admin" ON public.product_images;
CREATE POLICY "product_images_insert_admin"
  ON public.product_images FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "product_images_update_admin" ON public.product_images;
CREATE POLICY "product_images_update_admin"
  ON public.product_images FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "product_images_delete_admin" ON public.product_images;
CREATE POLICY "product_images_delete_admin"
  ON public.product_images FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- addresses
-- =============================================================================

-- SELECT/INSERT/UPDATE/DELETE: own rows; admins read everything
DROP POLICY IF EXISTS "addresses_select" ON public.addresses;
CREATE POLICY "addresses_select"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "addresses_insert" ON public.addresses;
CREATE POLICY "addresses_insert"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_update" ON public.addresses;
CREATE POLICY "addresses_update"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_delete" ON public.addresses;
CREATE POLICY "addresses_delete"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- carts
-- =============================================================================
-- Guest cart operations (user_id IS NULL) must go through server actions
-- using the service_role key because RLS cannot inspect session cookies.
-- The policies below only cover authenticated users.
-- =============================================================================

DROP POLICY IF EXISTS "carts_select" ON public.carts;
CREATE POLICY "carts_select"
  ON public.carts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "carts_insert" ON public.carts;
CREATE POLICY "carts_insert"
  ON public.carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "carts_update" ON public.carts;
CREATE POLICY "carts_update"
  ON public.carts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "carts_delete" ON public.carts;
CREATE POLICY "carts_delete"
  ON public.carts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- cart_items
-- =============================================================================

DROP POLICY IF EXISTS "cart_items_select" ON public.cart_items;
CREATE POLICY "cart_items_select"
  ON public.cart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND   carts.user_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "cart_items_insert" ON public.cart_items;
CREATE POLICY "cart_items_insert"
  ON public.cart_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND   carts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cart_items_update" ON public.cart_items;
CREATE POLICY "cart_items_update"
  ON public.cart_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND   carts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cart_items_delete" ON public.cart_items;
CREATE POLICY "cart_items_delete"
  ON public.cart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND   carts.user_id = auth.uid()
    )
  );

-- =============================================================================
-- orders
-- =============================================================================
-- INSERT and UPDATE are service-role only (no public policy).
-- Guest orders are readable only through signed server actions, not RLS.
-- =============================================================================

DROP POLICY IF EXISTS "orders_select" ON public.orders;
CREATE POLICY "orders_select"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- No INSERT policy: order creation goes exclusively through server actions
-- (service_role bypasses RLS).

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- =============================================================================
-- order_items
-- =============================================================================
-- INSERT/UPDATE/DELETE: service role only (no public policy).
-- =============================================================================

DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
CREATE POLICY "order_items_select"
  ON public.order_items FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND   orders.user_id = auth.uid()
    )
  );

-- =============================================================================
-- discount_codes
-- =============================================================================
-- Authenticated + anon users may read codes that are currently valid (for
-- client-side code validation UX). Columns are fully exposed — acceptable
-- since the data isn't sensitive; the discount is enforced server-side.
-- =============================================================================

DROP POLICY IF EXISTS "discount_codes_select_active" ON public.discount_codes;
CREATE POLICY "discount_codes_select_active"
  ON public.discount_codes FOR SELECT
  USING (
    public.is_admin()
    OR (
      active = true
      AND now() >= valid_from
      AND (valid_until IS NULL OR now() <= valid_until)
    )
  );

DROP POLICY IF EXISTS "discount_codes_insert_admin" ON public.discount_codes;
CREATE POLICY "discount_codes_insert_admin"
  ON public.discount_codes FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "discount_codes_update_admin" ON public.discount_codes;
CREATE POLICY "discount_codes_update_admin"
  ON public.discount_codes FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "discount_codes_delete_admin" ON public.discount_codes;
CREATE POLICY "discount_codes_delete_admin"
  ON public.discount_codes FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- newsletter_subscribers
-- =============================================================================

-- INSERT: anyone (anon + authenticated) may subscribe
DROP POLICY IF EXISTS "newsletter_subscribers_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_insert"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- SELECT / UPDATE / DELETE: admin only
DROP POLICY IF EXISTS "newsletter_subscribers_select_admin" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_select_admin"
  ON public.newsletter_subscribers FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "newsletter_subscribers_update_admin" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_update_admin"
  ON public.newsletter_subscribers FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "newsletter_subscribers_delete_admin" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribers_delete_admin"
  ON public.newsletter_subscribers FOR DELETE
  USING (public.is_admin());
