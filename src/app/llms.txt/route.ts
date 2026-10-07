import { siteConfig } from "@/lib/config/site";

export const dynamic = "force-static";

/**
 * llms.txt: a plain-text map of the site for AI assistants and search bots.
 * Lists only public, indexable pages.
 */
export function GET() {
  const base = siteConfig.frontendUrl.replace(/\/$/, "");

  const body = `# Graha Kavach

> Graha Kavach is a certified 3-in-1 home fire safety kit made by Speciality Geochem, Udaipur, Rajasthan (est. 2010). The kit contains a 2 kg ABC dry powder fire extinguisher, an automatic flame-activated fire safety ball and a 550°C fibreglass fire blanket. Delivery across India, cash on delivery available.

## Product
- [Complete Fire Safety Kit](${base}/fire-safety-kit): the 3-in-1 kit, price, contents and specifications
- [How it works](${base}/how-it-works): how each of the three protection layers works
- [Safety guide](${base}/safety-guide): where to place each item and what to do in a fire

## Company
- [About us](${base}/about): Speciality Geochem and 16 years of fire protection experience
- [Contact](${base}/contact): phone, email and address

## Learn
- [Fire safety blog](${base}/blog): practical guides on kitchen fires, LPG, electrical fires and extinguisher use

## Policies
- [Shipping policy](${base}/shipping-policy)
- [Refund policy](${base}/refund-policy)
- [Cancellation policy](${base}/cancellation-policy)
- [Terms and conditions](${base}/terms-and-conditions)
- [Privacy policy](${base}/privacy-policy)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
