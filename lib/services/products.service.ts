import { insforge } from '@/lib/insforge-client';
import { categories as staticCategories, products as staticProducts, heroSlides as staticHeroSlides } from '@/lib/data';
import type { DBCategory, DBHeroSlide, DBProduct } from '@/lib/types';

// ─── Categories ────────────────────────────────────────────────────────────

export async function getCategories(): Promise<DBCategory[]> {
  try {
    const { data, error } = await insforge.database
      .from('categories')
      .select('*')
      .order('name');
    if (error || !data || (data as unknown[]).length === 0) {
      return staticCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: c.count,
        src: c.src,
        alt: c.alt,
      }));
    }
    return data as DBCategory[];
  } catch {
    return staticCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c.count,
      src: c.src,
      alt: c.alt,
    }));
  }
}

// ─── Hero Slides ───────────────────────────────────────────────────────────

export async function getHeroSlides(): Promise<DBHeroSlide[]> {
  try {
    const { data, error } = await insforge.database
      .from('hero_slides')
      .select('*')
      .order('order_index');
    if (error || !data || (data as unknown[]).length === 0) {
      return staticHeroSlides.map((s, i) => ({
        id: s.id,
        src: s.src,
        alt: s.alt,
        link: '/',
        order_index: i,
      }));
    }
    return data as DBHeroSlide[];
  } catch {
    return staticHeroSlides.map((s, i) => ({
      id: s.id,
      src: s.src,
      alt: s.alt,
      link: '/',
      order_index: i,
    }));
  }
}

// ─── Products ──────────────────────────────────────────────────────────────

/** Map a static product to DB shape for fallback. */
function staticToDBProduct(p: typeof staticProducts[number]): DBProduct {
  const price = parseInt(String(p.price).replace(/[₹,]/g, ''), 10);
  const was = p.was ? parseInt(String(p.was).replace(/[₹,]/g, ''), 10) : null;
  return {
    id: p.id,
    name: p.name,
    slug: p.id,
    price,
    original_price: was,
    rating: p.rating,
    reviews_count: p.reviewCount,
    category_slug: p.category,
    badge: p.badge ?? null,
    images: [...(p.images as readonly string[])],
    sizes: [...(p.sizes as readonly string[])],
    stock: 100,
    description: p.description,
    details: null,
  };
}

export async function getProducts(): Promise<DBProduct[]> {
  try {
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data || (data as unknown[]).length === 0) {
      return staticProducts.map(staticToDBProduct);
    }
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
    return staticProducts.map(staticToDBProduct);
  }
}

export async function getProductById(id: string): Promise<DBProduct | null> {
  try {
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      const p = staticProducts.find((x) => x.id === id);
      return p ? staticToDBProduct(p) : null;
    }
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
    const p = staticProducts.find((x) => x.id === id);
    return p ? staticToDBProduct(p) : null;
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
    if (error || !data || (data as unknown[]).length === 0) {
      return staticProducts
        .filter((p) => p.category === cleanSlug)
        .map(staticToDBProduct);
    }
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
    return staticProducts
      .filter((p) => p.category === slug)
      .map(staticToDBProduct);
  }
}
