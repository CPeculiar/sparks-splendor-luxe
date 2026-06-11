
-- Products table (publicly readable; only writes via service role / admin edge funcs)
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT '₦',
  image text NOT NULL,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  sizes jsonb NOT NULL DEFAULT '["S","M","L","XL","XXL"]'::jsonb,
  description text DEFAULT '',
  fabric text DEFAULT '',
  badge text,
  stock integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are public read"
  ON public.products FOR SELECT USING (true);
-- Writes intentionally restricted; admin portal performs writes via anon-key
-- with a server-validated admin password through the admin-write edge function.

-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  email text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  display_currency text NOT NULL DEFAULT 'NGN',
  display_total numeric,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  item_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'paid',
  paystack_status text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) may insert their order at checkout (no PII beyond email/items)
CREATE POLICY "Anyone can create an order"
  ON public.orders FOR INSERT WITH CHECK (true);

-- No public reads — admin portal reads via edge function with admin password.

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_email ON public.orders(email);
CREATE INDEX idx_products_category ON public.products(category) WHERE active;
