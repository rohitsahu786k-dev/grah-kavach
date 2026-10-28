# Book Now landing page (/book-now)

A Hindi campaign page and a three-step booking funnel. Everything on it is managed in WordPress.

| What | Where in wp-admin |
|---|---|
| All copy, buttons, FAQ, timer settings | **Pages > Book Now**, "Landing Page Content" tabs |
| Images | Same screen; pick from the **Media Library** (alt text is set there) |
| SEO title, description, social card, noindex | The **Yoast SEO** box on the same page |
| Price, regular price, discount | The WooCommerce product `fire-safety-kit` |
| Amount paid now (the balance is paid on delivery) | WooCommerce **Deposits & Partial Payments** |

## Prices in the copy

Do not type prices into the text. Use these tokens and the storefront fills in the live figure, so the page can never show an amount the checkout does not charge:

`{price}` offer price, `{mrp}` regular price, `{discount}` difference, `{advance}` paid now, `{balance}` paid on delivery, `{end}` offer end time. Wrap words in `**double asterisks**` for bold.

## Countdown

Runs in India time. By default it counts to the daily cut-off in "Offer ends daily at" and restarts the next day. To run a real campaign with an end date, fill "Fixed offer end"; the timer then stops at zero. The price itself always follows WooCommerce, so end a sale there too.

## Funnel

`/book-now` (landing) > `/book-now/details` (details, pay, confirmed). The order is a normal WooCommerce COD order with the advance collected through Razorpay, created by the same API as the main checkout (source `nextjs-landing`). The details and payment steps are `noindex` and disallowed in robots.txt. The store header, footer and tab bar are hidden on these routes.

## First setup

Upload the plugin (v1.2.0 or later) and open wp-admin once. The "Book Now" page is created, and starter copy, the five images and a Yoast title and description are written into any empty fields, once. Check the placeholders the design left open: **customer reviews** (hidden until real ones are added), and the **cancellation / refund FAQ** (add one row in the FAQ tab: `Question|Answer`).
