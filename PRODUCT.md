# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are software developers and fintech engineers integrating ABA PayWay into Cambodian commerce systems, web checkouts, kiosks, Telegram mini apps, and backend services.

Secondary users are technical merchants and e-commerce operators who need to understand payment options, QR behavior, sandbox limitations, and go-live readiness well enough to evaluate or operate an integration.

## Product Purpose

Provide an unofficial, edge-compatible TypeScript SDK and practical documentation for ABA PayWay integrations. The product helps teams create purchases, generate and display KHQR payment codes, open ABA Mobile deeplinks, check transaction status, verify webhooks, and understand sandbox behavior without rebuilding the same integration glue repeatedly.

Success means a developer can move from credentials to a working, type-safe PayWay payment flow with fewer undocumented assumptions, clear examples, and reliable handling of ABA/KHQR response formats.

## Positioning

The durable position is an unofficial TypeScript SDK for ABA PayWay that turns PayWay's API contracts and KHQR display requirements into developer-ready utilities, typed responses, examples, and verification helpers.

The project should be transparent that it is unofficial while preserving ABA PayWay, KHQR, and Bakong terminology accurately.

## Operating Context

Users work inside JavaScript and TypeScript applications that may run in Node.js, serverless, or edge-compatible runtimes. Common workflows include creating a PayWay purchase, showing a returned QR image or locally generated KHQR frame, opening a mobile deeplink, checking transaction status, and validating webhook notifications.

The repository also includes local PayWay documentation mirrors under `monitor-bot/docs`, developer integration guidance under `docs`, sandbox scripts under `scripts`, and tests that document response normalization and cryptographic behavior.

## Capabilities and Constraints

The SDK supports purchase creation, payment-option selection, ABA PayWay deeplinks, KHQR display generation from EMV data, transaction status checks, webhook verification, HMAC hashing helpers, and sandbox/test scripts.

KHQR display work must preserve PayWay QR payment display guidance: users choose supported payment options, the generated QR appears in a clear scan area, and the flow has a payment completion state in the host application.

The project cannot claim official ABA endorsement. Sandbox KHQR limitations must remain clear because sandbox QR payments may stay pending when they cannot be scanned by the real ABA Mobile app.

## Brand Commitments

Use the project name and framing as an unofficial ABA PayWay SDK. Keep the voice direct, implementation-focused, and careful about banking/payment terminology.

Respect official ABA PayWay, ABA PAY, KHQR, and Bakong visual and textual conventions when rendering payment assets or explaining payment behavior. Avoid visual treatments that make payment screens look unofficial, decorative, or ambiguous.

## Evidence on Hand

- `src/client.ts` implements the PayWay client behavior and response normalization.
- `src/khqr.ts` generates the local KHQR display frame from an EMV/KHQR string.
- `tests` cover hashing, response handling, client behavior, utilities, and KHQR output.
- `docs/agent-guide.md` explains integration paths and frontend display decisions.
- `monitor-bot/docs` contains local mirrors of PayWay documentation used for implementation reference.
- There are no confirmed customer testimonials, production metrics, official certifications, or ABA endorsement claims in the repo.

## Product Principles

1. Prefer precise payment behavior over broad abstraction.
2. Keep examples runnable and aligned with the current SDK API.
3. Preserve official PayWay/KHQR terminology and display expectations.
4. Make sandbox limits and go-live caveats explicit where they affect developer decisions.
5. Keep UI and documentation practical for developers who are actively integrating payments.

## Accessibility & Inclusion

Payment display surfaces should maintain readable contrast, clear QR placement, and direct status language. Documentation should stay scannable, code-oriented, and understandable for both Cambodian and international developers working with ABA PayWay.
