'use client';

import { IconStar, IconStarHalf } from './icons';

type StarRatingProps = {
  rating: number;       // 0 – 5
  reviewCount?: number;
  size?: 'sm' | 'md';
};

export function StarRating({ rating, reviewCount, size = 'sm' }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i + 1 <= Math.floor(rating)) return 'filled';
    if (i < rating) return 'half';
    return 'empty';
  });

  const px = size === 'md' ? 16 : 13;

  return (
    <div className="star-rating" aria-label={`Rating: ${rating} out of 5`}>
      <div className="stars" aria-hidden="true">
        {stars.map((type, i) => (
          <span
            key={i}
            className={`star ${type === 'filled' ? 'filled' : type === 'half' ? 'half' : ''}`}
          >
            {type === 'filled' ? (
              <IconStar size={px} fill="currentColor" />
            ) : type === 'half' ? (
              <IconStarHalf size={px} />
            ) : (
              <IconStar size={px} />
            )}
          </span>
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="star-count">
          {rating.toFixed(1)} ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
