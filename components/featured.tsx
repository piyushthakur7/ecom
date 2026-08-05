'use client';

import Link from 'next/link';
import { ImageSlot } from './image-slot';
import { StarRating } from './star-rating';
import { useCart } from './cart-context';
import { FavouriteButton } from './favourite-button';
import { products } from '@/lib/data';

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

export function Featured() {
  const { addToCart } = useCart();

  return (
    <section id="featured" className="section">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 36,
        }}
      >
        <div>
          <span className="section-kicker">Featured collection</span>
          <h2 className="section-title" style={{ whiteSpace: 'nowrap' }}>
            This week&apos;s picks
          </h2>
        </div>
        <Link className="btn btn-ghost" href="/category/kurti">
          View all products
        </Link>
      </div>

      <div className="product-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card" style={{ position: 'relative' }}>
            {/* Image */}
            <Link href={`/product/${p.id}`} style={{ display: 'block', textDecoration: 'none' }}>
              <div className="media-clip" style={{ width: '100%', aspectRatio: '3 / 4', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <ImageSlot
                  src={p.src}
                  alt={p.name}
                  credit={p.credit}
                  sizes="(max-width: 600px) 50vw, (max-width: 1280px) 33vw, 290px"
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

            {/* Badge */}
            {p.badge && (
              <span className={`product-badge ${badgeClass[p.badge] ?? ''}`}>
                {badgeEmoji[p.badge]} {p.badge}
              </span>
            )}

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Link
                href={`/product/${p.id}`}
                style={{ textDecoration: 'none', color: 'inherit', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}
              >
                {p.name}
              </Link>

              {/* Star rating */}
              <StarRating rating={p.rating} reviewCount={p.reviewCount} />

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'baseline',
                  fontFeatureSettings: "'tnum' 1",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 16 }}>{p.price}</span>
                {p.was && (
                  <span
                    style={{
                      fontSize: 13,
                      textDecoration: 'line-through',
                      color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
                    }}
                  >
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
    </section>
  );
}
