# Graha Kavach WhatsApp Contacts API

Written for: the developer or marketing team that will pull contact data for ad audiences.

## Overview

The Contacts API returns one record per WhatsApp number that has messaged, been messaged by, or opted out of Graha Kavach. Each record carries the phone number, name, first and last message times, lead status, order amount, opt-out state and the Meta ad that brought the lead in. Buyers and opted-out numbers can be excluded from ad audiences using these fields.

It is part of the `grahakavach-whatsapp` WordPress plugin on admin.grahakavach.in.

## Setup and authentication

The endpoint is closed by default because it returns personal data.

1. Set a long random string, either in WooCommerce -> WhatsApp Alerts -> Settings -> "Contacts API key", or in `wp-config.php` on the WordPress host:

   ```php
   define( 'GKWA_CONTACTS_API_KEY', '<long random string>' );
   ```

2. Install the updated plugin so the contacts table is created. The plugin must be active and the Meta webhook must be subscribed to **messages**.
3. Send the key in every request as `Authorization: Bearer <GKWA_CONTACTS_API_KEY>`.

A logged-in WordPress user who can manage WooCommerce can also call the endpoint. Everyone else receives HTTP 401.

## Request

```
GET https://admin.grahakavach.in/wp-json/gk-whatsapp/v1/contacts
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `updated_after` | date | none | Only contacts changed after this time. ISO 8601 (`2026-10-01T00:00:00Z`) or `Y-m-d`. Use it for incremental syncs. |
| `page` | integer | 1 | Page number, starting at 1. |
| `per_page` | integer | 100 | Records per page, maximum 200. |

Results are sorted by last change, oldest first, so a sync can store the newest `updated_after` it has seen and continue from there.

```
curl -H "Authorization: Bearer <GKWA_CONTACTS_API_KEY>" \
  "https://admin.grahakavach.in/wp-json/gk-whatsapp/v1/contacts?updated_after=2026-10-01&per_page=100"
```

## Response fields

| # | Data point | JSON field | Notes |
| --- | --- | --- | --- |
| 1 | Phone number with country code | `phone` | Digits only, e.g. `919812345678`. This is the key Meta matches on. |
| 2 | Name | `name` | WhatsApp profile name, else the name from the order or cart. May be empty. |
| 3 | First and last message | `first_message_at`, `last_message_at` | ISO 8601, UTC. Both directions. Customer replies only: `first_reply_at`, `last_reply_at`. |
| 4 | Lead status | `lead_status` | `ordered`, `interested`, `no_reply` or `not_interested`. |
| 5 | Order amount | `orders`, `order_amount`, `currency` | Total of paid orders linked to the number, in INR. |
| 6 | Opt-out / block status | `opted_out`, `opted_out_at` | `true` once the customer replied STOP. Opted-out numbers are still listed. |
| 7 | Source ad | `ad.ad_id`, `ad.ctwa_clid`, `ad.headline`, `ad.source_url` | From the click-to-WhatsApp referral. `null` when the lead did not come from an ad. |

Paging fields at the top level: `total`, `page`, `per_page`, `pages`.

```json
{
  "total": 42, "page": 1, "per_page": 100, "pages": 1,
  "contacts": [{
    "phone": "919812345678",
    "name": "Asha Verma",
    "first_message_at": "2026-10-02T06:10:00+00:00",
    "last_message_at": "2026-10-05T11:02:00+00:00",
    "first_reply_at": "2026-10-02T06:12:00+00:00",
    "last_reply_at": "2026-10-04T09:30:00+00:00",
    "messages_sent": 3,
    "lead_status": "ordered",
    "orders": 1,
    "order_amount": 2499,
    "currency": "INR",
    "opted_out": false,
    "opted_out_at": null,
    "ad": {
      "ad_id": "1203...",
      "ctwa_clid": "AR...",
      "headline": "Complete home fire protection",
      "source_url": "https://fb.me/..."
    }
  }]
}
```

## Lead status

The first rule that matches wins:

| Status | Rule |
| --- | --- |
| `ordered` | A paid order is linked to the number. |
| `not_interested` | The customer replied STOP and has no paid order. |
| `interested` | The customer replied, clicked a cart reminder, or has an active cart. |
| `no_reply` | Graha Kavach messaged the number and there was no reply. |

## Limitations

- Replies, profile names and ad referral data are stored only from the moment the updated plugin is installed. Earlier conversations have no reply times or ad data.
- Orders are linked to a number through the message log, so only orders that triggered a WhatsApp message are counted.
- The endpoint holds data from this plugin only. Conversations handled inside a third-party WhatsApp tool such as Blue Tick are not included.
- Phone numbers are normalised to `91XXXXXXXXXX`. Numbers without a valid mobile are skipped.
