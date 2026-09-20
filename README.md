# Graha Kavach Frontend

Next.js storefront for `grahakavach.in` with WordPress and WooCommerce running at `admin.grahakavach.in`.

## Architecture

- Frontend: `https://grahakavach.in`
- Backend: `https://admin.grahakavach.in`
- GraphQL: `https://admin.grahakavach.in/graphql`
- WordPress REST: `https://admin.grahakavach.in/wp-json/wp/v2/`
- Woo Store API: `https://admin.grahakavach.in/wp-json/wc/store/v1/`
- Woo REST: `https://admin.grahakavach.in/wp-json/wc/v3/`

## Backend Plugins

- WooCommerce
- Advanced Custom Fields Pro
- WPGraphQL
- WPGraphQL for ACF
- Yoast SEO
- Advanced Shipment Tracking for WooCommerce

## Decisions

- My Account stays on native WooCommerce.
- Cart and checkout currently link to native WooCommerce pages.
- Public products use WooCommerce Store API.
- Server-only order/admin operations use WooCommerce REST API.
- CMS content prefers WPGraphQL and falls back to WordPress REST.
- SEO metadata maps from Yoast REST fields when available.
- Backend ACF field expectations are documented in `docs/backend-content-model.md`.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill private values where needed. Public endpoint defaults are already in `src/lib/site-config.ts`.
