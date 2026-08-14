'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart-context';
import { useAuth } from '@/components/auth-context';
import { AuthModal } from '@/components/auth-modal';
import { Footer } from '@/components/footer';
import { useToast } from '@/components/toast';
import { createOrder } from '@/lib/services/orders.service';
import { updateAddresses, updateProfile } from '@/lib/services/auth.service';
import type { SavedAddress } from '@/lib/types';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

type FormState = {
  firstName: string; lastName: string; phone: string; email: string;
  address: string; city: string; state: string; pincode: string; landmark: string;
  payment: string; upiId: string;
};

const emptyForm: FormState = {
  firstName: '', lastName: '', phone: '', email: '',
  address: '', city: '', state: '', pincode: '', landmark: '',
  payment: 'upi', upiId: '',
};

export default function CheckoutPage() {
  const { items, total, count, clearCart } = useCart();
  const { user, profile, isLoading: authLoading, patchProfile } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');

  const shipping = total >= 999 ? 0 : 99;
  const grandTotal = total + shipping;

  // Redirect to cart if empty
  useEffect(() => {
    if (!authLoading && count === 0 && !success) router.replace('/cart');
  }, [count, success, router, authLoading]);

  // Pre-fill form from profile on load
  useEffect(() => {
    if (!profile) return;
    const nameParts = (profile.full_name ?? '').split(' ');
    const defaultAddr = profile.addresses?.find((a) => a.isDefault) ?? profile.addresses?.[0];

    setForm((f) => ({
      ...f,
      firstName: nameParts[0] ?? '',
      lastName: nameParts.slice(1).join(' ') ?? '',
      phone: profile.phone ?? '',
      email: user?.email ?? '',
      ...(defaultAddr ? {
        address: defaultAddr.street,
        city: defaultAddr.city,
        state: defaultAddr.state,
        pincode: defaultAddr.pincode,
        landmark: defaultAddr.landmark ?? '',
      } : {}),
    }));

    if (defaultAddr) setSelectedAddressId(defaultAddr.id);
  }, [profile, user]);

  // When user selects a saved address
  useEffect(() => {
    if (!profile) return;
    if (selectedAddressId === 'new') return;
    const addr = profile.addresses?.find((a) => a.id === selectedAddressId);
    if (!addr) return;
    setForm((f) => ({
      ...f,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark ?? '',
      phone: addr.phone || f.phone,
    }));
  }, [selectedAddressId, profile]);

  if (authLoading || (count === 0 && !success)) return null;

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit number';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state) e.state = 'Required';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    if (form.payment === 'upi' && !form.upiId.trim()) e.upiId = 'Enter your UPI ID';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Gate: must be logged in
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setPlacing(true);

    const shippingAddress: SavedAddress = {
      id: selectedAddressId !== 'new' ? selectedAddressId : `addr-${Date.now()}`,
      name: `${form.firstName} ${form.lastName}`,
      phone: form.phone,
      street: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      landmark: form.landmark || undefined,
      isDefault: false,
    };

    // Upload / Save address to user's profile in DB if logged in
    if (user) {
      try {
        const existingAddrs = profile?.addresses || [];
        const exists = existingAddrs.some(
          (a) => a.street.toLowerCase() === form.address.toLowerCase() && a.pincode === form.pincode
        );
        let updatedAddrs = existingAddrs;
        if (!exists || selectedAddressId === 'new') {
          const addrToSave: SavedAddress = {
            ...shippingAddress,
            isDefault: existingAddrs.length === 0,
          };
          updatedAddrs = [addrToSave, ...existingAddrs.filter((a) => a.id !== shippingAddress.id)];
          await updateAddresses(user.id, updatedAddrs);
          patchProfile({ addresses: updatedAddrs });
        }
        // Save phone / name to profile if missing
        if (!profile?.phone || !profile?.full_name) {
          await updateProfile(user.id, {
            full_name: profile?.full_name || `${form.firstName} ${form.lastName}`,
            phone: profile?.phone || form.phone,
          });
        }
      } catch (err) {
        console.warn('Could not auto-save address to profile:', err);
      }
    }

    const result = await createOrder({
      userId: user ? user.id : null,
      customerName: `${form.firstName} ${form.lastName}`,
      customerEmail: form.email,
      customerPhone: form.phone,
      shippingAddress,
      paymentMethod: form.payment,
      items,
      total,
      shipping,
    });

    if (result) {
      clearCart();
      setOrderNumber(result.orderNumber);
      setSuccess(true);
      toast('Order placed successfully! 🎉');
    } else {
      toast('Failed to place order. Please try again.', 'error');
    }
    setPlacing(false);
  }

  if (success) {
    return (
      <main>
        <div className="section">
          <div className="checkout-success">
            <div className="success-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--color-success-dark)' }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 style={{ fontSize: 28, marginBottom: 10 }}>Order Placed! 🎉</h1>
            <p style={{ color: 'color-mix(in srgb, var(--color-text) 65%, transparent)', marginBottom: 8, lineHeight: 1.7 }}>
              Thank you, <strong>{form.firstName}</strong>! Your order <strong>{orderNumber}</strong> has been placed successfully.
              We&apos;ll send a confirmation to <strong>{form.email}</strong>.
            </p>
            <p style={{ fontSize: 14, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)', marginBottom: 32 }}>
              📦 Expected delivery: 3–5 business days · Ships from Amritsar
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/profile?tab=orders" className="btn btn-primary btn-large">View My Orders</Link>
              <Link href="/" className="btn btn-secondary btn-large">Continue Shopping</Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <div className="section">
        {/* Header */}
        <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/cart">Cart</Link>
          <span className="breadcrumb-sep">›</span>
          <span>Checkout</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(22px,3vw,32px)', marginBottom: 28 }}>
          Checkout
        </h1>

        {/* Auth notice for guests */}
        {!user && (
          <div style={{ marginBottom: 20, padding: '14px 18px', background: 'var(--color-warning-bg)', border: '1.5px solid var(--color-warning-border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
            <span>🔐</span>
            <span>
              <button type="button" onClick={() => setAuthOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
                Sign in
              </button>
              {' '}to save your order history and auto-fill your address next time.
            </span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} noValidate>
          <div className="checkout-layout">
            {/* LEFT — form */}
            <div>
              {/* Saved addresses (if logged in) */}
              {user && profile?.addresses && profile.addresses.length > 0 && (
                <div className="checkout-section">
                  <div className="checkout-section-title">
                    <span className="checkout-step-num">1</span>
                    Saved Addresses
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {profile.addresses.map((addr) => (
                      <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', border: `1.5px solid ${selectedAddressId === addr.id ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: 10, cursor: 'pointer', background: selectedAddressId === addr.id ? 'var(--color-accent-100)' : 'var(--color-surface-raised)' }}>
                        <input type="radio" name="saved-address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} style={{ marginTop: 2 }} />
                        <div style={{ fontSize: 14 }}>
                          <div style={{ fontWeight: 600 }}>{addr.name}{addr.isDefault && <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--color-success-bg)', color: 'var(--color-success-dark)', padding: '2px 8px', borderRadius: 20 }}>Default</span>}</div>
                          <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>{addr.street}, {addr.city}, {addr.state} — {addr.pincode}</div>
                          {addr.phone && <div style={{ color: 'var(--color-text-subtle)', fontSize: 12 }}>📞 {addr.phone}</div>}
                        </div>
                      </label>
                    ))}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1.5px solid ${selectedAddressId === 'new' ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: 10, cursor: 'pointer' }}>
                      <input type="radio" name="saved-address" checked={selectedAddressId === 'new'} onChange={() => setSelectedAddressId('new')} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>+ Use a new address</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-step-num">{user && profile?.addresses?.length ? '2' : '1'}</span>
                  Contact Information
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-row">
                    <Field label="First name" error={errors.firstName}>
                      <input className="form-input" placeholder="Gurleen" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                    </Field>
                    <Field label="Last name" error={errors.lastName}>
                      <input className="form-input" placeholder="Kaur" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                    </Field>
                  </div>
                  <div className="form-row">
                    <Field label="Phone number" error={errors.phone}>
                      <input className="form-input" type="tel" placeholder="98XXXXXXXX" maxLength={10} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                    </Field>
                    <Field label="Email address" error={errors.email}>
                      <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-step-num">{user && profile?.addresses?.length ? '3' : '2'}</span>
                  Delivery Address
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Field label="Street / House no." error={errors.address}>
                    <input className="form-input" placeholder="249, Block-D, Thakur ji Estate" value={form.address} onChange={(e) => set('address', e.target.value)} />
                  </Field>
                  <Field label="Landmark (optional)" error={errors.landmark}>
                    <input className="form-input" placeholder="Near main market" value={form.landmark} onChange={(e) => set('landmark', e.target.value)} />
                  </Field>
                  <div className="form-row">
                    <Field label="City" error={errors.city}>
                      <input className="form-input" placeholder="Amritsar" value={form.city} onChange={(e) => set('city', e.target.value)} />
                    </Field>
                    <Field label="State" error={errors.state}>
                      <select className="form-input" value={form.state} onChange={(e) => set('state', e.target.value)}>
                        <option value="">Select state</option>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Pincode" error={errors.pincode}>
                    <input className="form-input" placeholder="143001" maxLength={6} value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Payment */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-step-num">{user && profile?.addresses?.length ? '4' : '3'}</span>
                  Payment Method
                </div>
                <div className="payment-options">
                  <PaymentTile id="pay-upi" value="upi" checked={form.payment === 'upi'} onChange={() => set('payment', 'upi')} icon="📱" label="UPI" sub="PhonePe, GPay, Paytm, BHIM" />
                  {form.payment === 'upi' && (
                    <div style={{ paddingLeft: 12 }}>
                      <Field label="Your UPI ID" error={errors.upiId}>
                        <input className="form-input" placeholder="yourname@upi" value={form.upiId} onChange={(e) => set('upiId', e.target.value)} />
                      </Field>
                    </div>
                  )}
                  <PaymentTile id="pay-card" value="card" checked={form.payment === 'card'} onChange={() => set('payment', 'card')} icon="💳" label="Debit / Credit Card" sub="Visa, Mastercard, RuPay" />
                  <PaymentTile id="pay-netbanking" value="netbanking" checked={form.payment === 'netbanking'} onChange={() => set('payment', 'netbanking')} icon="🏦" label="Net Banking" sub="All major Indian banks" />
                  <PaymentTile id="pay-cod" value="cod" checked={form.payment === 'cod'} onChange={() => set('payment', 'cod')} icon="🏠" label="Cash on Delivery" sub="Pay when you receive" />
                </div>
              </div>

              {/* Place order (mobile) */}
              <div className="show-mobile" style={{ display: 'block' }}>
                <PlaceOrderBtn total={grandTotal} placing={placing} />
              </div>
            </div>

            {/* RIGHT — order summary */}
            <div className="checkout-order-col">
              <div className="checkout-order-summary">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, margin: '0 0 16px' }}>Your Order</h2>
                {items.map((item) => (
                  <div key={`${item.id}-${item.size ?? ''}`} className="order-line-item">
                    <div className="order-line-img">
                      <Image src={item.image} alt={item.name} fill sizes="52px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="order-line-name">
                      {item.name}
                      <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', background: 'var(--color-accent-100)', border: '1px solid var(--color-accent-200)', padding: '1px 6px', borderRadius: 4, marginTop: 3 }}>
                        Size: {item.size || 'M'}
                      </span>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 400, opacity: 0.65, marginTop: 2 }}>Qty: {item.quantity}</span>
                    </div>
                    <span className="order-line-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="cart-summary-row"><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                  <div className="cart-summary-row"><span>Shipping</span><span style={{ color: shipping === 0 ? 'var(--color-success-dark)' : 'inherit' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                  <div className="cart-summary-row cart-summary-total"><span>Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
                </div>
                <div className="hide-mobile">
                  <PlaceOrderBtn total={grandTotal} placing={placing} />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Auth modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        message="Sign in to place your order and track it easily."
      />

      <Footer />
    </main>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <span className="form-label">{label}</span>
      {children}
      {error && <span style={{ fontSize: 11, color: 'var(--color-accent)', marginTop: 2 }}>{error}</span>}
    </div>
  );
}

function PaymentTile({ id, value, checked, onChange, icon, label, sub }: {
  id: string; value: string; checked: boolean; onChange: () => void;
  icon: string; label: string; sub: string;
}) {
  return (
    <label className="payment-tile" htmlFor={id}>
      <input id={id} type="radio" name="payment" value={value} checked={checked} onChange={onChange} />
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <div className="payment-tile-label">{label}</div>
        <div className="payment-tile-sub">{sub}</div>
      </div>
    </label>
  );
}

function PlaceOrderBtn({ total, placing }: { total: number; placing: boolean }) {
  return (
    <button type="submit" className="btn btn-primary btn-block btn-large" disabled={placing} style={{ marginTop: 16, justifyContent: 'center', borderRadius: 'var(--radius-md)', opacity: placing ? 0.75 : 1 }}>
      {placing ? (
        <><span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', marginRight: 6 }}>⟳</span>Placing order…</>
      ) : (
        `Place Order · ₹${total.toLocaleString('en-IN')}`
      )}
    </button>
  );
}
