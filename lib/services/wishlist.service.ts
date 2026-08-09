import { insforge } from '@/lib/insforge-client';
import type { FavouriteItem } from '@/components/favourites-context';

// ─── Fetch wishlist product IDs ─────────────────────────────────────────────
export async function fetchWishlistFromDB(userId: string): Promise<string[]> {
  try {
    const { data, error } = await insforge.database
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId);
    if (error || !data) return [];
    return (data as unknown[]).map((r) => String((r as Record<string, unknown>).product_id));
  } catch {
    return [];
  }
}

// ─── Add to wishlist ────────────────────────────────────────────────────────
export async function addToWishlistDB(
  userId: string,
  productId: string
): Promise<void> {
  try {
    // Check if already exists
    const { data } = await insforge.database
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (Array.isArray(data) && data.length > 0) return; // already in wishlist
    await insforge.database.from('wishlists').insert([{
      user_id: userId,
      product_id: productId,
    }]);
  } catch {
    // silent
  }
}

// ─── Remove from wishlist ───────────────────────────────────────────────────
export async function removeFromWishlistDB(
  userId: string,
  productId: string
): Promise<void> {
  try {
    await insforge.database
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
  } catch {
    // silent
  }
}

// ─── Merge guest + DB wishlist ──────────────────────────────────────────────
export function mergeWishlistItems(
  guestItems: FavouriteItem[],
  dbProductIds: string[]
): string[] {
  const set = new Set(dbProductIds);
  guestItems.forEach((i) => set.add(i.id));
  return Array.from(set);
}
