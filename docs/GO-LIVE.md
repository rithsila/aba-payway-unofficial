# Go-Live Guideline — Sandbox to Production

What has to be true before you ask ABA to enable production, what changes
when they do, and how to verify the switch.

For *how to run the tests*, see [TESTING_GUIDE.md](../TESTING_GUIDE.md).
This document is about **readiness**, not mechanics.

---

## 1. Readiness checklist

Status as of the last verified run. Update it as you go — an unchecked box
is a thing ABA or your users will find for you.

### Verified working

- [x] **Credentials and signing** — ABA accepts the HMAC-SHA512 request
      signature, and rejects one signed with a wrong key.
- [x] **KHQR purchase** — returns an EMVCo payload (`000201…`) and a
      rendered PNG.
- [x] **ABA Mobile deeplink** — `abamobilebank://` link plus App Store and
      Play Store fallbacks.
- [x] **Transaction status** — `check-transaction-2` returns the correct
      amount and an accurate status.
- [x] **Error handling** — an unknown transaction returns code 6 as a
      structured result, not an exception.
- [x] **Hosted card checkout** — `paymentGate: 0` returns a payable page.
- [x] **Pushback signature verification** — implemented to ABA's scheme and
      unit-tested against an independent implementation.

- [x] **A real payment settles as APPROVED.** Verified 2026-09-04:
      transaction `EAMTMGQPZRTGQN`, USD 1.00, Mastercard `*6777`, reported
      APPROVED by `check-transaction-2`. Report:
      `reports/sandbox-report-20260904-043925.md` (8 passed, 0 failed).

### Not yet verified — do these before going live

- [ ] **A real declined payment settles as DECLINED.** Run with
      `--with-declined`. You need to know your code does not release goods
      on a failed charge.
- [ ] **A live pushback is received and verified.** The signing scheme is
      implemented and tested, but no callback from ABA has ever reached this
      integration. Requires a public HTTPS URL whitelisted by ABA (§3).
- [ ] **Idempotency on repeated pushback.** ABA may deliver the same
      callback more than once. Confirm your handler settles an order once.

### Known gaps — decide, don't discover

Each of these is fine to launch without, *as long as you know you are*.

- [ ] **Refunds** — `/payments/refund` is 404 on a default sandbox
      merchant. If your business needs refunds, ask ABA to enable the API
      and test it before launch, not after your first dispute.
- [ ] **3D Secure** — untested. The test card used for T8 is deliberately
      the non-enrolled one. Real production cards **will** hit 3DS, and the
      payer gets an OTP step your UI must tolerate.
- [ ] **KHR currency** — untested. KHR amounts must be whole numbers and
      above 100 (codes 46 and 47).
- [ ] **Alipay / WeChat / Google Pay** — untested. Only enable what you
      have exercised.

---

## 2. What actually changes in production

| | Sandbox | Production |
| :-- | :-- | :-- |
| Base URL | `https://checkout-sandbox.payway.com.kh` | `https://checkout.payway.com.kh` |
| Merchant ID / API key | Sandbox sheet | **Different** — a new sheet from ABA |
| Cards | Test cards only | Real cards only; test cards are rejected |
| KHQR | Cannot be scanned by ABA Mobile | **Really scannable** |
| Money | None | Real |

Only `ABA_BASE_URL`, `ABA_MERCHANT_ID` and `ABA_API_KEY` change. No code
changes — the SDK reduces a full "API Url" to its origin, so pasting ABA's
production URL verbatim works.

> **Do not reuse sandbox credentials against the production URL.** They are
> a different pair; you get code 1 "Wrong Hash." and waste an afternoon.

### One behaviour to re-check on day one

`paymentGate: 0` is needed **because this sandbox profile has the QR Payment
API service enabled**, which makes the purchase endpoint ignore
`paymentOption` and always answer with KHQR JSON.

Your production profile may be configured differently. On day one, create
one card purchase and confirm you still get a `checkoutUrl` back. If ABA
returns KHQR JSON instead, `paymentGate` is being ignored; if it returns a
checkout page *without* `paymentGate`, the profile simply does not have the
QR API service and you can drop the flag.

---

## 3. What to send ABA

1. **The report.** Generate it with `npm run report:sandbox` and attach
   `reports/sandbox-report-*.md`. It carries the real transaction IDs so
   ABA can verify each one in their own system.
   - Only send a report whose verdict reads **READY**. An `INCOMPLETE` one
     says on its first page that no payment was completed.
2. **Your sandbox Merchant ID** (already in the report).
3. **Your production callback URL**, and ask them to **whitelist the
   domain**. ABA rejects a `return_url` on a non-whitelisted domain with
   code 81 — and this is the item that most often blocks launch, because it
   is a manual step on their side. Ask early.
4. **Which payment options to enable** on the production profile. Ask only
   for what you have tested (code 23 means an option is not enabled).
5. **Whether you need refunds or payouts.** Both are enabled per merchant;
   the RSA key pair on your credential sheet belongs to those APIs and is
   unused by anything else.

---

## 4. Cutover

1. Get the production credential sheet from ABA.
2. Set the three production values in your deployment's environment — not
   in a committed file. `.env` is gitignored for this reason.
3. Deploy.
4. **Make one real purchase with a real card, for a small real amount.**
   There is no production sandbox; this is the only true smoke test.
5. Confirm it appears in the ABA merchant portal.
6. Confirm your pushback handler received the callback and verified its
   signature.
7. Refund that transaction if refunds are enabled — which also tests the
   refund path with something you control.

---

## 5. After launch

- **Poll, don't only listen.** `checkStatus()` is verified working; a
  callback can be delayed or lost. Treat pushback as a fast path and
  polling as the source of truth. ABA rate-limits check-transaction at 600
  requests/second, so a reconciliation sweep is cheap.
- **Never trust the client.** Settle orders on a verified pushback or a
  `checkStatus()` result, never on the payer returning to your success URL.
- **A fresh transaction returns code 6 for about a second** before it is
  queryable. That is normal, and it also means "unknown transaction" — do
  not treat a single code 6 as failure.
- **Watch for code 21** ("End of API lifetime"). Production keys expire
  too; it will look like a sudden total outage.

---

## 6. If something goes wrong

Rolling back is switching the three environment values back to sandbox and
redeploying. There is no data migration to undo.

What is *not* reversible is a real payment. Before launch, make sure you
can answer: if a payment succeeds at ABA but your handler crashes before
recording it, how do you find out? The answer should be a reconciliation
job that lists ABA transactions and compares them to your orders — not a
customer email.

---

## 7. Error codes at a glance

Codes are per endpoint; see the full table in
[TESTING_GUIDE.md](../TESTING_GUIDE.md) (Appendix A). The ones that will
bite you in production:

| Code | Meaning | Fix |
| :-- | :-- | :-- |
| 1 / 5 | Wrong hash | Merchant ID and API key are not a matching pair |
| 21 | End of API lifetime | Key expired — get a new one from ABA |
| 23 | Payment option not enabled | Ask ABA to enable it on the profile |
| 81 | Return URL not whitelisted | Ask ABA to whitelist the callback domain |
| 6 (on purchase) | Domain not whitelisted | Same as 81, at a different step |
| 6 (on status) | Transaction not found | Normal for ~1s after creation |
