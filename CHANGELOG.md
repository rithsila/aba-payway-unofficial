# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `paymentGate` and `viewType` on `PurchaseRequest`, unlocking the hosted card
  checkout. A merchant profile with the QR Payment API service enabled answers
  every purchase with KHQR JSON and ignores `paymentOption`; `paymentGate: 0`
  routes to the Checkout service, which returns the page as `checkoutUrl`.
  This is the only sandbox flow a human can pay, so it is the only way to reach
  `APPROVED`/`DECLINED` — sandbox KHQR cannot be scanned by real ABA Mobile.
- `npm run pay:sandbox` — creates a card purchase, opens the checkout page, and
  polls until ABA settles it. Prints ABA's test cards.

- `npm run report:sandbox` — runs the full live battery and writes a dated
  evidence report to `reports/` for a production access request. Checks that
  do not run are recorded as NOT VERIFIED, and the verdict only says READY
  when a real card payment actually settled as APPROVED.

### Fixed
- **`verifyWebhook` now implements ABA's actual pushback scheme.** It hashed
  the raw payload string, which matches nothing ABA sends, so it rejected
  every genuine callback. ABA sorts the JSON body's keys ascending and
  concatenates their *values* (no keys, no separator) before HMAC-SHA512 and
  base64. It now accepts a raw string or an already-parsed object — the
  signature is rebuilt from parsed values, so re-serialising cannot break it —
  and falls back to `apiKey` when no secret is given, since ABA issues no
  separate pushback secret.
- `createPurchase` no longer follows ABA's checkout redirect and misreports the
  resulting HTML as "the merchant ID or API key is wrong".
- README no longer claims `verifyWebhook()` supported ABA's pushback header; it
  contradicted `.env.example`, which said it was unimplemented.

### Changed
- Extracted `hmacSha512Base64` so request signing and pushback verification
  share one HMAC implementation.
- The report's T9 no longer waits for `DECLINED`, which never arrives. A
  refused card does not settle the transaction: ABA shows error 57 on the
  checkout page and leaves it open for retry, so `check-transaction-2` keeps
  reporting `PENDING`. T9 now asserts the negative — a refused attempt must
  never surface as `APPROVED` — and the docs record that `PENDING` must not be
  read as "this payment failed".

## [1.2.0]

### Added
- Support for the ABA Mobile deeplink flow end to end.

### Changed
- Style match header color and flag-tail notch to official KHQR branding.
- Redesigned card template to fix clip-path/transform bug.

### Fixed
- Preserved quickchart's viewBox so the QR fills the frame natively.
- Fixed the fetching of QR to fill the frame appropriately, not just to its native size.
- Corrected fabricated method names in the LLM agent guide.

### Documentation
- Documented `generateKHQR` in the agent guide's KHQR step.
- Broadened agent-guide stack detection beyond 5 JS frameworks.

## [1.1.0]

### Added
- Credential preflight and QR-viewing scripts, alongside a testing guide.

### Fixed
- Parsed ABA's v3 response envelope properly.
- Fixed `tsconfig` flag invalidation blocking the build.
- Fixed build by ordering types condition first and adding ignoreDeprecations.
- Corrected webhook secret and dropped unrelated app docs.

### Removed
- Removed `docs-site` after moving it to a separate repository.

## [1.0.0] - Initial Release

### Added
- Initial setup and scaffolding for `aba-payway-sdk-unofficial`.
- `ABAPayWay` client implementation with purchase, status check, and webhook verification.
- Configurable KHQR SVG generator.
- Utilities for transaction ID, timestamp, phone formatting, and QR expiration.
- HMAC-SHA512 hash generation for ABA API authentication.
- TypeScript type definitions.
- Sandbox integration tests, `env` example, and project documentation.
- Fumadocs documentation website and LLM agent integration guide.

### Fixed
- Corrected `req_time` timezone, items encoding, and non-JSON replies.
