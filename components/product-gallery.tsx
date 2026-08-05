'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

type ProductGalleryProps = {
  images: readonly string[];
  name: string;
  saleBadge?: string | null;
};

export function ProductGallery({ images, name, saleBadge }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mainRef.current.style.setProperty('--zoom-x', `${x}%`);
    mainRef.current.style.setProperty('--zoom-y', `${y}%`);
  }, []);

  const handleMouseEnter = useCallback(() => setZoomed(true), []);
  const handleMouseLeave = useCallback(() => setZoomed(false), []);

  // Touch swipe support
  const touchStartX = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) < 40) return;
    if (diff < 0) setActiveIdx((i) => Math.min(i + 1, images.length - 1));
    else setActiveIdx((i) => Math.max(i - 1, 0));
  };

  return (
    <div style={{ display: 'contents' }}>
      {/* Thumbnail strip */}
      <div className="gallery-thumbnails">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            className={`gallery-thumb ${i === activeIdx ? 'active' : ''}`}
            onClick={() => setActiveIdx(i)}
            aria-label={`View image ${i + 1}`}
          >
            <Image src={src} alt={`${name} — view ${i + 1}`} fill sizes="72px" style={{ objectFit: 'cover' }} />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        ref={mainRef}
        className={`gallery-main ${zoomed ? 'zoomed' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Product image — hover to zoom"
      >
        {saleBadge && (
          <span className="tag tag-accent gallery-sale-badge">{saleBadge}</span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={images[activeIdx]}
          src={images[activeIdx]}
          alt={`${name} — main view`}
          className="gallery-main-img"
        />

        {/* Dot indicators (mobile) */}
        {images.length > 1 && (
          <div className="gallery-dots" style={{ position: 'absolute', bottom: 12, left: 0, right: 0 }}>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`gallery-dot ${i === activeIdx ? 'active' : ''}`}
                onClick={() => setActiveIdx(i)}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
