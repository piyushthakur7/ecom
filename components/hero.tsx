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

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setTimeout(() => {
      goTo((current + 1) % slides.length);
    }, INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="hero-slider" style={{ background: '#f3f2f2', aspectRatio: '16/7' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc', fontSize: 14 }}>
          Loading…
        </div>
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div className="hero-slider" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Slide image */}
      <Link
        href={slide.link || '/'}
        style={{ display: 'block', width: '100%' }}
        tabIndex={slide.link && slide.link !== '/' ? 0 : -1}
        aria-label={slide.alt}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.src}
          alt={slide.alt}
          style={{
            width: '100%',
            aspectRatio: '16 / 7',
            objectFit: 'cover',
            display: 'block',
            transition: 'opacity 0.4s ease',
            opacity: isAnimating ? 0 : 1,
          }}
        />
      </Link>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
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
                background: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Prev / Next arrows (only if > 1 slide) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            style={{
              position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
              width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo((current + 1) % slides.length)}
            aria-label="Next slide"
            style={{
              position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
              width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
