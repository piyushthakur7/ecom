import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms & Conditions — ' + siteConfig.name,
  description: 'The terms that apply when you shop with us.',
};

const LAST_UPDATED = '18 August 2026';

export default function TermsPage() {
  return (
    <main>
      <div className="section legal-page">
        <span className="section-kicker">Legal</span>
        <h1 className="section-title" style={{ marginBottom: 8 }}>Terms & Conditions</h1>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 32 }}>
          Last updated {LAST_UPDATED}
        </p>

        <p>
          By browsing or ordering from this website you agree to the terms below. Please
          read them alongside our <Link href="/privacy-policy">Privacy Policy</Link>,{' '}
          <Link href="/shipping-policy">Shipping Policy</Link> and{' '}
          <Link href="/returns-refunds">Returns &amp; Refunds</Link> policy.
        </p>

        <h2>Who we are</h2>
        <p>
          This store is operated by {siteConfig.name} from Amritsar, Punjab, India.
          Our contact address appears at the bottom of this page.
        </p>

        <h2>Your account</h2>
        <p>
          You are responsible for keeping your account secure and for everything done
          through it. Tell us straight away if you think someone else has access. We may
          suspend an account that is used fraudulently or abusively.
        </p>

        <h2>Products and colours</h2>
        <p>
          We photograph every product as faithfully as we can, but screens vary and
          handloom and block-printed fabrics carry natural irregularities. Slight
          differences in colour, print placement and weave are characteristics of the
          craft, not defects.
        </p>

        <h2>Pricing and availability</h2>
        <p>
          All prices are in Indian Rupees and include applicable taxes unless stated
          otherwise. Prices and availability can change without notice. If an item is
          mispriced or goes out of stock after you order, we will contact you and refund
          you in full rather than ship something you did not choose.
        </p>

        <h2>Orders</h2>
        <p>
          Your order is an offer to buy. It is accepted only when we confirm it by email.
          We may decline an order &mdash; for example where stock has run out, the address
          cannot be served, or we suspect fraud.
        </p>

        <h2>Payment</h2>
        <p>
          Online payments are handled by Razorpay. We never see or store your card, UPI
          or bank credentials. Cash on delivery is available on eligible orders and may
          be withdrawn for a given address at our discretion.
        </p>

        <h2>Coupons</h2>
        <p>
          Discount codes are single-use unless stated otherwise, cannot be exchanged for
          cash, and may be withdrawn at any time. First-order codes are valid only on a
          customer&apos; first purchase. We may cancel an order where a code has been
          used in bad faith.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The photographs, text, designs and logo on this site belong to us and may not be
          copied or reused for commercial purposes without written permission.
        </p>

        <h2>Liability</h2>
        <p>
          Our liability for any order is limited to the amount you paid for it. We are not
          liable for indirect losses. Nothing here removes rights you have under the
          Consumer Protection Act, 2019.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms are governed by Indian law, and the courts of Amritsar, Punjab have
          jurisdiction over any dispute.
        </p>

        <h2>Contact</h2>
        <p>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </p>
        <p className="text-muted" style={{ lineHeight: 1.7 }}>
          {siteConfig.address.map((line) => (
            <span key={line} style={{ display: 'block' }}>{line}</span>
          ))}
        </p>

      </div>
      <Footer />
    </main>
  );
}
