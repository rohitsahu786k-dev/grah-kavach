import { z } from "zod";

export const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const contactInfoSchema = z.object({
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  whatsapp: z.string().optional().default(""),
});

export const globalSiteSettingsSchema = z.object({
  brandName: z.string().min(1),
  announcement: z.string().optional().default(""),
  contact: contactInfoSchema,
  socialLinks: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url(),
      }),
    )
    .default([]),
  headerNavigation: z.array(navItemSchema).default([]),
  footerNavigation: z.array(navItemSchema).default([]),
});

export type GlobalSiteSettings = z.infer<typeof globalSiteSettingsSchema>;
