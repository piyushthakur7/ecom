import { ImageSlot } from './image-slot';
import { hero, stats } from '@/lib/data';

export function Hero() {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))',
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding:
            'clamp(48px,7vw,104px) clamp(24px,4vw,72px) clamp(40px,6vw,72px) clamp(20px,5vw,72px)',
        }}
      >
        <span className="tag tag-accent" style={{ alignSelf: 'flex-start', marginBottom: 24 }}>
          New collection — Festive ’26
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'clamp(38px,4.8vw,72px)',
            lineHeight: 1.06,
            letterSpacing: '-0.02em',
            margin: '0 0 24px -0.05em',
          }}
        >
          <span style={{ whiteSpace: 'nowrap' }}>Every thread,</span>
          <br />
          <span style={{ whiteSpace: 'nowrap' }}>a celebration.</span>
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            maxWidth: '50ch',
            margin: '0 0 28px',
            color: 'color-mix(in srgb, var(--color-text) 82%, transparent)',
          }}
        >
          Kurtis, co-ord sets, suits, sarees and dupattas in everyday fabrics — block prints,
          chanderi and handloom cotton, cut to be worn, not saved for later.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href="#featured">
            Shop new arrivals
          </a>
          <a className="btn btn-ghost" href="#categories">
            Browse categories
          </a>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,auto)',
            justifyContent: 'start',
            gap: '24px clamp(28px,4vw,64px)',
            borderTop: '2px solid var(--color-divider)',
            marginTop: 'clamp(36px,5vw,56px)',
            paddingTop: 24,
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="media-clip"
        style={{
          minHeight: 'clamp(380px,62vh,760px)',
          borderLeft: '2px solid var(--color-divider)',
        }}
      >
        <ImageSlot
          src={hero.src}
          alt={hero.alt}
          credit={hero.credit}
          sizes="(max-width: 840px) 100vw, 50vw"
          priority
        />
      </div>
    </section>
  );
}
