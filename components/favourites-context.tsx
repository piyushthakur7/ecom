'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type FavouriteItem = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
};

type FavouritesValue = {
  items: FavouriteItem[];
  count: number;
  toggle: (item: FavouriteItem) => void;
  isFavourite: (id: string) => boolean;
  clear: () => void;
};

const FavouritesContext = createContext<FavouritesValue | null>(null);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FavouriteItem[]>([]);

  const toggle = useCallback((item: FavouriteItem) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  }, []);

  const isFavourite = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.length, [items]);

  const value = useMemo(
    () => ({ items, count, toggle, isFavourite, clear }),
    [items, count, toggle, isFavourite, clear]
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used inside <FavouritesProvider>');
  return ctx;
}
