'use client';

import { siteConfig } from '@/lib/site';
import { useCart } from './cart-context';

const links = [
  { label: 'Kurtis', href: '#categories' },
  { label: 'Co-ord sets', href: '#categories' },
  { label: 'Suits', href: '#categories' },
  { label: 'Sarees', href: '#categories' },
  { label: 'Dupattas', href: '#categories' },
];

export function Nav() {
  const { count } = useCart();

  return (
    <nav className="nav">
      <span className="nav-brand">{siteConfig.name}</span>
      {links.map((link) => (
        <a key={link.label} href={link.href}>
          {link.label}
        </a>
      ))}
      <a href="#featured" style={{ color: 'var(--color-accent)' }}>
        Sale
      </a>
      <button type="button" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
        Cart · {count}
      </button>
    </nav>
  );
}
