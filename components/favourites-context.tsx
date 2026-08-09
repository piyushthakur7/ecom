'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import {
  fetchWishlistFromDB,
  addToWishlistDB,
  removeFromWishlistDB,
} from '@/lib/services/wishlist.service';
import { getProducts } from '@/lib/services/products.service';

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
  const { user, isLoading: authLoading } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);

  // On login: fetch wishlist from DB and merge with guest wishlist
  useEffect(() => {
    if (authLoading) return;

    const prevId = prevUserIdRef.current;
    const curId = user?.id ?? null;

    if (curId && curId !== prevId) {
      (async () => {
        const dbIds = await fetchWishlistFromDB(curId);
        // Resolve product details for DB ids not in guest list
        const allProducts = await getProducts();
        setItems((guest) => {
          const merged = [...guest];
          for (const pid of dbIds) {
            if (!merged.find((g) => g.id === pid)) {
              const p = allProducts.find((x) => x.id === pid);
              if (p) {
                merged.push({
                  id: p.id,
                  name: p.name,
                  price: `₹${Number(p.price).toLocaleString('en-IN')}`,
                  image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '',
                  category: p.category_slug,
                  rating: p.rating,
                  reviewCount: p.reviews_count,
                });
              }
            }
          }
          // Sync guest items to DB
          merged.forEach((item) => {
            if (!dbIds.includes(item.id)) addToWishlistDB(curId, item.id);
          });
          return merged;
        });
      })();
    }

    prevUserIdRef.current = curId;
  }, [user, authLoading]);

  const toggle = useCallback((item: FavouriteItem) => {
    setItems((prev) => {
      const isFav = prev.some((i) => i.id === item.id);
      const uid = prevUserIdRef.current;
      if (isFav) {
        if (uid) removeFromWishlistDB(uid, item.id);
        return prev.filter((i) => i.id !== item.id);
      } else {
        if (uid) addToWishlistDB(uid, item.id);
        return [...prev, item];
      }
    });
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
