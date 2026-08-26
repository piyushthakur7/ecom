'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

type VideoItem = {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  productLink: string;
  tag: string;
};

/**
 * A muted, looping reel that only fetches once it scrolls into view.
 *
 * `autoPlay` makes the browser download the file immediately regardless of
 * `preload`, and these four reels are 16 MB between them — enough to saturate
 * the connection and hold up everything above the fold. Starting playback from
 * an IntersectionObserver keeps the autoplay behaviour but defers the bytes to
 * the point where someone can actually see them.
 */
function ReelVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer (or reduced motion): fall back to loading it on demand.
    if (typeof IntersectionObserver === 'undefined') {
      el.preload = 'metadata';
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!el.src) el.src = src;
          void el.play().catch(() => {/* autoplay can be refused; leave paused */});
        } else {
          el.pause();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      loop
      muted
      playsInline
      preload="none"
      aria-label="Product reel"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

const sampleVideos: VideoItem[] = [
  {
    id: 'v1',
    title: 'Designer Runway & Festive Dress Showcase',
    category: 'Couture & Dresses',
    videoUrl: '/videos/reel-1.mp4',
    productLink: '/category/dresses',
    tag: 'Trending Reel',
  },
  {
    id: 'v2',
    title: 'Chanderi & Silk Festive Suit Lookbook',
    category: 'Festive Suits',
    videoUrl: '/videos/reel-2.mp4',
    productLink: '/category/suits',
    tag: 'New Arrival',
  },
  {
    id: 'v3',
    title: 'Handcrafted Designer Lehenga & Fit Detail',
    category: 'Lehenga Collection',
    videoUrl: '/videos/reel-3.mp4',
    productLink: '/category/lehengas',
    tag: 'Bestseller',
  },
  {
    id: 'v4',
    title: 'Everyday Cotton Kurti & Block Print Drape',
    category: 'Kurti Collection',
    videoUrl: '/videos/reel-4.mp4',
    productLink: '/category/kurti',
    tag: 'Everyday Wear',
  },
];

export function VideoSection() {
  return (
    <section className="section" style={{ paddingTop: 'clamp(32px, 5vw, 64px)', paddingBottom: 'clamp(32px, 5vw, 64px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <span className="section-kicker">Watch in Action</span>
        <h2 className="section-title" style={{ margin: '8px 0' }}>
          Explore Our Collection in Motion
        </h2>
        <p style={{ color: 'color-mix(in srgb, var(--color-text) 65%, transparent)', fontSize: 15, maxWidth: 540, margin: '0 auto' }}>
          See the rich fabric drape, intricate block prints, and real customer fit in vertical video reels.
        </p>
      </div>

      <div className="video-grid">
        {sampleVideos.map((video) => (
          <div
            key={video.id}
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg, 16px)',
              overflow: 'hidden',
              border: '1px solid var(--color-neutral-200, #e4e4e7)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 9:16 Vertical HTML5 Video Container */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '9 / 16',
                background: '#09090b',
                overflow: 'hidden',
              }}
            >
              {/* Native HTML5 MP4 reel — starts only once it is on screen */}
              <ReelVideo src={video.videoUrl} />

              {/* Dark subtle gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.65) 100%)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />

              {/* Reel Tag Badge */}
              {/* <span
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  background: 'rgba(0, 0, 0, 0.70)',
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '5px 14px',
                  borderRadius: 20,
                  letterSpacing: '0.02em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  zIndex: 3,
                }}
              >
                {video.tag}
              </span> */}

              {/* Bottom title overlay on reel */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
                  right: 14,
                  color: '#ffffff',
                  zIndex: 3,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fca5a5' }}>
                  {video.category}
                </span>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, margin: '2px 0 0', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                  {video.title}
                </div>
              </div>
            </div>

            {/* Card Footer CTA */}
            <div style={{ padding: '14px 18px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                href={video.productLink}
                className="btn btn-secondary btn-block"
                style={{ borderRadius: 'var(--radius-md, 8px)', fontSize: 14, textDecoration: 'none', textAlign: 'center', fontWeight: 600 }}
              >
                Shop This Look →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
