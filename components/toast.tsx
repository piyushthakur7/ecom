'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastValue = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  const iconMap: Record<ToastType, string> = { success: '✓', error: '✕', info: 'ℹ' };
  const colorMap: Record<ToastType, string> = {
    success: '#16a34a',
    error: '#dc2626',
    info: '#2563eb',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#fff',
              color: '#1a1a1a',
              border: `1.5px solid ${colorMap[t.type]}`,
              borderLeft: `4px solid ${colorMap[t.type]}`,
              borderRadius: 10,
              padding: '12px 18px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              fontFamily: 'var(--font-body, sans-serif)',
              fontSize: 14,
              fontWeight: 500,
              minWidth: 220,
              maxWidth: 340,
              animation: 'toastIn 0.3s ease',
              pointerEvents: 'auto',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: colorMap[t.type],
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {iconMap[t.type]}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.toast;
}
