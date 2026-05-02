'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics/fbq';

type StashedPayload = {
  event_id: string;
  value: number;
  currency: string;
  num_items: number;
  content_ids: string[];
  contents?: Array<{ id: string; quantity: number }>;
  order_id: string;
};

export function PurchaseTracker({ orderNumber }: { orderNumber: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || !orderNumber) return;

    let payload: StashedPayload | null = null;
    try {
      const raw = sessionStorage.getItem(`oh_purchase_${orderNumber}`);
      if (raw) payload = JSON.parse(raw) as StashedPayload;
    } catch {}

    if (!payload) return;

    fired.current = true;
    track(
      'Purchase',
      {
        value: payload.value,
        currency: payload.currency,
        num_items: payload.num_items,
        content_ids: payload.content_ids,
        contents: payload.contents,
        order_id: payload.order_id,
      },
      payload.event_id,
    );

    try {
      sessionStorage.removeItem(`oh_purchase_${orderNumber}`);
    } catch {}
  }, [orderNumber]);

  return null;
}
