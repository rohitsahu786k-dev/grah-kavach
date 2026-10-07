# SEO audit fixes (Semrush, 7 Oct 2026)

## Removing the dead URLs from Google
`urls-to-remove-from-google.txt` lists every URL from the audit that is 404 (or a redirect into a 404).
Search Console has no bulk upload, so remove them one by one:
Search Console -> Indexing -> Removals -> New request -> Temporarily remove URL -> paste the URL.
They are already 404, so Google also drops them on its own at the next crawl; the removal tool just speeds it up.
`/home` now 301-redirects to `/` and does not need removing.

## What was changed in code
- Canonical tags are always the page's own storefront URL (CMS canonicals were `/slug/` and `/home/`, which redirect or 404).
- One brand suffix in every title, 60 characters or fewer; descriptions padded/trimmed to 110-160 characters.
- Home page has its own title (was "Home - Graha Kavach").
- `www.grahakavach.in` 301-redirects to `grahakavach.in`; `/home` 301-redirects to `/`.
- `/blog?category=...` is noindex and canonical to `/blog`.
- WordPress sample post "hello-world" removed from the blog, sitemap and site (404).
- Added `/llms.txt`.

## Not fixable from the storefront code
- `http://grahakavach.in/` returned 403 to the Semrush crawler (a bot rule at the host/firewall). A normal request returns 301 to https.
- ~380 KB of JS/CSS per page: bundle size, a separate performance task.
- Delete the "Hello world!" post in WordPress admin so it is gone at the source too.
