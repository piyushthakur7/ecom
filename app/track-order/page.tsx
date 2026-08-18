'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { getOrderByNumber } from '@/lib/services/orders.service';
import type { DBOrder } from '@/lib/types';
import { IconPackage, IconTruck, IconCheckCircle, IconClock, IconX, IconMapPin } from '@/components/icons';

const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'] as const;

const STEP_ICON = {
  Pending: <IconClock size={16} />,
  Processing: <IconPackage size={16} />,
  Shipped: <IconTruck size={16} />,
  Delivered: <IconCheckCircle size={16} />,
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<DBOrder | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setSearched(false);
    const found = await getOrderByNumber(orderNumber);
    setOrder(found);
    setSearched(true);
    setLoading(false);
  }

  const status = order?.status ?? 'Pending';
  const cancelled = status === 'Cancelled';
  const currentStep = STEPS.indexOf(status as (typeof STEPS)[number]);

  return (
    <main>
      <div className="section" style={{ maxWidth: 760, paddingTop: 'clamp(28px,4vw,48px)' }}>
        <span className="section-kicker">Order tracking</span>
        <h1 className="section-title" style={{ marginBottom: 10 }}>Track your order</h1>
        <p className="text-muted" style={{ marginBottom: 28, fontSize: 14 }}>
          Enter the order number from your confirmation screen or email — it looks like{' '}
          <strong>SE-XXXXXXXX</strong>.
        </p>

        <form onSubmit={handleTrack} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: 220, minHeight: 44 }}
            placeholder="SE-XXXXXXXX"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            aria-label="Order number"
          />
          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Checking…' : 'Track order'}
          </button>
        </form>

        {searched && !order && (
          <div className="track-empty">
            <IconX size={32} />
            <p style={{ fontWeight: 700, margin: '10px 0 4px' }}>No order found</p>
            <p className="text-muted" style={{ fontSize: 14, marginBottom: 18 }}>
              Double-check the order number. If it still doesn&apos;t work, email us at{' '}
              <a href="mailto:saanshikaethnics@gmail.com">saanshikaethnics@gmail.com</a>.
            </p>
            <Link href="/profile?tab=orders" className="btn btn-secondary">See my orders</Link>
          </div>
        )}

        {order && (
          <div className="track-result">
            <div className="track-result-head">
              <div>
                <span className="text-muted" style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Order
                </span>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20 }}>
                  {order.order_number}
                </div>
                <div className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>
                  Placed {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <span className={`order-status-badge status-${status.toLowerCase()}`}>{status}</span>
            </div>

            {cancelled ? (
              <p className="text-muted" style={{ fontSize: 14 }}>
                This order was cancelled. If that looks wrong, please get in touch.
              </p>
            ) : (
              <ol className="track-steps">
                {STEPS.map((step, i) => (
                  <li key={step} className={`track-step ${i <= currentStep ? 'done' : ''}`}>
                    <span className="track-step-dot">{STEP_ICON[step]}</span>
                    <span className="track-step-label">{step}</span>
                  </li>
                ))}
              </ol>
            )}

            <hr className="product-divider" style={{ margin: '20px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
              <div>
                <div className="track-label">Items ({order.items.length})</div>
                {order.items.map((it, i) => (
                  <div key={i} style={{ fontSize: 13, padding: '3px 0' }}>
                    {it.name} × {it.quantity}
                  </div>
                ))}
              </div>
              {order.shipping_address && (
                <div>
                  <div className="track-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconMapPin size={13} /> Delivering to
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <div>{order.shipping_address.street}</div>
                    <div>{order.shipping_address.city}, {order.shipping_address.state}</div>
                    <div>{order.shipping_address.pincode}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="track-total">
              <span>Order total</span>
              <span>₹{Number(order.total + order.shipping).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
