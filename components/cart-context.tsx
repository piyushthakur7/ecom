'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type CartValue = { count: number; addToCart: () => void };

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const addToCart = useCallback(() => setCount((c) => c + 1), []);
  const value = useMemo(() => ({ count, addToCart }), [count, addToCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a <CartProvider>');
  return ctx;
}
