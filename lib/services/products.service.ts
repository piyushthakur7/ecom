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
