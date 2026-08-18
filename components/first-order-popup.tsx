'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    let timer: ReturnType<typeof setTimeout> | undefined;

    // ?offer=preview shows it unconditionally, so the shop owner can check the
    // popup without wiping storage or making a throwaway account. Read off the
    // URL rather than useSearchParams(), which would force every page that
    // renders this layout to become dynamic.
    const preview =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('offer') === 'preview';

    async function maybeShow() {
      if (!preview) {
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
      }

      if (cancelled) return;
      timer = setTimeout(() => { if (!cancelled) setOpen(true); }, preview ? 300 : SHOW_AFTER_MS);
    }

    maybeShow();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
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
    const preview =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('offer') === 'preview';
    if (preview) return; // previewing must not mark the offer as seen
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

        {/* Photo half - makes it read as an ad rather than a system dialog */}
        <div className="promo-media">
          <Image
            src="/images/hero/banner-1.jpg"
            alt=""
            fill
            sizes="(max-width: 700px) 100vw, 300px"
            style={{ objectFit: 'cover' }}
            priority={false}
          />
          <span className="promo-media-badge">15%<small>OFF</small></span>
        </div>

        {/* Copy half */}
        <div className="promo-content">
          <span className="promo-kicker">
            <IconSparkles size={14} /> Welcome offer
          </span>

          <h2 id="promo-title" className="promo-title">
            15% off your<br />first order
          </h2>

          <p className="promo-body">
            New here? Take 15% off on orders over
            ₹{FIRST_ORDER_COUPON.minSubtotal.toLocaleString('en-IN')} — kurtis,
            suits, sarees, everything.
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
    </div>
  );
}
