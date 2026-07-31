import { testimonials } from '@/lib/data';

export function Testimonials() {
  return (
    <section style={{ background: 'var(--color-neutral-100)' }}>
      <div className="section">
        <span className="section-kicker" style={{ marginBottom: 36 }}>
          What our customers say
        </span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))',
            gap: '32px clamp(24px,3vw,56px)',
          }}
        >
          {testimonials.map((t) => (
            <figure
              key={t.name}
              style={{ margin: 0, borderTop: '2px solid var(--color-divider)', paddingTop: 20 }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: 44,
                  lineHeight: 1,
                  color: 'var(--color-accent)',
                  display: 'block',
                  marginBottom: 10,
                }}
              >
                “
              </span>
              <blockquote
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 19,
                  lineHeight: 1.4,
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}
              >
                {t.quote}
              </blockquote>
              <figcaption
                style={{
                  fontSize: 14,
                  marginTop: 16,
                  color: 'color-mix(in srgb, var(--color-text) 70%, transparent)',
                }}
              >
                — {t.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
