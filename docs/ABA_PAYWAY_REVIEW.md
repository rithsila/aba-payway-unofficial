# ABA PayWay SDK — Research-Based Review

*Generated: 2026-06-09 | Sources: ABA PayWay official Developer Suite + community SDKs | Confidence: High (verified against official docs)*

This review compares the code in `src/` against the **official ABA PayWay
API** (developer.payway.com.kh). Each finding says what the code does, what
ABA actually expects, and how to fix it.

> **Resolution status (2026-06-09):** Findings #1, #2, #3, #4, #6, #8, #9 were
> fixed on branch `fix/aba-api-conformance` with unit tests covering the real
> ABA response shapes. **Deferred:** #5 (items Base64 — changes the public API
> shape) and #7 (hash field order — could break a currently-accepted hash;
> needs a live, non-expired key to verify). #10 is documentation only.

---

## How ABA PayWay works (summary)

ABA PayWay is a payment gateway in Cambodia. The flow your SDK touches:

1. **Create a purchase** — POST signed parameters to
   `/api/payment-gateway/v1/payments/purchase`. ABA returns either an HTML
   checkout page (for cards/ABA Pay) **or** a JSON object with `qr_string`,
   `abapay_deeplink`, and `checkout_qr_url` (only when
   `payment_option = abapay_khqr_deeplink`).
2. **Check status** — POST to `/api/payment-gateway/v1/payments/check-transaction-2`
   to read the payment status (valid for transactions in the last 7 days).
3. **Callback (pushback)** — after the customer pays, ABA sends a POST to your
   `return_url`/`callback_url` with a signature in the
   `X-PAYWAY-HMAC-SHA512` header. You must verify it.

**Authentication** = HMAC-SHA512 of a fixed concatenation of parameter values,
keyed by your **public key (API key)**, then Base64-encoded. The order of
fields in the concatenation is fixed and must match ABA exactly.

**Two environments**, same paths, different host:
- Sandbox: `https://checkout-sandbox.payway.com.kh`
- Production: `https://checkout.payway.com.kh`

APIs are only callable from a **whitelisted domain/IP** (error code `6`
otherwise). The API key has a **validity period**; an expired key returns
**code 21 "End of API lifetime"** (this is what your sandbox key returns now).

---

## Findings

Severity: **CRITICAL** = broken / will not work · **HIGH** = wrong behavior in
real use · **MEDIUM** = conformance / robustness · **LOW** = minor.

### 1. CRITICAL — `checkStatus` never succeeds (wrong response parsing)

`src/client.ts:164` checks `if (data.status !== 0)`.

The official check-transaction-2 response wraps status as an **object**, and
puts the transaction under `data`:

```json
{
  "status": { "code": "00", "message": "Success." },
  "data": {
    "payment_status": "APPROVED",
    "payment_status_code": 0,
    "payment_amount": 100.00,
    "payment_currency": "USD",
    "apv": "123456"
  }
}
```

So `data.status` is `{ code: "00", ... }`, and `data.status !== 0` is **always
true** → the method always returns an error. Line 173 also reads
`data.payment_status`, but the real path is `data.data.payment_status`.

This is exactly why the sandbox test returned `"Unknown error"`.

**Fix:**
- Success when `data.status?.code === "00"`.
- Read `data.data.payment_status`, `data.data.payment_amount`,
  `data.data.payment_currency`.
- Outer error codes: `5` invalid hash, `6` transaction not found,
  `8` invalid merchant profile, `11` internal error, `429` rate limit.

### 2. CRITICAL — `verifyWebhook` uses the wrong algorithm (rejects all real callbacks)

`src/client.ts:193` HMACs the **raw payload string**.

ABA does **not** sign the raw body. The official algorithm (from the
docs' PHP sample) is:

1. Parse the JSON body.
2. **Sort the fields by key, ascending** (`ksort`).
3. Concatenate the **values** in that order (JSON-encode any array/object value).
4. HMAC-SHA512 with the secret key, Base64-encode.
5. Compare against the `X-PAYWAY-HMAC-SHA512` request header (constant-time).

Because the SDK hashes the raw string instead of the sorted-values string, a
genuine ABA callback signature will **never** match → every real webhook is
rejected.

**Fix:** reimplement to parse JSON, sort keys ascending, concatenate values
(stringify nested objects), then HMAC-SHA512. Keep the existing constant-time
compare (that part is good). Document that ABA sends the signature in the
`X-PAYWAY-HMAC-SHA512` header.

### 3. HIGH — KHR amount is formatted with decimals (invalid)

`src/client.ts:22` does `request.amount.toFixed(2)` for every currency.

ABA rule: **USD uses 2 decimals** (`100.00`); **KHR must be a whole number with
no decimal** (`10000`, not `10000.00`). A KHR amount with decimals is rejected
as invalid amount (error code `3`).

**Fix:**
```ts
const amount =
  request.currency === "KHR"
    ? Math.round(request.amount).toString()
    : request.amount.toFixed(2);
```

### 4. HIGH — URL fields are not Base64-encoded

`return_url`, `cancel_url`, `continue_success_url`, `return_deeplink`
(`src/client.ts:40-43, 62-65`) are sent as raw URLs.

ABA expects these URL fields **Base64-encoded**. Sending a raw URL means ABA
Base64-decodes it into garbage, so the redirect and callback destinations
break. (The hash still matches, because it is computed over whatever you send —
so this fails silently, not as a "Wrong Hash" error.)

**Fix:** Base64-encode the URL values, and use the **same encoded value** in
both the hash input and the request body.

### 5. HIGH — `items` should be a Base64-encoded JSON array

`src/client.ts:30,56` sends `items` as a raw string (e.g. `"Product A"`).

ABA expects:
```php
base64_encode(json_encode([["name"=>"product 1","quantity"=>1,"price"=>1.00]]))
```
ABA treats `items` as description only (not used for pricing), so impact is
limited, but the current value is non-conformant and may be rejected by stricter
validation.

**Fix:** accept a structured `items` array, JSON-encode and Base64-encode it
(and Base64-encode the same value used in the hash).

### 6. MEDIUM — `createPurchase` assumes JSON, but standard purchase returns HTML

The standard purchase endpoint returns an **HTML checkout page** for cards / ABA
Pay. It returns **JSON** (`qr_string`, `abapay_deeplink`, `checkout_qr_url`)
**only** when `payment_option = abapay_khqr_deeplink`. The SDK always calls
`response.json()` (`src/client.ts:92`), which throws on the HTML response and is
caught as a generic error. Also the SDK reads `data.checkout_url` (line 110) but
the deeplink response field is `checkout_qr_url`.

**Fix:**
- Default (or require) `payment_option = "abapay_khqr_deeplink"` for the JSON/QR
  flow this SDK is built around, and document it.
- Read `checkout_qr_url` (keep `checkout_url` as a fallback).

### 7. MEDIUM — Hash field order follows the legacy spec (forward-compat risk)

`src/hash.ts` concatenates (with `ctid`, `pwt` at positions 7–8, ending at
`return_params`). This matches the **older v2 PDF** spec.

The **current** Developer Suite "Purchase" spec for a standard purchase:
- does **not** include `ctid`/`pwt` (those belong to "Purchase using token"), and
- appends `payout`, `lifetime`, `additional_params`, `google_pay_token`,
  `skip_success_page` after `return_params`.

ABA rebuilds the hash from its documented order, so a mismatch would cause
"Wrong Hash" (code `1`). **This could not be fully verified** because the
sandbox key is expired (code 21 may be returned before the hash is checked).
Recommend re-testing with a valid key and, if needed, aligning to the current
documented order.

*(Inference — verify with a live key before changing.)*

### 8. MEDIUM — `check-transaction-2` should use a JSON body

The check-transaction-2 docs specify `Content-Type: application/json` with a
JSON body. The SDK sends `application/x-www-form-urlencoded` (`src/client.ts:148`).
Combined with finding #1, this may also contribute to the endpoint not
behaving as expected.

**Fix:** send `check-transaction-2` as a JSON body with
`Content-Type: application/json`.

### 9. MEDIUM — `PaymentStatus` is missing `CANCELLED` and `PRE-AUTH`

ABA returns `APPROVED`, `PRE-AUTH`, `PENDING`, `DECLINED`, `REFUNDED`,
`CANCELLED`. `mapPaymentStatus` (`src/client.ts:224`) handles only 4, so
`PRE-AUTH` and `CANCELLED` fall through to `ERROR`. The `PaymentStatus` type
(`src/types.ts`) is also missing them.

**Fix:** add `CANCELLED` and `PRE-AUTH` to the type and the mapping.

### 10. LOW — operational notes for SDK users (document these)

- **IP/domain whitelisting** is required, or every call returns code `6`.
- **API key expiry** is real (your current key = code 21). Document how to
  detect and renew.
- **Rate limit**: 600 requests/second on check-transaction; stop polling once a
  final status is returned.

---

## What is already correct (keep it)

- `check-transaction-2` is the right endpoint. ✓
- Check-status hash = `req_time + merchant_id + tran_id`. ✓
- HMAC-SHA512 + Base64 mechanism and Web Crypto usage. ✓
- Constant-time comparison in `verifyWebhook` (the compare, not the input). ✓
- Result-object error handling (never throws to the caller). ✓

---

## Suggested priority order

1. Fix `checkStatus` parsing (#1) — it is fully broken today.
2. Fix `verifyWebhook` algorithm (#2) — security-critical and fully broken.
3. Fix KHR amount (#3) and Base64 URLs (#4) — break real payments.
4. Base64 `items` (#5), purchase response handling (#6), JSON body for check (#8).
5. Verify hash order with a live key (#7); add missing statuses (#9); docs (#10).

Each fix should follow the repo's TDD setup: add/adjust a unit test in
`tests/` (mock `fetch` with the real ABA response shapes documented above), and
re-run the sandbox integration test once a valid key is available.

---

## Sources

1. [Purchase — ABA Developer Suite](https://developer.payway.com.kh/purchase-14530820e0) — purchase params, hash field order, payment_option values.
2. [Check transaction — ABA Developer Suite](https://developer.payway.com.kh/check-transaction-14530826e0) — check-transaction-2 endpoint, hash, response envelope, status codes.
3. [eCommerce Checkout — ABA Developer Suite](https://developer.payway.com.kh/ecommerce-checkout-3158159f0) — pushback data, callback signature PHP sample, `X-PAYWAY-HMAC-SHA512`.
4. [QR API — ABA Developer Suite](https://developer.payway.com.kh/qr-api-14530840e0) — qrString/qrImage/deeplink response shape.
5. [PayWay v2 Sandbox PDF](https://checkout-sandbox.payway.com.kh/plugins/payway-v2-sandbox.pdf) — legacy hash order (with ctid/pwt), error codes, whitelisting.
6. [Joselay/aba-payway-docs](https://github.com/Joselay/aba-payway-docs) — offline API reference structure.
