'use client';

import { ImageSlot } from './image-slot';
import { useCart } from './cart-context';
import { products } from '@/lib/data';

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
            This week’s picks
          </h2>
        </div>
        <a className="btn btn-ghost" href="#categories">
          View all products
        </a>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
          gap: 'var(--space-6) var(--space-4)',
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="product-card"
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <div className="media-clip" style={{ width: '100%', aspectRatio: '3 / 4' }}>
              <ImageSlot
                src={p.src}
                alt={p.name}
                credit={p.credit}
                sizes="(max-width: 600px) 50vw, (max-width: 1280px) 33vw, 290px"
              />
              {p.showOff && (
                <span
                  className="tag tag-accent"
                  style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                >
                  {p.off}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>
                {p.name}
              </span>
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
                      color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
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
              onClick={addToCart}
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
