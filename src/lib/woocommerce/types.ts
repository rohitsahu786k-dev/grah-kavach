import { z } from "zod";

export const wooImageSchema = z.object({
  id: z.number(),
  src: z.string().url(),
  name: z.string().optional().default(""),
  alt: z.string().optional().default(""),
});

export const wooProductSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  slug: z.string().min(1),
  permalink: z.string().url().or(z.literal("")),
  type: z.string().optional().default("simple"),
  status: z.string().optional().default("publish"),
  sku: z.string().optional().default(""),
  price: z.string().optional().default(""),
  regular_price: z.string().optional().default(""),
  sale_price: z.string().optional().default(""),
  stock_status: z.enum(["instock", "outofstock", "onbackorder"]).default("outofstock"),
  stock_quantity: z.number().nullable().optional(),
  average_rating: z.string().optional().default("0"),
  rating_count: z.number().optional().default(0),
  date_modified: z.string().nullable().optional(),
  short_description: z.string().optional().default(""),
  description: z.string().optional().default(""),
  images: z.array(wooImageSchema).optional().default([]),
  categories: z.array(z.object({ id: z.number(), name: z.string(), slug: z.string() })).optional().default([]),
});

export const wooCouponSchema = z.object({
  id: z.number(),
  code: z.string(),
  amount: z.string(),
  discount_type: z.string(),
  date_expires: z.string().nullable().optional(),
  usage_count: z.number().optional(),
  usage_limit: z.number().nullable().optional(),
});

export const wooOrderSchema = z.object({
  id: z.number(),
  number: z.string(),
  status: z.string(),
  currency: z.string(),
  total: z.string(),
  date_created: z.string().nullable().optional(),
});

export const wooCustomerSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string().optional().default(""),
  last_name: z.string().optional().default(""),
});

export const wooReviewSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  review: z.string(),
  reviewer: z.string(),
  reviewer_email: z.string().email().or(z.literal("")).optional().default(""),
  rating: z.number(),
  verified: z.boolean().optional().default(false),
  // Needed for the `datePublished` field of Review structured data.
  date_created: z.string().optional().default(""),
});

export type WooProduct = z.infer<typeof wooProductSchema>;
export type WooCoupon = z.infer<typeof wooCouponSchema>;
export type WooOrder = z.infer<typeof wooOrderSchema>;
export type WooCustomer = z.infer<typeof wooCustomerSchema>;
export type WooReview = z.infer<typeof wooReviewSchema>;
