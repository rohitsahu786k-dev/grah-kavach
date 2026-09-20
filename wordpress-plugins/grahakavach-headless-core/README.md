# Graha Kavach Headless Core

Project-specific integration code for the Graha Kavach headless stack.
All customisation lives here so that **no third-party plugin and no WordPress
core file is ever modified**.

- **Target install:** `admin.grahakavach.in`
- **Requires:** WordPress 6.2+, PHP 7.4+ (install runs WP 7.1.1 / PHP 8.3.33)
- **Optional integrations:** WPGraphQL, WooCommerce, ACF — each module degrades
  to a no-op if its dependency is absent.

---

## What it does

| Module | File | Responsibility |
| --- | --- | --- |
| Config | `class-gk-config.php` | Resolves settings from `wp-config.php` constants first, then options. Secrets are constant-only. |
| Noindex | `class-gk-noindex.php` | Keeps the backend out of search engines **without touching wp-admin, REST or GraphQL**. |
| CORS | `class-gk-cors.php` | Strict origin allowlist. No wildcard, ever. |
| Cache control | `class-gk-cache-control.php` | Stops LiteSpeed caching API responses. **Fixes a confirmed data leak** — see below. |
| Settings | `class-gk-settings.php` | Global settings screen — the ACF Pro replacement. |
| GraphQL | `class-gk-graphql.php` | Registers `grahaKavachSettings` and `frontendUri`. |
| REST | `class-gk-rest.php` | `gk/v1/settings`, `gk/v1/health`, `gk_frontend_url` field. |
| Revalidation | `class-gk-revalidation.php` | HMAC-signed cache-invalidation webhook to Next.js. |
| URLs | `class-gk-urls.php` | Backend URL → storefront URL mapping and cache-tag derivation. |
| Admin | `class-gk-admin.php` | "View on site" links point at the storefront. |

---

## Installation

1. Copy the `grahakavach-headless-core` folder to
   `wp-content/plugins/` on `admin.grahakavach.in`.
2. Add the configuration block below to `wp-config.php`, **above** the
   `/* That's all, stop editing! */` line.
3. Activate the plugin in **Plugins → Installed Plugins**.
4. Visit **Settings → Graha Kavach** and fill in brand and contact details.
5. Build the header/footer menus in **Appearance → Menus** and assign them to
   the *Graha Kavach — Header* and *Graha Kavach — Footer* locations.

### wp-config.php

```php
/* Graha Kavach headless configuration */
define( 'GK_HEADLESS_FRONTEND_URL',      'https://grahakavach.in' );
define( 'GK_HEADLESS_REVALIDATE_URL',    'https://grahakavach.in/api/revalidate' );
define( 'GK_HEADLESS_REVALIDATE_SECRET', 'REPLACE_WITH_A_LONG_RANDOM_STRING' );
define( 'GK_HEADLESS_ALLOWED_ORIGINS',   'https://grahakavach.in,http://localhost:3000' );
define( 'GK_HEADLESS_NOINDEX',           true );
```

Generate the secret with `openssl rand -hex 32` and use the **same value** for
`REVALIDATE_SECRET` in the Next.js environment.

> The secret is read **only** from a constant. It is never written to the
> database and never rendered in the admin UI. If it is missing, the webhook
> refuses to fire rather than sending an unsigned request.

---

## Why this plugin exists instead of ACF Pro

`docs/backend-content-model.md` specified an ACF **Options Page** with
**Repeater** fields. Both are ACF Pro features; this install runs ACF free
6.8.10. Installing an unlicensed ACF Pro build was rejected outright, so the
same data model is provided natively:

| ACF Pro feature | Replacement |
| --- | --- |
| Options Page | WP Settings API page under **Settings → Graha Kavach**, one option row |
| Repeater — header/footer nav | **Native WordPress menus.** Better editor UX, drag-and-drop ordering, and WPGraphQL exposes menu locations with no extra code. |
| Repeater — social links | Line-delimited `Label\|URL` rows, parsed and validated into a typed array |

The **GraphQL field names match the original contract**, so the frontend is
unaffected by the storage change.

If a licensed ACF Pro is purchased later, these can be migrated to real ACF
fields without changing the GraphQL shape the frontend consumes.

---

## Verifying the webhook in Next.js

The signature is `sha256=` + HMAC-SHA256 of the **raw request body**. Compare it
in constant time — a plain `===` on a signature is a timing oracle.

```ts
// src/app/api/revalidate/route.ts
import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return new Response("Not configured", { status: 500 });

  // Must read the RAW body — re-serialising JSON changes the bytes.
  const raw = await request.text();
  const received = request.headers.get("x-gk-signature") ?? "";
  const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");

  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response("Bad signature", { status: 401 });
  }

  const { tags, timestamp } = JSON.parse(raw) as { tags: string[]; timestamp: number };

  // Reject replays older than five minutes.
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) {
    return new Response("Stale", { status: 401 });
  }

  for (const tag of tags) revalidateTag(tag);

  return Response.json({ revalidated: tags });
}
```

### Cache tags emitted

| Change | Tags sent |
| --- | --- |
| Page saved | `wp-page:<slug>` |
| Post saved | `wp-post:<slug>`, `wp-posts` |
| Product saved / stock change | `woo-product:<id>`, `woo-products` |
| Settings or menu saved | `wp-settings` |

Dispatch happens on `shutdown` and is non-blocking, so a slow or unreachable
storefront can never delay an editor's save.

---

## API surface added

```
GET  /wp-json/gk/v1/settings   Global settings (public — same data as the site footer)
GET  /wp-json/gk/v1/health     Booleans and versions only; no secrets
```

GraphQL:

```graphql
{
  grahaKavachSettings {
    brandName
    announcement
    frontendUrl
    contact { phone email address whatsapp }
    socialLinks { label url }
  }
  menuItems(where: { location: GK_HEADER }) { nodes { label uri } }
}
```

---

## Noindex scope

Applied **only** to public front-end page views:

- `<meta name="robots" content="noindex, nofollow, noarchive">`
- `X-Robots-Tag: noindex, nofollow, noarchive`
- `robots.txt` → `Disallow: /`, with `/wp-json/` and `/graphql` explicitly allowed
- Core and Yoast sitemaps suppressed
- Backend canonical URLs suppressed

Explicitly **exempt** — these behave exactly as before:

`wp-admin` · `wp-login.php` · `/wp-json/*` (incl. `wc/v3`, `wc/store`) ·
`/graphql` · `admin-ajax.php` · WP-CLI · cron · XML-RPC

---

## CORS policy

- Origins must be listed explicitly. **There is no wildcard fallback.**
- `Access-Control-Allow-Credentials: true` is only ever sent with a single
  concrete origin — never with `*`. Browsers reject that combination, and it
  would be unsafe regardless.
- `Vary: Origin` is set on every response, including refusals.
  **Known limitation, verified 2026-09-20:** the Hostinger/LiteSpeed edge
  rewrites the header to `Vary: Accept-Encoding`, so `Origin` does not survive
  to the client. It is stripped through both the REST path and WPGraphQL's
  independent header pipeline, which confirms the edge is responsible rather
  than this plugin.
  The compensating control is `class-gk-cache-control.php`: every API response
  carries `Cache-Control: no-cache, no-store, must-revalidate, private`, so a
  shared cache must not store the response in the first place. `Vary: Origin`
  would be defence-in-depth on top of that, not the primary protection.
- Preflight `OPTIONS` from an unlisted origin gets `403` with no CORS headers.
- `Cart-Token` and `Nonce` are allowed and exposed so the WooCommerce Store API
  works through a browser when that path is chosen.

WordPress's default `rest_send_cors_headers` handler is removed and replaced,
rather than layered over, so there is exactly one source of CORS headers.

---

## The LiteSpeed cache leak this plugin fixes

**Severity: high. Confirmed by reproduction on `admin.grahakavach.in`, 2026-09-20.**

LiteSpeed Cache stores WooCommerce REST responses in its `private` bucket with
`max-age=1800`. That bucket is keyed by session cookie — but a server-to-server
call authenticated with HTTP **Basic auth carries no cookie**, so it lands in
the *cookieless* bucket that every anonymous visitor also shares.

Reproduction on a previously-unseen URL:

```
1) GET /wp-json/wc/v3/settings/general?proof=N   with Basic auth
   -> 200   X-LiteSpeed-Cache: miss
            X-LiteSpeed-Cache-Control: private, max-age=1800

2) GET /wp-json/wc/v3/settings/general?proof=N   with NO credentials
   -> 200   X-LiteSpeed-Cache: hit,private
            ...full store settings body returned to an anonymous caller
```

Adding a unique query string returns `401` as expected, which confirms
WooCommerce's own authentication is working correctly — **the leak is entirely
in the cache layer.**

This matters because Next.js reads Woo REST server-side with Basic auth and no
cookies, which is precisely the pattern that populates the shared bucket. The
catalogue is currently empty, so nothing sensitive leaked during testing; with
real orders present the same mechanism would expose **customer PII and order
records** to unauthenticated callers.

`class-gk-cache-control.php` marks every `/wp-json/*` and `/graphql` response
`no-cache, no-store` via the LiteSpeed control API, the `DONOTCACHEPAGE`
family of constants, and explicit HTTP headers.

**Verify after activation** — this must return `401`, not a cached `200`:

```bash
curl -si "https://admin.grahakavach.in/wp-json/wc/v3/settings/general" \
  | grep -iE "^HTTP|x-litespeed-cache"
```

Expect `X-LiteSpeed-Cache-Control: no-cache` on every API response, and never
`hit,private`.

> Until the plugin is deployed, this remains **an open vulnerability on the
> live backend**. It should also be mitigated independently in LiteSpeed's
> own settings (exclude `/wp-json/` and `/graphql` from caching), so the
> protection does not depend on a single plugin staying active.
