import { insforge } from '@/lib/insforge-client';
import type { CartItem } from '@/components/cart-context';

// ─── Fetch cart from DB ─────────────────────────────────────────────────────
export async function fetchCartFromDB(userId: string): Promise<CartItem[]> {
  try {
    const { data, error } = await insforge.database
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);
    if (error || !data) return [];
    return (data as unknown[]).map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.product_id),
        name: String(r.name),
        price: Number(r.price),
        priceDisplay: `₹${Number(r.price).toLocaleString('en-IN')}`,
        image: String(r.image),
        category: String(r.category ?? ''),
        size: r.size ? String(r.size) : undefined,
        color: r.color ? String(r.color) : undefined,
        quantity: Number(r.quantity),
        _dbRowId: String(r.id),
      } as CartItem & { _dbRowId: string };
    });
  } catch {
    return [];
  }
}

// ─── Add / upsert a single cart item ───────────────────────────────────────
export async function upsertCartItem(
  userId: string,
  item: CartItem
): Promise<void> {
  try {
    // Check if row exists for this user + product + size + color combo
    const { data } = await insforge.database
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', item.id)
      .eq('size', item.size ?? null)
      .eq('color', item.color ?? null);

    const existing = Array.isArray(data) && data.length > 0
      ? (data[0] as Record<string, unknown>)
      : null;

    if (existing) {
      await insforge.database
        .from('cart_items')
        .update({ quantity: item.quantity })
        .eq('id', String(existing.id));
    } else {
      await insforge.database.from('cart_items').insert([{
        user_id: userId,
        product_id: item.id,
        quantity: item.quantity,
        size: item.size ?? null,
        color: item.color ?? null,
        price: item.price,
        name: item.name,
        image: item.image,
        category: item.category,
      }]);
    }
  } catch {
    // silently fail — local state is source of truth
  }
}

// ─── Update quantity ────────────────────────────────────────────────────────
export async function updateCartItemQty(
  userId: string,
  productId: string,
  size: string | undefined,
  color: string | undefined,
  qty: number
): Promise<void> {
  try {
    await insforge.database
      .from('cart_items')
      .update({ quantity: qty })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('size', size ?? null)
      .eq('color', color ?? null);
  } catch {
    // silent
  }
}

// ─── Remove a single item ───────────────────────────────────────────────────
export async function removeCartItemFromDB(
  userId: string,
  productId: string,
  size: string | undefined,
  color?: string | undefined
): Promise<void> {
  try {
    await insforge.database
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('size', size ?? null)
      .eq('color', color ?? null);
  } catch {
    // silent
  }
}

// ─── Clear all items ────────────────────────────────────────────────────────
export async function clearCartInDB(userId: string): Promise<void> {
  try {
    await insforge.database
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
  } catch {
    // silent
  }
}

// ─── Merge guest + DB items ─────────────────────────────────────────────────
/** Called on login. DB items win for shared products; guest-only items are added. */
export function mergeCartItems(
  guestItems: CartItem[],
  dbItems: CartItem[]
): CartItem[] {
  const merged = [...dbItems];
  for (const g of guestItems) {
    const key = `${g.id}::${g.size ?? ''}`;
    const exists = merged.find((d) => `${d.id}::${d.size ?? ''}` === key);
    if (!exists) merged.push(g);
    else {
      // Take the higher quantity
      exists.quantity = Math.max(exists.quantity, g.quantity);
    }
  }
  return merged;
}
