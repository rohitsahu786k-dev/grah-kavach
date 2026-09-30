import type { Media } from "@/types";

/*
 * Images already uploaded to the WordPress media library, used when a CMS
 * entry (kit item, blog post) has no image of its own. Attaching a real image
 * in WordPress overrides these, so a card is never blank.
 */
const UPLOADS = "https://admin.grahakavach.in/wp-content/uploads";

const media = (id: number, file: string, alt: string): Media => ({
  id,
  url: `${UPLOADS}/${file}`,
  alt,
  width: null,
  height: null,
});

export const kitFallbackItems = [
  {
    id: -1,
    title: "2 kg ABC Fire Extinguisher",
    summary: "Dry powder extinguisher for the first response to a small fire.",
    image: media(196, "Fire-Extinguisher-in-Modern-Hallway.png", "Fire extinguisher mounted in a hallway"),
  },
  {
    id: -2,
    title: "Automatic Fire Ball",
    summary: "Activates on contact with flame to help suppress fire while you move to safety.",
    image: media(195, "Modern-Utility-Wall-with-Fire-Safety-Ball.png", "Automatic fire safety ball on a wall"),
  },
  {
    id: -3,
    title: "Fibreglass Fire Blanket",
    summary: "1 x 1 m blanket to smother kitchen and small fires.",
    image: media(194, "Modern-Kitchen-with-Fire-Blanket-Safety.png", "Fire blanket in a kitchen"),
  },
];

const postImages: [RegExp, Media][] = [
  [/kitchen/i, media(200, "kitchen-fire-safety-graha-kavach.webp", "Kitchen fire safety")],
  [/monsoon|electric|wiring/i, media(198, "electrical-panel-mcb-fire-safety-graha-kavach.webp", "Electrical panel fire safety")],
  [/after|recover/i, media(186, "after_a_small_fire_recovery_checklist.webp", "After a small fire checklist")],
  [/shop|office/i, media(205, "extinguish-home-office-1870x623-1.webp", "Fire safety for shops and offices")],
  [/rent|apartment|elder/i, media(171, "graha-kavach-complete-home-fire-safety-banner.webp", "Complete home fire safety")],
  [/battery|inverter/i, media(199, "inverter-battery-fire-safety-graha-kavach.webp", "Inverter battery fire safety")],
];

const defaultPostImage = media(196, "Fire-Extinguisher-in-Modern-Hallway.png", "Fire safety at home");

export function fallbackPostImage(title: string): Media {
  return postImages.find(([pattern]) => pattern.test(title))?.[1] ?? defaultPostImage;
}
