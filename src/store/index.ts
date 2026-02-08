import { create } from 'zustand';
import { db, isSupabaseConfigured } from '../lib/supabase';

// ==================== TYPES ====================
export type Category = 'alimentos' | 'cervezas' | 'refrescos' | 'aseo' | 'combos';
export type PaymentMethod = 'transfermovil' | 'enzona' | 'transfer' | 'cash';
export type DeliveryMethod = 'delivery' | 'messenger' | 'pickup';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
export type UserRole = 'admin' | 'vendor' | 'delivery' | 'client';
export type View = 'home' | 'catalog' | 'cart' | 'orders' | 'profile' | 'admin' | 'checkout';

export interface Product {
  id: string; name: string; description: string; category: Category;
  priceCUP: number; priceMLC: number; unit: string; stock: number;
  minStock: number; image: string; isFeatured: boolean; isActive: boolean;
  salesCount: number; expiryDate?: string;
}

export interface CartItem { product: Product; quantity: number; }

export interface Combo {
  id: string; name: string; description: string; priceCUP: number;
  priceMLC: number; savingsCUP: number; items: string[]; image: string;
}

export interface DeliveryZone {
  id: string; name: string; feeCUP: number; feeMLC: number; estimatedTime: string;
}

export interface Order {
  id: string; orderNumber: string; items: CartItem[]; customerName: string;
  customerPhone: string; customerAddress: string; deliveryZone: string;
  deliveryMethod: DeliveryMethod; deliveryFee: number; subtotal: number;
  total: number; paymentMethod: PaymentMethod; paymentVerified: boolean;
  status: OrderStatus; notes: string; createdAt: string;
}

export interface User {
  id: string; name: string; phone: string; email: string;
  role: UserRole; isFrequent: boolean; totalOrders: number; totalSpent: number;
}

// ==================== STATIC DATA ====================
export const CATEGORIES: { id: Category; name: string; icon: string }[] = [
  { id: 'alimentos', name: 'Alimentos', icon: '🍚' },
  { id: 'cervezas', name: 'Cervezas', icon: '🍺' },
  { id: 'refrescos', name: 'Refrescos', icon: '🥤' },
  { id: 'aseo', name: 'Aseo', icon: '🧴' },
  { id: 'combos', name: 'Combos', icon: '📦' },
];

const FALLBACK_PRODUCTS: Product[] = [
  { id: '1', name: 'Arroz suelto', description: 'Arroz de grano largo premium', category: 'alimentos', priceCUP: 250, priceMLC: 0.85, unit: 'libra', stock: 100, minStock: 10, image: '🍚', isFeatured: true, isActive: true, salesCount: 45 },
  { id: '2', name: 'Frijoles negros', description: 'Frijoles negros nacionales', category: 'alimentos', priceCUP: 300, priceMLC: 1.00, unit: 'libra', stock: 80, minStock: 10, image: '🫘', isFeatured: true, isActive: true, salesCount: 38 },
  { id: '3', name: 'Aceite de soya', description: 'Aceite vegetal 1 litro', category: 'alimentos', priceCUP: 800, priceMLC: 2.70, unit: 'litro', stock: 50, minStock: 5, image: '🫒', isFeatured: true, isActive: true, salesCount: 52 },
  { id: '4', name: 'Azúcar refino', description: 'Azúcar blanca nacional', category: 'alimentos', priceCUP: 200, priceMLC: 0.70, unit: 'libra', stock: 120, minStock: 15, image: '🍬', isFeatured: false, isActive: true, salesCount: 30 },
  { id: '5', name: 'Pollo troceado', description: 'Pollo congelado importado', category: 'alimentos', priceCUP: 1200, priceMLC: 4.00, unit: 'kg', stock: 30, minStock: 5, image: '🍗', isFeatured: true, isActive: true, salesCount: 60 },
  { id: '6', name: 'Salchichas', description: 'Salchichas de pollo 500g', category: 'alimentos', priceCUP: 600, priceMLC: 2.00, unit: 'paquete', stock: 45, minStock: 8, image: '🌭', isFeatured: false, isActive: true, salesCount: 25 },
  { id: '7', name: 'Pasta de tomate', description: 'Pasta de tomate 250g', category: 'alimentos', priceCUP: 350, priceMLC: 1.20, unit: 'unidad', stock: 60, minStock: 10, image: '🍅', isFeatured: false, isActive: true, salesCount: 20 },
  { id: '8', name: 'Espaguetis', description: 'Pasta espagueti 500g', category: 'alimentos', priceCUP: 280, priceMLC: 0.95, unit: 'paquete', stock: 70, minStock: 10, image: '🍝', isFeatured: false, isActive: true, salesCount: 18 },
  { id: '9', name: 'Cerveza Cristal', description: 'Cerveza Cristal lata 355ml', category: 'cervezas', priceCUP: 250, priceMLC: 0.85, unit: 'unidad', stock: 200, minStock: 20, image: '🍺', isFeatured: true, isActive: true, salesCount: 120 },
  { id: '10', name: 'Cerveza Bucanero', description: 'Cerveza Bucanero lata 355ml', category: 'cervezas', priceCUP: 280, priceMLC: 0.95, unit: 'unidad', stock: 180, minStock: 20, image: '🍻', isFeatured: true, isActive: true, salesCount: 95 },
  { id: '11', name: 'Cerveza Presidente', description: 'Cerveza importada 355ml', category: 'cervezas', priceCUP: 350, priceMLC: 1.20, unit: 'unidad', stock: 100, minStock: 10, image: '🥂', isFeatured: false, isActive: true, salesCount: 40 },
  { id: '12', name: 'Malta Bucanero', description: 'Malta lata 355ml', category: 'refrescos', priceCUP: 200, priceMLC: 0.70, unit: 'unidad', stock: 150, minStock: 15, image: '🥫', isFeatured: false, isActive: true, salesCount: 35 },
  { id: '13', name: 'Refresco Cola', description: 'Cola nacional 500ml', category: 'refrescos', priceCUP: 180, priceMLC: 0.60, unit: 'unidad', stock: 100, minStock: 15, image: '🥤', isFeatured: false, isActive: true, salesCount: 28 },
  { id: '14', name: 'Jugo de mango', description: 'Jugo natural 1 litro', category: 'refrescos', priceCUP: 350, priceMLC: 1.20, unit: 'litro', stock: 40, minStock: 5, image: '🧃', isFeatured: true, isActive: true, salesCount: 22 },
  { id: '15', name: 'Agua mineral', description: 'Ciego Montero 500ml', category: 'refrescos', priceCUP: 100, priceMLC: 0.35, unit: 'unidad', stock: 200, minStock: 20, image: '💧', isFeatured: false, isActive: true, salesCount: 50 },
  { id: '16', name: 'Detergente líquido', description: 'Multiusos 1 litro', category: 'aseo', priceCUP: 500, priceMLC: 1.70, unit: 'litro', stock: 60, minStock: 8, image: '🧴', isFeatured: false, isActive: true, salesCount: 15 },
  { id: '17', name: 'Jabón de baño', description: 'Jabón perfumado', category: 'aseo', priceCUP: 150, priceMLC: 0.50, unit: 'unidad', stock: 100, minStock: 10, image: '🧼', isFeatured: false, isActive: true, salesCount: 22 },
  { id: '18', name: 'Pasta dental', description: 'Con flúor 100ml', category: 'aseo', priceCUP: 300, priceMLC: 1.00, unit: 'unidad', stock: 70, minStock: 8, image: '🪥', isFeatured: true, isActive: true, salesCount: 18 },
  { id: '19', name: 'Papel higiénico', description: 'Doble hoja x4', category: 'aseo', priceCUP: 400, priceMLC: 1.35, unit: 'paquete', stock: 90, minStock: 10, image: '🧻', isFeatured: false, isActive: true, salesCount: 30 },
];

export const COMBOS: Combo[] = [
  { id: 'c1', name: 'Combo Familiar', description: '5lb Arroz + 2lb Frijoles + 1L Aceite + 2lb Azúcar', priceCUP: 2800, priceMLC: 9.50, savingsCUP: 500, items: ['Arroz 5lb', 'Frijoles 2lb', 'Aceite 1L', 'Azúcar 2lb'], image: '👨‍👩‍👧‍👦' },
  { id: 'c2', name: 'Combo Fiesta', description: '12 Cristal + 6 Bucanero + 4 Refrescos', priceCUP: 5500, priceMLC: 18.50, savingsCUP: 900, items: ['12 Cristal', '6 Bucanero', '4 Refrescos'], image: '🎉' },
  { id: 'c3', name: 'Combo Aseo', description: 'Detergente + 3 Jabones + Pasta dental + Papel x4', priceCUP: 1800, priceMLC: 6.00, savingsCUP: 350, items: ['Detergente 1L', '3 Jabones', 'Pasta dental', 'Papel x4'], image: '✨' },
  { id: 'c4', name: 'Combo Básico', description: '3lb Arroz + 1lb Frijoles + 1L Aceite', priceCUP: 1500, priceMLC: 5.00, savingsCUP: 250, items: ['Arroz 3lb', 'Frijoles 1lb', 'Aceite 1L'], image: '🏠' },
];

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'z1', name: 'Consolación del Sur (Centro)', feeCUP: 100, feeMLC: 0.35, estimatedTime: '15-25 min' },
  { id: 'z2', name: 'Pueblo Nuevo', feeCUP: 100, feeMLC: 0.35, estimatedTime: '15-25 min' },
  { id: 'z3', name: 'La Leña', feeCUP: 150, feeMLC: 0.50, estimatedTime: '20-35 min' },
  { id: 'z4', name: 'Puerta de Golpe', feeCUP: 200, feeMLC: 0.70, estimatedTime: '25-40 min' },
  { id: 'z5', name: 'Alonso de Rojas', feeCUP: 250, feeMLC: 0.85, estimatedTime: '30-45 min' },
  { id: 'z6', name: 'Pilotos', feeCUP: 250, feeMLC: 0.85, estimatedTime: '30-45 min' },
  { id: 'z7', name: 'Herradura', feeCUP: 300, feeMLC: 1.00, estimatedTime: '35-50 min' },
  { id: 'z8', name: 'Ceja del Río', feeCUP: 200, feeMLC: 0.70, estimatedTime: '25-40 min' },
  { id: 'z9', name: 'Santa Clara', feeCUP: 200, feeMLC: 0.70, estimatedTime: '25-40 min' },
  { id: 'z10', name: 'El Naranjo', feeCUP: 250, feeMLC: 0.85, estimatedTime: '30-45 min' },
  { id: 'z11', name: 'Entronque de Herradura', feeCUP: 300, feeMLC: 1.00, estimatedTime: '35-50 min' },
  { id: 'z12', name: 'La Palma', feeCUP: 300, feeMLC: 1.00, estimatedTime: '35-50 min' },
  { id: 'z13', name: 'Loma de la Güira', feeCUP: 350, feeMLC: 1.20, estimatedTime: '40-55 min' },
  { id: 'z14', name: 'San Andrés', feeCUP: 250, feeMLC: 0.85, estimatedTime: '30-45 min' },
  { id: 'z15', name: 'Río Hondo', feeCUP: 300, feeMLC: 1.00, estimatedTime: '35-50 min' },
  { id: 'z16', name: 'Quiñones', feeCUP: 200, feeMLC: 0.70, estimatedTime: '25-40 min' },
  { id: 'z17', name: 'Sabana de Cantero', feeCUP: 350, feeMLC: 1.20, estimatedTime: '40-55 min' },
  { id: 'z18', name: 'Los Palacios', feeCUP: 400, feeMLC: 1.35, estimatedTime: '45-60 min' },
  { id: 'z19', name: 'San Diego de los Baños', feeCUP: 450, feeMLC: 1.50, estimatedTime: '50-65 min' },
  { id: 'z20', name: 'Viñales', feeCUP: 500, feeMLC: 1.70, estimatedTime: '55-70 min' },
];

// ==================== LOCAL STORAGE HELPERS ====================
const USERS_KEY = 'mc_users_db';
const SESSION_KEY = 'mc_active_session';

interface StoredUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  password: string;
}

function getAllStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function storeUser(user: StoredUser): void {
  const all = getAllStoredUsers();
  // Remove if exists (update)
  const filtered = all.filter(u => u.id !== user.id);
  filtered.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
}

function findStoredUser(contact: string, password: string): StoredUser | null {
  const all = getAllStoredUsers();
  const c = contact.toLowerCase().replace(/\s+/g, '');

  for (const u of all) {
    const phoneMatch = u.phone && u.phone.toLowerCase().replace(/\s+/g, '') === c;
    const emailMatch = u.email && u.email.toLowerCase().replace(/\s+/g, '') === c;
    const nameMatch = u.name && u.name.toLowerCase().replace(/\s+/g, '') === c;

    if (phoneMatch || emailMatch || nameMatch) {
      if (u.password === password) {
        return u;
      }
      return null; // Found user but wrong password
    }
  }
  return null; // User not found
}

function findStoredUserByContact(contact: string): StoredUser | null {
  const all = getAllStoredUsers();
  const c = contact.toLowerCase().replace(/\s+/g, '');

  for (const u of all) {
    const phoneMatch = u.phone && u.phone.toLowerCase().replace(/\s+/g, '') === c;
    const emailMatch = u.email && u.email.toLowerCase().replace(/\s+/g, '') === c;

    if (phoneMatch || emailMatch) {
      return u;
    }
  }
  return null;
}

function saveActiveSession(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function loadActiveSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearActiveSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ==================== CONVERTERS ====================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToProduct(row: any): Product {
  return {
    id: row.id, name: row.name, description: row.description || '',
    category: row.category as Category,
    priceCUP: Number(row.price_cup) || 0, priceMLC: Number(row.price_mlc) || 0,
    unit: row.unit || 'unidad', stock: row.stock || 0, minStock: row.min_stock || 5,
    image: row.image_url || '📦', isFeatured: row.is_featured || false,
    isActive: row.is_active !== false, salesCount: row.sales_count || 0,
    expiryDate: row.expiry_date || undefined,
  };
}

function productToDb(p: Partial<Product>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (p.name !== undefined) result.name = p.name;
  if (p.description !== undefined) result.description = p.description;
  if (p.category !== undefined) result.category = p.category;
  if (p.priceCUP !== undefined) result.price_cup = p.priceCUP;
  if (p.priceMLC !== undefined) result.price_mlc = p.priceMLC;
  if (p.unit !== undefined) result.unit = p.unit;
  if (p.stock !== undefined) result.stock = p.stock;
  if (p.minStock !== undefined) result.min_stock = p.minStock;
  if (p.image !== undefined) result.image_url = p.image;
  if (p.isFeatured !== undefined) result.is_featured = p.isFeatured;
  if (p.isActive !== undefined) result.is_active = p.isActive;
  if (p.salesCount !== undefined) result.sales_count = p.salesCount;
  if (p.expiryDate !== undefined) result.expiry_date = p.expiryDate;
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToOrder(row: any): Order {
  return {
    id: row.id, orderNumber: row.order_number,
    customerName: row.customer_name, customerPhone: row.customer_phone,
    customerAddress: row.customer_address || '', deliveryZone: row.delivery_zone_id || '',
    deliveryMethod: row.delivery_method || 'delivery',
    deliveryFee: Number(row.delivery_fee_cup) || 0,
    subtotal: Number(row.subtotal_cup) || 0, total: Number(row.total_cup) || 0,
    paymentMethod: row.payment_method || 'cash',
    paymentVerified: row.payment_verified || false,
    status: row.status || 'pending', notes: row.notes || '',
    createdAt: row.created_at,
    items: (row.order_items || []).map((item: { product_name: string; quantity: number; unit_price_cup: number }) => ({
      product: {
        id: '', name: item.product_name, description: '', category: 'alimentos' as Category,
        priceCUP: Number(item.unit_price_cup) || 0, priceMLC: 0, unit: 'unidad', stock: 0,
        minStock: 0, image: '📦', isFeatured: false, isActive: true, salesCount: 0,
      },
      quantity: item.quantity,
    })),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToZone(row: any): DeliveryZone {
  return {
    id: row.id, name: row.name,
    feeCUP: Number(row.fee_cup) || 0, feeMLC: Number(row.fee_mlc) || 0,
    estimatedTime: row.estimated_time || '30-60 min',
  };
}

// ==================== STORE ====================
interface AppState {
  currentView: View;
  setView: (v: View) => void;
  currency: 'CUP' | 'MLC';
  toggleCurrency: () => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  addProduct: (p: Product) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;
  orders: Order[];
  addOrder: (o: Order) => void;
  updateOrderStatus: (id: string, s: OrderStatus) => void;
  verifyPayment: (id: string) => void;
  user: User | null;
  login: (name: string, phone: string, role: UserRole) => void;
  logout: () => void;
  isAdmin: () => boolean;
  supabaseConnected: boolean;
  setSbConnected: (v: boolean) => void;
  syncWithSupabase: () => Promise<void>;
  deliveryZones: DeliveryZone[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: Category | 'all';
  setSelectedCategory: (c: Category | 'all') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  isLoading: boolean;
}

export const useStore = create<AppState>((set, get) => ({
  currentView: 'home',
  setView: (v) => set({ currentView: v }),
  currency: 'CUP',
  toggleCurrency: () => set((s) => ({ currency: s.currency === 'CUP' ? 'MLC' : 'CUP' })),

  // ===== PRODUCTS =====
  products: FALLBACK_PRODUCTS,
  setProducts: (p) => set({ products: p }),

  addProduct: async (p) => {
    set((s) => ({ products: [...s.products, p] }));
    if (isSupabaseConfigured) {
      const dbData = productToDb(p);
      const { data, error } = await db.createProduct(dbData);
      if (!error && data) {
        const newProduct = dbToProduct(data);
        set((s) => ({ products: s.products.map(prod => prod.id === p.id ? newProduct : prod) }));
      }
    }
  },

  updateProduct: async (id, data) => {
    set((s) => ({ products: s.products.map((p) => p.id === id ? { ...p, ...data } : p) }));
    if (isSupabaseConfigured) {
      const dbData = productToDb(data);
      await db.updateProduct(id, dbData);
    }
  },

  deleteProduct: async (id) => {
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    if (isSupabaseConfigured) {
      await db.deleteProduct(id);
    }
  },

  // ===== CART =====
  cart: [],
  addToCart: (product) => set((s) => {
    const existing = s.cart.find((i) => i.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return s;
      return { cart: s.cart.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
    }
    return { cart: [...s.cart, { product, quantity: 1 }] };
  }),
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((i) => i.product.id !== id) })),
  updateCartQty: (id, qty) => set((s) => {
    if (qty <= 0) return { cart: s.cart.filter((i) => i.product.id !== id) };
    return { cart: s.cart.map((i) => i.product.id === id ? { ...i, quantity: qty } : i) };
  }),
  clearCart: () => set({ cart: [] }),
  cartTotal: () => {
    const s = get();
    return s.cart.reduce((t, i) => t + (s.currency === 'CUP' ? i.product.priceCUP : i.product.priceMLC) * i.quantity, 0);
  },
  cartCount: () => get().cart.reduce((t, i) => t + i.quantity, 0),

  // ===== ORDERS =====
  orders: [],

  addOrder: async (o) => {
    set((s) => ({ orders: [o, ...s.orders] }));
    if (isSupabaseConfigured) {
      const orderDb = {
        order_number: o.orderNumber,
        customer_id: get().user?.id || null,
        customer_name: o.customerName,
        customer_phone: o.customerPhone,
        customer_address: o.customerAddress,
        delivery_zone_id: o.deliveryZone || null,
        delivery_method: o.deliveryMethod,
        delivery_fee_cup: o.deliveryFee,
        subtotal_cup: o.subtotal,
        total_cup: o.total,
        currency: get().currency,
        payment_method: o.paymentMethod,
        status: 'pending',
        notes: o.notes,
      };
      const { data, error } = await db.createOrder(orderDb);
      if (!error && data) {
        const orderItems = o.items.map(item => ({
          order_id: data.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price_cup: item.product.priceCUP,
          total_price_cup: item.product.priceCUP * item.quantity,
        }));
        await db.createOrderItems(orderItems);
      }
    }
  },

  updateOrderStatus: async (id, status) => {
    set((s) => ({ orders: s.orders.map((o) => o.id === id ? { ...o, status } : o) }));
    if (isSupabaseConfigured) {
      await db.updateOrderStatus(id, status);
    }
  },

  verifyPayment: async (id) => {
    set((s) => ({ orders: s.orders.map((o) => o.id === id ? { ...o, paymentVerified: true } : o) }));
    if (isSupabaseConfigured) {
      await db.verifyPayment(id);
    }
  },

  // ===== AUTH =====
  user: null,

  login: (name, phone, role) => {
    const user: User = {
      id: Date.now().toString(),
      name, phone, email: '',
      role,
      isFrequent: false, totalOrders: 0, totalSpent: 0,
    };
    set({ user });
    saveActiveSession(user);
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      try { await db.signOut(); } catch (e) { console.log('Signout error:', e); }
    }
    clearActiveSession();
    set({ user: null, currentView: 'home' });
  },

  isAdmin: () => {
    const u = get().user;
    return u?.role === 'admin' || u?.role === 'vendor';
  },

  // ===== SUPABASE SYNC =====
  supabaseConnected: false,
  setSbConnected: (v) => set({ supabaseConnected: v }),

  syncWithSupabase: async () => {
    // Restore local session first
    const session = loadActiveSession();
    if (session) {
      set({ user: session });
    }

    if (!isSupabaseConfigured) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const connTest = await db.testConnection();
      set({ supabaseConnected: connTest.success });

      if (!connTest.success) {
        set({ isLoading: false });
        return;
      }

      // Load products
      const { data: productsData } = await db.getProducts();
      if (productsData && productsData.length > 0) {
        set({ products: productsData.map(dbToProduct) });
      }

      // Load orders
      const { data: ordersData } = await db.getOrders();
      if (ordersData && ordersData.length > 0) {
        set({ orders: ordersData.map(dbToOrder) });
      }

      // Load delivery zones
      const { data: zonesData } = await db.getDeliveryZones();
      if (zonesData && zonesData.length > 0) {
        set({ deliveryZones: zonesData.map(dbToZone) });
      }

      // Check existing Supabase session
      const { data: sessionData } = await db.getSession();
      if (sessionData?.session?.user) {
        const userId = sessionData.session.user.id;
        const { data: profile } = await db.getProfile(userId);
        if (profile) {
          const user: User = {
            id: profile.id, name: profile.name,
            phone: profile.phone || '', email: profile.email || '',
            role: profile.role as UserRole,
            isFrequent: profile.is_frequent_customer || false,
            totalOrders: profile.total_orders || 0,
            totalSpent: Number(profile.total_spent) || 0,
          };
          set({ user });
          saveActiveSession(user);
        }
      }

      // Real-time subscriptions
      db.subscribeToProducts(() => {
        db.getProducts().then(({ data }) => {
          if (data) set({ products: data.map(dbToProduct) });
        });
      });

      db.subscribeToOrders(() => {
        db.getOrders().then(({ data }) => {
          if (data) set({ orders: data.map(dbToOrder) });
        });
      });

    } catch (e) {
      console.error('Error sincronización:', e);
    }

    set({ isLoading: false });
  },

  deliveryZones: DELIVERY_ZONES,
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  selectedCategory: 'all',
  setSelectedCategory: (c) => set({ selectedCategory: c }),
  selectedProduct: null,
  setSelectedProduct: (p) => set({ selectedProduct: p }),
  isLoading: true,
}));

// ==================== EXPORTED AUTH HELPERS ====================
// These are used directly by AuthView to handle registration and login

export function registerLocalUser(
  name: string,
  phone: string,
  email: string,
  password: string,
  role: UserRole
): void {
  const contact = phone.trim() || email.trim();
  const existingUser = findStoredUserByContact(contact);
  
  const user: StoredUser = {
    id: existingUser ? existingUser.id : Date.now().toString(),
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    role,
    password,
  };
  storeUser(user);
}

export function loginLocalUser(
  contact: string,
  password: string
): { success: boolean; user?: StoredUser; error?: string } {
  const contactClean = contact.toLowerCase().replace(/\s+/g, '');

  // First check if user exists
  const existingUser = findStoredUserByContact(contactClean);

  if (!existingUser) {
    return { success: false, error: 'No se encontró una cuenta con ese teléfono o correo. Regístrate primero.' };
  }

  // User found, check password
  const user = findStoredUser(contact, password);

  if (!user) {
    return { success: false, error: 'Contraseña incorrecta. Intenta de nuevo.' };
  }

  return { success: true, user };
}
