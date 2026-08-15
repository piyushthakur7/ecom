'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Footer } from '@/components/footer';
import { useAuth } from '@/components/auth-context';
import { AuthModal } from '@/components/auth-modal';
import { useToast } from '@/components/toast';
import { updateProfile, updateAddresses } from '@/lib/services/auth.service';
import { getUserOrders } from '@/lib/services/orders.service';
import type { SavedAddress, DBOrder } from '@/lib/types';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Pending:    { bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' },
  Processing: { bg: 'var(--color-info-bg)', text: 'var(--color-info)' },
  Shipped:    { bg: 'var(--color-success-bg)', text: 'var(--color-success)' },
  Delivered:  { bg: 'var(--color-success-bg)', text: 'var(--color-success-dark)' },
  Cancelled:  { bg: 'var(--color-danger-bg)', text: 'var(--color-danger)' },
};

type Tab = 'profile' | 'addresses' | 'orders' | 'wishlist';

const emptyAddress: Omit<SavedAddress, 'id'> = {
  name: '', phone: '', street: '', city: '', state: '', pincode: '', landmark: '', isDefault: false,
};

function ProfileContent() {
  const { user, profile, isLoading, refreshProfile, patchProfile, signOut } = useAuth();
  const searchParams = useSearchParams();
  const toast = useToast();

  const initialTab = (searchParams.get('tab') as Tab) ?? 'profile';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [authOpen, setAuthOpen] = useState(false);

  // Profile tab state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Addresses tab state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<SavedAddress | null>(null);
  const [addrForm, setAddrForm] = useState<Omit<SavedAddress, 'id'>>(emptyAddress);
  const [savingAddr, setSavingAddr] = useState(false);

  // Orders tab state
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Sync profile into form fields
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setPhone(profile.phone ?? '');
      setAddresses(Array.isArray(profile.addresses) ? profile.addresses : []);
    }
  }, [profile]);

  // Load orders when tab changes
  useEffect(() => {
    if (tab === 'orders' && user && orders.length === 0) {
      setOrdersLoading(true);
      getUserOrders(user.id).then((data) => {
        setOrders(data);
        setOrdersLoading(false);
      });
    }
  }, [tab, user, orders.length]);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    setSavingProfile(true);
    const ok = await updateProfile(user.id, { full_name: fullName, phone });
    if (ok) {
      patchProfile({ full_name: fullName, phone });
      toast('Profile saved successfully!');
    } else {
      toast('Failed to save profile.', 'error');
    }
    setSavingProfile(false);
  }, [user, fullName, phone, patchProfile, toast]);

  const handleSaveAddress = useCallback(async () => {
    if (!user) return;
    setSavingAddr(true);
    let newAddresses: SavedAddress[];
    if (editingAddr) {
      newAddresses = addresses.map((a) => a.id === editingAddr.id ? { ...editingAddr, ...addrForm } : a);
    } else {
      const newAddr: SavedAddress = { ...addrForm, id: `addr-${Date.now()}` };
      if (addresses.length === 0) newAddr.isDefault = true;
      newAddresses = [...addresses, newAddr];
    }
    const ok = await updateAddresses(user.id, newAddresses);
    if (ok) {
      setAddresses(newAddresses);
      patchProfile({ addresses: newAddresses });
      setShowAddressForm(false);
      setEditingAddr(null);
      setAddrForm(emptyAddress);
      toast(editingAddr ? 'Address updated!' : 'Address added!');
    } else {
      toast('Failed to save address.', 'error');
    }
    setSavingAddr(false);
  }, [user, addresses, addrForm, editingAddr, patchProfile, toast]);

  const handleDeleteAddress = useCallback(async (id: string) => {
    if (!user) return;
    const newAddresses = addresses.filter((a) => a.id !== id);
    await updateAddresses(user.id, newAddresses);
    setAddresses(newAddresses);
    patchProfile({ addresses: newAddresses });
    toast('Address removed.');
  }, [user, addresses, patchProfile, toast]);

  const handleSetDefault = useCallback(async (id: string) => {
    if (!user) return;
    const newAddresses = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    await updateAddresses(user.id, newAddresses);
    setAddresses(newAddresses);
    patchProfile({ addresses: newAddresses });
    toast('Default address updated.');
  }, [user, addresses, patchProfile, toast]);

  // Not logged in
  if (!isLoading && !user) {
    return (
      <main>
        <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
            <h1 style={{ fontSize: 24, fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: 10 }}>Sign in to view your profile</h1>
            <p style={{ color: 'var(--color-text-subtle)', marginBottom: 24 }}>Access your orders, wishlist, and saved addresses.</p>
            <button type="button" className="btn btn-primary btn-large" onClick={() => setAuthOpen(true)}>Sign in with Google</button>
          </div>
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => refreshProfile()} />
        <Footer />
      </main>
    );
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <main>
        <div className="section" style={{ minHeight: '60vh' }}>
          <div style={{ height: 28, background: 'var(--color-skeleton)', borderRadius: 4, width: '30%', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 24 }} />
          <div style={{ height: 16, background: 'var(--color-skeleton)', borderRadius: 4, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </main>
    );
  }

  const avatarInitial = (profile?.full_name ?? user?.email ?? '?')[0].toUpperCase();
  const avatarUrl = profile?.avatar_url ?? user?.profile?.avatar_url;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
  ];

  return (
    <main>
      <div className="section" style={{ paddingTop: 'clamp(24px,3vw,40px)' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-accent)', flexShrink: 0 }}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt={profile?.full_name ?? 'Avatar'} width={72} height={72} unoptimized style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--color-accent)', color: 'var(--color-on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
                {avatarInitial}
              </div>
            )}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(20px,2.5vw,28px)', margin: 0 }}>
              {profile?.full_name ?? 'My Account'}
            </h1>
            <div style={{ color: 'var(--color-text-subtle)', fontSize: 14, marginTop: 4 }}>{user?.email}</div>
            {profile?.role === 'admin' && (
              <span style={{ display: 'inline-block', marginTop: 6, fontSize: 12, background: 'var(--color-accent)', color: 'var(--color-on-accent)', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                Admin
              </span>
            )}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {profile?.role === 'admin' && (
              <Link href="/admin" className="btn btn-ghost" style={{ fontSize: 13 }}>⚙️ Admin Dashboard</Link>
            )}
            <button type="button" className="btn btn-ghost" onClick={signOut} style={{ fontSize: 13, color: 'var(--color-danger)' }}>Sign Out</button>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--color-border)', marginBottom: 32, overflowX: 'auto' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '10px 18px', fontSize: 14, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                borderBottom: tab === t.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                marginBottom: -2, whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ─────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 520 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Account Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-field">
                <span className="form-label">Full name</span>
                <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="form-field">
                <span className="form-label">Email address</span>
                <input className="form-input" value={user?.email ?? ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-field">
                <span className="form-label">Phone number</span>
                <input className="form-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" maxLength={10} />
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              style={{ marginTop: 20, opacity: savingProfile ? 0.7 : 1 }}
            >
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* ── Addresses Tab ─────────────────────────────────────────────── */}
        {tab === 'addresses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, margin: 0 }}>Saved Addresses</h2>
              <button type="button" className="btn btn-primary" onClick={() => { setEditingAddr(null); setAddrForm(emptyAddress); setShowAddressForm(true); }} style={{ fontSize: 13 }}>
                + Add Address
              </button>
            </div>

            {addresses.length === 0 && !showAddressForm && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-subtle)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📍</div>
                <p>No saved addresses yet. Add one to speed up checkout!</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {addresses.map((addr) => (
                <div key={addr.id} style={{ padding: '16px 20px', border: '1.5px solid var(--color-border)', borderRadius: 12, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {addr.name}
                        {addr.isDefault && <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--color-success-bg)', color: 'var(--color-success-dark)', padding: '2px 8px', borderRadius: 20 }}>Default</span>}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>{addr.street}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{addr.city}, {addr.state} — {addr.pincode}</div>
                      {addr.landmark && <div style={{ color: 'var(--color-text-subtle)', fontSize: 13 }}>Near: {addr.landmark}</div>}
                      <div style={{ color: 'var(--color-text-subtle)', fontSize: 13, marginTop: 2 }}>📞 {addr.phone}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button type="button" className="btn btn-ghost" onClick={() => { setEditingAddr(addr); setAddrForm({ name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode, landmark: addr.landmark ?? '', isDefault: addr.isDefault }); setShowAddressForm(true); }} style={{ fontSize: 12, padding: '6px 12px' }}>Edit</button>
                      {!addr.isDefault && <button type="button" className="btn btn-ghost" onClick={() => handleSetDefault(addr.id)} style={{ fontSize: 12, padding: '6px 12px' }}>Set Default</button>}
                      <button type="button" className="btn btn-ghost" onClick={() => handleDeleteAddress(addr.id)} style={{ fontSize: 12, padding: '6px 12px', color: 'var(--color-danger)' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Address form */}
            {showAddressForm && (
              <div style={{ background: 'var(--color-surface-sunken)', border: '1.5px solid var(--color-border)', borderRadius: 14, padding: '20px 24px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
                  {editingAddr ? 'Edit Address' : 'New Address'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-field">
                      <span className="form-label">Full name *</span>
                      <input className="form-input" value={addrForm.name} onChange={(e) => setAddrForm((f) => ({ ...f, name: e.target.value }))} placeholder="Gurleen Kaur" />
                    </div>
                    <div className="form-field">
                      <span className="form-label">Phone *</span>
                      <input className="form-input" type="tel" maxLength={10} value={addrForm.phone} onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))} placeholder="98XXXXXXXX" />
                    </div>
                  </div>
                  <div className="form-field">
                    <span className="form-label">Street / House no. *</span>
                    <input className="form-input" value={addrForm.street} onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))} placeholder="249, Block-D" />
                  </div>
                  <div className="form-field">
                    <span className="form-label">Landmark</span>
                    <input className="form-input" value={addrForm.landmark ?? ''} onChange={(e) => setAddrForm((f) => ({ ...f, landmark: e.target.value }))} placeholder="Near main market" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-field">
                      <span className="form-label">City *</span>
                      <input className="form-input" value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} placeholder="Amritsar" />
                    </div>
                    <div className="form-field">
                      <span className="form-label">State *</span>
                      <select className="form-input" value={addrForm.state} onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))}>
                        <option value="">Select state</option>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-field">
                    <span className="form-label">Pincode *</span>
                    <input className="form-input" maxLength={6} value={addrForm.pincode} onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value }))} placeholder="143001" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn btn-primary" onClick={handleSaveAddress} disabled={savingAddr} style={{ opacity: savingAddr ? 0.7 : 1 }}>
                    {savingAddr ? 'Saving…' : editingAddr ? 'Update Address' : 'Save Address'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowAddressForm(false); setEditingAddr(null); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Orders Tab ────────────────────────────────────────────────── */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Order History</h2>
            {ordersLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1,2,3].map((i) => (
                  <div key={i} style={{ height: 80, background: 'var(--color-skeleton)', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-subtle)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <p style={{ marginBottom: 20 }}>You haven&apos;t placed any orders yet.</p>
                <Link href="/" className="btn btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map((order) => {
                  const sc = STATUS_COLORS[order.status] ?? STATUS_COLORS.Pending;
                  return (
                    <div key={order.id} style={{ border: '1.5px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
                      {/* Order header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--color-surface-sunken)', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{order.order_number}</span>
                          <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--color-text-subtle)' }}>
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, background: sc.bg, color: sc.text, padding: '4px 12px', borderRadius: 20 }}>
                          {order.status}
                        </span>
                      </div>
                      {/* Items */}
                      <div style={{ padding: '14px 20px' }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                            <span>{item.name}{item.size || item.color ? ` (${[item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : ''].filter(Boolean).join(', ')})` : ''} × {item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '2px solid var(--color-border)', fontWeight: 700 }}>
                          <span>Total</span>
                          <span>₹{Number(order.total + order.shipping).toLocaleString('en-IN')}</span>
                        </div>
                        {order.shipping_address && (
                          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-text-subtle)' }}>
                            📍 {order.shipping_address.street}, {order.shipping_address.city}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Wishlist Tab ──────────────────────────────────────────────── */}
        {tab === 'wishlist' && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>❤️</div>
            <p style={{ marginBottom: 20, color: 'var(--color-text-muted)' }}>View and manage your saved items in your wishlist.</p>
            <Link href="/favourites" className="btn btn-primary">Go to Wishlist →</Link>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense
      fallback={
        <main>
          <div className="section" style={{ minHeight: '60vh' }}>
            <div style={{ height: 28, background: 'var(--color-skeleton)', borderRadius: 4, width: '30%', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 24 }} />
          </div>
        </main>
      }
    >
      <ProfileContent />
    </React.Suspense>
  );
}
