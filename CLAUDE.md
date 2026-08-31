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

### Crypto is Web Crypto, not Node `crypto`

All hashing uses `crypto.subtle` + `TextEncoder` + `btoa`, never `node:crypto`. This is deliberate: the SDK must run in Node 18+, Deno, and edge runtimes. Keep it that way — do not import `node:crypto`. (This is also why `tsconfig.json` includes the `DOM` lib.) Because `crypto.subtle.sign` is async, **every function that hashes is async**, including `verifyWebhook` and `generateKHQR`.

`verifyWebhook` uses a constant-time comparison loop to avoid timing attacks — preserve this when editing.

### API response convention

Client methods never throw on a failed payment or HTTP error. They catch everything and return a result object with `success: false`, an `error` string, and ABA's `errorCode`. Follow this pattern for any new client method — callers expect to branch on `success`, not catch exceptions.

ABA ships **two status-envelope shapes**, and `src/response.ts` (`readAbaStatus`) normalises both. Never test `data.status !== 0` directly:

- legacy (`check-transaction`): `{ "status": 6, "description": "tran_id not found" }`
- v3 (`check-transaction-2`, current purchase): `{ "status": { "code": "00", "message": "Success!" } }`

Success is the **string** `"00"` in v3 but the **number** `0` in the legacy shape, while failures are plain numbers in both. Reading a v3 success as a failure is exactly the bug that made a valid key look expired.

Other shape details worth knowing:

- Purchase returns `qrString`/`qrImage` (camelCase) on v3, `qr_string` on the old API. It does **not** return `checkout_url` on v3.
- `check-transaction-2` nests the detail under `data`, as `total_amount`, `payment_currency`, `transaction_date`.
- A rejected request is HTTP **403** with the reason in a JSON envelope, so parse the body on non-2xx too. Codes: 1/5 wrong hash, 6 unknown `tran_id`, 21 expired key.
- A freshly created `abapay_khqr` transaction returns code 6 for a second or so before it is queryable. The SDK does not retry internally, because code 6 also means a genuinely unknown transaction.

### The RSA key pair is unused

ABA's credential sheet includes an RSA public and private key alongside the merchant ID and "Public Key". Nothing in this SDK uses them: purchase, check-transaction-2, and webhook verification are all HMAC-SHA512 signed with the API key. The RSA pair belongs to the payout/refund APIs, which ABA enables per merchant (`/payments/refund` is 404 on a default sandbox merchant). Do not wire RSA into the request path without a specific endpoint that needs it.

### `generateKHQR` note

`generateKHQR` is async and returns a base64-encoded SVG **data URI** (`data:image/svg+xml;base64,...`), not a hosted URL. It fetches the QR matrix from quickchart.io and embeds it in a styled SVG card. If that fetch fails it falls back to a placeholder box rather than throwing. (The README's API table is slightly out of date here — trust the code.)

## Testing

Vitest with `globals: true`, so `describe`/`it`/`expect` are available without imports. Tests live in `tests/` (excluded from the build via `tsconfig.json`). There is no HTTP mocking library set up — network-dependent paths are tested by stubbing `fetch` or asserting on pure logic.
