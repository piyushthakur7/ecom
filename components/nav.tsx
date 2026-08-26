'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/lib/site';
import { useCart } from './cart-context';
import { useFavourites } from './favourites-context';
import { useAuth } from './auth-context';
import { AuthModal } from './auth-modal';
import { IconTag, IconChevronDown, IconHeart, IconHome, IconShoppingBag, IconUser, IconPackage, IconSettings, IconLogIn, IconLogOut } from './icons';
import { getCategories, getCategoryList, getProducts } from '@/lib/services/products.service';
import type { DBProduct } from '@/lib/types';
import type { CategoryListItem } from '@/lib/services/products.service';
import { cdnImage } from '@/lib/cloudinary';

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
    const t = setTimeout(async () => {
      const q = query.toLowerCase();
      const matched: SearchResult[] = [];
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);

      prods.forEach((p) => {
        if (p.name.toLowerCase().includes(q) || p.category_slug.toLowerCase().includes(q)) {
          const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '';
          matched.push({ id: p.id, name: p.name, price: `₹${p.price}`, src: img, category: p.category_slug, href: `/product/${p.id}` });
        }
      });
      cats.forEach((c) => {
        if (c.name.toLowerCase().includes(q)) {
          matched.push({ id: c.id, name: c.name, price: c.count || '', src: c.src, category: 'Category', href: `/category/${c.slug}` });
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
  const { user, profile, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [drawerQuery, setDrawerQuery] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [navCategories, setNavCategories] = useState<CategoryListItem[]>([]);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const catMenuRef = useRef<HTMLLIElement>(null);

  const results = useDebouncedSearch(query);
  const drawerResults = useDebouncedSearch(drawerQuery);

  // Load categories from DB (with static fallback)
  useEffect(() => {
    getCategoryList().then((cats) => setNavCategories(cats));
  }, []);

  const navLinks = navCategories.map((c) => ({ label: c.name, href: `/category/${c.slug}` }));

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => desktopSearchRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setQuery('');
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setCatMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setCatMenuOpen(false); setProfileMenuOpen(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const closeDrawer = () => { setDrawerOpen(false); setDrawerQuery(''); };

  // Avatar initial from profile name or email
  const avatarInitial = (profile?.full_name ?? user?.email ?? '?')[0].toUpperCase();
  const avatarUrl = profile?.avatar_url ?? user?.profile?.avatar_url;

  return (
    <>
      <nav className="nav">
        {/* Brand */}
        <Link href="/" className="nav-brand">{siteConfig.name}</Link>

        {/* Desktop links */}
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/shop">Shop</Link></li>

          <li className="nav-dropdown" ref={catMenuRef}>
            <button
              type="button"
              className="nav-dropdown-toggle"
              aria-haspopup="true"
              aria-expanded={catMenuOpen}
              onClick={() => setCatMenuOpen((v) => !v)}
            >
              Categories
              <IconChevronDown className="nav-dropdown-chevron" size={14} />
            </button>
            {catMenuOpen && (
              <div className="nav-dropdown-menu">
                {navLinks.map((link) => (
                  <Link key={link.label} href={link.href} onClick={() => setCatMenuOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </li>

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
                      <Image src={cdnImage(r.src, 120)} alt={r.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
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

          {/* Search toggle (Desktop only, hidden on mobile since search is inside mobile drawer) */}
          <button type="button" className="btn btn-icon hide-mobile" aria-label="Search" onClick={openSearch}>
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

          {/* Desktop User Profile Dropdown Menu */}
          <div className="hide-mobile" ref={profileMenuRef} style={{ position: 'relative' }}>
            {user ? (
              <button
                id="nav-profile-btn"
                type="button"
                className="btn btn-icon"
                aria-label="My account"
                onClick={() => setProfileMenuOpen((v) => !v)}
                style={{ padding: 0, width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-accent)' }}
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={profile?.full_name ?? 'Avatar'} width={36} height={36} unoptimized style={{ objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                    {avatarInitial}
                  </span>
                )}
              </button>
            ) : (
              <button
                id="nav-sign-in-btn"
                type="button"
                className="btn btn-icon"
                aria-label="Sign in"
                onClick={() => setAuthOpen(true)}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            )}
            {profileMenuOpen && (
              <div style={{
                position: 'absolute', top: 44, right: 0, background: '#fff',
                border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                minWidth: 180, zIndex: 100, overflow: 'hidden',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.full_name ?? 'My Account'}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>{user?.email}</div>
                </div>
                <Link href="/profile" onClick={() => setProfileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 14, color: 'inherit', textDecoration: 'none' }}><IconUser size={15} /> My Profile</Link>
                <Link href="/profile?tab=orders" onClick={() => setProfileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 14, color: 'inherit', textDecoration: 'none' }}><IconPackage size={15} /> My Orders</Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setProfileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 14, color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}><IconSettings size={15} /> Admin Dashboard</Link>
                )}
                <button
                  type="button"
                  onClick={() => { setProfileMenuOpen(false); signOut(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-700)', borderTop: '1px solid var(--color-divider)' }}
                >
                  <IconLogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile User Gmail Avatar / Profile Button (Replaces 3-line hamburger dashes!) */}
          <button
            type="button"
            className="show-mobile btn btn-icon"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
            style={{ padding: 0, width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: user ? '2px solid var(--color-accent)' : 'none', flexShrink: 0 }}
          >
            {user && avatarUrl ? (
              <Image src={avatarUrl} alt={profile?.full_name ?? 'Avatar'} width={36} height={36} unoptimized style={{ objectFit: 'cover', borderRadius: '50%' }} />
            ) : user ? (
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                {avatarInitial}
              </span>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Auth modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => router.push('/profile')}
      />

      {/* Drawer overlay */}
      <div className={`nav-drawer-overlay ${drawerOpen ? 'open' : ''}`} aria-hidden="true" onClick={closeDrawer} />

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

        {/* User Card in Drawer */}
        {user && (
          <div style={{ margin: '0 16px 12px', padding: '12px 14px', background: 'var(--color-surface)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={38} height={38} unoptimized style={{ borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700 }}>
                {avatarInitial}
              </span>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: 14, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{profile?.full_name || 'My Account'}</div>
              <div style={{ fontSize: 12, color: 'var(--color-neutral-700)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
        )}

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
                    <Image src={cdnImage(r.src, 120)} alt={r.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
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
          <Link href="/" onClick={closeDrawer}>
            <IconHome />
            Home
          </Link>
          <Link href="/shop" onClick={closeDrawer}>
            <IconShoppingBag />
            Shop
          </Link>

          {/* Categories accordion */}
          <div className="nav-drawer-accordion">
            <button
              type="button"
              className="nav-drawer-row"
              aria-expanded={categoriesDropdownOpen}
              onClick={() => setCategoriesDropdownOpen((v) => !v)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconTag />
                Categories ({navLinks.length})
              </span>
              <IconChevronDown className="nav-drawer-chevron" size={16} />
            </button>

            {categoriesDropdownOpen && (
              <div className="nav-drawer-sublinks">
                {navLinks.map((link) => (
                  <Link key={link.label} href={link.href} onClick={closeDrawer}>
                    {link.label}
                  </Link>
                ))}
                <Link href="/category/dresses" onClick={closeDrawer} className="nav-sale-mobile">
                  Sale Collection
                </Link>
              </div>
            )}
          </div>

          <Link href="/favourites" onClick={closeDrawer}>
            <IconHeart />
            Favourites{favCount > 0 ? ` (${favCount})` : ''}
          </Link>

          {user ? (
            <>
              <Link href="/profile" onClick={closeDrawer}>
                <IconUser />
                My Profile
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={closeDrawer} className="nav-sale-mobile">
                  <IconSettings />
                  Admin
                </Link>
              )}
              <button type="button" className="nav-drawer-row nav-drawer-signout" onClick={() => { closeDrawer(); signOut(); }}>
                <IconLogOut />
                Sign Out
              </button>
            </>
          ) : (
            <button type="button" className="nav-drawer-row" onClick={() => { closeDrawer(); setAuthOpen(true); }}>
              <IconLogIn />
              Sign In
            </button>
          )}
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
