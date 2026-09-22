'use client';

import { useEffect } from 'react';
import { triggerKeepAliveIfExpired } from '@/lib/keep-alive-runner';

export function KeepAliveListener() {
  useEffect(() => {
    triggerKeepAliveIfExpired();
  }, []);

  return null;
}
