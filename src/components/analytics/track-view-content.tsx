"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/analytics/meta-pixel";

type Props = {
  productId: number | string;
  productName: string;
  price: number;
  currency?: string;
};

export function TrackProductView({
  productId,
  productName,
  price,
  currency = "INR",
}: Props) {
  useEffect(() => {
    trackViewContent({
      content_ids: [productId],
      content_name: productName,
      value: price,
      currency,
    });
  }, [productId, productName, price, currency]);

  return null;
}
