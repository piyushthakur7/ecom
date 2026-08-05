'use client';

import { useFavourites, type FavouriteItem } from './favourites-context';

type FavouriteButtonProps = {
  product: FavouriteItem;
  /** 'overlay' sits on top of product image; 'inline' is a plain icon button */
  variant?: 'overlay' | 'inline';
  size?: number;
};

export function FavouriteButton({ product, variant = 'overlay', size = 18 }: FavouriteButtonProps) {
  const { toggle, isFavourite } = useFavourites();
  const active = isFavourite(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // don't follow parent <a> / Link
    e.stopPropagation();
    toggle(product);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`fav-btn ${variant === 'overlay' ? 'fav-btn-overlay' : 'fav-btn-inline'} ${active ? 'fav-active' : ''}`}
      aria-label={active ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
      aria-pressed={active}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ transition: 'fill 0.2s ease, transform 0.18s ease', display: 'block' }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
