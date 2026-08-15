'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getHeroSlides } from '@/lib/services/products.service';
import type { DBHeroSlide } from '@/lib/types';

const INTERVAL = 5000;

export function Hero() {
  const [slides, setSlides] = useState<DBHeroSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getHeroSlides().then(setSlides);
  }, []);

  const goTo = (idx: number) => {
    if (isAnimating || idx === current) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsAnimating(false);
    }, 400);
  };

  // Auto-advance image slider
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setTimeout(() => {
      goTo((current + 1) % slides.length);
    }, INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, slides.length]);

  const slide = slides[current];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        background: '#fdfbf7',
        borderBottom: '1px solid var(--color-divider)',
        overflow: 'hidden',
        minHeight: 'clamp(520px, 70vh, 700px)',
      }}
    >
      {/* ── Left Content Column (Static Text & Stats) ────────────────── */}
      <div
        style={{
          padding: 'clamp(32px, 5vw, 64px) clamp(24px, 5vw, 64px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 'clamp(20px, 3vw, 32px)',
          background: '#fdfbf7',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Top Kicker Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(107, 29, 47, 0.08)',
                padding: '4px 10px',
                borderRadius: 4,
              }}
            >
              New collection — Festive &apos;26
            </span>
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(36px, 4.5vw, 58px)',
              fontWeight: 800,
              lineHeight: 1.08,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Every thread,<br />a celebration.
          </h1>

          {/* Subtext Paragraph */}
          <p
            style={{
              fontSize: 'clamp(14px, 1.2vw, 16px)',
              color: 'color-mix(in srgb, var(--color-text) 75%, transparent)',
              lineHeight: 1.6,
              maxWidth: 480,
              margin: 0,
            }}
          >
            Kurtis, co-ord sets, suits, sarees and dupattas in everyday fabrics — block prints, chanderi and handloom cotton, cut to be worn, not saved for later.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link
            href="/category/suits"
            className="btn btn-primary btn-large"
            style={{
              borderRadius: 'var(--radius-md, 8px)',
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Shop new arrivals
          </Link>
          <Link
            href="/#categories"
            className="btn btn-ghost"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--color-accent, #c97d4e)',
              textDecoration: 'none',
              padding: '14px 20px',
            }}
          >
            Browse categories →
          </Link>
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid #e4e4e7', margin: '4px 0 0 0' }} />

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 800, color: '#18181b' }}>
              160+
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a', marginTop: 4 }}>
              Styles Live
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 800, color: '#18181b' }}>
              48h
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717a', marginTop: 4 }}>
              Dispatch, Amritsar
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Column (Auto-sliding Image Carousel) ────────────────── */}
      <div
        style={{
          position: 'relative',
          minHeight: 400,
          background: '#e4e4e7',
          overflow: 'hidden',
        }}
      >
        {slide ? (
          <Link
            href={slide.link || '/'}
            style={{ display: 'block', width: '100%', height: '100%' }}
            tabIndex={slide.link && slide.link !== '/' ? 0 : -1}
            aria-label={slide.alt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'opacity 0.4s ease',
                opacity: isAnimating ? 0 : 1,
              }}
            />
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a1a1aa', fontSize: 14 }}>
            Loading images…
          </div>
        )}

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 8,
              zIndex: 2,
            }}
            aria-label="Slide navigation"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === current ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}
              />
            ))}
          </div>
        )}

        {/* Prev / Next controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo((current - 1 + slides.length) % slides.length)}
              aria-label="Previous slide"
              style={{
                position: 'absolute',
                top: '50%',
                left: 16,
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo((current + 1) % slides.length)}
              aria-label="Next slide"
              style={{
                position: 'absolute',
                top: '50%',
                right: 16,
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
