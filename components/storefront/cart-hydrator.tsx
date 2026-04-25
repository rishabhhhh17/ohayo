'use client';

import { useEffect } from 'react';
import { hydrateCartStore } from '@/lib/cart/store';

/**
 * Hydrates the Zustand cart store from localStorage on mount.
 * Must be rendered in a client boundary — place inside the storefront layout.
 */
export function CartHydrator() {
  useEffect(() => {
    hydrateCartStore();
  }, []);

  return null;
}
