/**
 * Client-side Razorpay helpers.
 * Used only in browser context — do NOT import in server components.
 */

export type RazorpayPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: () => void) => void;
};

type RazorpayConstructorOptions = RazorpayOptions & {
  handler?: (response: RazorpayPayload) => void;
  modal?: { ondismiss?: () => void; escape?: boolean };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayConstructorOptions) => RazorpayInstance;
  }
}

/**
 * Loads the Razorpay checkout.js script if not already loaded.
 * Safe to call multiple times.
 */
export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('loadRazorpayScript must be called in a browser context'));
      return;
    }

    if (typeof window.Razorpay !== 'undefined') {
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.head.appendChild(script);
  });
}

/**
 * Opens the Razorpay payment modal.
 * Resolves with the payment payload on success.
 * Rejects if the user dismisses the modal.
 */
export function openCheckout(opts: RazorpayOptions): Promise<RazorpayPayload> {
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      ...opts,
      handler: (response: RazorpayPayload) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        },
        escape: false,
      },
    });

    rzp.on('payment.failed', () => {
      reject(new Error('Payment failed'));
    });

    rzp.open();
  });
}
