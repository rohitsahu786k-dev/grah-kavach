import { publicEnv } from "@/lib/validation/env";

export const siteConfig = {
  frontendUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
} as const;
