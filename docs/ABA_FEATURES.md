# ABA PayWay Features &amp; SDK Implementation Status

Complete checklist of all official ABA PayWay features from the [ABA Developer Suite](https://developer.payway.com.kh/overview-865678m0) and their implementation status in `aba-payway-sdk-unofficial`.

Last updated: September 2026 (SDK v1.5.0)

---

## 1. Ecommerce Checkout


| Feature                     | ABA Endpoint                                                          | Status        | Notes                                                                                                                            |
| :--------------------------- | :--------------------------------------------------------------------- | :-------------: | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Purchase**                | `POST /api/payment-gateway/v1/payments/purchase`                      | ✅ Implemented | `client.createPurchase()` — supports KHQR, ABA PAY, Cards (`paymentGate: 0`), deeplinks.                                         |
| **Check Transaction**       | `POST /api/payment-gateway/v1/payments/check-transaction-2`           | ✅ Implemented | `client.checkStatus()` — checks status within 7 days (`APPROVED`, `PENDING`, `DECLINED`, `REFUNDED`, `CANCELLED`).               |
| **Close Transaction**       | `POST /api/payment-gateway/v1/payments/close-transaction`             | ✅ Implemented | `client.closeTransaction()` — cancels unpaid transactions before payment completion.                                             |
| **Refund API**              | `POST /api/merchant-portal/merchant-access/online-transaction/refund` | ✅ Implemented | `client.refund()` — full &amp; partial refunds for KHQR, ABA PAY, Cards within 30 days. Uses RSA chunk encryption.               |
| **Get Transaction Details** | `POST /api/payment-gateway/v1/payments/transaction-detail`            | ✅ Implemented | `client.getTransactionDetail()` — retrieves full history, masked account, bank name, and operation log for any past transaction. |
| **Get Transaction List**    | `POST /api/payment-gateway/v1/payments/transaction-list-2`            | ✅ Implemented | `client.listTransactions()` — retrieves paginated list of transactions filtered by date range (max 3 days), amount, and status.  |
| **Exchange Rate**           | `POST /api/payment-gateway/v1/exchange-rate`                          | ✅ Implemented | `client.getExchangeRates()` — fetches live daily buy &amp; sell foreign exchange rates directly from ABA Bank.                   |
| **Get Transactions by Ref** | `POST /api/payment-gateway/v1/payments/get-transactions-by-mc-ref`    | ✅ Implemented | `client.getTransactionsByRef()` — retrieves purchase transactions using merchant reference number (max 50).                     |


---

## 2. Credentials on File (Tokenization & Recurring Payments)

Allows saving customer cards or linking ABA Mobile accounts for one-click and recurring payments.

| Feature               | ABA Endpoint                                                                 | Status        | Notes                                                                               |
| :-------------------- | :--------------------------------------------------------------------------- | :-----------: | :---------------------------------------------------------------------------------- |
| **Link Account**      | `POST /api/payment-credential/v3/aof/link-account`                           | ✅ Implemented | `client.linkAccount()` — returns QR / deeplink to link customer ABA Mobile account. |
| **Link Card**         | `POST /api/payment-credential/v3/cof/link-card`                              | ✅ Implemented | `client.linkCard()` — returns hosted card entry HTML form for Visa/MC/JCB/UPI.      |
| **Token Payment**     | `POST /api/payment-gateway/v3/purchase/payment-credential`                   | ✅ Implemented | `client.chargeToken()` — charges saved token (`CITI_FLEX`, `CITO_FLEX`, etc.).      |
| **Renew Token**       | `POST /api/payment-credential/v3/token-management/renew-expired-account-token` | ✅ Implemented | `client.renewToken()` — renews account tokens before or after 90-day expiry.        |
| **Get Token Details** | `POST /api/payment-credential/v3/token-management/get-token-details`         | ✅ Implemented | `client.getTokenDetails()` — retrieves linked card/account details manually.        |
| **Remove Token**      | `POST /api/payment-credential/v3/token-management/remove-token`              | ✅ Implemented | `client.removeToken()` — deletes customer saved card/account token.                 |
| **Subscription**      | `POST /api/payment-gateway/v1/payments/purchase`                             | ✅ Implemented | `client.createPurchase()` — purchase & save token flow (`tokenFlag`, `ctid`).       |

---

## 3. Payment Links

Allows merchants to create hosted payment links to send via SMS, email, or chat apps.

| Feature                      | ABA Endpoint                                                    | Status        | Notes                                                                               |
| :--------------------------- | :-------------------------------------------------------------- | :-----------: | :---------------------------------------------------------------------------------- |
| **Create Payment Link**      | `POST /api/merchant-portal/merchant-access/payment-link/create` | ✅ Implemented | `client.createPaymentLink()` — generates payment URL with RSA `merchant_auth` & image. |
| **Get Payment Link Details** | `POST /api/merchant-portal/merchant-access/payment-link/detail` | ✅ Implemented | `client.getPaymentLinkDetails()` — retrieves link status, amount, and click counter.  |

---

## 4. Pre-authorization (Hold & Capture)

Used for hotels, rental deposits, or booking holds where funds are reserved first and captured later.

| Feature                           | ABA Endpoint                                                                | Status        | Notes                                                                               |
| :-------------------------------- | :-------------------------------------------------------------------------- | :-----------: | :---------------------------------------------------------------------------------- |
| **Complete Pre-auth**             | `POST /api/merchant-portal/merchant-access/online-transaction/pre-auth-completion`   | ✅ Implemented | `client.completePreAuth()` — captures funds (supports optional payout splitting).   |
| **Cancel Pre-purchase**           | `POST /api/merchant-portal/merchant-access/online-transaction/pre-auth-cancellation` | ✅ Implemented | `client.cancelPreAuth()` — releases hold on customer funds before completion.       |

---

## 5. Payout (Funds Route & Payment Splitting)

For marketplaces, platforms, and aggregators splitting revenue to third parties or merchant sub-accounts.

| Feature                          | ABA Endpoint                                                                     | Status        | Notes                                                                               |
| :------------------------------- | :------------------------------------------------------------------------------- | :-----------: | :---------------------------------------------------------------------------------- |
| **Add Beneficiary to Whitelist** | `POST /api/merchant-portal/merchant-access/whitelist-account/add-whitelist-payout` | ✅ Implemented | `client.addPayoutBeneficiary()` — pre-registers bank accounts allowed to receive payouts. |
| **Update Beneficiary Status**    | `POST /api/merchant-portal/merchant-access/whitelist-account/update-whitelist-status` | ✅ Implemented | `client.updatePayoutBeneficiaryStatus()` — activates (1) or deactivates (0) beneficiary accounts. |
| **Payout**                       | `POST /api/payment-gateway/v2/direct-payment/merchant/payout`                    | ✅ Implemented | `client.createPayout()` — executes immediate transfer to whitelisted ABA accounts. |

---

## 6. SDK Utilities & Helper Functions

| Helper                             | Module          | Status        | Notes                                                                                              |
| :--------------------------------- | :--------------- | :-------------: | :-------------------------------------------------------------------------------------------------- |
| **KHQR SVG Card Generator**        | `src/khqr.ts`   | ✅ Implemented | `generateKHQR()` — renders official-style KHQR payment card SVG.                                   |
| **Webhook Signature Verification** | `src/client.ts` | ✅ Implemented | `client.verifyWebhook()` — validates `X-PayWay-HMAC-SHA512` header using ABA value-sort algorithm. |
| **RSA Chunk Encryption**           | `src/rsa.ts`    | ✅ Implemented | `encryptRsaChunks()` — 117-byte PKCS#1 v1.5 chunk encryption for refund `merchant_auth`.           |
| **ABA HMAC-SHA512 Hash**           | `src/hash.ts`   | ✅ Implemented | `generateABAHash()`, `hmacSha512Base64()`, & `hmacSha512Hex()`.                                   |
| **Transaction ID Generator**       | `src/utils.ts`  | ✅ Implemented | `generateTransactionId()` — generates unique alphanumeric IDs under 20 chars.                      |
| **UTC Timestamp Generator**        | `src/utils.ts`  | ✅ Implemented | `getABATimestamp()` — returns `YYYYMMDDHHmmss` in UTC.                                             |
| **Phone Number Normalizer**        | `src/utils.ts`  | ✅ Implemented | `formatPhoneForABA()` — converts international numbers to domestic 0-prefix.                       |
| **QR Expiration Calculator**       | `src/utils.ts`  | ✅ Implemented | `getQRExpiration()` — calculates standard 15-minute NBC Bakong expiration.                         |

---

## 7. Sandbox Test Runners & CLI Verification

| Command                      | Purpose                                                                                   | Verification Result        |
| :---------------------------- | :----------------------------------------------------------------------------------------- | :--------------------------: |
| `npm run test:new-features`  | Live E2E test runner for Exchange Rates, Transaction List, Transaction Detail, and Refund | ✅ Verified Live on Sandbox |
| `npm test`                   | Vitest unit test suite (13 test suites, 152 tests)                                        | ✅ 152/152 Passing         |
| `npm run verify:credentials` | Preflight credential verification on sandbox                                              | ✅ Verified Live            |
| `npm run pay:sandbox`        | Interactive hosted card purchase & polling test                                       | ✅ Verified Live            |
| `npm run report:sandbox`     | Production access readiness evidence reporter                                             | ✅ Verified Live            |

---

## Summary & Coverage

- **Total ABA APIs**: 20 endpoints
- **Implemented in SDK**: 20 of 20 endpoints (100% full coverage of ABA PayWay Developer Suite) + 8 utility helpers
- **Remaining to Implement**: 0 endpoints remaining (all 5 planned phases completed).

