# Graha Kavach WhatsApp Alerts

WhatsApp Cloud API messages for the WooCommerce backend (`admin.grahakavach.in`) and the Next.js storefront.

| Message | Template | Triggered by |
| --- | --- | --- |
| Signup thank-you | `gk_welcome` | Customer account created (needs a phone number) |
| Abandoned cart, reminder 1 / 2 | `gk_cart_reminder_1` / `_2` | Cart idle 60 min / 24 h after the shopper typed a mobile number at checkout |
| Payment successful | `gk_payment_success` | Online order paid |
| COD confirmed | `gk_cod_advance_received` | COD order, online advance paid |
| Order being processed | `gk_order_processing` | 5 min after payment (setting) |
| Shipped + tracking | `gk_order_shipped` | Tracking number added (Advanced Shipment Tracking) |
| Delivered | `gk_order_delivered` | Status -> Completed |
| Cancelled / Refunded / Payment failed | `gk_order_cancelled`, `gk_order_refunded`, `gk_payment_failed` | Matching WooCommerce events |
| New order alert to the owner | `gk_admin_new_order` | Confirmed order |

`templates.json` is the single source of truth for all of them. The Meta approval document in `docs/whatsapp/` is generated from it.

## How it works

- Order messages hook into WooCommerce itself, so they fire no matter where the order was created (storefront, wp-admin, REST).
- Nothing sends inside a request. Each message is logged, queued in Action Scheduler and sent in the background with up to 4 attempts (2, 10, 30 min back-off). A Meta outage can never slow or break checkout.
- The cart lives in the browser, so the storefront posts a signed snapshot to `POST /wp-json/gk-whatsapp/v1/cart/capture` once a valid mobile number is typed at checkout. The signature is HMAC-SHA256 with the existing `GK_HEADLESS_REVALIDATE_SECRET`; no new secret is needed on either side.
- The reminder button opens `https://grahakavach.in/cart?recover=<token>`; the storefront restores the cart and goes to checkout.
- Reminders stop as soon as the customer's order is confirmed, are capped at 3 per number per 7 days, and are skipped for numbers that replied `STOP`.

## Install

1. Copy this folder to `wp-content/plugins/grahakavach-whatsapp/` on the WordPress host and activate it. WooCommerce must be active.
2. Add to `wp-config.php` (above "That's all, stop editing"):

   ```php
   define( 'GKWA_ACCESS_TOKEN', '<System User token, expiry Never>' );
   define( 'GKWA_APP_SECRET',   '<Meta app secret>' );
   define( 'GKWA_VERIFY_TOKEN', '<any long random string>' );
   // define( 'GKWA_DISABLED', true ); // emergency kill switch, no deploy needed
   ```

   `GK_HEADLESS_REVALIDATE_SECRET` must already be defined (it is, for the Next.js revalidation webhook).
3. WooCommerce -> WhatsApp Alerts -> Settings: fill in Phone number ID and WhatsApp Business Account ID, set the owner's number, tick **Enable**, save.
4. Templates tab -> **Submit missing templates to Meta**. Wait until each shows `APPROVED`.
5. In Meta (WhatsApp -> Configuration) set the callback URL shown on the Settings tab, paste the verify token, subscribe to **messages**, then press **Subscribe app to WhatsApp account**.
6. Settings tab -> send a test message to your own number. Check the **Message log** tab.

The Next.js side needs no new environment variable. Deploy the storefront as usual.

## Notes

- **Reliable timing**: the cart reminders use WP-Cron every 10 minutes. On low-traffic sites add a real cron: `*/10 * * * * curl -s https://admin.grahakavach.in/wp-cron.php?doing_wp_cron >/dev/null`.
- **Tracking**: the shipped message reads the `_wc_shipment_tracking_items` meta that Advanced Shipment Tracking writes (the same data `/api/track` uses).
- **Delivered message**: it fires on status `Completed`. If Advanced Shipment Tracking is set to auto-complete orders when shipped, turn the delivered message off in Settings.
- **Consent**: cart reminders are MARKETING. Add a line to the privacy policy and checkout saying order updates and reminders are sent on WhatsApp, and keep the STOP handling on.
- **Phone numbers** are normalised to `91XXXXXXXXXX`. Orders without a valid mobile are logged as `skipped`, never an error.
