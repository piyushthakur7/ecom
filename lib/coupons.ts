/**
 * Discount coupons.
 *
 * Kept deliberately small: a code, what it takes off, and the rules for when
 * it may be used. `validateCoupon` is the single place that decides whether a
 * code applies, so the cart, the checkout summary and the amount actually
 * charged can never drift apart.
 */

export type Coupon = {
  code: string;
  label: string;
  /** Percentage off the item subtotal (shipping is never discounted). */
  percentOff: number;
  /** Minimum item subtotal, in rupees, before the code is allowed. */
  minSubtotal: number;
  /** Cap on the rupee value of the discount, so a huge cart can't drain margin. */
  maxDiscount: number;
  /** First-order codes are hidden from the manual field and auto-applied. */
  firstOrderOnly: boolean;
};

export const COUPONS: Coupon[] = [
  {
    code: 'FIRST15',
    label: '15% off your first order',
    percentOff: 15,
    minSubtotal: 999,
    maxDiscount: 1500,
    firstOrderOnly: true,
  },
];

export function findCoupon(code: string): Coupon | null {
  const wanted = code.trim().toUpperCase();
  return COUPONS.find((c) => c.code === wanted) ?? null;
}

export type CouponResult =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; reason: string };

/**
 * @param subtotal   item subtotal in rupees, before shipping
 * @param isFirstOrder whether this customer has no previous orders
 */
export function validateCoupon(code: string, subtotal: number, isFirstOrder: boolean): CouponResult {
  const coupon = findCoupon(code);
  if (!coupon) return { ok: false, reason: 'That coupon code is not valid.' };

  if (coupon.firstOrderOnly && !isFirstOrder) {
    return { ok: false, reason: 'This code is for first orders only.' };
  }

  if (subtotal < coupon.minSubtotal) {
    const short = coupon.minSubtotal - subtotal;
    return { ok: false, reason: `Add ₹${short.toLocaleString('en-IN')} more to use this code.` };
  }

  const raw = Math.floor((subtotal * coupon.percentOff) / 100);
  const discount = Math.min(raw, coupon.maxDiscount);
  return { ok: true, coupon, discount };
}

/** localStorage keys shared by the popup and the checkout page. */
export const COUPON_STORAGE_KEY = 'saanshika:first-order-coupon';
export const POPUP_SEEN_KEY = 'saanshika:first-order-popup-seen';
