import type { WpMedia } from "@/lib/wordpress/types";

export const brandAssets = {
  logo: {
    id: 0,
    url: "/brand/graha-kavach-logo.png",
    alt: "Graha Kavach",
    width: 220,
    height: 100,
    mime: "image/png",
  } satisfies WpMedia,
  favicon: "/brand/graha-kavach-favicon.png",
} as const;
