'use client';

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

  return (
    <div className="star-rating" aria-label={`Rating: ${rating} out of 5`}>
      <div className="stars" aria-hidden="true">
        {stars.map((type, i) => (
          <span
            key={i}
            className={`star ${type === 'filled' ? 'filled' : type === 'half' ? 'half' : ''}`}
            style={{ fontSize: size === 'md' ? 16 : 13 }}
          >
            {type === 'filled' ? '★' : type === 'half' ? '★' : '☆'}
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
