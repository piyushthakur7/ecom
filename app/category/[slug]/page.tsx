'use client';

import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/cart-context';
import { StarRating } from '@/components/star-rating';
import { FavouriteButton } from '@/components/favourite-button';
import { useToast } from '@/components/toast';
import { getCategories, getProductsByCategory } from '@/lib/services/products.service';
import type { DBCategory, DBProduct } from '@/lib/types';

const badgeClass: Record<string, string> = {
  'Highly Purchased': 'badge-purchased',
  'Trending':         'badge-trending',
  'Best Seller':      'badge-bestseller',
  'New Arrival':      'badge-new',
};
const badgeEmoji: Record<string, string> = {
  'Highly Purchased': '🔥',
  'Trending':         '⚡',
  'Best Seller':      '🏆',
  'New Arrival':      '✨',
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { addToCart } = useCart();
  const toast = useToast();

  const [category, setCategory] = useState<DBCategory | null | undefined>(undefined);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getProductsByCategory(slug)]).then(([cats, prods]) => {
      const cat = cats.find((c) => c.slug === slug);
      setCategory(cat ?? null);
      setProducts(prods);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <main>
        <section className="category-page-hero">
          <div className="section" style={{ paddingTop: 'clamp(28px,4vw,48px)', paddingBottom: 'clamp(28px,4vw,48px)' }}>
            <div style={{ height: 36, background: 'var(--color-skeleton)', borderRadius: 4, width: '30%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </section>
        <div className="section">
          <div className="category-page-grid">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-md)', background: 'var(--color-skeleton)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: 14, borderRadius: 4, background: 'var(--color-skeleton)', width: '80%' }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!category) notFound();

  return (
    <main>
      {/* Category hero banner */}
      <section className="category-page-hero">
        <div className="section" style={{ paddingTop: 'clamp(28px,4vw,48px)', paddingBottom: 'clamp(28px,4vw,48px)' }}>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>{category.name}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="section-kicker">Browse collection</span>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', margin: 0 }}>
                {category.name}
              </h1>
              <p style={{ marginTop: 8, color: 'color-mix(in srgb, var(--color-text) 65%, transparent)', fontSize: 14 }}>
                {products.length > 0 ? `${products.length} styles` : category.count} available
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* Product grid */}
      <div className="section">
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Coming soon!</p>
            <p style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', marginBottom: 24 }}>
              We&apos;re adding new {category.name} styles. Check back soon.
            </p>
            <Link href="/" className="btn btn-primary">Back to Home</Link>
          </div>
        ) : (
          <div className="category-page-grid">
            {products.map((p) => {
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
                      {badgeEmoji[p.badge]} {p.badge}
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
                    className="btn btn-secondary btn-block"
                    onClick={() => {
                      addToCart({ id: p.id, name: p.name, price: p.price, priceDisplay, image: img, category: p.category_slug });
                      toast(`${p.name} added to cart`);
                    }}
                    aria-label={`Add ${p.name} to cart`}
                  >
                    Add to cart
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
