'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useFavourites } from '@/components/favourites-context';
import { useCart } from '@/components/cart-context';
import { FavouriteButton } from '@/components/favourite-button';
import { StarRating } from '@/components/star-rating';
import { Footer } from '@/components/footer';
import { IconHeart } from '@/components/icons';
import { cdnImage } from '@/lib/cloudinary';

export default function FavouritesPage() {
  const { items, count } = useFavourites();
  const { addToCart } = useCart();

  return (
    <main>
      <div className="section">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <span className="section-kicker">Your wishlist</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(24px,3.5vw,36px)', margin: 0 }}>
            Favourites {count > 0 && <span style={{ fontSize: '0.6em', opacity: 0.6 }}>({count})</span>}
          </h1>
        </div>

        {count === 0 ? (
          <div className="favourites-empty">
            <div className="favourites-empty-icon"><IconHeart size={56} /></div>
            <h2 style={{ fontSize: 22, marginBottom: 10 }}>Nothing saved yet</h2>
            <p style={{ color: 'color-mix(in srgb, var(--color-text) 65%, transparent)', marginBottom: 28 }}>
              Tap the heart on any product to save it here.
            </p>
            <Link href="/" className="btn btn-primary btn-large">Browse Collection</Link>
          </div>
        ) : (
          <div className="product-grid">
            {items.map((item) => (
              <div key={item.id} className="product-card" style={{ position: 'relative' }}>
                {/* Image */}
                <Link href={`/product/${item.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div
                    className="media-clip"
                    style={{ width: '100%', aspectRatio: '3 / 4', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}
                  >
                    <Image
                      src={cdnImage(item.image, 600)}
                      alt={item.name}
                      fill
                      sizes="(max-width: 600px) 50vw, (max-width: 1280px) 33vw, 280px"
                      style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    />
                  </div>
                </Link>

                {/* Heart button (overlay) — clicking removes from favourites */}
                <FavouriteButton product={item} variant="overlay" />

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Link
                    href={`/product/${item.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}
                  >
                    {item.name}
                  </Link>
                  <StarRating rating={item.rating} reviewCount={item.reviewCount} />
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{item.price}</span>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() =>
                    addToCart({
                      id: item.id,
                      name: item.name,
                      price: parseInt(item.price.replace(/[₹,]/g, ''), 10),
                      priceDisplay: item.price,
                      image: item.image,
                      category: item.category,
                    })
                  }
                  aria-label={`Add ${item.name} to cart`}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
