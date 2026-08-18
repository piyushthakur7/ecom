'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { StarRating } from '@/components/star-rating';
import { FavouriteButton } from '@/components/favourite-button';
import { useCart } from '@/components/cart-context';
import { useToast } from '@/components/toast';
import { getProducts, getCategories } from '@/lib/services/products.service';
import type { DBProduct, DBCategory } from '@/lib/types';
import { IconFlame, IconZap, IconTrophy, IconSparkles } from '@/components/icons';

const badgeClass: Record<string, string> = {
  'Highly Purchased': 'badge-purchased',
  'Trending':         'badge-trending',
  'Best Seller':      'badge-bestseller',
  'New Arrival':      'badge-new',
};
const badgeIcon: Record<string, ReactNode> = {
  'Highly Purchased': <IconFlame size={12} />,
  'Trending':         <IconZap size={12} />,
  'Best Seller':      <IconTrophy size={12} />,
  'New Arrival':      <IconSparkles size={12} />,
};

type Sort = 'featured' | 'price-low' | 'price-high' | 'rating';

export default function ShopPage() {
  const { addToCart } = useCart();
  const toast = useToast();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [sort, setSort] = useState<Sort>('featured');

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter((p) => activeCat === 'all' || p.category_slug === activeCat);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  return (
    <main>
      <div className="section" style={{ paddingTop: 'clamp(24px,3vw,40px)' }}>
        <span className="section-kicker">All products</span>
        <h1 className="section-title" style={{ marginBottom: 24 }}>Shop everything</h1>

        {/* Filter + sort bar */}
        <div className="shop-toolbar">
          <div className="shop-filters">
            <button
              type="button"
              className={`shop-chip ${activeCat === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCat('all')}
            >
              All ({products.length})
            </button>
            {categories.map((c) => {
              const n = products.filter((p) => p.category_slug === c.slug).length;
              if (n === 0) return null;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`shop-chip ${activeCat === c.slug ? 'active' : ''}`}
                  onClick={() => setActiveCat(c.slug)}
                >
                  {c.name} ({n})
                </button>
              );
            })}
          </div>

          <label className="shop-sort">
            <span className="text-muted" style={{ fontSize: 13 }}>Sort</span>
            <select
              className="input"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-md)', background: 'var(--color-skeleton, #f0eeee)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: 14, borderRadius: 4, background: 'var(--color-skeleton, #f0eeee)', width: '80%' }} />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Nothing here yet</p>
            <p className="text-muted" style={{ marginBottom: 24 }}>Try another category.</p>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveCat('all')}>
              Show everything
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {sorted.map((p) => {
              const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
              const priceDisplay = `₹${Number(p.price).toLocaleString('en-IN')}`;
              const wasDisplay = p.original_price ? `₹${Number(p.original_price).toLocaleString('en-IN')}` : null;
              const offPct = p.original_price && p.original_price > p.price
                ? `${Math.round((1 - p.price / p.original_price) * 100)}% off`
                : null;

              return (
                <div key={p.id} className="product-card" style={{ position: 'relative' }}>
                  <Link href={`/product/${p.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="media-clip" style={{ width: '100%', aspectRatio: '3 / 4', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {offPct && (
                        <span className="tag tag-accent" style={{ position: 'absolute', top: 10, left: 10, pointerEvents: 'none' }}>
                          {offPct}
                        </span>
                      )}
                    </div>
                  </Link>

                  <FavouriteButton
                    product={{ id: p.id, name: p.name, price: priceDisplay, image: img, category: p.category_slug, rating: p.rating, reviewCount: p.reviews_count }}
                  />

                  {p.badge && (
                    <span className={`product-badge ${badgeClass[p.badge] ?? ''}`}>
                      {badgeIcon[p.badge]} {p.badge}
                    </span>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>
                      {p.name}
                    </Link>
                    <StarRating rating={p.rating} reviewCount={p.reviews_count} />
                    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontFeatureSettings: "'tnum' 1" }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{priceDisplay}</span>
                      {wasDisplay && (
                        <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}>
                          {wasDisplay}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    style={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 13 }}
                    onClick={() => {
                      addToCart({ id: p.id, name: p.name, price: p.price, priceDisplay, image: img, category: p.category_slug });
                      toast(`${p.name} added to cart`);
                    }}
                  >
                    Add to cart
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
