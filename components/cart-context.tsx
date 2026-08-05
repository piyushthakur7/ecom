'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;         // numeric for totalling
  priceDisplay: string;  // e.g. "₹849"
  image: string;
  category: string;
  size?: string;
  quantity: number;
};

type CartValue = {
  items: CartItem[];
  count: number;          // total qty across all items
  total: number;          // total ₹
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQty: (id: string, qty: number, size?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartValue | null>(null);

function makeKey(id: string, size?: string) {
  return size ? `${id}::${size}` : id;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const key = makeKey(product.id, product.size);
      const existing = prev.find((i) => makeKey(i.id, i.size) === key);
      if (existing) {
        return prev.map((i) =>
          makeKey(i.id, i.size) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string, size?: string) => {
    const key = makeKey(id, size);
    setItems((prev) => prev.filter((i) => makeKey(i.id, i.size) !== key));
  }, []);

  const updateQty = useCallback((id: string, qty: number, size?: string) => {
    const key = makeKey(id, size);
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => makeKey(i.id, i.size) !== key));
    } else {
      setItems((prev) =>
        prev.map((i) => (makeKey(i.id, i.size) === key ? { ...i, quantity: qty } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

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
