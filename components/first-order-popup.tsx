'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from './auth-context';
import { getUserOrders } from '@/lib/services/orders.service';
import { COUPONS, COUPON_STORAGE_KEY, POPUP_SEEN_KEY } from '@/lib/coupons';
import { IconX, IconCheck, IconSparkles } from './icons';

const FIRST_ORDER_COUPON = COUPONS.find((c) => c.firstOrderOnly)!;
const SHOW_AFTER_MS = 4000;

export function FirstOrderPopup() {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function maybeShow() {
      // Already seen or already dismissed - never nag twice.
      try {
        if (localStorage.getItem(POPUP_SEEN_KEY)) return;
      } catch {
        return; // storage blocked: skip rather than show on every page view
      }

      // Signed-in shoppers who have ordered before are not first-order users.
      if (user) {
        const orders = await getUserOrders(user.id);
        if (orders.length > 0) {
          try { localStorage.setItem(POPUP_SEEN_KEY, 'not-eligible'); } catch { /* ignore */ }
          return;
        }
      }

      if (cancelled) return;
      timer = setTimeout(() => { if (!cancelled) setOpen(true); }, SHOW_AFTER_MS);
    }

    maybeShow();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [user, isLoading]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    setOpen(false);
    try { localStorage.setItem(POPUP_SEEN_KEY, String(Date.now())); } catch { /* ignore */ }
  }

  function claim() {
    // Remember the code so checkout can apply it without retyping.
    try { localStorage.setItem(COUPON_STORAGE_KEY, FIRST_ORDER_COUPON.code); } catch { /* ignore */ }
    navigator.clipboard?.writeText(FIRST_ORDER_COUPON.code).catch(() => {});
    setCopied(true);
    setTimeout(dismiss, 1200);
  }

  if (!open) return null;

  return (
    <div className="promo-overlay" role="dialog" aria-modal="true" aria-labelledby="promo-title" onClick={dismiss}>
      <div className="promo-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="promo-close" onClick={dismiss} aria-label="Close offer">
          <IconX size={18} />
        </button>

        <span className="promo-kicker">
          <IconSparkles size={14} /> Welcome offer
        </span>

        <h2 id="promo-title" className="promo-title">
          15% off your<br />first order
        </h2>

        <p className="promo-body">
          Use the code below at checkout on orders over
          ₹{FIRST_ORDER_COUPON.minSubtotal.toLocaleString('en-IN')}.
        </p>

        <div className="promo-code">{FIRST_ORDER_COUPON.code}</div>

        <button type="button" className="btn btn-primary btn-block btn-large" onClick={claim}>
          {copied ? <><IconCheck size={16} /> Code copied</> : 'Claim my 15% off'}
        </button>

        <Link href="/shop" className="promo-skip" onClick={dismiss}>
          Just browsing
        </Link>
      </div>
    </div>
  );
}
