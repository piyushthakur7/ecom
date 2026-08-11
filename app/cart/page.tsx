'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart-context';
import { Footer } from '@/components/footer';

export default function CartPage() {
  const { items, count, total, removeFromCart, updateQty, clearCart } = useCart();
  const router = useRouter();

  const shipping = total >= 999 ? 0 : 99;
  const grandTotal = total + shipping;

  if (count === 0) {
    return (
      <main>
        <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="cart-empty">
            <div className="cart-empty-icon">🛍️</div>
            <h1 style={{ fontSize: 26, marginBottom: 10 }}>Your cart is empty</h1>
            <p style={{ color: 'color-mix(in srgb, var(--color-text) 65%, transparent)', marginBottom: 28 }}>
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link href="/" className="btn btn-primary btn-large">Continue Shopping</Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <div className="section">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="section-kicker">Your bag</span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(24px,3.5vw,36px)', margin: 0 }}>
              Cart ({count} {count === 1 ? 'item' : 'items'})
            </h1>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="btn btn-ghost"
            style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}
          >
            Clear all
          </button>
        </div>

        <div className="cart-layout">
          {/* Items list */}
          <div>
            {items.map((item) => (
              <div key={`${item.id}-${item.size ?? ''}-${item.color ?? ''}`} className="cart-item">
                {/* Thumbnail */}
                <Link href={`/product/${item.id}`}>
                  <div className="cart-item-img">
                    <Image src={item.image} alt={item.name} fill sizes="90px" style={{ objectFit: 'cover' }} />
                  </div>
                </Link>

                {/* Info */}
                <div className="cart-item-info">
                  <Link href={`/product/${item.id}`} className="cart-item-name" style={{ textDecoration: 'none', color: 'inherit' }}>
                    {item.name}
                  </Link>
                  <div className="cart-item-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-accent)', background: '#fff5f0', border: '1px solid #fcdcd7', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                      Size: {item.size || 'M'}
                    </span>
                    {item.color && (
                      <span style={{ fontWeight: 700, color: '#18181b', background: '#f4f4f5', border: '1px solid #e4e4e7', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                        Color: {item.color}
                      </span>
                    )}
                  </div>
                  <span className="cart-item-price">{item.priceDisplay}</span>

                  {/* Qty stepper */}
                  <div className="qty-stepper" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="qty-btn"
                      aria-label="Decrease quantity"
                      onClick={() => updateQty(item.id, item.quantity - 1, item.size, item.color)}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      aria-label="Increase quantity"
                      onClick={() => updateQty(item.id, item.quantity + 1, item.size, item.color)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  className="cart-remove-btn cart-item-remove"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeFromCart(item.id, item.size, item.color)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Promo / shipping notice */}
            {total < 999 && (
              <div
                style={{
                  marginTop: 16,
                  padding: '12px 16px',
                  background: 'var(--color-accent-100)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  color: 'var(--color-accent-700)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>🚚</span>
                <span>Add <strong>₹{(999 - total).toFixed(0)}</strong> more for free shipping!</span>
              </div>
            )}
            {total >= 999 && (
              <div
                style={{
                  marginTop: 16,
                  padding: '12px 16px',
                  background: '#e8f5e9',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  color: '#2e7d32',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>✅</span>
                <span><strong>Free shipping</strong> applied!</span>
              </div>
            )}
          </div>

          {/* Summary panel */}
          <div className="cart-summary">
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, margin: '0 0 16px' }}>
              Order Summary
            </h2>

            <div className="cart-summary-row">
              <span>Subtotal ({count} items)</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? '#2e7d32' : 'inherit' }}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>

            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block btn-large"
              style={{ marginTop: 20, justifyContent: 'center', borderRadius: 'var(--radius-md)' }}
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout →
            </button>

            <Link href="/" className="btn btn-secondary btn-block" style={{ marginTop: 10, justifyContent: 'center' }}>
              Continue Shopping
            </Link>

            {/* Trust */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['🔒 Secure payment', '📦 Ships in 24–48h', '↩️ 7-day easy returns'].map((t) => (
                <span key={t} style={{ fontSize: 12, color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="mobile-cart-sticky-bar">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 11, color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => router.push('/checkout')}
          style={{ flex: 1, justifyContent: 'center', height: 44, borderRadius: 'var(--radius-md)' }}
        >
          Checkout →
        </button>
      </div>

      <Footer />
    </main>
  );
}
