'use client';

import React from 'react';
import Link from 'next/link';

type VideoItem = {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  productLink: string;
  tag: string;
};

const CLOUDINARY_REEL_URL = 'https://res.cloudinary.com/plv8a0nv/video/upload/v1786540008/U_won_t_believe_such_a_beautiful_dress_exist_fashion_dress_runway_shortvideos_viralvideo_-_evuki_designer_1080p_h264.mp4';

const sampleVideos: VideoItem[] = [
  {
    id: 'v1',
    title: 'Designer Runway & Festive Dress Showcase',
    category: 'Couture & Dresses',
    videoUrl: CLOUDINARY_REEL_URL,
    productLink: '/category/dresses',
    tag: 'Trending Reel',
  },
  {
    id: 'v2',
    title: 'Chanderi & Silk Festive Suit Lookbook',
    category: 'Festive Suits',
    videoUrl: CLOUDINARY_REEL_URL,
    productLink: '/category/suits',
    tag: 'New Arrival',
  },
  {
    id: 'v3',
    title: 'Handcrafted Designer Lehenga & Fit Detail',
    category: 'Lehenga Collection',
    videoUrl: CLOUDINARY_REEL_URL,
    productLink: '/category/lehengas',
    tag: 'Bestseller',
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          alignItems: 'stretch',
        }}
      >
        {sampleVideos.map((video) => (
          <div
            key={video.id}
            style={{
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg, 16px)',
              overflow: 'hidden',
              border: '1px solid var(--color-neutral-200)',
              boxShadow: '0 8px 30px var(--color-shadow-subtle)',
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
                background: 'var(--color-media-bg)',
                overflow: 'hidden',
              }}
            >
              {/* Native HTML5 Cloudinary MP4 Video Player */}
              <video
                src={video.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              {/* Dark subtle gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--gradient-media-scrim)',
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
                  background: 'var(--color-scrim-strong)',
                  backdropFilter: 'blur(10px)',
                  color: 'var(--color-on-media)',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '5px 14px',
                  borderRadius: 20,
                  letterSpacing: '0.02em',
                  boxShadow: '0 2px 8px var(--color-shadow-strong)',
                  zIndex: 3,
                }}
              >
                🎬 {video.tag}
              </span> */}

              {/* Bottom title overlay on reel */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
                  right: 14,
                  color: 'var(--color-on-media)',
                  zIndex: 3,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent-300)' }}>
                  {video.category}
                </span>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, margin: '2px 0 0', textShadow: '0 2px 4px var(--color-shadow-heavy)' }}>
                  {video.title}
                </div>
              </div>
            </div>

            {/* Card Footer CTA */}
            <div style={{ padding: '14px 18px', background: 'var(--color-surface-raised)', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
