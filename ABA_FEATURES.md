# ABA PayWay Features & SDK Implementation Status

Complete checklist of all official ABA PayWay features from the [ABA Developer Suite](https://developer.payway.com.kh/overview-865678m0) and their implementation status in `aba-payway-sdk-unofficial`.

Last updated: September 2026 (SDK v1.4.0)

---

## 1. Ecommerce Checkout

| Feature | ABA Endpoint | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Purchase** | `POST /api/payment-gateway/v1/payments/purchase` | ✅ Implemented | `client.createPurchase()` — supports KHQR, ABA PAY, Cards (`paymentGate: 0`), deeplinks. |
| **Check Transaction** | `POST /api/payment-gateway/v1/payments/check-transaction-2` | ✅ Implemented | `client.checkStatus()` — checks status within 7 days (`APPROVED`, `PENDING`, `DECLINED`, `REFUNDED`, `CANCELLED`). |
| **Close Transaction** | `POST /api/payment-gateway/v1/payments/close-transaction` | ✅ Implemented | `client.closeTransaction()` — cancels unpaid transactions before payment completion. |
| **Refund API** | `POST /api/merchant-portal/merchant-access/online-transaction/refund` | ✅ Implemented | `client.refund()` — full & partial refunds for KHQR, ABA PAY, Cards within 30 days. Uses RSA chunk encryption. |
| **Get Transaction Details** | `POST /api/payment-gateway/v1/payments/transaction-detail` | ✅ Implemented | `client.getTransactionDetail()` — retrieves full history, masked account, bank name, and operation log for any past transaction. |
| **Get Transaction List** | `POST /api/payment-gateway/v1/payments/transaction-list-2` | ✅ Implemented | `client.listTransactions()` — retrieves paginated list of transactions filtered by date range (max 3 days), amount, and status. |
| **Exchange Rate** | `POST /api/payment-gateway/v1/exchange-rate` | ✅ Implemented | `client.getExchangeRates()` — fetches live daily buy & sell foreign exchange rates directly from ABA Bank. |

---

## 2. Credentials on File (Tokenization & Recurring Payments)

Allows saving customer cards or linking ABA Mobile accounts for one-click and recurring payments.

| Feature | ABA Endpoint | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Link Account** | `POST /api/payment-gateway/v1/payments/link-account` | ❌ Not Implemented | Returns QR / deeplink to link customer ABA Mobile account to merchant profile. |
| **Link Card** | `POST /api/payment-gateway/v1/payments/link-card` | ❌ Not Implemented | Returns HTML card form to link Visa, Mastercard, JCB, or UPI cards. |
| **Token Payment** | `POST /api/payment-gateway/v1/payments/payment` | ❌ Not Implemented | Charge customer using saved token (`CITI_FLEX`, `CITO_FLEX`, `CITR_FIX`). |
| **Renew Token** | `POST /api/payment-gateway/v1/payments/renew-token` | ❌ Not Implemented | Renews tokens before or after 90-day expiry. |
| **Get Token Details** | `POST /api/payment-gateway/v1/payments/get-token-details` | ❌ Not Implemented | Retrieves linked card/account details manually if callback fails. |
| **Remove Token** | `POST /api/payment-gateway/v1/payments/remove-token` | ❌ Not Implemented | Deletes customer saved card/account token. |
| **Subscription** | `POST /api/payment-gateway/v1/payments/subscription` | ❌ Not Implemented | Makes purchase and saves payment token in a single user flow. |

---

## 3. Payment Links

Allows merchants to create hosted payment links to send via SMS, email, or chat apps.

| Feature | ABA Endpoint | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Create Payment Link** | `POST /api/payment-gateway/v1/payments/create-payment-link` | ❌ Not Implemented | Generates shareable payment URL for custom orders. |
| **Get Payment Link Details** | `POST /api/payment-gateway/v1/payments/get-payment-link-details` | ❌ Not Implemented | Checks status, clicks, and payment result of a generated payment link. |

---

## 4. Pre-authorization (Hold & Capture)

Used for hotels, rental deposits, or booking holds where funds are reserved first and captured later.

| Feature | ABA Endpoint | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Complete Pre-auth** | `POST /api/payment-gateway/v1/payments/complete-pre-auth-transactions` | ❌ Not Implemented | Captures held pre-auth funds after service delivery. |
| **Complete Pre-auth with Payout** | `POST /api/payment-gateway/v1/payments/complete-pre-auh-transaction-with-payout` | ❌ Not Implemented | Captures funds and splits payout to partner accounts simultaneously. |
| **Cancel Pre-purchase** | `POST /api/payment-gateway/v1/payments/cancel-pre-purchase-transaction` | ❌ Not Implemented | Releases temporary hold on customer funds before completion. |

---

## 5. Payout (Funds Route & Payment Splitting)

For marketplaces, platforms, and aggregators splitting revenue to third parties or merchant sub-accounts.

| Feature | ABA Endpoint | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Add Beneficiary to Whitelist** | `POST /api/merchant-portal/merchant-access/payout/add-beneficiary-to-whitelist` | ❌ Not Implemented | Pre-registers bank accounts allowed to receive payouts. |
| **Update Beneficiary Status** | `POST /api/merchant-portal/merchant-access/payout/update-a-beneficiary-status` | ❌ Not Implemented | Activates or deactivates whitelisted beneficiary accounts. |
| **Payout** | `POST /api/merchant-portal/merchant-access/payout/payout` | ❌ Not Implemented | Executes immediate transfer to whitelisted ABA accounts. |

---

## 6. SDK Utilities & Helper Functions

| Helper | Module | Status | Notes |
| :--- | :--- | :---: | :--- |
| **KHQR SVG Card Generator** | `src/khqr.ts` | ✅ Implemented | `generateKHQR()` — renders official-style KHQR payment card SVG. |
| **Webhook Signature Verification** | `src/client.ts` | ✅ Implemented | `client.verifyWebhook()` — validates `X-PayWay-HMAC-SHA512` header using ABA value-sort algorithm. |
| **RSA Chunk Encryption** | `src/rsa.ts` | ✅ Implemented | `encryptRsaChunks()` — 117-byte PKCS#1 v1.5 chunk encryption for refund `merchant_auth`. |
| **ABA HMAC-SHA512 Hash** | `src/hash.ts` | ✅ Implemented | `generateABAHash()` & `hmacSha512Base64()`. |
| **Transaction ID Generator** | `src/utils.ts` | ✅ Implemented | `generateTransactionId()` — generates unique alphanumeric IDs under 20 chars. |
| **UTC Timestamp Generator** | `src/utils.ts` | ✅ Implemented | `getABATimestamp()` — returns `YYYYMMDDHHmmss` in UTC. |
| **Phone Number Normalizer** | `src/utils.ts` | ✅ Implemented | `formatPhoneForABA()` — converts international numbers to domestic 0-prefix. |
| **QR Expiration Calculator** | `src/utils.ts` | ✅ Implemented | `getQRExpiration()` — calculates standard 15-minute NBC Bakong expiration. |

---

## Summary & Roadmap

- **Total ABA APIs**: 20 endpoints
- **Implemented in SDK**: 7 core payment endpoints (**Ecommerce Checkout is 100% complete!**) + 8 utility helpers
- **Remaining to Implement**: 13 endpoints across Tokenization (Credentials on File), Payment Links, Pre-auth, and Payout.

### Recommended Next Priorities

1. **Payment Links API** (`create-payment-link`, `get-payment-link-details`): Enables invoices and quick payment link generation for chat/social selling.
2. **Credentials on File / Recurring** (`link-card`, `payment`): Allows saving customer cards for 1-click and subscription checkout.
3. **Pre-authorization** (`complete-pre-auth-transactions`, `cancel-pre-purchase-transaction`): Allows temporary authorization holds and delayed capture.
