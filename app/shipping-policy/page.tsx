import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shipping Policy — ' + siteConfig.name,
  description: 'Dispatch times, delivery estimates and shipping charges.',
};

const LAST_UPDATED = '18 August 2026';

export default function ShippingPolicyPage() {
  return (
    <main>
      <div className="section legal-page">
        <span className="section-kicker">Legal</span>
        <h1 className="section-title" style={{ marginBottom: 8 }}>Shipping Policy</h1>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 32 }}>
          Last updated {LAST_UPDATED}
        </p>

        <h2>Where we ship</h2>
        <p>We deliver across India. We do not ship internationally at the moment.</p>

        <h2>Dispatch time</h2>
        <p>
          Orders are packed and handed to our courier within <strong>24 to 48 hours</strong>
          of being placed, excluding Sundays and public holidays. Orders placed after
          6pm are processed the next working day.
        </p>

        <h2>Delivery estimates</h2>
        <ul>
          <li><strong>Punjab and North India</strong> &mdash; 2 to 4 working days after dispatch</li>
          <li><strong>Rest of India</strong> &mdash; 4 to 7 working days after dispatch</li>
          <li><strong>Remote and hill areas</strong> &mdash; up to 10 working days</li>
        </ul>
        <p>
          These are estimates from our courier partners, not guarantees. Festive
          periods and weather disruptions can add a few days.
        </p>

        <h2>Shipping charges</h2>
        <ul>
          <li>Orders of <strong>₹999 and above</strong> ship free.</li>
          <li>Below ₹999, a flat fee of <strong>₹99</strong> applies.</li>
        </ul>
        <p>The fee is shown at checkout before you pay, never added afterwards.</p>

        <h2>Tracking</h2>
        <p>
          You will receive the order number by email as soon as the order is confirmed.
          Track its progress any time on our <Link href="/track-order">order tracking page</Link>,
          or from the Orders tab in your <Link href="/profile">profile</Link>.
        </p>

        <h2>Incorrect address</h2>
        <p>
          Please check your address and phone number carefully before paying. If a parcel
          is returned to us because the address was wrong or nobody was reachable, we can
          resend it once you cover the return and redelivery charges.
        </p>

        <h2>Delays and lost parcels</h2>
        <p>
          If your order has not moved for more than 7 working days, write to us at{' '}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> with your order
          number and we will chase the courier on your behalf.
        </p>

      </div>
      <Footer />
    </main>
  );
}
