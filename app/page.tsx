import { Hero } from '@/components/hero';
import { VideoSection } from '@/components/product-videos';
import { Categories } from '@/components/categories';
import { Featured } from '@/components/featured';
import { Features } from '@/components/features';
import { Testimonials } from '@/components/testimonials';
import { Newsletter } from '@/components/newsletter';
import { Footer } from '@/components/footer';
import { FirstOrderPopup } from '@/components/first-order-popup';
import { siteConfig } from '@/lib/site';
import { getHeroSlides } from '@/lib/services/products.service';

/** Catalogue content changes rarely; re-fetch the hero at most every 5 minutes. */
export const revalidate = 300;

export default async function HomePage() {
  const heroSlides = await getHeroSlides();

  return (
    <main>
      <Hero initialSlides={heroSlides} />
      
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
      <hr className="rule" />
      <VideoSection />
      <Newsletter />
      
      <Footer />

      {/* Welcome offer runs on the homepage only, so it can never
          interrupt someone in the middle of cart or checkout. */}
      <FirstOrderPopup />
    </main>
  );
}
