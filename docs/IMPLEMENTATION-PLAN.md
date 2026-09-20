# Graha Kavach — Implementation Plan

**Status:** Phase 1 complete (audit + backup + architecture). No build work started.
**Companion document:** `docs/ARCHITECTURE.md`
**Content contract:** `docs/backend-content-model.md`

---

## 0. The central risk

`grahakavach.in` is a **live, indexed, customer-facing site today**. It is not a staging
environment and it is not empty. The headless backend `admin.grahakavach.in` is a separate,
blank WordPress install.

This means the project is not "build a frontend" — it is **a migration with a cutover**.
Every phase below is ordered so that the live site keeps serving until the replacement is
provably better. Nothing touches DNS for `grahakavach.in` until Phase 7.

Second risk: the Hostinger account currently connected to this session **does not own
`grahakavach.in`**. Panel-level backups, DNS changes, and file access for the real hosts are
not reachable from here. See §1.

---

## Phase 1 — Audit, backup, architecture ✅ **complete**

Done:
- Audited both WordPress installs, WooCommerce config, plugins, themes, APIs.
- Verified WPGraphQL, Woo REST v3, and Woo Store API reachability.
- Exported a content backup of both sites to `backups/<timestamp>/` (gitignored).
- Wrote `docs/ARCHITECTURE.md` and this plan.

Not done, and blocked:
- **A Hostinger panel backup could not be created.** See §1 below — this is the one Phase 1
  deliverable that requires user action before Phase 2 begins.

---

## §1 — Backup: what exists and what is still needed

**What was taken (by this session):**

`backups/<timestamp>/` contains a full REST content export:

| Source | Contents |
| --- | --- |
| `live-grahakavach.in/` | 11 pages (full Elementor content), 4 posts, all 216 media records, categories, tags |
| `admin-grahakavach.in/` | pages, posts, media, users, plus full WooCommerce config: system status, general/tax settings, tax classes, shipping zones, payment gateways, products, orders, customers, coupons |

This is enough to **rebuild content**, and enough to **diff against** after any change. It is a
safety net, and it captures the live site's URL structure — which is what the redirect map in
Phase 7 is built from.

**What it is not:** it is not a restorable site image. It has no database, no theme files, no
plugin files, no uploaded binaries (only their URLs), and no user passwords.

**Required before Phase 2 — user action:**

1. In hPanel for the account that owns `grahakavach.in`, create an on-demand backup of **both**
   `grahakavach.in` and `admin.grahakavach.in`, and confirm the restore point exists.
2. Either connect that Hostinger account to this session, or confirm that backend changes will
   be applied manually. Without it, Phases 2–4 cannot be executed programmatically.

**Do not begin Phase 2 until step 1 is confirmed.**

---

## Phase 2 — Backend configuration — **partially complete (2026-09-20)**

**Done:**
- Correct Hostinger account and WordPress MCP connected (`u522826627`, owns both hosts).
- Pre-change state snapshot captured to `backups/<ts>-phase2-pre/`.
- `grahakavach-headless-core` v1.0.0 built, deployed and activated.
- 🔴 **LiteSpeed authenticated-response leak closed and re-verified.**
- WPGraphQL for ACF 3.0.0, WPGraphQL Smart Cache 2.3.2, Add WPGraphQL SEO 5.1.0 installed.
- Backend `noindex` + robots.txt + all sitemap routes 404'd, APIs untouched.
- CORS allowlist live and enforced (allowed → ACAO; disallowed → no ACAO, preflight 403).
- Permalinks confirmed `/%postname%/`.

**Still outstanding — see §2.1 and §2.4 below:** store currency/country/address, GST rates,
shipping zones, payment gateway, `force_ssl`, Terms page, PRO Elements removal, 2FA,
and the `wp-config.php` constants (including the revalidation secret).

### Original scope

All work on `admin.grahakavach.in`. No frontend work. Nothing here is customer-visible.

### 2.1 Store fundamentals — *blocking for any commerce work*

| Setting | From | To |
| --- | --- | --- |
| Currency | `USD` | `INR` |
| Currency position | left | left, `₹` |
| Store country/state | `US:CA` | `IN:RJ` |
| Store address | empty | 103, Ostwal Plaza 2, Sundarwas, Udaipur (Raj.) India |
| `force_ssl` | `false` | `true` |
| Site title | `admin.grahakavach.in` | Graha Kavach |
| Timezone | UTC (`gmt_offset 0`) | `Asia/Kolkata` |

### 2.2 Security remediation

- Remove **PRO Elements** or replace with licensed Elementor Pro (`ARCHITECTURE.md` §9.3).
- Set `noindex` on the whole backend host.
- Resolve the missing `Access-Control-Allow-Origin` — or commit to the Next.js proxy approach
  and leave the Store API origin-locked. **Decide this before Phase 5.**
- Enable 2FA on the admin account.

### 2.3 Plugins

Already installed and active on `admin.grahakavach.in`:

| Plugin | Version | Keep? |
| --- | --- | --- |
| WooCommerce | 11.1.1 | ✅ core |
| WPGraphQL | 2.23.0 | ✅ core |
| Advanced Custom Fields | 6.8.10 | ✅ core |
| Yoast SEO | 28.5 | ✅ core |
| LiteSpeed Cache | 7.9.1 | ✅ keep, exclude API routes from page cache |
| Elementor | 4.2.4 | ⚠️ backend-only; not used for storefront rendering |
| PRO Elements | 4.2.3 | ❌ remove — see 2.2 |
| Classic Editor | 1.7.0 | ⚠️ optional |
| EMCP Tools | 3.16.1 | ✅ MCP access |

Still required:

| Plugin | Purpose | Priority |
| --- | --- | --- |
| **WPGraphQL for ACF** | Exposes ACF fields in the GraphQL schema. Without it the entire ACF content model in `backend-content-model.md` is unreachable over GraphQL. | **Blocking** |
| **Headless/CORS helper** (or a small mu-plugin) | Sends `Access-Control-Allow-Origin` and `X-Robots-Tag: noindex`. Skip if using the Next.js proxy. | High |
| **Payment gateway** — Razorpay or PayU | No gateway is enabled today. Nothing can be sold. | **Blocking for launch** |
| **WPGraphQL Yoast SEO** | Serves Yoast metadata through GraphQL instead of a second REST call. | Medium |
| **2FA plugin** | Admin account hardening. | Medium |
| WooGraphQL | Only if catalogue reads move to GraphQL. Not required by the chosen architecture. | Optional |

### 2.4 Commerce configuration

- GST tax rates per product HSN code; set `tax_based_on` appropriately for Indian GST.
- Shipping zones for India (currently only the catch-all fallback zone exists) with real rates.
- Enable COD plus one online gateway.
- Create the **Terms and conditions** page — WooCommerce reports it as missing.

**Exit criteria:** a test order can be placed end-to-end in INR on `admin.grahakavach.in`, with
tax and shipping calculated, and it appears correctly in the orders list.

---

## Phase 3 — Content model

- Build the ACF field groups exactly as specified in `docs/backend-content-model.md`.
  That file is the contract; do not add or rename fields without updating it first.
- Create the ACF options page `Graha Kavach Settings`.
- Enable **Show in GraphQL** on every field group, with the GraphQL field names from the contract.
- Verify each field group by running a real GraphQL query against it before any frontend code
  consumes it.

**Exit criteria:** one GraphQL query returns the full global settings object and a complete
homepage composition.

---

## Phase 4 — Content and media migration

Source: `grahakavach.in`. Target: `admin.grahakavach.in`.

1. Migrate all **216 media items** with filenames preserved.
2. Migrate 4 blog posts, preserving slugs exactly:
   - `fire-ball-at-home-a-beginners-safety-guide`
   - `aff-fire-ball-protection-for-home-office`
   - `the-right-fire-extinguisher-for-car-safety`
   - `how-to-choose-fire-extinguisher-for-home`
3. Migrate editorial pages: `about-us`, `contact-us`, `privacy-policy`, `blogs`, `home`.
4. **Convert product pages into real WooCommerce products.** The live site has no WooCommerce —
   `fire-blanket`, `fire-extinguisher-for-car`, `fire-extinguisher-for-home`, `aff-fire-ball`,
   `standard-fire-extinguisher-combo-kit`, and `our-product` are Elementor pages today. Each
   needs a real product with SKU, price, stock, category, images, and tax class.
   **This is the largest single task in the project** and the one most likely to be
   underestimated — it is content authoring, not migration.
5. Rewrite image URLs embedded in migrated content to the new host.
6. Record the old-URL → new-URL map. Phase 7 depends on it.

**Exit criteria:** every live URL has a known destination, and no migrated page references an
image on the old host.

---

## Phase 5 — Frontend build

**Not started — begins only on explicit instruction.**

Current scaffold: routes for `/`, `/about`, `/blog`, `/blog/[slug]`, `/shop`; libs for GraphQL,
Woo REST, Woo Store, SEO, tracking, and validation.

1. Fix `src/lib/woocommerce/rest.ts` to send credentials as an `Authorization: Basic` header
   rather than query parameters (`ARCHITECTURE.md` §2).
2. Decide and implement the caching model — either adopt `cacheComponents: true` with
   `use cache`/`cacheTag`/`cacheLife`, or stay on `fetch`-level `next: { revalidate, tags }`.
   Apply one consistently; do not mix.
3. Replace the fallback content in `src/lib/wordpress/content-fallbacks.ts` with live ACF data
   once Phase 3 lands.
4. Build product listing and product detail pages against Woo REST.
5. Build cart via the chosen Store API path (proxy vs. direct CORS).
6. Implement checkout handoff to WooCommerce.
7. Structured data, `generateMetadata`, sitemap, robots.
8. Revalidation route handler with shared-secret auth; WordPress webhooks to call it.

---

## Phase 6 — Pre-cutover verification

- Deploy Next.js to a staging URL reading from the real backend.
- Verify: every migrated URL resolves, every image loads, metadata matches, structured data
  validates, a real payment completes, and the order appears in WooCommerce.
- Lighthouse and Core Web Vitals baseline against the current live site — the replacement must
  not regress.
- Confirm the full redirect map from Phase 4.6.

---

## Phase 7 — Cutover

The only phase that touches the live domain. Plan a rollback before starting.

1. Capture a fresh backup of `grahakavach.in` immediately before cutover.
2. Point `grahakavach.in` at the Next.js deployment.
3. Apply all 301 redirects.
4. Verify the backend is `noindex` and the storefront is indexable.
5. Submit the new sitemap; monitor Search Console for coverage loss daily for two weeks.
6. Keep the old WordPress install intact and reachable (not deleted) until rankings are stable.

---

## Open decisions — needed from the user

1. **Hostinger account access.** The connected account does not own `grahakavach.in`. Connect
   the correct one, or confirm manual application of backend changes.
2. **Cart transport:** Next.js proxy (recommended) or CORS-enabled direct Store API calls?
3. **Payment gateway:** Razorpay, PayU, or another?
4. **PRO Elements:** approve removal, or purchase an Elementor Pro licence?
5. **Product catalogue:** who authors SKUs, prices, stock, and GST/HSN data? This is business
   input the build cannot supply.
6. **Checkout domain:** accept the visible handoff to `admin.grahakavach.in` for launch, or
   budget for a headless checkout?
