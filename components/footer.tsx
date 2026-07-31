import { siteConfig } from '@/lib/site';

const columns = [
  {
    heading: 'Shop',
    links: [
      { label: 'Kurtis', href: '#categories' },
      { label: 'Co-ord sets', href: '#categories' },
      { label: 'Suits & salwar sets', href: '#categories' },
      { label: 'Sarees', href: '#categories' },
      { label: 'Dresses', href: '#categories' },
      { label: 'Dupattas', href: '#categories' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Track order', href: '#featured' },
      { label: 'Shipping policy', href: '#featured' },
      { label: 'Returns & refunds', href: '#featured' },
      { label: 'Size guide', href: '#featured' },
      { label: 'Privacy policy', href: '#featured' },
    ],
  },
];

const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  fontSize: 14,
} as const;

const headingStyle = {
  fontSize: 12,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-700)',
  marginBottom: 4,
} as const;

export function Footer() {
  return (
    <footer style={{ borderTop: '2px solid var(--color-divider)' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,72px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))',
          gap: '36px clamp(24px,3vw,56px)',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: '-0.01em',
              margin: '0 0 8px',
            }}
          >
            {siteConfig.name}
          </p>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '36ch',
              color: 'color-mix(in srgb, var(--color-text) 70%, transparent)',
            }}
          >
            Every thread, a celebration. Ethnic wear in everyday fabrics, made in Amritsar.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading} style={columnStyle}>
            <span style={headingStyle}>{col.heading}</span>
            {col.links.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        ))}

        <div style={columnStyle}>
          <span style={headingStyle}>Contact</span>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <span
            style={{
              lineHeight: 1.6,
              color: 'color-mix(in srgb, var(--color-text) 70%, transparent)',
            }}
          >
            {siteConfig.address.map((line) => (
              <span key={line} style={{ display: 'block' }}>
                {line}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 clamp(20px,5vw,72px) 28px',
          fontSize: 12,
          letterSpacing: '0.04em',
          color: 'color-mix(in srgb, var(--color-text) 60%, transparent)',
        }}
      >
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
