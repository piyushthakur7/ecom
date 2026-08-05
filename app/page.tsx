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
    <main>
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
    </main>
  );
}
