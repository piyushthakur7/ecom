import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/site';

const columns = [
  {
    heading: 'Shop',
    links: [
      { label: 'Kurti',            href: '/category/kurti' },
      { label: 'Tops',             href: '/category/tops' },
      { label: 'Suits',            href: '/category/suits' },
      { label: 'Unstitched Suits', href: '/category/unstitched-suits' },
      { label: 'Anarkali',         href: '/category/anarkali' },
      { label: 'Dresses',          href: '/category/dresses' },
      { label: 'Plazzo',           href: '/category/plazzo' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Track order',      href: '/track-order' },
      { label: 'Shipping policy',  href: '/shipping-policy' },
      { label: 'Returns & refunds',href: '/returns-refunds' },
      { label: 'Size guide',       href: '/size-guide' },
      { label: 'Privacy policy',   href: '/privacy-policy' },
      { label: 'Terms & conditions', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <p className="footer-brand-title">{siteConfig.name}</p>
          <p className="footer-brand-desc">
            Every thread, a celebration. Ethnic wear in everyday fabrics, made in Amritsar.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading} className="footer-col">
            <span className="footer-heading">{col.heading}</span>
            {col.links.map((link) => (
              <Link key={link.label} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        <div className="footer-col">
          <span className="footer-heading">Contact</span>
          <a href={`mailto:${siteConfig.email}`} className="footer-link">{siteConfig.email}</a>
          <span className="footer-address">
            {siteConfig.address.map((line) => (
              <span key={line} style={{ display: 'block' }}>
                {line}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
