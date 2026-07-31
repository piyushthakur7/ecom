import { CartProvider } from '@/components/cart-context';
import { Marquee } from '@/components/marquee';
import { Nav } from '@/components/nav';
import { Hero } from '@/components/hero';
import { Categories } from '@/components/categories';
import { Featured } from '@/components/featured';
import { Features } from '@/components/features';
import { Testimonials } from '@/components/testimonials';
import { Newsletter } from '@/components/newsletter';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/site';

export default function HomePage() {
  return (
    <CartProvider>
      <div style={{ minHeight: '100vh' }}>
        <Marquee />
        <Nav />
        <Hero />
        <hr className="rule" />
        <Categories />
        <hr className="rule" />
        <Featured />
        <hr className="rule" />
        <Features />
        {siteConfig.showTestimonials && (
          <>
            <hr className="rule" />
            <Testimonials />
          </>
        )}
        <Newsletter />
        <Footer />
      </div>
    </CartProvider>
  );
}
