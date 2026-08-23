# Field Journal: post-deploy ops checklist

Complete after shipping the containment + session-auth changes.

## 1. Environment

In Vercel (Production + Preview) and local `.env.local`:

1. Set a **new** `CARRIER_JOURNAL_LOG_SECRET` (rotate; treat the old passphrase as compromised).
2. Set `CARRIER_SESSION_SIGNING_SECRET` to a long random value (do **not** reuse the passphrase).
3. Redeploy.

## 2. Notion unpublish

1. Open the Carrier Journal database.
2. Uncheck **Publish Public** on every row (or filter `Publish Public = true` and clear).
3. Save a daybook entry or redeploy so `revalidateTag("notion-carrier-journal")` / ISR (300s) clears cached HTML.
4. Purge any CDN in front of the site if present.

## 3. Verify

- [ ] `/field-journal` shows the sanitized public fitness journal.
- [ ] `/field-journal/footwear` shows unbranded Pair A/B mileage only (no brand/ratings).
- [ ] `/carrier-journal` permanently redirects to `/field-journal`.
- [ ] `/log?token=anything` does **not** authenticate (no query-token gate).
- [ ] POST login at `/log` sets HttpOnly `carrier_session`.
- [ ] Daybook save sets Notion **Publish Public** checked.
- [ ] Empty Notion does not show seed/demo narratives on any public path.
- [ ] Old passphrase fails; new passphrase works.

## 4. Search / cache

- Request Google removal or URL inspection refresh for indexed journal and footwear URLs if snippets still show employer, HOKA, or operational text.
