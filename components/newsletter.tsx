'use client';

import { useState } from 'react';

export function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <section style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(48px,7vw,84px) clamp(20px,5vw,72px)',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'clamp(32px,4.2vw,56px)',
            lineHeight: 1.06,
            letterSpacing: '-0.015em',
            margin: '0 0 28px -0.05em',
          }}
        >
          Get first pick
          <br />
          of every drop.
        </h3>

        {subscribed ? (
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, margin: 0 }}>
            You’re on the list. First drop lands in your inbox.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
            style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', maxWidth: 560 }}
          >
            <label htmlFor="newsletter-email" style={{ position: 'absolute', left: -9999 }}>
              Your email address
            </label>
            <input
              id="newsletter-email"
              className="newsletter-input"
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-ghost btn-on-accent">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
