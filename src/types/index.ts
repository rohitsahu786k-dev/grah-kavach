import type { ReactNode } from "react";

/** A component that renders children and accepts a className override. */
export type WithChildren<T = unknown> = T & {
  children?: ReactNode;
  className?: string;
};

/** Shared size scale used across interactive components. */
export type Size = "sm" | "md" | "lg";

/** Shared tone scale used by Badge, StockStatus and status messaging. */
export type Tone = "neutral" | "primary" | "secondary" | "success" | "warning" | "danger";

/** A resolved media item as served by the CMS GraphQL layer. */
export type Media = {
  id: number;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  mime?: string;
};

/** Minimal product shape the commerce components render. */
export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  priceMinor: number | null;
  regularPriceMinor: number | null;
  currency: string;
  stockStatus: "instock" | "outofstock" | "onbackorder";
  image: Media | null;
  tagline?: string;
};

/** One shipment as returned by the tracking service contract. */
export type Shipment = {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  shippedOn: string | null;
};
