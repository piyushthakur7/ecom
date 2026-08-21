'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge-client';
import { useAuth } from '@/components/auth-context';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAllOrders, updateOrderStatus } from '@/lib/services/orders.service';
import type { DBCategory, DBHeroSlide, DBProduct, DBOrder, OrderStatus, Profile } from '@/lib/types';
import {
  IconChart, IconTag, IconImage, IconShirt, IconPackage, IconUsers,
  IconWallet, IconClock, IconEye, IconUser, IconMail, IconPhone,
  IconMapPin, IconCreditCard,
} from '@/components/icons';

type AdminTab = 'overview' | 'categories' | 'hero' | 'products' | 'orders' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, profile, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [uploading, setUploading] = useState(false);

  // DB States
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [heroSlides, setHeroSlides] = useState<DBHeroSlide[]>([]);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', count: '', src: '', alt: '' });

  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [heroForm, setHeroForm] = useState({ src: '', alt: '', link: '/' });

  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<DBProduct | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '', category_slug: 'kurti', price: '', original_price: '',
    stock: '50', badge: '', description: '', images: [] as string[],
    sizes: 'XS,S,M,L,XL,XXL', color: '',
  });

  // Auth guard
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.replace('/profile');
    }
  }, [isLoading, user, isAdmin, router]);

  // Load all DB data
  useEffect(() => {
    if (!isAdmin) return;
    async function loadAll() {
      setDbLoading(true);
      try {
        const [catRes, heroRes, prodRes] = await Promise.all([
          insforge.database.from('categories').select('*').order('name'),
          insforge.database.from('hero_slides').select('*').order('order_index'),
          insforge.database.from('products').select('*').order('created_at', { ascending: false }),
        ]);
        if (catRes.data) setCategories(catRes.data as DBCategory[]);
        if (heroRes.data) setHeroSlides(heroRes.data as DBHeroSlide[]);
        if (prodRes.data) setProducts((prodRes.data as unknown[]).map((r) => {
          const row = r as Record<string, unknown>;
          return { ...row, images: Array.isArray(row.images) ? row.images : [], sizes: Array.isArray(row.sizes) ? row.sizes : [] } as DBProduct;
        }));

        const [ordRes, usrRes] = await Promise.all([
          getAllOrders(),
          insforge.database.from('profiles').select('*').order('created_at', { ascending: false }),
        ]);
        setOrders(ordRes);
        if (usrRes.data) setUsers((usrRes.data as unknown[]).map((r) => {
          const row = r as Record<string, unknown>;
          return { ...row, addresses: Array.isArray(row.addresses) ? row.addresses : [] } as Profile;
        }));
      } catch (e) {
        console.error('Admin load error:', e);
      } finally {
        setDbLoading(false);
      }
    }
    loadAll();
  }, [isAdmin]);

  // ── Category Actions ────────────────────────────────────────────────────
  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catForm.name || !catForm.src) return alert('Name and image URL are required!');
    const newCat: DBCategory = {
      id: `cat-${Date.now()}`,
      name: catForm.name,
      slug: catForm.slug || catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count: catForm.count || '0 styles',
      src: catForm.src,
      alt: catForm.alt || `${catForm.name} category`,
    };
    setCategories((prev) => [...prev, newCat]);
    setIsCatModalOpen(false);
    setCatForm({ name: '', slug: '', count: '', src: '', alt: '' });
    try { await insforge.database.from('categories').insert([newCat]); } catch { /* silent */ }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Delete this category?')) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try { await insforge.database.from('categories').delete().eq('id', id); } catch { /* silent */ }
  }

  // ── Hero Banner Actions ─────────────────────────────────────────────────
  async function handleAddHero(e: React.FormEvent) {
    e.preventDefault();
    if (!heroForm.src) return alert('Banner image URL is required!');
    const newSlide: DBHeroSlide = {
      id: `slide-${Date.now()}`,
      src: heroForm.src,
      alt: heroForm.alt || 'Promotional Banner',
      link: heroForm.link || '/',
      order_index: heroSlides.length,
    };
    setHeroSlides((prev) => [...prev, newSlide]);
    setIsHeroModalOpen(false);
    setHeroForm({ src: '', alt: '', link: '/' });
    try { await insforge.database.from('hero_slides').insert([newSlide]); } catch { /* silent */ }
  }

  async function handleDeleteHero(id: string) {
    if (!confirm('Delete this hero banner slide?')) return;
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
    try { await insforge.database.from('hero_slides').delete().eq('id', id); } catch { /* silent */ }
  }

  // ── Product Actions ─────────────────────────────────────────────────────
  function openAddProduct() {
    setEditingProd(null);
    setProdForm({
      name: '', category_slug: categories[0]?.slug || 'kurti', price: '', original_price: '',
      stock: '50', badge: '', description: '', images: [], sizes: 'XS,S,M,L,XL,XXL', color: '',
    });
    setIsProdModalOpen(true);
  }

  function openEditProduct(p: DBProduct) {
    setEditingProd(p);
    setProdForm({
      name: p.name,
      category_slug: p.category_slug,
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      stock: String(p.stock),
      badge: p.badge ?? '',
      description: p.description,
      images: [...p.images],
      sizes: p.sizes.join(','),
      color: p.color ?? '',
    });
    setIsProdModalOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price || prodForm.images.length === 0) {
      return alert('Name, Price, and at least 1 image are required!');
    }
    const cleanCategorySlug = (prodForm.category_slug || 'kurti').toLowerCase().trim();
    const payload: DBProduct = {
      id: editingProd?.id ?? `prod-${Date.now()}`,
      name: prodForm.name,
      slug: prodForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: parseFloat(prodForm.price) || 0,
      original_price: prodForm.original_price ? parseFloat(prodForm.original_price) : null,
      rating: editingProd?.rating ?? 5.0,
      reviews_count: editingProd?.reviews_count ?? 1,
      category_slug: cleanCategorySlug,
      badge: prodForm.badge || null,
      images: prodForm.images,
      sizes: prodForm.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      color: prodForm.color.trim() || null,
      stock: parseInt(prodForm.stock) || 50,
      description: prodForm.description || '',
      details: null,
      created_at: editingProd?.created_at ?? new Date().toISOString(),
    };

    // Close modal & reset form immediately
    setIsProdModalOpen(false);
    const isEdit = Boolean(editingProd);
    const targetId = editingProd?.id;
    setEditingProd(null);
    setProdForm({
      name: '', category_slug: 'kurti', price: '', original_price: '',
      stock: '50', badge: '', description: '', images: [],
      sizes: 'XS,S,M,L,XL,XXL', color: '',
    });

    if (isEdit && targetId) {
      setProducts((prev) => prev.map((p) => (p.id === targetId ? payload : p)));
      const { id, ...rest } = payload;
      const { error } = await insforge.database.from('products').update(rest).eq('id', id);
      if (error) {
        const errMsg = error.message || error.details || error.hint || JSON.stringify(error);
        console.error('Failed to update product in DB:', errMsg, error);
        alert(`Failed to update product in database: ${errMsg}`);
      }
    } else {
      setProducts((prev) => [payload, ...prev]);
      const { error } = await insforge.database.from('products').insert([payload]);
      if (error) {
        const errMsg = error.message || error.details || error.hint || JSON.stringify(error);
        console.error('Failed to insert product in DB:', errMsg, error);
        setProducts((prev) => prev.filter((p) => p.id !== payload.id));
        alert(`Failed to save product to database: ${errMsg}`);
      }
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try { await insforge.database.from('products').delete().eq('id', id); } catch { /* silent */ }
  }

  // ── Order Actions ───────────────────────────────────────────────────────
  async function handleOrderStatusChange(orderId: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status } : prev));
    }
    await updateOrderStatus(orderId, status);
  }

  // ── Image Upload (Cloudinary) ───────────────────────────────────────────
  async function handleImageUpload(file: File, target: 'cat' | 'hero' | 'prod') {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      if (target === 'cat') setCatForm((f) => ({ ...f, src: url }));
      if (target === 'hero') setHeroForm((f) => ({ ...f, src: url }));
      if (target === 'prod') setProdForm((f) => ({ ...f, images: [...f.images, url] }));
    } catch {
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const statusColors: Record<string, { bg: string; text: string }> = {
    Pending:    { bg: '#fff8e1', text: '#f59e0b' },
    Processing: { bg: '#e3f2fd', text: '#2563eb' },
    Shipped:    { bg: '#e8f5e9', text: '#16a34a' },
    Delivered:  { bg: '#f0fdf4', text: '#15803d' },
    Cancelled:  { bg: '#fef2f2', text: '#dc2626' },
  };

  // Guard: loading or not admin
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: 16, color: '#888' }}>Loading…</div>
      </div>
    );
  }
  if (!user || !isAdmin) return null;

  // Overview stats
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total) + Number(o.shipping), 0);
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',   label: 'Overview',    icon: <IconChart size={16} /> },
    { id: 'categories', label: 'Categories',  icon: <IconTag size={16} /> },
    { id: 'hero',       label: 'Hero Banners',icon: <IconImage size={16} /> },
    { id: 'products',   label: 'Products',    icon: <IconShirt size={16} /> },
    { id: 'orders',     label: 'Orders',      icon: <IconPackage size={16} /> },
    { id: 'users',      label: 'Users',       icon: <IconUsers size={16} /> },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Admin header */}
      <div style={{ background: '#1a1a1a', color: '#fff', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 800 }}>Saanshika</Link>
          <span style={{ color: '#888', fontSize: 13 }}>/ Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#aaa' }}>{user.email}</span>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 13 }}>← View Store</Link>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: '#fff', borderRight: '1px solid #e5e7eb', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, padding: '20px 12px' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeTab === t.id ? 'var(--color-accent-100, #fff5f0)' : 'none',
                color: activeTab === t.id ? 'var(--color-accent, #c94040)' : '#444',
                fontWeight: activeTab === t.id ? 600 : 400, fontSize: 14,
                transition: 'all 0.15s',
              }}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

          {/* ── Overview ─────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, marginBottom: 24 }}>Dashboard Overview</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <IconWallet size={22} />, color: '#16a34a' },
                  { label: 'Total Orders', value: orders.length, icon: <IconPackage size={22} />, color: '#2563eb' },
                  { label: 'Pending Orders', value: pendingOrders, icon: <IconClock size={22} />, color: '#f59e0b' },
                  { label: 'Products', value: products.length, icon: <IconShirt size={22} />, color: '#7c3aed' },
                  { label: 'Categories', value: categories.length, icon: <IconTag size={22} />, color: '#0891b2' },
                  { label: 'Users', value: users.length, icon: <IconUsers size={22} />, color: '#db2777' },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px' }}>
                    <div style={{ marginBottom: 8, color: stat.color }}>{stat.icon}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 14 }}>Recent Orders</h2>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Order #', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#444' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => {
                      const sc = statusColors[o.status] ?? statusColors.Pending;
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2563eb' }}>{o.order_number}</td>
                          <td style={{ padding: '12px 16px' }}>{o.customer_name}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>₹{Number(Number(o.total) + Number(o.shipping)).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 12, background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{o.status}</span></td>
                          <td style={{ padding: '12px 16px', color: '#888' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No orders yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Categories ───────────────────────────────────────────── */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22 }}>Categories</h1>
                <button type="button" className="btn btn-primary" onClick={() => setIsCatModalOpen(true)}>+ Add Category</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {categories.map((cat) => (
                  <div key={cat.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '1', overflow: 'hidden', position: 'relative' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cat.src} alt={cat.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{cat.name}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{cat.slug} · {cat.count}</div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <Link href={`/category/${cat.slug}`} style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>View ↗</Link>
                        <button type="button" onClick={() => handleDeleteCategory(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', padding: 0 }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                {!dbLoading && categories.length === 0 && <p style={{ color: '#888', gridColumn: '1/-1' }}>No categories yet.</p>}
              </div>
            </div>
          )}

          {/* ── Hero Banners ─────────────────────────────────────────── */}
          {activeTab === 'hero' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22 }}>Hero Banners</h1>
                <button type="button" className="btn btn-primary" onClick={() => setIsHeroModalOpen(true)}>+ Add Banner</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {heroSlides.map((slide, idx) => (
                  <div key={slide.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 0 }}>
                    <div style={{ width: 180, height: 90, flexShrink: 0, overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slide.src} alt={slide.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600 }}>{slide.alt}</div>
                      <div style={{ fontSize: 13, color: '#2563eb', marginTop: 4 }}>→ {slide.link}</div>
                      <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Position: {idx + 1}</div>
                    </div>
                    <button type="button" onClick={() => handleDeleteHero(slide.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '14px 20px', fontSize: 13 }}>Delete</button>
                  </div>
                ))}
                {!dbLoading && heroSlides.length === 0 && <p style={{ color: '#888' }}>No hero banners yet.</p>}
              </div>
            </div>
          )}

          {/* ── Products ─────────────────────────────────────────────── */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22 }}>Products ({products.length})</h1>
                <button type="button" className="btn btn-primary" onClick={openAddProduct}>+ Add Product</button>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Image', 'Product', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#444' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const img = p.images?.[0] ?? '';
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '10px 16px' }}>
                            {img && <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden' }}><Image src={img} alt={p.name} width={44} height={44} style={{ objectFit: 'cover' }} /></div>}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            {p.badge && <span style={{ fontSize: 11, background: '#fff5f0', color: 'var(--color-accent)', padding: '2px 6px', borderRadius: 10 }}>{p.badge}</span>}
                          </td>
                          <td style={{ padding: '10px 16px', color: '#666' }}>{p.category_slug}</td>
                          <td style={{ padding: '10px 16px', fontWeight: 600 }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '10px 16px' }}><span style={{ color: p.stock <= 5 ? '#dc2626' : p.stock <= 20 ? '#f59e0b' : '#16a34a' }}>{p.stock}</span></td>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button type="button" className="btn btn-ghost" onClick={() => openEditProduct(p)} style={{ fontSize: 12, padding: '5px 10px' }}>Edit</button>
                              <button type="button" onClick={() => handleDeleteProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!dbLoading && products.length === 0 && (
                      <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No products yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Orders ───────────────────────────────────────────────── */}
          {activeTab === 'orders' && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, marginBottom: 20 }}>Orders ({orders.length})</h1>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Order #', 'Customer', 'Total', 'Status', 'Date', 'Update Status', 'Details'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 600, color: '#444', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const sc = statusColors[o.status] ?? statusColors.Pending;
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#2563eb' }}>{o.order_number}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                            <div style={{ fontSize: 12, color: '#888' }}>{o.customer_email}</div>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>₹{Number(Number(o.total) + Number(o.shipping)).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontSize: 12, background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{o.status}</span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#888', whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                          <td style={{ padding: '12px 14px' }} onClick={(e) => e.stopPropagation()}>
                            <select
                              value={o.status}
                              onChange={(e) => handleOrderStatusChange(o.id, e.target.value as OrderStatus)}
                              style={{ fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid #e0e0e0', cursor: 'pointer' }}
                            >
                              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                              style={{ fontSize: 12, padding: '5px 10px' }}
                            >
                              <IconEye size={13} /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!dbLoading && orders.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No orders yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Users ────────────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, marginBottom: 20 }}>Users ({users.length})</h1>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Name', 'Email', 'Phone', 'Role', 'Joined'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#444' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {u.avatar_url ? (
                              <Image src={u.avatar_url} alt={u.full_name ?? ''} width={32} height={32} unoptimized style={{ borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                                {(u.full_name ?? u.email ?? '?')[0].toUpperCase()}
                              </div>
                            )}
                            <span style={{ fontWeight: 600 }}>{u.full_name ?? '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#666' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px', color: '#666' }}>{u.phone ?? '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 12, background: u.role === 'admin' ? '#fef2f2' : '#f0fdf4', color: u.role === 'admin' ? '#dc2626' : '#16a34a', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#888' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}</td>
                      </tr>
                    ))}
                    {!dbLoading && users.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No users yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Category Modal ───────────────────────────────────────────────── */}
      {isCatModalOpen && (
        <Modal title="Add Category" onClose={() => setIsCatModalOpen(false)}>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AdminField label="Category Name *">
              <input className="form-input" value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Kurtis" required />
            </AdminField>
            <AdminField label="Slug">
              <input className="form-input" value={catForm.slug} onChange={(e) => setCatForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated if empty" />
            </AdminField>
            <AdminField label="Count label">
              <input className="form-input" value={catForm.count} onChange={(e) => setCatForm((f) => ({ ...f, count: e.target.value }))} placeholder="48 styles" />
            </AdminField>
            <AdminField label="Category Image">
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cat')} />
              <input className="form-input" style={{ marginTop: 8 }} value={catForm.src} onChange={(e) => setCatForm((f) => ({ ...f, src: e.target.value }))} placeholder="Or paste image URL" />
              {catForm.src && <img src={catForm.src} alt="preview" style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: 'cover' }} />}
            </AdminField>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading…' : 'Add Category'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setIsCatModalOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Hero Modal ───────────────────────────────────────────────────── */}
      {isHeroModalOpen && (
        <Modal title="Add Hero Banner" onClose={() => setIsHeroModalOpen(false)}>
          <form onSubmit={handleAddHero} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AdminField label="Banner Image *">
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'hero')} />
              <input className="form-input" style={{ marginTop: 8 }} value={heroForm.src} onChange={(e) => setHeroForm((f) => ({ ...f, src: e.target.value }))} placeholder="Or paste image URL" />
              {heroForm.src && <img src={heroForm.src} alt="preview" style={{ marginTop: 8, width: '100%', maxHeight: 120, borderRadius: 8, objectFit: 'cover' }} />}
            </AdminField>
            <AdminField label="Alt Text / Description">
              <input className="form-input" value={heroForm.alt} onChange={(e) => setHeroForm((f) => ({ ...f, alt: e.target.value }))} placeholder="Festive Collection 2025" />
            </AdminField>
            <AdminField label="Redirect Link">
              <input className="form-input" value={heroForm.link} onChange={(e) => setHeroForm((f) => ({ ...f, link: e.target.value }))} placeholder="/category/suits" />
            </AdminField>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading…' : 'Add Banner'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setIsHeroModalOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Product Modal ─────────────────────────────────────────────────── */}
      {isProdModalOpen && (
        <Modal title={editingProd ? 'Edit Product' : 'Add Product'} onClose={() => { setIsProdModalOpen(false); setEditingProd(null); }}>
          <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AdminField label="Product Name *">
              <input className="form-input" value={prodForm.name} onChange={(e) => setProdForm((f) => ({ ...f, name: e.target.value }))} placeholder="Block-print Mul Kurti" required />
            </AdminField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <AdminField label="Price (₹) *">
                <input className="form-input" type="number" value={prodForm.price} onChange={(e) => setProdForm((f) => ({ ...f, price: e.target.value }))} placeholder="849" required />
              </AdminField>
              <AdminField label="Original Price (₹)">
                <input className="form-input" type="number" value={prodForm.original_price} onChange={(e) => setProdForm((f) => ({ ...f, original_price: e.target.value }))} placeholder="1099" />
              </AdminField>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <AdminField label="Category *">
                <select
                  className="form-input"
                  value={prodForm.category_slug}
                  onChange={(e) => setProdForm((f) => ({ ...f, category_slug: e.target.value }))}
                  required
                >
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name} ({c.slug})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="kurti">Kurtis (kurti)</option>
                      <option value="sarees">Sarees (sarees)</option>
                      <option value="suits">Suits (suits)</option>
                      <option value="lehengas">Lehengas (lehengas)</option>
                      <option value="coords">Co-ords (coords)</option>
                      <option value="dupattas">Dupattas (dupattas)</option>
                      <option value="dresses">Dresses (dresses)</option>
                    </>
                  )}
                </select>
              </AdminField>
              <AdminField label="Stock">
                <input className="form-input" type="number" value={prodForm.stock} onChange={(e) => setProdForm((f) => ({ ...f, stock: e.target.value }))} />
              </AdminField>
            </div>
            <AdminField label="Badge">
              <select className="form-input" value={prodForm.badge} onChange={(e) => setProdForm((f) => ({ ...f, badge: e.target.value }))}>
                <option value="">None</option>
                <option>Best Seller</option>
                <option>Trending</option>
                <option>Highly Purchased</option>
                <option>New Arrival</option>
              </select>
            </AdminField>
            <AdminField label="Color">
              <input className="form-input" value={prodForm.color} onChange={(e) => setProdForm((f) => ({ ...f, color: e.target.value }))} placeholder="e.g. Pink, Royal Blue, Maroon" />
            </AdminField>
            <AdminField label="Sizes (comma-separated)">
              <input className="form-input" value={prodForm.sizes} onChange={(e) => setProdForm((f) => ({ ...f, sizes: e.target.value }))} placeholder="XS,S,M,L,XL,XXL" />
            </AdminField>
            <AdminField label="Description">
              <textarea className="form-input" rows={3} value={prodForm.description} onChange={(e) => setProdForm((f) => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </AdminField>
            <AdminField label="Product Images *">
              <input type="file" accept="image/*" multiple onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                for (const file of files) await handleImageUpload(file, 'prod');
              }} />
              {prodForm.images.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {prodForm.images.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} alt={`img-${i}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                      <button type="button" onClick={() => setProdForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 11, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </AdminField>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading…' : editingProd ? 'Update Product' : 'Add Product'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setIsProdModalOpen(false); setEditingProd(null); }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Order Details Modal ───────────────────────────────────────────── */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleOrderStatusChange}
          statusColors={statusColors}
        />
      )}
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: '#fff', borderRadius: 16, padding: '28px 28px 24px',
        width: '92vw', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
        zIndex: 201, boxShadow: '0 20px 60px rgba(0,0,0,0.20)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, margin: 0 }}>{title}</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#aaa', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </>
  );
}

function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
  statusColors,
}: {
  order: DBOrder;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  statusColors: Record<string, { bg: string; text: string }>;
}) {
  const sc = statusColors[order.status] ?? statusColors.Pending;
  const grandTotal = Number(order.total) + Number(order.shipping);

  return (
    <Modal title={`Order Details — ${order.order_number}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: '#888' }}>Order Placed On</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {new Date(order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, background: sc.bg, color: sc.text, padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>
              {order.status}
            </span>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              style={{ fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid #d0d0d0', cursor: 'pointer', fontWeight: 600 }}
            >
              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer & Address split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {/* Customer info */}
          <div style={{ padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fafafa' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
              <IconUser size={15} /> Customer Details
            </div>
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
              <div><a href={`mailto:${order.customer_email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2563eb', textDecoration: 'none' }}><IconMail size={13} />{order.customer_email}</a></div>
              <div><a href={`tel:${order.customer_phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2563eb', textDecoration: 'none' }}><IconPhone size={13} />{order.customer_phone}</a></div>
            </div>
          </div>

          {/* Shipping Address */}
          <div style={{ padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fafafa' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
              <IconMapPin size={15} /> Shipping Address
            </div>
            {order.shipping_address ? (
              <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600 }}>{order.shipping_address.name || order.customer_name}</div>
                <div>{order.shipping_address.street}</div>
                <div>{order.shipping_address.city}, {order.shipping_address.state} — <strong>{order.shipping_address.pincode}</strong></div>
                {order.shipping_address.landmark && <div style={{ fontSize: 12, color: '#888' }}>Landmark: {order.shipping_address.landmark}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#888', marginTop: 2 }}><IconPhone size={12} />{order.shipping_address.phone || order.customer_phone}</div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#888' }}>No address recorded</div>
            )}
          </div>
        </div>

        {/* Payment & Summary */}
        <div style={{ padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
            <IconCreditCard size={15} /> Payment Breakdown
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, fontSize: 13 }}>
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Method</span>
              <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{order.payment_method}</span>
            </div>
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{Number(order.total).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Shipping</span>
              <span style={{ fontWeight: 600, color: order.shipping === 0 ? '#16a34a' : 'inherit' }}>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
            </div>
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Grand Total</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-accent)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shiprocket */}
        {(() => {
          const status = order.shiprocket_status ?? '';
          const failed = status.startsWith('FAILED');
          // Nothing recorded at all: an order placed before Shiprocket was
          // wired up, or the migration in scratch/shiprocket.sql has not run.
          if (!status && !order.shiprocket_shipment_id) return null;

          return (
            <div style={{ padding: '14px 16px', border: `1px solid ${failed ? '#fecaca' : '#e5e7eb'}`, borderRadius: 10, background: failed ? '#fef2f2' : '#fff' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
                <IconPackage size={15} /> Shiprocket
              </div>
              {failed ? (
                <div style={{ fontSize: 13, color: '#b91c1c' }}>
                  <strong>Shipment not created.</strong>
                  <div style={{ marginTop: 4, wordBreak: 'break-word' }}>{status.replace(/^FAILED:\s*/, '')}</div>
                  <div style={{ marginTop: 6, color: '#7f1d1d' }}>Create this shipment by hand in the Shiprocket dashboard.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Shipment ID</span>
                    <span style={{ fontWeight: 600 }}>{order.shiprocket_shipment_id || '—'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Order ID</span>
                    <span style={{ fontWeight: 600 }}>{order.shiprocket_order_id || '—'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#888', display: 'block', fontSize: 12 }}>Status</span>
                    <span style={{ fontWeight: 600 }}>{status || '—'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Product Items Table */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 7 }}>
            <IconShirt size={15} /> Ordered Products ({order.items.length})
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Size / Color</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < order.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {item.image && (
                          <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                        )}
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-accent)', background: '#fff5f0', border: '1px solid #fcdcd7', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                          Size: {item.size || 'M'}
                        </span>
                        {item.color && (
                          <span style={{ fontWeight: 700, color: '#18181b', background: '#f4f4f5', border: '1px solid #e4e4e7', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#666' }}>
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>{label}</label>
      {children}
    </div>
  );
}
