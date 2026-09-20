/**
 * Routes whose first section is drawn behind the fixed header.
 *
 * Two components have to agree about this: the header, which starts
 * transparent on these routes, and the spacer, which reserves no height on
 * them. Keeping the list in one module is what stops those two drifting apart
 * and producing either a blank strip above the hero or navigation sitting on
 * top of body copy.
 */
/*
 * Currently empty, and that is deliberate.
 *
 * The homepage hero is a full-width banner carousel whose artwork carries its
 * own headline — on some slides that headline sits right at the top edge of
 * the image. A transparent header would land on top of it, and dark
 * navigation over a photograph is unreadable wherever the banner happens to be
 * dark. So the header stays solid and the carousel starts below it.
 *
 * Add a route here if it ever gets a hero designed with clear space at the
 * top; the header and the spacer both read this list, so they cannot disagree.
 */
export const HERO_OVERLAY_ROUTES: ReadonlySet<string> = new Set<string>();

export function overlaysHero(pathname: string): boolean {
  return HERO_OVERLAY_ROUTES.has(pathname);
}
