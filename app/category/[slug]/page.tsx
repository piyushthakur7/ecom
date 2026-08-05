'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/cart-context';
import { ImageSlot } from '@/components/image-slot';
import { StarRating } from '@/components/star-rating';
import { FavouriteButton } from '@/components/favourite-button';
import { categories, products } from '@/lib/data';

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
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const catProducts = products.filter((p) => p.category === slug);

  return (
    <main>
      {/* Category hero banner */}
      <section className="category-page-hero">
        <div className="section" style={{ paddingTop: 'clamp(28px,4vw,48px)', paddingBottom: 'clamp(28px,4vw,48px)' }}>
          {/* Breadcrumb */}
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
                {category.count} available
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* Product grid */}
      <div className="section">
        {catProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Coming soon!</p>
            <p style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', marginBottom: 24 }}>
              We&apos;re adding new {category.name} styles. Check back soon.
            </p>
            <Link href="/" className="btn btn-primary">Back to Home</Link>
          </div>
        ) : (
          <div className="category-page-grid">
            {catProducts.map((p) => (
              <div key={p.id} className="product-card" style={{ position: 'relative' }}>
                <Link href={`/product/${p.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div className="media-clip" style={{ width: '100%', aspectRatio: '3 / 4', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <ImageSlot
                      src={p.src}
                      alt={p.name}
                      credit={p.credit}
                      sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 280px"
                    />
                    {p.showOff && p.off && (
                      <span
                        className="tag tag-accent"
                        style={{ position: 'absolute', top: 10, left: 10, pointerEvents: 'none' }}
                      >
                        {p.off}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Favourite button */}
                <FavouriteButton
                  product={{ id: p.id, name: p.name, price: p.price, image: p.src, category: p.category, rating: p.rating, reviewCount: p.reviewCount }}
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
                  <StarRating rating={p.rating} reviewCount={p.reviewCount} />
                  <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontFeatureSettings: "'tnum' 1" }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{p.price}</span>
                    {p.was && (
                      <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}>
                        {p.was}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => addToCart({
                    id: p.id,
                    name: p.name,
                    price: parseInt(p.price.replace(/[₹,]/g, ''), 10),
                    priceDisplay: p.price,
                    image: p.src,
                    category: p.category,
                  })}
                  aria-label={`Add ${p.name} to cart`}
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
