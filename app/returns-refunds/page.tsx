import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Returns & Refunds — ' + siteConfig.name,
  description: 'Our 3-day return window, what qualifies, and how refunds are processed.',
};

const LAST_UPDATED = '18 August 2026';

export default function ReturnsRefundsPage() {
  return (
    <main>
      <div className="section legal-page">
        <span className="section-kicker">Legal</span>
        <h1 className="section-title" style={{ marginBottom: 8 }}>Returns & Refunds</h1>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 32 }}>
          Last updated {LAST_UPDATED}
        </p>

        <h2>Return window</h2>
        <p>
          You may request a return within <strong>3 days of delivery</strong>. After
          3 days we are unable to accept the item back.
        </p>

        <h2>Condition of the item</h2>
        <p>To be accepted, the item must come back:</p>
        <ul>
          <li>Unworn, unwashed and unaltered</li>
          <li>With all original tags still attached</li>
          <li>In its original packaging</li>
          <li>Free of stains, perfume, deodorant marks and damage</li>
        </ul>

        <h2>What cannot be returned</h2>
        <ul>
          <li>Unstitched fabric that has been cut or tailored</li>
          <li>Items bought during a clearance sale, unless they arrived damaged</li>
          <li>Anything returned without its original tags</li>
        </ul>

        <h2>Damaged or wrong item</h2>
        <p>
          If your parcel arrives damaged, or the item is not what you ordered, email us
          within <strong>48 hours of delivery</strong> with photographs of the item and
          the packaging. We will arrange a replacement or a full refund including
          shipping, at no cost to you.
        </p>

        <h2>How to start a return</h2>
        <p>
          Email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> with your
          order number and the reason for the return. We will confirm the return address
          and next steps within one working day.
        </p>

        <h2>Return shipping</h2>
        <p>
          For change-of-mind returns the return courier cost is yours. For damaged,
          defective or incorrect items, we cover it.
        </p>

        <h2>Refunds</h2>
        <ul>
          <li>
            Refunds are processed within <strong>5 to 7 working days</strong> of the
            returned item reaching us and passing inspection.
          </li>
          <li>
            Online payments are refunded to the original payment method through Razorpay.
            Your bank may take a further 3 to 5 days to show it.
          </li>
          <li>
            COD orders are refunded by bank transfer; we will ask for your account details.
          </li>
          <li>
            The original shipping fee is refunded only when the return is our fault.
          </li>
        </ul>

        <h2>Cancellations</h2>
        <p>
          An order can be cancelled free of charge any time before it is dispatched. Once
          it has shipped, please use the return process above.
        </p>

        <h2>Exchanges</h2>
        <p>
          We do not process direct exchanges. Return the item for a refund and place a
          fresh order for the size or colour you want, so you are not waiting twice.
        </p>

      </div>
      <Footer />
    </main>
  );
}
