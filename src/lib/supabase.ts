import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ==================== DATABASE SERVICE ====================
export const db = {
  // --- CONNECTION ---
  async testConnection() {
    if (!supabase) return { success: false, message: 'Supabase no configurado' };
    try {
      const { error } = await supabase.from('products').select('id').limit(1);
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Conectado ✅' };
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Error desconocido' };
    }
  },

  // --- AUTH ---
  async signUp(email: string, password: string) {
    if (!supabase) return { data: null, error: { message: 'Supabase no configurado' } };
    return await supabase.auth.signUp({ email, password });
  },

  async signIn(email: string, password: string) {
    if (!supabase) return { data: null, error: { message: 'Supabase no configurado' } };
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    if (!supabase) return;
    return await supabase.auth.signOut();
  },

  async getSession() {
    if (!supabase) return { data: { session: null }, error: null };
    return await supabase.auth.getSession();
  },

  // --- PROFILES ---
  async getProfile(userId: string) {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('profiles').select('*').eq('id', userId).single();
  },

  async createProfile(profile: Record<string, unknown>) {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('profiles').insert(profile).select().single();
  },

  async updateProfile(userId: string, updates: Record<string, unknown>) {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('profiles').update(updates).eq('id', userId);
  },

  // --- PRODUCTS ---
  async getProducts() {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('products').select('*').order('created_at', { ascending: false });
  },

  async createProduct(product: Record<string, unknown>) {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('products').insert(product).select().single();
  },

  async updateProduct(id: string, updates: Record<string, unknown>) {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('products').update(updates).eq('id', id);
  },

  async deleteProduct(id: string) {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('products').delete().eq('id', id);
  },

  // --- ORDERS ---
  async getOrders(customerId?: string) {
    if (!supabase) return { data: null, error: null };
    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (customerId) query = query.eq('customer_id', customerId);
    return await query;
  },

  async createOrder(order: Record<string, unknown>) {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('orders').insert(order).select().single();
  },

  async createOrderItems(items: Record<string, unknown>[]) {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('order_items').insert(items);
  },

  async updateOrderStatus(id: string, status: string) {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('orders').update({ status }).eq('id', id);
  },

  async verifyPayment(id: string) {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('orders').update({ payment_verified: true }).eq('id', id);
  },

  // --- DELIVERY ZONES ---
  async getDeliveryZones() {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('delivery_zones').select('*').eq('is_active', true);
  },

  // --- SETTINGS ---
  async getSettings() {
    if (!supabase) return { data: null, error: null };
    return await supabase.from('app_settings').select('*');
  },

  async validateSecretKey(key: string, role: 'admin' | 'vendor') {
    if (!supabase) return false;
    const settingKey = role === 'admin' ? 'admin_secret_key' : 'vendor_secret_key';
    const { data } = await supabase.from('app_settings').select('value').eq('key', settingKey).single();
    return data?.value === key;
  },

  // --- REAL-TIME SUBSCRIPTIONS ---
  subscribeToOrders(callback: (payload: unknown) => void) {
    if (!supabase) return null;
    return supabase.channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  },

  subscribeToProducts(callback: (payload: unknown) => void) {
    if (!supabase) return null;
    return supabase.channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
      .subscribe();
  },
};

// ==================== SQL SETUP ====================
export const SETUP_SQL = `
-- ============================================
-- 🇨🇺 MERCADOCUBA - BASE DE DATOS COMPLETA
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- TABLA 1: PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, phone TEXT, email TEXT, whatsapp TEXT, address TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin','vendor','delivery','client')),
  is_frequent_customer BOOLEAN DEFAULT FALSE, total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0, login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ, last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 2: PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('alimentos','cervezas','refrescos','aseo','combos','otros')),
  price_cup NUMERIC(10,2) NOT NULL DEFAULT 0, price_mlc NUMERIC(10,2) DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unidad' CHECK (unit IN ('unidad','libra','kg','litro','caja','paquete','saco')),
  stock INTEGER NOT NULL DEFAULT 0, min_stock INTEGER DEFAULT 5,
  image_url TEXT DEFAULT '', is_featured BOOLEAN DEFAULT FALSE, is_active BOOLEAN DEFAULT TRUE,
  sales_count INTEGER DEFAULT 0, expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 3: COMBOS
CREATE TABLE IF NOT EXISTS combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT DEFAULT '',
  price_cup NUMERIC(10,2) NOT NULL DEFAULT 0, price_mlc NUMERIC(10,2) DEFAULT 0,
  savings_cup NUMERIC(10,2) DEFAULT 0, image_url TEXT DEFAULT '', is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 4: COMBO_ITEMS
CREATE TABLE IF NOT EXISTS combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 1
);

-- TABLA 5: DELIVERY_ZONES
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, fee_cup NUMERIC(10,2) NOT NULL DEFAULT 0,
  fee_mlc NUMERIC(10,2) DEFAULT 0, estimated_time TEXT DEFAULT '30-60 min',
  is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 6: ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL, customer_address TEXT DEFAULT '',
  delivery_zone_id UUID REFERENCES delivery_zones(id) ON DELETE SET NULL,
  delivery_method TEXT NOT NULL DEFAULT 'delivery' CHECK (delivery_method IN ('delivery','messenger','pickup')),
  delivery_fee_cup NUMERIC(10,2) DEFAULT 0, subtotal_cup NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_cup NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'CUP' CHECK (currency IN ('CUP','MLC')),
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('transfermovil','enzona','transfer','cash')),
  payment_proof_url TEXT DEFAULT '', payment_verified BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','on_the_way','delivered','cancelled')),
  cancelled_reason TEXT DEFAULT '', notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 7: ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cup NUMERIC(10,2) NOT NULL DEFAULT 0, total_price_cup NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- TABLA 8: PROMOTIONS
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, description TEXT DEFAULT '',
  discount_percent INTEGER DEFAULT 0, discount_amount_cup NUMERIC(10,2) DEFAULT 0,
  min_purchase_cup NUMERIC(10,2) DEFAULT 0, code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT TRUE, starts_at TIMESTAMPTZ DEFAULT NOW(), ends_at TIMESTAMPTZ,
  usage_limit INTEGER DEFAULT 0, usage_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 9: ACTIVITY_LOG
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, details JSONB DEFAULT '{}', ip_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 10: APP_SETTINGS
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, value TEXT NOT NULL, description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDICES
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES (acceso abierto para anon key, la seguridad se maneja en el frontend)
CREATE POLICY "public_read_products" ON products FOR SELECT USING (true);
CREATE POLICY "public_read_combos" ON combos FOR SELECT USING (true);
CREATE POLICY "public_read_combo_items" ON combo_items FOR SELECT USING (true);
CREATE POLICY "public_read_zones" ON delivery_zones FOR SELECT USING (true);
CREATE POLICY "public_read_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "public_read_promotions" ON promotions FOR SELECT USING (true);
CREATE POLICY "auth_profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "auth_orders" ON orders FOR ALL USING (true);
CREATE POLICY "auth_order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "auth_activity" ON activity_log FOR ALL USING (true);
CREATE POLICY "admin_products" ON products FOR ALL USING (true);
CREATE POLICY "admin_combos" ON combos FOR ALL USING (true);
CREATE POLICY "admin_combo_items" ON combo_items FOR ALL USING (true);
CREATE POLICY "admin_zones" ON delivery_zones FOR ALL USING (true);
CREATE POLICY "admin_settings" ON app_settings FOR ALL USING (true);
CREATE POLICY "admin_promotions" ON promotions FOR ALL USING (true);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- DATOS INICIALES
INSERT INTO app_settings (key, value, description) VALUES
  ('admin_secret_key', 'MERCADOCUBA_ADMIN_2025', 'Clave secreta para registro de administradores'),
  ('vendor_secret_key', 'MERCADOCUBA_VENDOR_2025', 'Clave secreta para registro de vendedores'),
  ('store_name', 'MercadoCuba', 'Nombre de la tienda'),
  ('store_whatsapp', '+5350000000', 'WhatsApp de la tienda'),
  ('mlc_rate', '300', 'Tasa CUP por 1 MLC')
ON CONFLICT (key) DO NOTHING;

-- Zonas de entrega - Pinar del Río
INSERT INTO delivery_zones (name, fee_cup, fee_mlc, estimated_time) VALUES
  ('Centro - Pinar del Río', 150, 0.50, '25-40 min'),
  ('Hermanos Cruz', 150, 0.50, '30-45 min'),
  ('Carlos Manuel', 200, 0.70, '30-45 min'),
  ('Capitán San Luis', 200, 0.70, '35-50 min'),
  ('San Juan y Martínez', 350, 1.20, '50-70 min'),
  ('Consolación del Sur', 400, 1.35, '55-75 min'),
  ('Viñales', 450, 1.50, '60-80 min'),
  ('Los Palacios', 500, 1.70, '70-90 min'),
  ('Minas de Matahambre', 500, 1.70, '70-90 min'),
  ('La Coloma', 350, 1.20, '45-65 min');

-- Productos iniciales
INSERT INTO products (name, description, category, price_cup, price_mlc, unit, stock, min_stock, is_featured, image_url) VALUES
  ('Arroz suelto', 'Arroz de grano largo premium', 'alimentos', 250, 0.85, 'libra', 100, 10, true, '🍚'),
  ('Frijoles negros', 'Frijoles negros nacionales', 'alimentos', 300, 1.00, 'libra', 80, 10, true, '🫘'),
  ('Aceite de soya', 'Aceite vegetal 1 litro', 'alimentos', 800, 2.70, 'litro', 50, 5, true, '🫒'),
  ('Azúcar refino', 'Azúcar blanca nacional', 'alimentos', 200, 0.70, 'libra', 120, 15, false, '🍬'),
  ('Pollo troceado', 'Pollo congelado importado', 'alimentos', 1200, 4.00, 'kg', 30, 5, true, '🍗'),
  ('Salchichas', 'Salchichas de pollo 500g', 'alimentos', 600, 2.00, 'paquete', 45, 8, false, '🌭'),
  ('Pasta de tomate', 'Pasta de tomate 250g', 'alimentos', 350, 1.20, 'unidad', 60, 10, false, '🍅'),
  ('Espaguetis', 'Pasta espagueti 500g', 'alimentos', 280, 0.95, 'paquete', 70, 10, false, '🍝'),
  ('Cerveza Cristal', 'Cerveza Cristal lata 355ml', 'cervezas', 250, 0.85, 'unidad', 200, 20, true, '🍺'),
  ('Cerveza Bucanero', 'Cerveza Bucanero lata 355ml', 'cervezas', 280, 0.95, 'unidad', 180, 20, true, '🍻'),
  ('Cerveza Presidente', 'Cerveza importada 355ml', 'cervezas', 350, 1.20, 'unidad', 100, 10, false, '🥂'),
  ('Malta Bucanero', 'Malta lata 355ml', 'refrescos', 200, 0.70, 'unidad', 150, 15, false, '🥫'),
  ('Refresco Cola', 'Cola nacional 500ml', 'refrescos', 180, 0.60, 'unidad', 100, 15, false, '🥤'),
  ('Jugo de mango', 'Jugo natural 1 litro', 'refrescos', 350, 1.20, 'litro', 40, 5, true, '🧃'),
  ('Agua mineral', 'Ciego Montero 500ml', 'refrescos', 100, 0.35, 'unidad', 200, 20, false, '💧'),
  ('Detergente líquido', 'Multiusos 1 litro', 'aseo', 500, 1.70, 'litro', 60, 8, false, '🧴'),
  ('Jabón de baño', 'Jabón perfumado', 'aseo', 150, 0.50, 'unidad', 100, 10, false, '🧼'),
  ('Pasta dental', 'Con flúor 100ml', 'aseo', 300, 1.00, 'unidad', 70, 8, true, '🪥'),
  ('Papel higiénico', 'Doble hoja x4', 'aseo', 400, 1.35, 'paquete', 90, 10, false, '🧻')
ON CONFLICT DO NOTHING;
`;
