'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { IconFlame, IconZap, IconTrophy, IconSparkles } from './icons';
import { StarRating } from './star-rating';
import { useCart } from './cart-context';
import { FavouriteButton } from './favourite-button';
import { useToast } from './toast';
import { getProducts } from '@/lib/services/products.service';
import { cdnImage } from '@/lib/cloudinary';
import type { DBProduct } from '@/lib/types';

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

export function Featured() {
  const { addToCart } = useCart();
  const toast = useToast();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section id="featured" className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
          <div>
            <span className="section-kicker">Featured collection</span>
            <h2 className="section-title" style={{ whiteSpace: 'nowrap' }}>This week&apos;s picks</h2>
          </div>
        </div>
        {/* Skeleton */}
        <div className="product-grid">
          {[1,2,3,4].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-md)', background: '#f0eeee', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: 14, borderRadius: 4, background: '#f0eeee', width: '80%' }} />
              <div style={{ height: 12, borderRadius: 4, background: '#f0eeee', width: '50%' }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
        <div>
          <span className="section-kicker">Featured collection</span>
          <h2 className="section-title" style={{ whiteSpace: 'nowrap' }}>This week&apos;s picks</h2>
        </div>
        <Link className="btn btn-ghost" href="/category/kurti">View all products</Link>
      </div>

      <div className="product-grid">
        {products.map((p, i) => {
          const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
          const priceDisplay = `₹${Number(p.price).toLocaleString('en-IN')}`;
          const wasDisplay = p.original_price ? `₹${Number(p.original_price).toLocaleString('en-IN')}` : null;
          const offPct = p.original_price && p.original_price > p.price
            ? `${Math.round((1 - p.price / p.original_price) * 100)}% off`
            : null;

          return (
            <div key={p.id} className="product-card" style={{ position: 'relative' }}>
              {/* Image */}
              <Link href={`/product/${p.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                <div className="media-clip" style={{ width: '100%', aspectRatio: '3 / 4', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cdnImage(img, 600)}
                    alt={p.name}
                    loading={i < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  />
                  {offPct && (
                    <span className="tag tag-accent" style={{ position: 'absolute', top: 10, left: 10, pointerEvents: 'none' }}>
                      {offPct}
                    </span>
                  )}
                </div>
              </Link>

              {/* Favourite button */}
              <FavouriteButton
                product={{
                  id: p.id,
                  name: p.name,
                  price: priceDisplay,
                  image: img,
                  category: p.category_slug,
                  rating: p.rating,
                  reviewCount: p.reviews_count,
                }}
              />

              {/* Badge */}
              {p.badge && (
                <span className={`product-badge ${badgeClass[p.badge] ?? ''}`}>
                  {badgeIcon[p.badge]} {p.badge}
                </span>
              )}

              {/* Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>
                  {p.name}
                </Link>
                <StarRating rating={p.rating} reviewCount={p.reviews_count} />
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontFeatureSettings: "'tnum' 1" }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{priceDisplay}</span>
                  {wasDisplay && (
                    <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'color-mix(in srgb, var(--color-text) 68%, transparent)' }}>
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
                  addToCart({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    priceDisplay,
                    image: img,
                    category: p.category_slug,
                  });
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
    </section>
  );
}
