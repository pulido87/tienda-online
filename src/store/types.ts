export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'alimentos' | 'cervezas' | 'refrescos' | 'aseo' | 'combos' | 'otros';
  priceCUP: number;
  priceMLC: number;
  unit: string;
  stock: number;
  minStock: number;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  salesCount: number;
  expiryDate?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  feeCUP: number;
  feeMLC: number;
  estimatedTime: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryZone: string;
  deliveryMethod: 'delivery' | 'messenger' | 'pickup';
  deliveryFee: number;
  subtotal: number;
  total: number;
  currency: 'CUP' | 'MLC';
  paymentMethod: 'transfermovil' | 'enzona' | 'transfer' | 'cash';
  paymentVerified: boolean;
  status: 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  role: 'admin' | 'vendor' | 'delivery' | 'client';
  isFrequentCustomer: boolean;
  totalOrders: number;
  totalSpent: number;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  priceCUP: number;
  priceMLC: number;
  savingsCUP: number;
  items: string[];
  imageUrl: string;
}

export type View = 'home' | 'catalog' | 'cart' | 'checkout' | 'orders' | 'auth' | 'profile' | 'admin' | 'supabaseSetup';
