import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateShipping } from '@/lib/config/shipping';

export type CartItem = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  image: string;
  price: number;
  size: string;
  colorName: string;
  quantity: number;
};

export type AppliedDiscount = {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
};

type CartState = {
  items: CartItem[];
  appliedDiscount: AppliedDiscount | null;
  count: () => number;
  subtotal: () => number;
  shipping: () => number;
  total: () => number;
  add: (item: CartItem) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  setDiscount: (d: AppliedDiscount) => void;
  clearDiscount: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedDiscount: null,

      // Sum of all item quantities
      count: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      // Sum of price * quantity (in paise)
      subtotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),

      // Shipping based on subtotal
      shipping: () => calculateShipping(get().subtotal()),

      // Total = subtotal - discount + shipping
      total: () => {
        const subtotal = get().subtotal();
        const discount = get().appliedDiscount?.amount ?? 0;
        const shipping = get().shipping();
        return subtotal - discount + shipping;
      },

      // Add item — merge quantity if same variantId already exists
      add: (item: CartItem) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      // Remove item by variantId
      remove: (variantId: string) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      // Set exact quantity for a variantId (removes if qty <= 0)
      setQty: (variantId: string, qty: number) =>
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.variantId !== variantId) };
          }
          return {
            items: state.items.map((i) =>
              i.variantId === variantId ? { ...i, quantity: qty } : i,
            ),
          };
        }),

      // Clear all items
      clear: () => set({ items: [], appliedDiscount: null }),

      // Set applied discount
      setDiscount: (d: AppliedDiscount) => set({ appliedDiscount: d }),

      // Clear applied discount
      clearDiscount: () => set({ appliedDiscount: null }),
    }),
    {
      name: 'knitto-cart',
      storage: createJSONStorage(() => {
        // SSR-safe: return a no-op storage during SSR
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      skipHydration: true,
    },
  ),
);

/**
 * Call once in a client component (e.g., layout) to hydrate the store from localStorage.
 * Safe to call multiple times — zustand guard prevents double hydration.
 */
export function hydrateCartStore() {
  useCartStore.persist.rehydrate();
}
