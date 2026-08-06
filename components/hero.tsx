'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { heroSlides } from '@/lib/data';

export function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);

  // Auto-play horizontal sliding carousel every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setActiveIdx((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setActiveIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <section className="hero-section-wrap">
      <div className="hero-banner-card">
        {/* Horizontal Sliding Banner Track */}
        <Link href="#featured" aria-label="Shop New Arrivals" className="hero-banner-track-wrap">
          <div
            className="hero-banner-track"
            style={{ transform: `translateX(-${activeIdx * 100}%)` }}
          >
            {heroSlides.map((slide, i) => (
              <div key={slide.id} className="hero-slide-item">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="hero-banner-img"
                />
              </div>
            ))}
          </div>
        </Link>

        {/* Slide Indicators & Navigation Arrows */}
        <div className="hero-slider-controls">
          <button
            type="button"
            className="hero-nav-arrow"
            onClick={prevSlide}
            aria-label="Previous banner photo"
          >
            ‹
          </button>
          <div className="hero-slide-dots">
            {heroSlides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                className={`hero-dot ${idx === activeIdx ? 'active' : ''}`}
                onClick={() => setActiveIdx(idx)}
                aria-label={`Go to photo ${idx + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="hero-nav-arrow"
            onClick={nextSlide}
            aria-label="Next banner photo"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
