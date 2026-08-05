'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/lib/site';
import { useCart } from './cart-context';
import { useFavourites } from './favourites-context';
import { products, categories } from '@/lib/data';

const navLinks = [
  { label: 'Kurti',           href: '/category/kurti' },
  { label: 'Tops',            href: '/category/tops' },
  { label: 'Suits',           href: '/category/suits' },
  { label: 'Unstitched',      href: '/category/unstitched-suits' },
  { label: 'Anarkali',        href: '/category/anarkali' },
  { label: 'Dresses',         href: '/category/dresses' },
  { label: 'Plazzo',          href: '/category/plazzo' },
];

type SearchResult = {
  id: string;
  name: string;
  price: string;
  src: string;
  category: string;
  href: string;
};

function useDebouncedSearch(query: string, delay = 200) {
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(() => {
      const q = query.toLowerCase();
      const matched: SearchResult[] = [];

      // Search products
      products.forEach((p) => {
        if (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
          matched.push({ id: p.id, name: p.name, price: p.price, src: p.src, category: p.category, href: `/product/${p.id}` });
        }
      });

      // Search categories
      categories.forEach((c) => {
        if (c.name.toLowerCase().includes(q)) {
          matched.push({ id: c.id, name: c.name, price: c.count, src: c.src, category: 'Category', href: `/category/${c.slug}` });
        }
      });

      setResults(matched.slice(0, 6));
    }, delay);
    return () => clearTimeout(t);
  }, [query, delay]);

  return results;
}

export function Nav() {
  const { count } = useCart();
  const { count: favCount } = useFavourites();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [drawerQuery, setDrawerQuery] = useState('');
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = useDebouncedSearch(query);
  const drawerResults = useDebouncedSearch(drawerQuery);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => desktopSearchRef.current?.focus(), 50);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const closeDrawer = () => { setDrawerOpen(false); setDrawerQuery(''); };

  return (
    <>
      <nav className="nav">
        {/* Brand */}
        <Link href="/" className="nav-brand">{siteConfig.name}</Link>

        {/* Desktop links */}
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
          <li>
            <Link href="/category/dresses" className="nav-sale">Sale</Link>
          </li>
        </ul>

        {/* Right actions */}
        <div className="nav-actions">
          {/* Desktop Search */}
          <div className={`nav-search-wrap ${searchOpen ? 'open' : ''}`} ref={dropdownRef}>
            <input
              ref={desktopSearchRef}
              className="nav-search-input"
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => { if (!query) setSearchOpen(false); }}
              aria-label="Search products"
            />
            {query && (
              <div className="search-dropdown" role="listbox">
                {results.length > 0 ? results.map((r) => (
                  <Link key={r.id} href={r.href} className="search-dropdown-item" onClick={() => { setQuery(''); setSearchOpen(false); }}>
                    <div className="search-dropdown-thumb">
                      <Image src={r.src} alt={r.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="search-dropdown-info">
                      <div className="search-dropdown-name">{r.name}</div>
                      <div className="search-dropdown-price">{r.price}</div>
                      <div className="search-dropdown-cat">{r.category}</div>
                    </div>
                  </Link>
                )) : (
                  <div className="search-empty">No results for &ldquo;{query}&rdquo;</div>
                )}
              </div>
            )}
          </div>

          {/* Search toggle button */}
          <button
            type="button"
            className="btn btn-icon"
            aria-label="Search"
            onClick={openSearch}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Favourites */}
          <Link href="/favourites" className="btn btn-icon" style={{ position: 'relative' }} aria-label={`Favourites — ${favCount} items`}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill={favCount > 0 ? '#e91e63' : 'none'} stroke={favCount > 0 ? '#e91e63' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {favCount > 0 && <span className="fav-nav-badge">{favCount}</span>}
          </Link>

          {/* Cart */}
          <Link href="/cart" className="btn btn-icon cart-btn" aria-label={`Cart — ${count} items`}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            className={`hamburger ${drawerOpen ? 'open' : ''}`}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Drawer overlay */}
      <div
        className={`nav-drawer-overlay ${drawerOpen ? 'open' : ''}`}
        aria-hidden="true"
        onClick={closeDrawer}
      />

      {/* Mobile drawer */}
      <aside className={`nav-drawer ${drawerOpen ? 'open' : ''}`} aria-label="Navigation menu">
        <div className="nav-drawer-header">
          <span className="nav-drawer-brand">{siteConfig.name}</span>
          <button type="button" className="nav-drawer-close" onClick={closeDrawer} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer search */}
        <div className="nav-drawer-search">
          <input
            className="nav-drawer-search-input"
            type="search"
            placeholder="Search products…"
            value={drawerQuery}
            onChange={(e) => setDrawerQuery(e.target.value)}
            aria-label="Search products"
          />
          {drawerQuery && (
            <div className="search-dropdown" style={{ position: 'relative', top: 8, minWidth: 'unset', border: 'none', borderRadius: 0, boxShadow: 'none', marginTop: 4 }}>
              {drawerResults.length > 0 ? drawerResults.map((r) => (
                <Link key={r.id} href={r.href} className="search-dropdown-item" onClick={closeDrawer}>
                  <div className="search-dropdown-thumb">
                    <Image src={r.src} alt={r.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="search-dropdown-info">
                    <div className="search-dropdown-name">{r.name}</div>
                    <div className="search-dropdown-price">{r.price}</div>
                    <div className="search-dropdown-cat">{r.category}</div>
                  </div>
                </Link>
              )) : (
                <div className="search-empty">No results for &ldquo;{drawerQuery}&rdquo;</div>
              )}
            </div>
          )}
        </div>

        {/* Drawer nav links */}
        <nav className="nav-drawer-links">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} onClick={closeDrawer}>
              {link.label}
            </Link>
          ))}
          <Link href="/category/dresses" className="nav-sale-mobile" onClick={closeDrawer}>
            🔥 Sale
          </Link>
          <Link href="/favourites" onClick={closeDrawer} style={{ color: '#e91e63' }}>
            ♥ Favourites{favCount > 0 ? ` (${favCount})` : ''}
          </Link>
        </nav>

        <div className="nav-drawer-footer">
          <Link href="/cart" className="btn btn-primary btn-block" onClick={closeDrawer} style={{ justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            View Cart · {count}
          </Link>
        </div>
      </aside>
    </>
  );
}
