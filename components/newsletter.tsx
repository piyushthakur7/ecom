'use client';

import { IconCheck } from './icons';

import { useState } from 'react';

export function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <section style={{ background: '#591726', color: '#ffffff', borderTop: '1px solid #731e32' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(36px, 5vw, 54px) clamp(20px, 5vw, 72px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 540 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 'clamp(20px, 2.4vw, 28px)',
                lineHeight: 1.2,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: '0 0 4px 0',
                color: '#ffffff',
              }}
            >
              STAY UPDATED
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
              Get exclusive offers and new collection updates directly to your inbox.
            </p>
          </div>
        </div>

        {subscribed ? (
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: '#f4d068', margin: 0 }}>
            <IconCheck size={16} style={{ verticalAlign: -3, marginRight: 4, display: 'inline-block' }} />You&apos;re on the list! Thank you for subscribing.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%', maxWidth: 460 }}
          >
            <label htmlFor="newsletter-email" style={{ position: 'absolute', left: -9999 }}>
              Your email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                minWidth: 220,
                background: '#ffffff',
                border: 'none',
                color: '#18181b',
                padding: '12px 16px',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                borderRadius: 4,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#c59b27',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#a67f1b')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#c59b27')}
            >
              SUBSCRIBE
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
