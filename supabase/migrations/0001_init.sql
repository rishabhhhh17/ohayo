-- =============================================================================
-- Knitd – 0001_init.sql
-- Initial schema migration (idempotent)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- provides gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- case-insensitive text (emails)

-- ---------------------------------------------------------------------------
-- Enums  (guarded so re-running is safe)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.product_gender AS ENUM ('mens', 'womens', 'unisex', 'kids');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cart_status AS ENUM ('active', 'converted', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM (
    'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Helper function: set_updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Table: discount_codes  (defined BEFORE orders so FK can be inline)
-- ---------------------------------------------------------------------------
-- value semantics:
--   percentage → integer 1–100 (percent off)
--   fixed      → integer > 0   (INR paise off)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text        UNIQUE NOT NULL,
  type            public.discount_type NOT NULL,
  value           integer     NOT NULL CHECK (value > 0),
  min_order_amount integer    NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  max_uses        integer     CHECK (max_uses IS NULL OR max_uses > 0),
  uses_count      integer     NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
  valid_from      timestamptz NOT NULL DEFAULT now(),
  valid_until     timestamptz,
  active          boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT discount_codes_code_upper   CHECK (code = upper(code)),
  CONSTRAINT discount_codes_value_range  CHECK (
    (type = 'percentage' AND value BETWEEN 1 AND 100)
    OR (type = 'fixed'   AND value > 0)
  ),
  CONSTRAINT discount_codes_valid_range  CHECK (
    valid_until IS NULL OR valid_until > valid_from
  )
);

-- ---------------------------------------------------------------------------
-- Table: profiles  (extends auth.users)
-- ---------------------------------------------------------------------------
-- NOTE: default_address_id FK is added AFTER addresses table (see below).
-- The email column is denormalized from auth.users for admin-side search
-- (e.g., Supabase dashboard queries, server-side filters) without requiring
-- a JOIN to auth.users which lives in a different schema and is not directly
-- accessible in RLS subqueries. It is kept in sync by handle_new_user().
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           text,
  phone               text,
  role                public.user_role NOT NULL DEFAULT 'customer',
  default_address_id  uuid,       -- FK constraint added after addresses table
  email               citext,     -- denormalized; populated by trigger
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: products
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id               uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text           UNIQUE NOT NULL,
  name             text           NOT NULL,
  description      text           NOT NULL DEFAULT '',
  base_price       integer        NOT NULL CHECK (base_price >= 0),   -- INR paise
  compare_at_price integer        CHECK (
                                    compare_at_price IS NULL
                                    OR compare_at_price > base_price
                                  ),
  status           public.product_status  NOT NULL DEFAULT 'draft',
  category         text,          -- e.g. 'Ankle', 'Crew', 'No-Show'
  gender           public.product_gender  NOT NULL DEFAULT 'unisex',
  featured         boolean        NOT NULL DEFAULT false,
  sort_order       integer        NOT NULL DEFAULT 0,
  created_at       timestamptz    NOT NULL DEFAULT now(),
  updated_at       timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_status_idx    ON public.products (status);
CREATE INDEX IF NOT EXISTS products_category_idx  ON public.products (category);
CREATE INDEX IF NOT EXISTS products_gender_idx    ON public.products (gender);
CREATE INDEX IF NOT EXISTS products_featured_idx  ON public.products (featured) WHERE featured = true;
-- slug is already indexed via UNIQUE constraint

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: product_variants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
  id             uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid     NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size           text     NOT NULL,
  color_name     text     NOT NULL,
  color_hex      text     NOT NULL CHECK (color_hex ~ '^#[0-9a-fA-F]{6}$'),
  sku            text     UNIQUE NOT NULL,
  stock_quantity integer  NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  price_override integer  CHECK (price_override IS NULL OR price_override >= 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT product_variants_unique_combo UNIQUE (product_id, size, color_name)
);

CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON public.product_variants (product_id);

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: product_images
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid     NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         text     NOT NULL,
  alt_text    text     NOT NULL DEFAULT '',
  sort_order  integer  NOT NULL DEFAULT 0,
  is_primary  boolean  NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images (product_id);

-- Only one primary image per product
CREATE UNIQUE INDEX IF NOT EXISTS product_images_one_primary
  ON public.product_images (product_id)
  WHERE is_primary = true;

DROP TRIGGER IF EXISTS trg_product_images_updated_at ON public.product_images;
CREATE TRIGGER trg_product_images_updated_at
  BEFORE UPDATE ON public.product_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: addresses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text     NOT NULL,
  phone       text     NOT NULL,
  line1       text     NOT NULL,
  line2       text,
  city        text     NOT NULL,
  state       text     NOT NULL,
  pincode     text     NOT NULL CHECK (pincode ~ '^[0-9]{6}$'),  -- Indian 6-digit
  country     text     NOT NULL DEFAULT 'IN',
  is_default  boolean  NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON public.addresses (user_id);

-- Only one default address per user
CREATE UNIQUE INDEX IF NOT EXISTS addresses_one_default
  ON public.addresses (user_id)
  WHERE is_default = true;

DROP TRIGGER IF EXISTS trg_addresses_updated_at ON public.addresses;
CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Back-fill FK: profiles.default_address_id → addresses.id
-- (idempotent: wrapped in DO block that ignores duplicate constraint error)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_default_address_fk
    FOREIGN KEY (default_address_id)
    REFERENCES public.addresses(id)
    ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Table: carts
-- ---------------------------------------------------------------------------
-- Guest carts (user_id IS NULL) use session_id. Because Supabase RLS cannot
-- inspect arbitrary request headers, guest cart writes must go through server
-- actions using the service role. Logged-in user operations use the anon key
-- with the RLS policy "auth.uid() = user_id".
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
  id          uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid           REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  text,          -- for guest carts
  status      public.cart_status NOT NULL DEFAULT 'active',
  created_at  timestamptz    NOT NULL DEFAULT now(),
  updated_at  timestamptz    NOT NULL DEFAULT now(),

  CONSTRAINT carts_has_identifier CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS carts_user_id_idx    ON public.carts (user_id);
CREATE INDEX IF NOT EXISTS carts_session_id_idx ON public.carts (session_id);

-- A logged-in user can only have one active cart at a time
CREATE UNIQUE INDEX IF NOT EXISTS carts_one_active_per_user
  ON public.carts (user_id)
  WHERE status = 'active' AND user_id IS NOT NULL;

DROP TRIGGER IF EXISTS trg_carts_updated_at ON public.carts;
CREATE TRIGGER trg_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: cart_items
-- ---------------------------------------------------------------------------
-- on delete restrict on variant_id: admin should archive variants, not delete
-- them, to preserve cart accuracy. A restricted delete surfaces the issue.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     uuid     NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  variant_id  uuid     NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
  quantity    integer  NOT NULL CHECK (quantity > 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT cart_items_unique_variant UNIQUE (cart_id, variant_id)
);

CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx ON public.cart_items (cart_id);

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id                   uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number         text           UNIQUE NOT NULL DEFAULT '',
  user_id              uuid           REFERENCES auth.users(id) ON DELETE SET NULL,
  email                citext         NOT NULL,
  phone                text           NOT NULL,
  subtotal             integer        NOT NULL CHECK (subtotal >= 0),
  discount_amount      integer        NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  shipping_amount      integer        NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  tax_amount           integer        NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount         integer        NOT NULL CHECK (total_amount >= 0),
  currency             text           NOT NULL DEFAULT 'INR',
  status               public.order_status NOT NULL DEFAULT 'pending',
  razorpay_order_id    text           UNIQUE,
  razorpay_payment_id  text,
  razorpay_signature   text,
  shipping_address     jsonb          NOT NULL,
  billing_address      jsonb          NOT NULL,
  notes                text,
  discount_code_id     uuid           REFERENCES public.discount_codes(id) ON DELETE SET NULL,
  created_at           timestamptz    NOT NULL DEFAULT now(),
  updated_at           timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx    ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_email_idx      ON public.orders (email);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: order_items
-- ---------------------------------------------------------------------------
-- variant_id is nullable (ON DELETE SET NULL) so order history survives if
-- a variant is ever hard-deleted. Snapshots capture point-in-time data.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id                      uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                uuid     NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id              uuid     REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name_snapshot   text     NOT NULL,
  variant_snapshot        jsonb    NOT NULL,  -- { size, color_name, color_hex, sku }
  unit_price              integer  NOT NULL CHECK (unit_price >= 0),
  quantity                integer  NOT NULL CHECK (quantity > 0),
  line_total              integer  NOT NULL CHECK (line_total >= 0),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);

DROP TRIGGER IF EXISTS trg_order_items_updated_at ON public.order_items;
CREATE TRIGGER trg_order_items_updated_at
  BEFORE UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: newsletter_subscribers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id                uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  email             citext   UNIQUE NOT NULL,
  subscribed_at     timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at   timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_newsletter_subscribers_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER trg_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Sequence + trigger: generate_order_number
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'KND-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_order_number ON public.orders;
CREATE TRIGGER trg_orders_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ---------------------------------------------------------------------------
-- Trigger: handle_new_user — auto-creates profile on auth.users insert
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_auth_users_on_signup ON auth.users;
CREATE TRIGGER trg_auth_users_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Function: decrement_stock_for_order
-- Called by server verify endpoint AFTER Razorpay confirms payment.
-- Transactional: raises EXCEPTION on insufficient stock; caller rolls back.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_stock_for_order(p_order_id uuid)
RETURNS void AS $$
DECLARE
  item          RECORD;
  current_stock integer;
BEGIN
  FOR item IN
    SELECT variant_id, quantity
    FROM   public.order_items
    WHERE  order_id = p_order_id
    AND    variant_id IS NOT NULL
  LOOP
    SELECT stock_quantity
    INTO   current_stock
    FROM   public.product_variants
    WHERE  id = item.variant_id
    FOR UPDATE;                                -- pessimistic lock for concurrency safety

    IF current_stock IS NULL THEN
      RAISE EXCEPTION 'Variant % not found', item.variant_id;
    END IF;

    IF current_stock < item.quantity THEN
      RAISE EXCEPTION
        'Insufficient stock for variant %: have %, need %',
        item.variant_id, current_stock, item.quantity;
    END IF;

    UPDATE public.product_variants
    SET    stock_quantity = stock_quantity - item.quantity
    WHERE  id = item.variant_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.decrement_stock_for_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock_for_order(uuid) TO service_role;

-- ---------------------------------------------------------------------------
-- Helper function: is_admin  (referenced by RLS in 0002_rls.sql)
-- Defined at the end so SQL-language body can reference public.profiles,
-- which Postgres validates at CREATE FUNCTION time.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
