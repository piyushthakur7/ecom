'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { IconFlame, IconZap, IconTrophy, IconSparkles, IconPalette, IconCheck } from '@/components/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart-context';
import { FavouriteButton } from '@/components/favourite-button';
import { ProductGallery } from '@/components/product-gallery';
import { StarRating } from '@/components/star-rating';
import { Footer } from '@/components/footer';
import { Newsletter } from '@/components/newsletter';
import { ProductTabs } from '@/components/product-tabs';
import { useToast } from '@/components/toast';
import { getProductById, getProductsByCategory } from '@/lib/services/products.service';
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

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { addToCart } = useCart();
  const router = useRouter();
  const toast = useToast();

  const [product, setProduct] = useState<DBProduct | null | undefined>(undefined); // undefined = loading
  const [related, setRelated] = useState<DBProduct[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProductById(id).then((p) => {
      setProduct(p);
      if (p) {
        if (p.sizes && p.sizes.length > 0) setSelectedSize(p.sizes[0]);
        else setSelectedSize('M');

        if (p.color) {
          const colors = p.color.split(',').map((c) => c.trim()).filter(Boolean);
          if (colors.length > 0) setSelectedColor(colors[0]);
        }

        getProductsByCategory(p.category_slug).then((all) =>
          setRelated(all.filter((r) => r.id !== p.id).slice(0, 4))
        );
      }
    });
  }, [id]);

  if (product === undefined) {
    // Loading skeleton
    return (
      <main>
        <div className="section" style={{ paddingTop: 'clamp(24px,3vw,40px)' }}>
          <div className="product-detail-grid">
            <div style={{ width: '100%', aspectRatio: '3/4', background: '#f0eeee', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ height: 28, background: '#f0eeee', borderRadius: 4, width: '70%' }} />
              <div style={{ height: 16, background: '#f0eeee', borderRadius: 4, width: '40%' }} />
              <div style={{ height: 20, background: '#f0eeee', borderRadius: 4, width: '25%' }} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) notFound();

  const p = product;
  const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
  const priceDisplay = `₹${Number(p.price).toLocaleString('en-IN')}`;
  const wasDisplay = p.original_price ? `₹${Number(p.original_price).toLocaleString('en-IN')}` : null;
  const offPct = p.original_price && p.original_price > p.price
    ? `${Math.round((1 - p.price / p.original_price) * 100)}% off`
    : null;

  const colorOptions = p.color
    ? p.color.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  function handleAddToCart() {
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      priceDisplay,
      image: img,
      category: p.category_slug,
      size: selectedSize ?? undefined,
      color: selectedColor ?? undefined,
    });
    setAdded(true);
    toast(`${p.name} added to cart`);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      priceDisplay,
      image: img,
      category: p.category_slug,
      size: selectedSize ?? undefined,
      color: selectedColor ?? undefined,
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
          <Link href={`/category/${p.category_slug}`}>{p.category_slug}</Link>
          <span className="breadcrumb-sep">›</span>
          <span style={{ maxWidth: '30ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
        </nav>

        {/* Product grid */}
        <div className="product-detail-grid">
          {/* Gallery */}
          <ProductGallery
            images={p.images.length > 0 ? p.images : [img]}
            name={p.name}
            saleBadge={offPct}
          />

          {/* Info */}
          <div className="product-info">
            {p.badge && (
              <span className={`product-badge ${badgeClass[p.badge] ?? ''}`} style={{ alignSelf: 'flex-start' }}>
                {badgeIcon[p.badge] ?? ''} {p.badge}
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <h1 className="product-info-title" style={{ flex: 1 }}>{p.name}</h1>
              <FavouriteButton
                product={{ id: p.id, name: p.name, price: priceDisplay, image: img, category: p.category_slug, rating: p.rating, reviewCount: p.reviews_count }}
                variant="inline"
                size={20}
              />
            </div>

            <div className="product-info-rating">
              <StarRating rating={p.rating} reviewCount={p.reviews_count} size="md" />
            </div>

            <hr className="product-divider" />

            {/* Price */}
            <div className="product-info-price">
              <span className="price-current">{priceDisplay}</span>
              {wasDisplay && <span className="price-was">{wasDisplay}</span>}
              {offPct && <span className="price-off">({offPct})</span>}
            </div>

            {/* Color selector */}
            {colorOptions.length > 0 && (
              <>
                <hr className="product-divider" />
                <div className="size-selector">
                  <span className="size-label">Color: <strong style={{ color: '#18181b', fontWeight: 600 }}>{selectedColor}</strong></span>
                  <div className="size-options">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`size-btn ${selectedColor === c ? 'selected' : ''}`}
                        onClick={() => setSelectedColor(c)}
                        style={{ borderRadius: 20, padding: '6px 16px', minWidth: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <IconPalette size={14} /> {c}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Size selector */}
            {p.sizes && p.sizes.length > 0 && (
              <>
                <hr className="product-divider" />
                <div className="size-selector">
                  <span className="size-label">Size</span>
                  <div className="size-options">
                    {p.sizes.map((size) => (
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
              <button type="button" className="btn btn-primary btn-add-cart" onClick={handleAddToCart} style={{ justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
                {added ? <><IconCheck size={16} /> Added to Cart!</> : 'Add to Cart'}
              </button>
              <button type="button" className="btn btn-buy-now" onClick={handleBuyNow} style={{ justifyContent: 'center' }}>
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
                3-day returns
              </span>
              <span className="trust-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.7 9a.6.6 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
                Secure checkout
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Description / details / policies / reviews */}
      <hr className="rule" />
      <div className="section">
        <ProductTabs product={p} />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <>
          <hr className="rule" />
          <div className="section">
            <span className="section-kicker">You may also like</span>
            <h2 className="section-title" style={{ marginBottom: 28 }}>More from this collection</h2>
            <div className="category-page-grid">
              {related.map((r) => {
                const rImg = Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : '';
                return (
                  <div key={r.id} className="product-card" style={{ position: 'relative' }}>
                    <Link href={`/product/${r.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                      <div className="media-clip" style={{ width: '100%', aspectRatio: '3 / 4', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={rImg} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </Link>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Link href={`/product/${r.id}`} style={{ textDecoration: 'none', color: 'inherit', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>
                        {r.name}
                      </Link>
                      <StarRating rating={r.rating} reviewCount={r.reviews_count} />
                      <span style={{ fontWeight: 700, fontSize: 15 }}>₹{Number(r.price).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Mobile Sticky CTA */}
      <div className="mobile-sticky-cta">
        <button type="button" className="btn btn-secondary" onClick={handleAddToCart} style={{ flex: 1, justifyContent: 'center', height: 44 }}>
          {added ? <><IconCheck size={15} /> Added</> : 'Add to Cart'}
        </button>
        <button type="button" className="btn btn-primary" onClick={handleBuyNow} style={{ flex: 1, justifyContent: 'center', height: 44 }}>
          Buy Now
        </button>
      </div>

      <Newsletter />
      <Footer />
    </main>
  );
}
