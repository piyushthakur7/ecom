import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  description: `How ${siteConfig.name} collects, uses and protects your personal information.`,
};

const LAST_UPDATED = '18 August 2026';

export default function PrivacyPolicyPage() {
  return (
    <main>
      <div className="section legal-page" style={{ maxWidth: 820 }}>
        <span className="section-kicker">Legal</span>
        <h1 className="section-title" style={{ marginBottom: 8 }}>Privacy Policy</h1>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 32 }}>
          Last updated {LAST_UPDATED}
        </p>

        <p>
          {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) runs this store from Amritsar, Punjab.
          This policy explains what we collect when you browse or order from us, why we
          collect it, and what control you have over it.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Account details</strong> — your name, email address and phone number.
            If you sign in with Google we receive your name, email and profile picture
            from Google; we never see your Google password.
          </li>
          <li>
            <strong>Order details</strong> — delivery address, items ordered, order value
            and order history.
          </li>
          <li>
            <strong>Payment information</strong> — handled entirely by Razorpay. Card
            numbers, UPI IDs and bank credentials are entered on Razorpay&apos;s systems
            and are never stored on our servers. We only receive a payment reference and
            whether the payment succeeded.
          </li>
          <li>
            <strong>Usage data</strong> — basic technical information such as your browser
            type and the pages you visit, used to keep the site working.
          </li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To process, pack and deliver your orders, and to handle returns.</li>
          <li>To contact you about an order — confirmation, dispatch and delivery updates.</li>
          <li>To respond when you write to us with a question or complaint.</li>
          <li>To send offers and new-collection updates, but only if you subscribed. Every email has an unsubscribe link.</li>
        </ul>

        <h2>Who we share it with</h2>
        <p>
          We do not sell your personal information. We share it only with the partners
          needed to run the store: our payment gateway (Razorpay), our delivery partners,
          and our hosting and database providers. Each receives only what it needs to do
          its job. We may also disclose information where the law requires it.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Order records are retained as long as needed for accounting, tax and warranty
          purposes. Account information is kept until you ask us to delete it.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>View and edit your saved addresses and details from your <Link href="/profile">profile</Link>.</li>
          <li>Unsubscribe from marketing email at any time using the link in any email.</li>
          <li>
            Ask for a copy of your data, or ask us to correct or delete it, by emailing{' '}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We use cookies and similar browser storage to keep you signed in and to remember
          your cart and wishlist between visits. Blocking them will stop those features
          from working, but you can still browse the store.
        </p>

        <h2>Security</h2>
        <p>
          Traffic to this site is encrypted in transit. Payments run through Razorpay, a
          PCI-DSS compliant gateway. No system is perfectly secure, so please use a strong,
          unique password and tell us straight away if you suspect a problem.
        </p>

        <h2>Children</h2>
        <p>
          This store is not intended for children under 18. We do not knowingly collect
          information from them.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If we update this policy we will change the date at the top of this page. Material
          changes will also be announced on the site.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about this policy or your data? Write to{' '}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or post to:
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
