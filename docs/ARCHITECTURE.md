# Graha Kavach — Headless Architecture

**Status:** Phase 1 (audit). Nothing in this document has been built yet.
**Last audited:** 2026-09-20

---

## 0. System topology (as audited)

There are **three** distinct systems, not two:

| Host | What it actually is today | Target role |
| --- | --- | --- |
| `grahakavach.in` | **Live production WordPress** — Astra theme, Elementor, Rank Math, FluentForms, AIOS. 11 pages, 4 posts, 216 media. **No WooCommerce.** Indexed and serving customers. | Next.js storefront (after cutover) |
| `admin.grahakavach.in` | **Empty WordPress** — Hello Elementor, WooCommerce 11.1.1 (unconfigured), WPGraphQL 2.23.0, ACF 6.8.10, Yoast 28.5, Elementor + PRO Elements. 0 products, 0 orders, 0 customers. | Headless CMS + commerce backend |
| This repo | Next.js 16.3.5 / React 19.2.8 scaffold, already wired to `admin.grahakavach.in` via env. | Storefront application |

> **The live site and the headless backend are different WordPress installs with different content.**
> `admin.grahakavach.in` is a blank slate. All real content currently lives on `grahakavach.in`
> and must be migrated. See `IMPLEMENTATION-PLAN.md` §2.

---

## 1. Responsibility boundaries

### WordPress (`admin.grahakavach.in`)
**Owns:** editorial content and identity.

- Posts (blog), pages, categories, tags, authors
- Media library — the single source of truth for all images
- Site settings (title, description, timezone, permalinks)
- Yoast SEO metadata per post/page
- User accounts for **editors only** (not shoppers)

**Does not own:** presentation. No theme templates are rendered to the public. Hello Elementor
stays installed only because WooCommerce needs a theme; it is never the customer-facing layer.

### WooCommerce (`admin.grahakavach.in`)
**Owns:** the entire commerce record of truth.

- Product catalogue: products, variations, SKUs, prices, stock, categories, attributes
- Cart and order lifecycle (pending → processing → completed → refunded)
- Customers, addresses, and order history
- Tax rules, shipping zones and methods, coupons
- Payment gateway configuration and settlement

**Does not own:** product *marketing* copy beyond the standard description fields — long-form
educational content, safety guidance, and comparison content belong to WP pages/posts + ACF.

### ACF (`admin.grahakavach.in`)
**Owns:** structured editorial data that has no native WordPress home.

- Global site settings (brand name, contact phone/email/address, WhatsApp, announcement bar)
- Header and footer navigation repeaters
- Social links
- Homepage composition: hero eyebrow/headline/summary, CTA labels and links, section blocks
- Product-page enrichment: safety warnings, usage instructions, certification badges, FAQs

**Contract:** field names and types are defined in `docs/backend-content-model.md`. That file is
the schema contract between backend and frontend. The frontend must never invent a field.

**Constraint:** ACF fields consumed via GraphQL require **WPGraphQL for ACF** (not yet installed).
Until then ACF is readable only over REST with `show_in_rest` enabled per field group.

### WPGraphQL (`admin.grahakavach.in`)
**Owns:** the read API for editorial content.

- Single typed endpoint at `/graphql` for posts, pages, media, taxonomies, settings
- Replaces multiple REST round-trips with one query per route
- Verified working: public queries succeed; **introspection is disabled for public requests**
  (correct for production — enable it only for authenticated schema tooling)

**Does not own:** commerce. WooGraphQL is **not installed**, so `products`, `cart`, `customer`
and `orders` do not exist in the schema. Commerce is read over Woo REST / Store API instead.
This is a deliberate split, not an oversight — see §3.

### Next.js (this repo)
**Owns:** everything the customer sees.

- All routing, rendering, layout, styling, and interaction
- Composition of WordPress content + WooCommerce data into pages
- SEO output (metadata, sitemap, robots, structured data)
- Analytics and conversion tracking
- Image optimisation and delivery
- Caching and revalidation policy

**Does not own:** any business data. Next.js is stateless. It never stores products, orders, or
customers; it reads them and renders them.

---

## 2. Commerce API flow

Two APIs, chosen per trust level:

```
                    ┌──────────────────────────────────────┐
                    │  Next.js (server)                    │
  Catalogue read ──▶│  wooRest()  ──── Woo REST v3         │──▶ admin.grahakavach.in
  (products, cats)  │  key+secret, SERVER ONLY             │    /wp-json/wc/v3
                    └──────────────────────────────────────┘

                    ┌──────────────────────────────────────┐
  Cart mutate    ──▶│  Next.js Route Handler (proxy)       │──▶ admin.grahakavach.in
  (add, update)     │  forwards Cart-Token + Nonce         │    /wp-json/wc/store/v1
                    └──────────────────────────────────────┘
```

**Woo REST v3** — authenticated with consumer key/secret. Used **server-side only** for reading
the catalogue and for any administrative read. Credentials must never reach the browser.

> **Open defect:** `src/lib/woocommerce/rest.ts` currently passes `consumer_key` and
> `consumer_secret` as **query string parameters**. These are written to server access logs,
> CDN logs, and any intermediate proxy. Must be moved to an HTTP `Authorization: Basic` header
> before launch. Tracked in `IMPLEMENTATION-PLAN.md` §4.

**Woo Store API** (`/wc/store/v1`) — public, cookie/token based. Used for cart state. It returns
a `Cart-Token` (JWT) and a `Nonce` header which must both be round-tripped on every mutation.

> **Open defect:** `admin.grahakavach.in` does **not** send an `Access-Control-Allow-Origin`
> header. `Access-Control-Allow-Headers/Methods/Credentials` are present but ACAO is absent, so
> **direct browser calls to the Store API from `grahakavach.in` will be blocked by CORS.**
> Two resolutions, pick one:
> 1. **Proxy through Next.js route handlers** (recommended — no CORS, hides the backend origin,
>    allows request shaping and rate limiting). Cart token is held in an `HttpOnly` cookie.
> 2. Add ACAO for `https://grahakavach.in` server-side on the WordPress host.
>
> This decision determines the cart implementation and must be settled before Phase 3.

---

## 3. Why commerce is not on GraphQL

WPGraphQL is installed; WooGraphQL is not. Rather than add it, the split is intentional:

- **Editorial reads → GraphQL.** Content is deeply nested and benefits from one typed query.
- **Commerce reads → Woo REST v3.** Prices and stock are volatile and need independent cache
  lifetimes; mixing them into a page-level GraphQL query forces the whole query to be as fresh
  as its most volatile field.
- **Commerce writes → Store API.** Cart and checkout are session-bearing and token-based;
  GraphQL adds no benefit and an extra plugin's worth of attack surface.

If WooGraphQL is added later it should serve catalogue reads only, never cart mutations.

---

## 4. Checkout flow

WooCommerce checkout is **not** rebuilt in Next.js for launch. Chosen flow:

```
Next.js product page
  → add to cart (Store API via Next proxy)
  → Next.js cart page (reads Store API)
  → hand off to https://admin.grahakavach.in/checkout/  ← WooCommerce renders
  → payment gateway
  → order confirmation
  → return link back to grahakavach.in
```

**Rationale.** Payment capture, tax calculation, and order creation are the highest-risk parts
of the system and are PCI-relevant. WooCommerce's own checkout is already audited, already
handles Indian payment gateways, and already writes correct order records. Rebuilding it
headlessly for launch adds risk with no customer-visible benefit.

**Cost of this choice:** the customer sees a domain change at checkout. Mitigate by styling the
WooCommerce checkout page to match the storefront, and by keeping the handoff to a single click.

**Blocking prerequisites — none of these are configured today:**

| Setting | Current value | Required |
| --- | --- | --- |
| Currency | `USD` | `INR` |
| Store country | `US:CA` | `IN:RJ` (Udaipur, Rajasthan) |
| Store address | empty | must be set |
| Tax rates | 0 configured | GST rates per HSN |
| Shipping zones | only the catch-all fallback | India zones + rates |
| Payment gateways | all 3 disabled (`bacs`, `cheque`, `cod`) | Razorpay/PayU + COD |
| `force_ssl` | `false` | `true` |
| Terms & conditions page | does not exist | required |

**Post-launch option:** move to Store API checkout once order volume justifies the work.

---

## 5. Tracking flow

- Events are defined once in `src/lib/tracking/events.ts` and emitted from the storefront.
- Commerce events follow the GA4 ecommerce schema: `view_item_list`, `view_item`,
  `add_to_cart`, `begin_checkout`, `purchase`.
- **Cross-domain is mandatory.** Because checkout is handed off to `admin.grahakavach.in`, the
  analytics property must have cross-domain linking configured for both hosts, or every order
  will be attributed to a referral from the backend domain and all acquisition data will be lost.
- `purchase` fires on the WooCommerce order-received page, not in Next.js. The storefront cannot
  observe order completion.
- Consent gating: no tracking script loads before consent where consent is required.

---

## 6. SEO flow

- **Canonical host is `https://grahakavach.in`.** `admin.grahakavach.in` must never rank.
- The backend must serve `X-Robots-Tag: noindex` (or a `robots.txt` disallow) so the headless
  WordPress does not compete with the storefront for the same content. **Not configured today.**
- Metadata originates in Yoast on the backend, is read through GraphQL/REST, and is rendered by
  Next.js `generateMetadata`.
- `src/app/sitemap.ts` and `src/app/robots.ts` are generated from backend content, and reference
  `grahakavach.in` URLs only.
- Structured data (`Product`, `Organization`, `BreadcrumbList`, `FAQPage`) is emitted by Next.js.
- **Redirect map is mandatory at cutover.** The live site has 11 indexed pages and 4 posts with
  established URLs. Any change in slug requires a 301. Losing these is the single largest
  launch risk. Current live slugs are captured in `backups/<timestamp>/live-grahakavach.in/`.

---

## 7. Media flow

- WordPress media library on `admin.grahakavach.in` is the only upload target.
- Next.js consumes images by absolute URL and optimises them through `next/image`.
- `next.config.ts` already allowlists `admin.grahakavach.in` and `grahakavach.in` in
  `images.remotePatterns`. Both are needed: the second covers migrated media still referenced
  at its original URL.
- **216 media items on the live site must be migrated**, and Elementor-embedded images inside
  page content must be rewritten to the new host or they will 404 after cutover.
- Alt text is authored in WordPress, never generated in the frontend.

---

## 8. Cache and revalidation flow

This is Next.js **16**. The caching model is Cache Components (`use cache`), not the Next 14
route-segment model.

- `cacheComponents: true` in `next.config.ts` enables the `use cache` directive, `cacheLife`,
  and `cacheTag`, and makes Partial Prerendering the default. It requires the Node.js runtime.
  **It is not enabled yet** — the current code uses `fetch`-level `next: { revalidate, tags }`,
  which remains valid but is the older model. Pick one and apply it consistently.
- Revalidation is tag-based. `revalidateTag()` invalidates explicit tags set via `cacheTag()`;
  `revalidatePath()` works through automatic soft tags derived from the route path.
- Time-based revalidation is stale-while-revalidate: stale content is served while a background
  regeneration runs.

Proposed cache lifetimes:

| Data | Tag | Lifetime | Invalidated by |
| --- | --- | --- | --- |
| Site settings / navigation (ACF) | `wp-settings` | 1 hour | ACF options save |
| Pages | `wp-page:<slug>` | 1 hour | page save |
| Blog posts | `wp-post:<slug>` | 1 hour | post save |
| Product catalogue | `woo-product:<id>` | 5 minutes | product save, stock change |
| Cart | — | **never cached** | — |

**On-demand invalidation.** WordPress webhooks (`save_post`, WooCommerce `product.updated`) call
a Next.js route handler that calls `revalidateTag()`. That handler **must** verify a shared
secret; an unauthenticated revalidation endpoint is a trivial denial-of-service vector.

**Multi-instance caveat.** `revalidateTag()` is local to one Next.js instance by default. If the
storefront is ever scaled beyond a single instance, a shared cache handler is required or
instances will serve divergent content.

**LiteSpeed.** Both WordPress hosts run LiteSpeed Cache. The backend's API responses must not be
page-cached, or the storefront will read stale prices and stock.

---

## 9. Security boundaries

| Boundary | Rule |
| --- | --- |
| Woo consumer key/secret | Server-side only. Never in `NEXT_PUBLIC_*`, never in a client component, never in a query string. |
| `.env.local` | Never committed. `.env.example` carries key names only. |
| Store API | Public by design. Treat every input as hostile; validate before forwarding. |
| Cart token | `HttpOnly`, `Secure`, `SameSite=Lax` cookie. Never in `localStorage`. |
| Revalidation webhook | Shared-secret authenticated, constant-time comparison. |
| Backend admin | `/wp-admin` restricted; strong passwords + 2FA for the single admin account. |
| Backend indexing | `noindex` — see §6. |
| Customer accounts | Owned by WooCommerce. Next.js never stores credentials. |
| Input validation | Zod at every trust boundary. `src/lib/validation/` already exists for this. |

### Security issues found during audit

1. **`force_ssl` is `false`** on the WooCommerce backend. Must be `true` before any payment
   gateway is enabled.
2. **Woo credentials sent as query parameters** (§2). Move to `Authorization` header.
3. **`PRO Elements` is installed and active** on `admin.grahakavach.in`. This is a third-party
   redistribution of Elementor Pro, not a licensed WP Engine build. It receives no vendor
   security updates and is an unvetted code path running with full PHP privileges on the host
   that will hold customer orders and payment configuration. **Recommend removing it**, or
   replacing it with a licensed Elementor Pro, before the backend handles real orders.
4. **No `Access-Control-Allow-Origin`** on the backend (§2) — a correctness blocker, and the
   fix must not be a blanket `*` once cart tokens are in play.
5. **Backend is publicly indexable** (§6).
6. **Single admin user** on both hosts, with the admin email on a shared consumer mail domain.
   Enable 2FA.
7. **🔴 LiteSpeed serves authenticated API responses to anonymous callers.** Confirmed by
   reproduction on 2026-09-20. Woo REST responses are stored in LiteSpeed's `private` bucket;
   because a Basic-auth server call carries no cookie, it lands in the cookieless bucket shared
   by all anonymous visitors. An authenticated `GET /wp-json/wc/v3/settings/general?proof=N`
   returned `X-LiteSpeed-Cache: miss`; the identical URL with **no credentials** then returned
   `X-LiteSpeed-Cache: hit,private` and the full settings body. WooCommerce auth itself is
   correct — a cache-busted request returns `401`. The leak is entirely in the cache layer.
   With real data present this would expose **order records and customer PII**.
   Mitigated by `class-gk-cache-control.php` in `grahakavach-headless-core`, which is **not yet
   deployed**. Also exclude `/wp-json/` and `/graphql` in LiteSpeed's own settings so the fix
   does not depend on one plugin staying active. This is the highest-priority item in the
   project.

---

## 10. Environment contract

Public (browser-visible, non-secret):

```
NEXT_PUBLIC_SITE_URL             https://grahakavach.in
NEXT_PUBLIC_WP_URL               https://admin.grahakavach.in
NEXT_PUBLIC_WP_GRAPHQL_URL       https://admin.grahakavach.in/graphql
NEXT_PUBLIC_WP_REST_URL          https://admin.grahakavach.in/wp-json/wp/v2
NEXT_PUBLIC_WOO_STORE_URL        https://admin.grahakavach.in/wp-json/wc/store/v1
NEXT_PUBLIC_WOO_MY_ACCOUNT_URL   https://admin.grahakavach.in/my-account/
NEXT_PUBLIC_WOO_CART_URL         https://admin.grahakavach.in/cart/
NEXT_PUBLIC_WOO_CHECKOUT_URL     https://admin.grahakavach.in/checkout/
```

Server-only (secret):

```
WOO_REST_URL                     https://admin.grahakavach.in/wp-json/wc/v3
WOO_CONSUMER_KEY                 (set)
WOO_CONSUMER_SECRET              (set)
```

Still required, not yet defined:

```
REVALIDATE_SECRET                shared secret for the webhook handler
NEXT_PUBLIC_GA_ID                analytics property
```

All values are validated at startup in `src/lib/validation/env.ts`.
