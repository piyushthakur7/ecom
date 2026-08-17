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
import { loadRazorpayScript } from '@/lib/razorpay';
import { IconCreditCard, IconPackage, IconShieldCheck, IconPhone, IconZap, IconHome } from '@/components/icons';
import type { SavedAddress } from '@/lib/types';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  payment: 'razorpay' | 'cod';
};

const emptyForm: FormState = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  payment: 'razorpay',
};

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): { open: () => void };
}

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
  const [paymentId, setPaymentId] = useState('');
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

    // Auto-save address & user details to profile
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

    // ── Payment Route A: Razorpay Online Payment ────────────────────────
    if (form.payment === 'razorpay') {
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast('Razorpay SDK failed to load. Check your internet connection.', 'error');
          setPlacing(false);
          return;
        }

        // 1. Create Razorpay order on server
        const createRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: grandTotal }),
        });

        const orderData = await createRes.json();

        if (!createRes.ok || !orderData.success) {
          toast(orderData.error || 'Failed to initialize payment gateway', 'error');
          setPlacing(false);
          return;
        }

        // 2. Launch Razorpay Checkout Modal
        const RazorpayWindow = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;
        const options: RazorpayOptions = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Saanshika Ethnics',
          description: `Payment for Order (${items.length} items)`,
          order_id: orderData.orderId,
          handler: async function (response: RazorpayResponse) {
            try {
              // 3. Verify signature on server
              const verifyRes = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderDetails: {
                    userId: user ? user.id : null,
                    customerName: `${form.firstName} ${form.lastName}`,
                    customerEmail: form.email,
                    customerPhone: form.phone,
                    shippingAddress,
                    items,
                    total,
                    shipping,
                  },
                }),
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.success) {
                clearCart();
                setOrderNumber(verifyData.orderNumber);
                setPaymentId(verifyData.paymentId);
                setSuccess(true);
                toast('Payment successful! Order placed');
              } else {
                toast(verifyData.error || 'Payment verification failed', 'error');
              }
            } catch (err) {
              console.error('Verification error:', err);
              toast('An error occurred verifying your payment.', 'error');
            } finally {
              setPlacing(false);
            }
          },
          prefill: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            contact: form.phone,
          },
          theme: {
            color: '#6b1d2f', // Deep Crimson Maroon theme!
          },
          modal: {
            ondismiss: function () {
              setPlacing(false);
              toast('Payment window closed.', 'info');
            },
          },
        };

        const rzp = new RazorpayWindow(options);
        rzp.open();
      } catch (err) {
        console.error('Razorpay flow error:', err);
        toast('Failed to initiate online payment.', 'error');
        setPlacing(false);
      }
      return;
    }

    // ── Payment Route B: Cash on Delivery (COD) ─────────────────────────
    const result = await createOrder({
      userId: user ? user.id : null,
      customerName: `${form.firstName} ${form.lastName}`,
      customerEmail: form.email,
      customerPhone: form.phone,
      shippingAddress,
      paymentMethod: 'cod',
      items,
      total,
      shipping,
    });

    if (result) {
      clearCart();
      setOrderNumber(result.orderNumber);
      setPaymentId('');
      setSuccess(true);
      toast('COD Order placed successfully!');
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
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 style={{ fontSize: 28, marginBottom: 10, color: 'var(--color-text)' }}>Order Confirmed!</h1>
            <p style={{ color: 'color-mix(in srgb, var(--color-text) 75%, transparent)', marginBottom: 8, lineHeight: 1.7 }}>
              Thank you, <strong>{form.firstName}</strong>! Your order <strong>{orderNumber}</strong> has been placed successfully.
              {paymentId && (
                <span style={{ display: 'block', fontSize: 13, color: '#6b1d2f', fontWeight: 600, marginTop: 4 }}>
                  <IconCreditCard size={14} style={{ verticalAlign: -2, marginRight: 4, display: 'inline-block' }} />Razorpay Payment ID: {paymentId}
                </span>
              )}
            </p>
            <p style={{ fontSize: 14, color: 'color-mix(in srgb, var(--color-text) 65%, transparent)', marginBottom: 32 }}>
              <IconPackage size={14} style={{ verticalAlign: -2, marginRight: 4, display: 'inline-block' }} />We will send confirmation & tracking updates to <strong>{form.email}</strong>. Expected delivery: 3–5 business days.
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
          <div style={{ marginBottom: 20, padding: '14px 18px', background: '#fff9e6', border: '1.5px solid #f5c842', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
            <IconShieldCheck size={18} />
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
                    Saved Delivery Addresses
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {profile.addresses.map((addr) => (
                      <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', border: `1.5px solid ${selectedAddressId === addr.id ? 'var(--color-accent)' : '#e0e0e0'}`, borderRadius: 10, cursor: 'pointer', background: selectedAddressId === addr.id ? 'var(--color-accent-100)' : '#fff' }}>
                        <input type="radio" name="saved-address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} style={{ marginTop: 2 }} />
                        <div style={{ fontSize: 14 }}>
                          <div style={{ fontWeight: 600 }}>{addr.name}{addr.isDefault && <span style={{ marginLeft: 8, fontSize: 11, background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 20 }}>Default</span>}</div>
                          <div style={{ color: '#666', marginTop: 2 }}>{addr.street}, {addr.city}, {addr.state} — {addr.pincode}</div>
                          {addr.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#888', fontSize: 12 }}><IconPhone size={12} />{addr.phone}</div>}
                        </div>
                      </label>
                    ))}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1.5px solid ${selectedAddressId === 'new' ? 'var(--color-accent)' : '#e0e0e0'}`, borderRadius: 10, cursor: 'pointer' }}>
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

              {/* Delivery Address */}
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

              {/* Payment Method */}
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-step-num">{user && profile?.addresses?.length ? '4' : '3'}</span>
                  Payment Method
                </div>
                <div className="payment-options">
                  {/* Razorpay Online */}
                  <label className={`payment-tile ${form.payment === 'razorpay' ? 'selected' : ''}`} htmlFor="pay-razorpay" style={{ border: form.payment === 'razorpay' ? '2px solid var(--color-accent)' : '1.5px solid var(--color-divider)', background: form.payment === 'razorpay' ? 'var(--color-accent-100)' : '#fff', borderRadius: 10, padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <input id="pay-razorpay" type="radio" name="payment" value="razorpay" checked={form.payment === 'razorpay'} onChange={() => set('payment', 'razorpay')} style={{ marginTop: 3 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconZap size={18} />
                        <span className="payment-tile-label" style={{ fontWeight: 700, fontSize: 15 }}>Online Payment (Razorpay)</span>
                        <span style={{ background: 'var(--color-accent)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase' }}>Recommended</span>
                      </div>
                      <div className="payment-tile-sub" style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                        UPI (GPay, PhonePe, Paytm, BHIM), Credit / Debit Cards, NetBanking & Wallets
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`payment-tile ${form.payment === 'cod' ? 'selected' : ''}`} htmlFor="pay-cod" style={{ border: form.payment === 'cod' ? '2px solid var(--color-accent)' : '1.5px solid var(--color-divider)', background: form.payment === 'cod' ? 'var(--color-accent-100)' : '#fff', borderRadius: 10, padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <input id="pay-cod" type="radio" name="payment" value="cod" checked={form.payment === 'cod'} onChange={() => set('payment', 'cod')} style={{ marginTop: 3 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconHome size={18} />
                        <span className="payment-tile-label" style={{ fontWeight: 700, fontSize: 15 }}>Cash on Delivery (COD)</span>
                      </div>
                      <div className="payment-tile-sub" style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                        Pay cash directly to the delivery partner when your package arrives
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Place order (mobile button) */}
              <div className="show-mobile" style={{ display: 'block' }}>
                <PlaceOrderBtn total={grandTotal} placing={placing} isRazorpay={form.payment === 'razorpay'} />
              </div>
            </div>

            {/* RIGHT — order summary */}
            <div className="checkout-order-col">
              <div className="checkout-order-summary">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, margin: '0 0 16px' }}>Your Order Summary</h2>
                {items.map((item) => (
                  <div key={`${item.id}-${item.size ?? ''}`} className="order-line-item">
                    <div className="order-line-img">
                      <Image src={item.image} alt={item.name} fill sizes="52px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="order-line-name">
                      {item.name}
                      <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', background: 'var(--color-accent-100)', border: '1px solid var(--color-accent-300)', padding: '1px 6px', borderRadius: 4, marginTop: 3 }}>
                        Size: {item.size || 'M'}
                      </span>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 400, opacity: 0.65, marginTop: 2 }}>Qty: {item.quantity}</span>
                    </div>
                    <span className="order-line-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="cart-summary-row"><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div>
                  <div className="cart-summary-row"><span>Shipping</span><span style={{ color: shipping === 0 ? '#2e7d32' : 'inherit' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                  <div className="cart-summary-row cart-summary-total"><span>Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
                </div>
                <div className="hide-mobile">
                  <PlaceOrderBtn total={grandTotal} placing={placing} isRazorpay={form.payment === 'razorpay'} />
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

function PlaceOrderBtn({ total, placing, isRazorpay }: { total: number; placing: boolean; isRazorpay: boolean }) {
  return (
    <button
      type="submit"
      className="btn btn-primary btn-block btn-large"
      disabled={placing}
      style={{
        marginTop: 16,
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        opacity: placing ? 0.75 : 1,
        padding: '14px 28px',
        fontSize: 16,
        fontWeight: 800,
      }}
    >
      {placing ? (
        <><span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', marginRight: 6 }}>⟳</span>Processing…</>
      ) : isRazorpay ? (
        `Pay Now · ₹${total.toLocaleString('en-IN')}`
      ) : (
        `Place Order (COD) · ₹${total.toLocaleString('en-IN')}`
      )}
    </button>
  );
}
