// ─── Shared DB entity types ────────────────────────────────────────────────
// These mirror the InsForge Postgres schema exactly.

// ─── Auth / Profile ────────────────────────────────────────────────────────
export type InsforgeUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  providers: string[];
  profile?: { name?: string; avatar_url?: string };
};

export type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  addresses: SavedAddress[];
  role: 'user' | 'admin';
  created_at: string;
};

// ─── Categories ────────────────────────────────────────────────────────────
export type DBCategory = {
  id: string;
  name: string;
  slug: string;
  count: string;
  src: string;
  alt: string;
  created_at?: string;
};

// ─── Hero Slides ───────────────────────────────────────────────────────────
export type DBHeroSlide = {
  id: string;
  src: string;
  alt: string;
  link: string;
  order_index: number;
  created_at?: string;
};

// ─── Products ──────────────────────────────────────────────────────────────
export type DBProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  rating: number;
  reviews_count: number;
  category_slug: string;
  badge: string | null;
  images: string[];
  sizes: string[];
  color?: string | null;
  stock: number;
  description: string;
  details: Record<string, string> | null;
  created_at?: string;
};

// ─── Cart ──────────────────────────────────────────────────────────────────
export type DBCartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size: string | null;
  color?: string | null;
  price: number;
  name: string;
  image: string;
  created_at?: string;
};

// ─── Wishlist ──────────────────────────────────────────────────────────────
export type DBWishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at?: string;
};

// ─── Orders ────────────────────────────────────────────────────────────────
export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type OrderLineItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
};

export type DBOrder = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  shipping: number;
  status: OrderStatus;
  payment_method: string;
  shipping_address: SavedAddress;
  items: OrderLineItem[];
  created_at: string;
  // ── Shiprocket (see scratch/shiprocket.sql) ──
  /** Shiprocket's own order id, for looking the order up in their dashboard. */
  shiprocket_order_id?: string | null;
  shiprocket_shipment_id?: string | null;
  /** Their status, or `FAILED: <reason>` when the push did not go through. */
  shiprocket_status?: string | null;
};

// ─── Reviews ───────────────────────────────────────────────────────────────
export type DBReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};
