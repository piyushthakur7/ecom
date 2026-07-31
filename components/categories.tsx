import { ImageSlot } from './image-slot';
import { categories } from '@/lib/data';

export function Categories() {
  return (
    <section id="categories" style={{ background: 'var(--color-neutral-100)' }}>
      <div className="section">
        <span className="section-kicker">Shop by category</span>
        <h2 className="section-title" style={{ marginBottom: 36 }}>
          Six ways to wear it
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {categories.map((cat) => (
            <a
              key={cat.id}
              className="card-link"
              href="#featured"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div className="media-clip" style={{ width: '100%', aspectRatio: '3 / 4' }}>
                <ImageSlot
                  src={cat.src}
                  alt={cat.alt}
                  credit={cat.credit}
                  sizes="(max-width: 600px) 50vw, (max-width: 1280px) 33vw, 210px"
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 8,
                  borderTop: '2px solid var(--color-divider)',
                  paddingTop: 10,
                  marginTop: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {cat.name}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'color-mix(in srgb, var(--color-text) 60%, transparent)',
                    fontFeatureSettings: "'tnum' 1",
                  }}
                >
                  {cat.count}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
