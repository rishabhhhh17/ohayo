type StandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'Subscribe';

type FbqFn = {
  (command: 'init', pixelId: string): void;
  (command: 'track', event: StandardEvent, params?: Record<string, unknown>, options?: { eventID?: string }): void;
  (command: 'trackCustom', event: string, params?: Record<string, unknown>): void;
  (command: 'consent', action: 'grant' | 'revoke'): void;
  queue?: unknown[];
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '951909170876049';

export function track(
  event: StandardEvent,
  params?: Record<string, unknown>,
  eventID?: string,
) {
  if (typeof window === 'undefined') return;
  if (!window.fbq) return;
  if (eventID) {
    window.fbq('track', event, params, { eventID });
  } else {
    window.fbq('track', event, params);
  }
}

export function trackCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!window.fbq) return;
  window.fbq('trackCustom', event, params);
}
