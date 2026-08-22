import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/site';
import { IconInstagram, IconFacebook, IconWhatsApp } from './icons';

// Opening the chat with a line already typed saves the customer a step and
// tells the shop the enquiry came from the website.
const WHATSAPP_HREF =
  `https://wa.me/${siteConfig.whatsapp}?text=` +
  encodeURIComponent('Hi Saanshika Ethnics! I have a question about your collection.');

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

          <div className="footer-social">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Saanshika Ethnics on Instagram"
            >
              <IconInstagram size={17} />
            </a>
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Saanshika Ethnics on Facebook"
            >
              <IconFacebook size={17} />
            </a>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message Saanshika Ethnics on WhatsApp"
            >
              <IconWhatsApp size={17} />
            </a>
          </div>
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
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <IconWhatsApp size={14} /> Chat on WhatsApp
          </a>
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
