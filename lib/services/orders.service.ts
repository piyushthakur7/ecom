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
      color: i.color,
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

// ─── Record the Shiprocket result against an order ──────────────────────────
/**
 * Best-effort: the order is already saved and the customer already has their
 * confirmation, so a failure here is logged and dropped rather than surfaced.
 * Also used to store the *reason* a push failed, which is why it accepts a
 * status with no ids.
 */
export async function updateOrderShipping(
  orderNumber: string,
  fields: { shiprocketOrderId?: string; shipmentId?: string; status: string }
): Promise<void> {
  try {
    const { error } = await insforge.database
      .from('orders')
      .update({
        ...(fields.shiprocketOrderId ? { shiprocket_order_id: fields.shiprocketOrderId } : {}),
        ...(fields.shipmentId ? { shiprocket_shipment_id: fields.shipmentId } : {}),
        shiprocket_status: fields.status.slice(0, 300),
      })
      .eq('order_number', orderNumber);

    if (error) {
      // By far the most common cause, and the one that looks like nothing is
      // wrong: the columns were never added, so every push silently forgets
      // its shipment id and /admin shows no Shiprocket panel at all. Say what
      // to do about it rather than logging a bare PostgREST message.
      if (/column .* does not exist/i.test(error.message)) {
        console.error(
          `Shiprocket ids for ${orderNumber} were discarded: the orders table has no ` +
            'shiprocket_* columns. Apply scratch/shiprocket.sql to the InsForge project ' +
            '(insforge sql --file scratch/shiprocket.sql, or paste it into the SQL editor).'
        );
      } else {
        console.error('Could not record Shiprocket ids:', error.message);
      }
    }
  } catch (err) {
    console.error('Recording Shiprocket ids threw:', err);
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

// ─── Look up a single order by its order number (public order tracking) ─────
export async function getOrderByNumber(orderNumber: string): Promise<DBOrder | null> {
  try {
    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.trim().toUpperCase())
      .limit(1);
    if (error || !data || (data as unknown[]).length === 0) return null;
    const r = (data as unknown[])[0] as Record<string, unknown>;
    return {
      ...r,
      items: Array.isArray(r.items) ? r.items : [],
      shipping_address: r.shipping_address ?? {},
    } as DBOrder;
  } catch {
    return null;
  }
}
