'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import {
  fetchCartFromDB,
  upsertCartItem,
  updateCartItemQty,
  removeCartItemFromDB,
  clearCartInDB,
  mergeCartItems,
} from '@/lib/services/cart.service';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  image: string;
  category: string;
  size?: string;
  color?: string;
  quantity: number;
};

type CartValue = {
  items: CartItem[];
  count: number;
  total: number;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  updateQty: (id: string, qty: number, size?: string, color?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartValue | null>(null);

function makeKey(id: string, size?: string, color?: string) {
  const finalSize = size || 'M';
  const finalColor = color || '';
  return `${id}::${finalSize}::${finalColor}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user, isLoading: authLoading } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);

  // On login: merge guest cart with DB cart
  useEffect(() => {
    if (authLoading) return;

    const prevId = prevUserIdRef.current;
    const curId = user?.id ?? null;

    if (curId && curId !== prevId) {
      // User just logged in — fetch DB cart and merge
      (async () => {
        const dbItems = await fetchCartFromDB(curId);
        setItems((guest) => {
          const merged = mergeCartItems(guest, dbItems);
          // Push merged items to DB
          merged.forEach((item) => upsertCartItem(curId, item));
          return merged;
        });
      })();
    } else if (!curId && prevId) {
      // User just logged out — keep local items (guest mode)
    }

    prevUserIdRef.current = curId;
  }, [user, authLoading]);

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>) => {
    const itemWithDetails: Omit<CartItem, 'quantity'> = {
      ...product,
      size: product.size || 'M',
      color: product.color || undefined,
    };

    setItems((prev) => {
      const key = makeKey(itemWithDetails.id, itemWithDetails.size, itemWithDetails.color);
      const existing = prev.find((i) => makeKey(i.id, i.size, i.color) === key);
      let next: CartItem[];
      if (existing) {
        next = prev.map((i) =>
          makeKey(i.id, i.size, i.color) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        next = [...prev, { ...itemWithDetails, quantity: 1 }];
      }
      // Persist to DB if logged in
      const uid = prevUserIdRef.current;
      if (uid) {
        const updated = next.find((i) => makeKey(i.id, i.size, i.color) === key);
        if (updated) upsertCartItem(uid, updated);
      }
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id: string, size?: string, color?: string) => {
    const key = makeKey(id, size, color);
    setItems((prev) => {
      const next = prev.filter((i) => makeKey(i.id, i.size, i.color) !== key);
      const uid = prevUserIdRef.current;
      if (uid) removeCartItemFromDB(uid, id, size, color);
      return next;
    });
  }, []);

  const updateQty = useCallback((id: string, qty: number, size?: string, color?: string) => {
    const key = makeKey(id, size, color);
    const uid = prevUserIdRef.current;
    if (qty <= 0) {
      setItems((prev) => {
        if (uid) removeCartItemFromDB(uid, id, size, color);
        return prev.filter((i) => makeKey(i.id, i.size, i.color) !== key);
      });
    } else {
      setItems((prev) => {
        const next = prev.map((i) => (makeKey(i.id, i.size, i.color) === key ? { ...i, quantity: qty } : i));
        if (uid) updateCartItemQty(uid, id, size, color, qty);
        return next;
      });
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    const uid = prevUserIdRef.current;
    if (uid) clearCartInDB(uid);
  }, []);

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, count, total, addToCart, removeFromCart, updateQty, clearCart }),
    [items, count, total, addToCart, removeFromCart, updateQty, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
