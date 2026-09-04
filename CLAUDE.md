# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An unofficial TypeScript SDK for the ABA PayWay payment gateway (Cambodia). It is published to npm as a library — there is no app to run. The public surface is defined entirely by `src/index.ts`.

## Commands

```bash
npm test              # run all tests once (vitest run)
npm run test:watch    # watch mode
npm run build         # bundle to dist/ via tsup (ESM + CJS + .d.ts)

npx vitest run tests/hash.test.ts          # run a single test file
npx vitest run -t "constant-time"          # run tests matching a name
```

`npm run build` runs automatically before publish (`prepublishOnly`).

## Architecture

The code is split by responsibility, one concern per file in `src/`:

- `client.ts` — `ABAPayWay` class. The only stateful piece. Holds frozen config and makes the three network calls: `createPurchase`, `checkStatus`, `verifyWebhook`.
- `hash.ts` — `generateABAHash`. Authentication signature for every API call.
- `utils.ts` — pure helpers (transaction IDs, timestamps, phone formatting, QR expiry).
- `khqr.ts` — `generateKHQR`. Builds a self-contained QR image; does not touch the ABA API.
- `types.ts` — all shared types. No runtime code.
- `index.ts` — barrel export. Anything not re-exported here is private to the package.

### Critical: ABA hash parameter order

`generateABAHash` concatenates parameters in an **exact fixed order** before HMAC-SHA512 (see the array in `hash.ts`). ABA's server rebuilds the same string and compares. If you add, remove, or reorder a field — in `hash.ts` OR in the `hashParams` object built in `client.ts` — the signature breaks and the API rejects the request. The two must always stay in sync. Missing optional fields are sent as empty strings (`?? ""`), never omitted.

Two things to know before extending it:

- **`hash.ts` does not match ABA's published order, and that is currently harmless.** ABA's v3 docs list no `ctid`/`pwt`, and end with five fields the SDK omits: `payout`, `lifetime`, `additional_params`, `google_pay_token`, `skip_success_page`. Since `ctid`/`pwt` are always `""` and the trailing five are always absent, both sides concatenate the identical string. **This stops being true the moment you support any of those five** — adding `lifetime` to the body without also appending it (and the four around it, in order) to `hash.ts` produces "Wrong Hash." on every request.
- **Not every body field is hashed.** `payment_gate` and `view_type` are body-only; putting them in `hashParams` breaks the signature. They are appended to the body *after* `hash` is built in `client.ts` for exactly this reason.

### Crypto is Web Crypto, not Node `crypto`

All hashing uses `crypto.subtle` + `TextEncoder` + `btoa`, never `node:crypto`. This is deliberate: the SDK must run in Node 18+, Deno, and edge runtimes. Keep it that way — do not import `node:crypto`. (This is also why `tsconfig.json` includes the `DOM` lib.) Because `crypto.subtle.sign` is async, **every function that hashes is async**, including `verifyWebhook` and `generateKHQR`.

`verifyWebhook` uses a constant-time comparison loop to avoid timing attacks — preserve this when editing.

### Pushback signing is not request signing

Two different schemes, and mixing them up silently rejects every callback:

- **Requests** (`hash.ts`) — a **fixed documented field order**, concatenated.
- **Pushback** (`verifyWebhook`) — the body's keys **sorted ascending**, then their **values** concatenated (no keys, no separator), matching ABA's PHP `ksort()` + `$b4hash .= $value`.

Consequences worth preserving:

- Hash the **whole body**, never a fixed list of the five documented fields (`tran_id`, `apv`, `status`, `return_params`, `merchant_ref`) — sorting the body means a field ABA adds later is covered automatically.
- The **raw body is not needed**, because the signature is rebuilt from parsed values. `verifyWebhook` therefore accepts a string or an already-parsed object, and incoming key order is irrelevant.
- The secret is the **merchant API key**; ABA issues no separate pushback secret. `verifyWebhook` falls back `secret` → `webhookSecret` → `apiKey`.
- Value coercion mirrors PHP: `null`/absent contributes `""`, `true` is `"1"`, objects are JSON-encoded. That last one is a latent mismatch — PHP's `json_encode` escapes `/` as `\/` and `JSON.stringify` does not — but every documented pushback field is a string, so the object branch is defensive only.

### API response convention

Client methods never throw on a failed payment or HTTP error. They catch everything and return a result object with `success: false`, an `error` string, and ABA's `errorCode`. Follow this pattern for any new client method — callers expect to branch on `success`, not catch exceptions.

ABA ships **two status-envelope shapes**, and `src/response.ts` (`readAbaStatus`) normalises both. Never test `data.status !== 0` directly:

- legacy (`check-transaction`): `{ "status": 6, "description": "tran_id not found" }`
- v3 (`check-transaction-2`, current purchase): `{ "status": { "code": "00", "message": "Success!" } }`

Success is the **string** `"00"` in v3 but the **number** `0` in the legacy shape, while failures are plain numbers in both. Reading a v3 success as a failure is exactly the bug that made a valid key look expired.

Other shape details worth knowing:

- Purchase returns `qrString`/`qrImage` (camelCase) on v3, `qr_string` on the old API. It does **not** return `checkout_url` on v3.
- The deeplink flow (`paymentOption: "abapay_khqr_deeplink"`) adds `abapay_deeplink` (`abamobilebank://…`) plus `app_store`/`play_store` links for a device without ABA Mobile. Verified against the live sandbox — every KHQR/deeplink option returns all of them, so one `createPurchase` covers phone-with-app, phone-without, and desktop. Community docs also list a `checkout_qr_url`; the sandbox never sends it, so the SDK does not read it.
- `return_deeplink` is base64-encoded JSON, `{ ios_scheme, android_scheme }`, and `encodeReturnDeeplinkForABA` handles it — the same encode-once rule as `items`: the hash and the body must carry the identical string.
- Only `req_time`, `merchant_id`, `tran_id`, `amount`, `items`, the customer fields, `payment_option`, the URLs, `return_deeplink`, `currency`, `custom_fields`, `return_params` and `hash` go in the **body**. `shipping`, `ctid`, `pwt` and `type` are hashed but must **not** be sent — including `shipping=""` in the body makes ABA answer code 10 "Wrong shipping price."
- `check-transaction-2` nests the detail under `data`, as `total_amount`, `payment_currency`, `transaction_date`.
- A rejected request is HTTP **403** with the reason in a JSON envelope, so parse the body on non-2xx too. Codes: 1/5 wrong hash, 6 unknown `tran_id`, 21 expired key.
- A freshly created `abapay_khqr` transaction returns code 6 for a second or so before it is queryable. The SDK does not retry internally, because code 6 also means a genuinely unknown transaction.
- Error codes are **endpoint-specific**, not global. Code 6 is "tran_id not found" on `check-transaction-2` but "domain not whitelisted" on `purchase`. Don't write one shared lookup table.

### Paying a sandbox transaction: `payment_gate`

Sandbox KHQR cannot be scanned by the real ABA Mobile app, so `abapay_khqr` transactions stay `PENDING` forever and nothing exercises `APPROVED`/`DECLINED` or the pushback. The hosted **card** checkout is the only sandbox flow a human can finish, using the cards in `docs/ABA Test Cards.md`.

`paymentOption: "cards"` alone does **not** get you there. This merchant profile has the QR Payment API service enabled, so `purchase` answers with KHQR JSON and silently ignores `payment_option`. Sending **`paymentGate: 0`** routes the request to the Checkout service, which replies **HTTP 302** to the hosted page. Verified against the live sandbox.

That redirect drives two details in `client.ts`:

- The purchase fetch uses `redirect: "manual"`. Following it yields the checkout page's HTML, which `parseAbaJson` reports as "the merchant ID or API key is wrong" — badly wrong advice for a request that succeeded.
- A 3xx with a `Location` is returned as `success: true` plus `checkoutUrl`; there is no JSON body to read, so the caller polls `checkStatus` for the outcome.

`view_type` changes the URL shape but not its validity: `hosted_view` is served from the root (`/<payload>`), everything else from `/checkout/<payload>`. Don't assert on the path. The page's token expires 180s after creation; the transaction stays open longer.

`npm run pay:sandbox` drives the whole loop — create, open the browser, poll until ABA settles.

### The RSA key pair is unused

ABA's credential sheet includes an RSA public and private key alongside the merchant ID and "Public Key". Nothing in this SDK uses them: purchase, check-transaction-2, and webhook verification are all HMAC-SHA512 signed with the API key. The RSA pair belongs to the payout/refund APIs, which ABA enables per merchant (`/payments/refund` is 404 on a default sandbox merchant). Do not wire RSA into the request path without a specific endpoint that needs it.

### `generateKHQR` note

`generateKHQR` is async and returns a base64-encoded SVG **data URI** (`data:image/svg+xml;base64,...`), not a hosted URL. It fetches the QR matrix from quickchart.io and embeds it in a styled SVG card. If that fetch fails it falls back to a placeholder box rather than throwing. (The README's API table is slightly out of date here — trust the code.)

## Testing

Vitest with `globals: true`, so `describe`/`it`/`expect` are available without imports. Tests live in `tests/` (excluded from the build via `tsconfig.json`). There is no HTTP mocking library set up — network-dependent paths are tested by stubbing `fetch` or asserting on pure logic.
