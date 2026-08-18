import { insforge } from '@/lib/insforge-client';
import type { DBCategory, DBHeroSlide, DBProduct } from '@/lib/types';

// ─── Categories ────────────────────────────────────────────────────────────

export async function getCategories(): Promise<DBCategory[]> {
  try {
    const { data, error } = await insforge.database
      .from('categories')
      .select('*')
      .order('name');
    if (error || !data) return [];
    return data as DBCategory[];
  } catch {
    return [];
  }
}

// ─── Hero Slides ───────────────────────────────────────────────────────────

export async function getHeroSlides(): Promise<DBHeroSlide[]> {
  try {
    const { data, error } = await insforge.database
      .from('hero_slides')
      .select('*')
      .order('order_index');
    if (error || !data) return [];
    return data as DBHeroSlide[];
  } catch {
    return [];
  }
}

// ─── Products ──────────────────────────────────────────────────────────────

export async function getProducts(): Promise<DBProduct[]> {
  try {
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as unknown[]).map((row) => {
      const r = row as Record<string, unknown>;
      let imgs: string[] = [];
      if (Array.isArray(r.images)) imgs = r.images as string[];
      else if (typeof r.images === 'string') { try { imgs = JSON.parse(r.images); } catch { imgs = []; } }

      let szs: string[] = [];
      if (Array.isArray(r.sizes)) szs = r.sizes as string[];
      else if (typeof r.sizes === 'string') { try { szs = JSON.parse(r.sizes); } catch { szs = []; } }

      return {
        ...r,
        images: imgs,
        sizes: szs,
      } as DBProduct;
    });
  } catch {
    return [];
  }
}

export async function getProductById(id: string): Promise<DBProduct | null> {
  try {
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    const r = data as Record<string, unknown>;
    let imgs: string[] = [];
    if (Array.isArray(r.images)) imgs = r.images as string[];
    else if (typeof r.images === 'string') { try { imgs = JSON.parse(r.images); } catch { imgs = []; } }

    let szs: string[] = [];
    if (Array.isArray(r.sizes)) szs = r.sizes as string[];
    else if (typeof r.sizes === 'string') { try { szs = JSON.parse(r.sizes); } catch { szs = []; } }

    return {
      ...r,
      images: imgs,
      sizes: szs,
    } as DBProduct;
  } catch {
    return null;
  }
}

export async function getProductsByCategory(slug: string): Promise<DBProduct[]> {
  try {
    const cleanSlug = slug.toLowerCase().trim();
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .eq('category_slug', cleanSlug)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as unknown[]).map((row) => {
      const r = row as Record<string, unknown>;
      let imgs: string[] = [];
      if (Array.isArray(r.images)) imgs = r.images as string[];
      else if (typeof r.images === 'string') { try { imgs = JSON.parse(r.images); } catch { imgs = []; } }

      let szs: string[] = [];
      if (Array.isArray(r.sizes)) szs = r.sizes as string[];
      else if (typeof r.sizes === 'string') { try { szs = JSON.parse(r.sizes); } catch { szs = []; } }

      return {
        ...r,
        images: imgs,
        sizes: szs,
      } as DBProduct;
    });
  } catch {
    return [];
  }
}

// ─── Stock ──────────────────────────────────────────────────────────────────
/**
 * Reduce stock after an order is paid for.
 *
 * Read-then-write, so it is not safe against two orders landing in the same
 * instant. Availability is already checked during pricing; this keeps the
 * catalogue honest for the next shopper. A database-level
 * `stock = stock - n` would close the race entirely.
 */
export async function decrementStock(
  items: { id: string; quantity: number }[]
): Promise<void> {
  // Collapse to one update per product.
  const totals = new Map<string, number>();
  for (const it of items) {
    totals.set(it.id, (totals.get(it.id) ?? 0) + Number(it.quantity || 0));
  }

  await Promise.all(
    [...totals].map(async ([id, qty]) => {
      try {
        const { data } = await insforge.database
          .from('products')
          .select('stock')
          .eq('id', id)
          .limit(1);
        const row = (data as unknown[] | null)?.[0] as Record<string, unknown> | undefined;
        if (!row) return;
        const next = Math.max(0, Number(row.stock ?? 0) - qty);
        await insforge.database.from('products').update({ stock: next }).eq('id', id);
      } catch (err) {
        // Never fail a paid order because stock bookkeeping hiccuped.
        console.error(`Could not decrement stock for product ${id}:`, err);
      }
    })
  );
}
