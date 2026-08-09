import { insforge } from '@/lib/insforge-client';
import type { DBOrder, OrderStatus, OrderLineItem, SavedAddress } from '@/lib/types';
import type { CartItem } from '@/components/cart-context';

// ─── Generate a friendly order number ──────────────────────────────────────
function generateOrderNumber(): string {
  return `SE-${Date.now().toString(36).toUpperCase()}`;
}

// ─── Create order ───────────────────────────────────────────────────────────
export type CreateOrderInput = {
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: SavedAddress;
  paymentMethod: string;
  items: CartItem[];
  total: number;
  shipping: number;
};

export async function createOrder(input: CreateOrderInput): Promise<{ orderId: string; orderNumber: string } | null> {
  try {
    const orderNumber = generateOrderNumber();
    const lineItems: OrderLineItem[] = input.items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      size: i.size,
      image: i.image,
    }));

    await insforge.database.from('orders').insert([{
      order_number: orderNumber,
      user_id: input.userId,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      total: input.total,
      shipping: input.shipping,
      status: 'Pending',
      payment_method: input.paymentMethod,
      shipping_address: input.shippingAddress,
      items: lineItems,
    }]);

    // Fetch the created order to get its UUID
    const { data } = await insforge.database
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .single();

    const row = data as Record<string, unknown> | null;
    return { orderId: String(row?.id ?? ''), orderNumber };
  } catch {
    return null;
  }
}

// ─── Fetch user's orders ────────────────────────────────────────────────────
export async function getUserOrders(userId: string): Promise<DBOrder[]> {
  try {
    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as unknown[]).map((row) => {
      const r = row as Record<string, unknown>;
      return {
        ...r,
        items: Array.isArray(r.items) ? r.items : [],
        shipping_address: r.shipping_address ?? {},
      } as DBOrder;
    });
  } catch {
    return [];
  }
}

// ─── Update order status (admin) ────────────────────────────────────────────
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    await insforge.database
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    return true;
  } catch {
    return false;
  }
}

// ─── Get all orders (admin) ─────────────────────────────────────────────────
export async function getAllOrders(): Promise<DBOrder[]> {
  try {
    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as unknown[]).map((row) => {
      const r = row as Record<string, unknown>;
      return {
        ...r,
        items: Array.isArray(r.items) ? r.items : [],
        shipping_address: r.shipping_address ?? {},
      } as DBOrder;
    });
  } catch {
    return [];
  }
}
