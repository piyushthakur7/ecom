'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart-context';
import { FavouriteButton } from '@/components/favourite-button';
import { ProductGallery } from '@/components/product-gallery';
import { StarRating } from '@/components/star-rating';
import { products, categories } from '@/lib/data';
import { Footer } from '@/components/footer';
import { Newsletter } from '@/components/newsletter';
import { ReviewSection } from '@/components/review-section';

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

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { addToCart } = useCart();
  const router = useRouter();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  // notFound() throws, so product is defined below — tell TS
  const p = product!;

  const category = categories.find((c) => c.slug === p.category);
  const related = products.filter((r) => r.category === p.category && r.id !== p.id).slice(0, 4);

  // Parse numeric price from display string e.g. "₹849" → 849
  const numericPrice = parseInt(p.price.replace(/[₹,]/g, ''), 10);

  function handleAddToCart() {
    addToCart({
      id: p.id,
      name: p.name,
      price: numericPrice,
      priceDisplay: p.price,
      image: p.src,
      category: p.category,
      size: selectedSize ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addToCart({
      id: p.id,
      name: p.name,
      price: numericPrice,
      priceDisplay: p.price,
      image: p.src,
      category: p.category,
      size: selectedSize ?? undefined,
    });
    router.push('/checkout');
  }

  return (
    <main>
      <div className="section" style={{ paddingTop: 'clamp(24px,3vw,40px)', paddingBottom: 'clamp(24px,3vw,40px)' }}>
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          {category && <Link href={`/category/${category.slug}`}>{category.name}</Link>}
          {category && <span className="breadcrumb-sep">›</span>}
          <span style={{ maxWidth: '30ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.name}
          </span>
        </nav>

        {/* Product grid */}
        <div className="product-detail-grid">
          {/* Gallery — thumbnails + main image */}
          <ProductGallery
            images={p.images}
            name={p.name}
            saleBadge={p.showOff && p.off ? p.off : null}
          />

          {/* Product info */}
          <div className="product-info">
            {/* Badge */}
            {p.badge && (
              <span className={`product-badge ${badgeClass[p.badge] ?? ''}`} style={{ alignSelf: 'flex-start' }}>
                {badgeEmoji[p.badge]} {p.badge}
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <h1 className="product-info-title" style={{ flex: 1 }}>{p.name}</h1>
              <FavouriteButton
                product={{ id: p.id, name: p.name, price: p.price, image: p.src, category: p.category, rating: p.rating, reviewCount: p.reviewCount }}
                variant="inline"
                size={20}
              />
            </div>

            {/* Rating */}
            <div className="product-info-rating">
              <StarRating rating={p.rating} reviewCount={p.reviewCount} size="md" />
            </div>

            <hr className="product-divider" />

            {/* Price */}
            <div className="product-info-price">
              <span className="price-current">{p.price}</span>
              {p.was && <span className="price-was">{p.was}</span>}
              {p.off && <span className="price-off">({p.off})</span>}
            </div>

            {/* Size selector */}
            {p.sizes && p.sizes.length > 0 && (
              <>
                <hr className="product-divider" />
                <div className="size-selector">
                  <span className="size-label">Size</span>
                  <div className="size-options">
                    {(p.sizes as readonly string[]).map((size) => (
                      <button
                        key={size}
                        type="button"
                        className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <hr className="product-divider" />

            {/* CTAs */}
            <div className="product-cta">
              <button
                type="button"
                className="btn btn-primary btn-add-cart"
                onClick={handleAddToCart}
                style={{ justifyContent: 'center', borderRadius: 'var(--radius-md)' }}
              >
                {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
              <button
                type="button"
                className="btn btn-buy-now"
                onClick={handleBuyNow}
                style={{ justifyContent: 'center' }}
              >
                Buy Now
              </button>
            </div>

            {/* Trust pills */}
            <div className="product-trust">
              <span className="trust-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" /><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
                Free shipping ₹999+
              </span>
              <span className="trust-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                7-day returns
              </span>
              <span className="trust-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.7 9a.6.6 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
                Secure checkout
              </span>
            </div>

            <hr className="product-divider" />

            {/* Description */}
            <p className="product-desc">{p.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <hr className="rule" />
      <div className="section">
        <ReviewSection productId={p.id} />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <>
          <hr className="rule" />
          <div className="section">
            <span className="section-kicker">You may also like</span>
            <h2 className="section-title" style={{ marginBottom: 28 }}>More from {category?.name ?? 'this collection'}</h2>
            <div className="category-page-grid">
              {related.map((r) => (
                <div key={r.id} className="product-card" style={{ position: 'relative' }}>
                  <Link href={`/product/${r.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="media-clip" style={{ width: '100%', aspectRatio: '3 / 4', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.src} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </Link>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Link href={`/product/${r.id}`} style={{ textDecoration: 'none', color: 'inherit', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>
                      {r.name}
                    </Link>
                    <StarRating rating={r.rating} reviewCount={r.reviewCount} />
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{r.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Mobile Sticky CTA bar */}
      <div className="mobile-sticky-cta">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleAddToCart}
          style={{ flex: 1, justifyContent: 'center', height: 44 }}
        >
          {added ? '✓ Added' : 'Add to Cart'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleBuyNow}
          style={{ flex: 1, justifyContent: 'center', height: 44 }}
        >
          Buy Now
        </button>
      </div>

      <Newsletter />
      <Footer />
    </main>
  );
}
