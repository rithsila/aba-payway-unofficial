# aba-payway-unofficial

![npm version](https://img.shields.io/npm/v/aba-payway-sdk-unofficial)

Unofficial ABA PayWay SDK for Cambodia. Supports KHQR generation, purchase creation, status checking, and webhook verification. Works in Node.js 18+, Deno, Bun, and Cloudflare Workers.

> **Why this project exists**: Online guides for ABA PayWay can look confusing and risky. Many developers fear losing money from wrong setups. We built this simple SDK with AI help so any developer can integrate ABA PayWay quickly and safely.

## Official ABA PayWay Links
- **Official Developer Docs**: [https://developer.payway.com.kh/](https://developer.payway.com.kh/)
- **Register Free Sandbox (Testing Account)**: [https://sandbox.payway.com.kh/register-sandbox/](https://sandbox.payway.com.kh/register-sandbox/)
- **ABA PayWay Business & Pricing**: [https://www.payway.com.kh/business](https://www.payway.com.kh/business)
- **NBC Bakong API Docs**: [https://api-bakong.nbc.gov.kh/document](https://api-bakong.nbc.gov.kh/document)

> **Disclaimer**: This is an unofficial open-source SDK. It is not affiliated with, endorsed by, or supported by ABA Bank or ABA PayWay.

---

## 🤖 For LLM Agents

Fetch the full integration guide and follow it step by step:

```bash
curl -fsSL https://raw.githubusercontent.com/rithsila/aba-payway-sdk-unofficial/main/docs/agent-guide.md
```

---

## Installation

```bash
npm install aba-payway-sdk-unofficial
```

---

## Quick Start

```typescript
import {
  ABAPayWay,
  generateKHQR,
  generateTransactionId,
} from "aba-payway-sdk-unofficial";

// 1. Create client
const aba = new ABAPayWay({
  merchantId: "your_merchant_id",
  apiKey: "your_api_key",
  baseUrl: "https://checkout.payway.com.kh",
});

// 2. Create a purchase
const txnId = generateTransactionId();

const purchase = await aba.createPurchase({
  transactionId: txnId,
  amount: 10.0,
  currency: "USD",
  items: "Product A",
  firstName: "Dara",
  lastName: "Chan",
  email: "dara@example.com",
  returnUrl: "https://yoursite.com/success",
  cancelUrl: "https://yoursite.com/cancel",
});

if (purchase.success) {
  // The current (v3) API answers with the KHQR payload and a PNG that ABA
  // rendered for you. `checkoutUrl` is only set by older API versions, so
  // check for it rather than assuming it.
  console.log("KHQR payload:", purchase.qrString);
  console.log("QR image:", purchase.qrImage); // "data:image/png;base64,..."
  console.log("ABA app deeplink:", purchase.abapayDeeplink);
  console.log("Not installed?", purchase.playStoreUrl, purchase.appStoreUrl);
}

// 3. Check payment status
const status = await aba.checkStatus(txnId);
console.log("Payment status:", status.status); // "APPROVED" | "PENDING" | ...

// 4. Verify a webhook
const isValid = await aba.verifyWebhook(
  rawBody,
  signatureHeader,
  webhookSecret,
);

// 5. Optionally render your own styled KHQR card (base64 SVG data URI).
//    Skip this if `purchase.qrImage` is enough — that one needs no extra call.
const khqrImage = await generateKHQR({
  emvData: purchase.qrString ?? "",
  amount: 10.0,
  currency: "USD",
  merchantName: "My Shop",
  headerColor: "#d42b2b",
});
console.log("KHQR image:", khqrImage); // "data:image/svg+xml;base64,..."
```

---

## Opening the ABA app (deeplink)

For a mobile checkout — a Telegram mini app, a WebView, a native app — you want
the payer to land *inside* ABA Mobile, not squint at a QR on the same phone they
are paying with. Ask for it with `paymentOption` and ABA answers with a link:

```typescript
const purchase = await aba.createPurchase({
  transactionId: txnId,
  amount: 4.5,
  currency: "USD",
  items: [{ name: "Fried rice", quantity: 1, price: 4.5 }],
  paymentOption: "abapay_khqr_deeplink",
  // Where ABA Mobile sends the payer back once they have paid. Pass the object
  // and the SDK base64-encodes it the way ABA expects.
  returnDeeplink: {
    ios_scheme: "myapp://order/42",
    android_scheme: "myapp://order/42",
  },
});

purchase.abapayDeeplink; // "abamobilebank://ababank.com?type=payway&qrcode=..."
purchase.qrString;       // same payment, as EMV data — for desktop
purchase.qrImage;        // same payment, as a PNG data URI
purchase.playStoreUrl;   // where to send a payer with no ABA Mobile installed
purchase.appStoreUrl;
```

One call gives you all of them, so branch on the device rather than making two
purchases:

| Payer is on | Show |
| ----------- | ---- |
| Phone with ABA Mobile | `abapayDeeplink` |
| Phone without it | `playStoreUrl` / `appStoreUrl` |
| Desktop | `qrImage`, or `generateKHQR(qrString)` for a branded card |

Then poll `checkStatus(txnId)` until it leaves `PENDING`. **Never treat the
payer returning through your `returnDeeplink` as proof of payment** — anyone can
open that URL. `checkStatus` is the only authority.

> A brand-new transaction answers `checkStatus` with `errorCode === "6"`
> ("tran_id not found") for a second or so before it becomes queryable. Retry
> rather than reporting a failure; the SDK does not hide this, because code 6
> also means a genuinely unknown transaction.

### `returnDeeplink` encoding

ABA wants `return_deeplink` as base64-encoded JSON. Pass the object and the SDK
encodes it; pass a string and it goes through untouched, so code that encoded it
by hand keeps working. `encodeReturnDeeplinkForABA` is exported if you need it
directly.

---

## API Reference

| Export                     | Type     | Description                                         |
| -------------------------- | -------- | --------------------------------------------------- |
| `ABAPayWay`                | class    | Main client. Constructor takes `ABAConfig`.         |
| `ABAPayWay.createPurchase` | method   | Create a payment. Returns `PurchaseResponse`.       |
| `ABAPayWay.checkStatus`    | method   | Check transaction status. Returns `StatusResponse`. |
| `ABAPayWay.verifyWebhook`  | method   | Verify webhook signature. Returns `boolean`.        |
| `generateKHQR`             | function | Build a KHQR image (base64 SVG data URI) from EMV data. Async. |
| `encodeItemsForABA`        | function | Base64-encode a `PurchaseItem[]` the way ABA expects. |
| `encodeReturnDeeplinkForABA` | function | Base64-encode a `ReturnDeeplink` the way ABA expects. |
| `generateABAHash`          | function | Generate HMAC-SHA512 hash for ABA API calls.        |
| `generateTransactionId`    | function | Generate a unique transaction ID.                   |
| `getABATimestamp`          | function | Get current timestamp in ABA format.                |
| `formatPhoneForABA`        | function | Normalize phone number for ABA API.                 |
| `getQRExpiration`          | function | Get QR code expiration timestamp.                   |

### Types

| Type               | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `ABAConfig`        | SDK configuration (merchantId, apiKey, baseUrl, webhookSecret)   |
| `PurchaseRequest`  | Input for `createPurchase`                                       |
| `PurchaseResponse` | Result from `createPurchase`                                     |
| `StatusResponse`   | Result from `checkStatus`                                        |
| `PaymentStatus`    | `"PENDING" \| "APPROVED" \| "DECLINED" \| "REFUNDED" \| "ERROR"` |
| `PaymentOption`    | `"cards" \| "abapay_khqr" \| "abapay_khqr_deeplink" \| "alipay" \| "wechat" \| "google_pay"` |
| `ReturnDeeplink`   | `{ ios_scheme?, android_scheme? }` — where ABA Mobile returns the payer |
| `KHQROptions`      | Input for `generateKHQR`                                         |
| `HashParams`       | Raw parameters for hash generation                               |

---

## KHQR Customization

Use `KHQROptions` to customize the QR code display. `generateKHQR` is async and
returns a base64-encoded SVG data URI you can use directly as an `<img>` `src`:

```typescript
import { generateKHQR } from "aba-payway-sdk-unofficial";

const dataUri = await generateKHQR({
  emvData: "your_emv_qr_string",
  amount: 5.5,
  currency: "USD",
  merchantName: "Rith Shop", // shown above the QR code
  headerColor: "#1a73e8", // hex color for the header bar
});
```

---

## Environment Setup

You need ABA PayWay merchant credentials to use this SDK:

| Variable        | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `merchantId`    | Your ABA PayWay merchant ID                                |
| `apiKey`        | Your ABA PayWay API key                                    |
| `baseUrl`       | ABA PayWay base URL (e.g.`https://checkout.payway.com.kh`) |
| `webhookSecret` | Accepted but currently unused — see note below (optional)   |

Contact ABA Bank to get these credentials.

> **`webhookSecret`:** ABA does not issue one and the SDK never reads it. ABA
> signs pushback with an `X-PayWay-HMAC-SHA512` header that `verifyWebhook()`
> does not implement yet.

---

## Development

```bash
# Run unit tests (mocked, no network)
npm test

# Build the package
npm run build
```

---

## Sandbox Testing

You can test the SDK against the real ABA PayWay sandbox. This makes live
network calls, so it needs sandbox credentials.

### 1. Get sandbox credentials

Register at https://sandbox.payway.com.kh/register-sandbox/. ABA will email you
a merchant ID, an API key, and a webhook secret.

### 2. Set up your `.env` file

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env`:

```bash
ABA_MERCHANT_ID=your_sandbox_merchant_id
ABA_API_KEY=your_sandbox_api_key
ABA_BASE_URL=https://checkout-sandbox.payway.com.kh
# ABA_WEBHOOK_SECRET=  # ABA does not issue one
```

`.env` is gitignored. Never commit real credentials.

### 3. Run the sandbox tests

```bash
npm run test:sandbox
```

This creates a real `$1.00` test purchase and checks its status. A new
transaction stays `PENDING` until you pay it by opening the returned checkout
URL in a browser.

If you run `npm run test:sandbox` without a `.env` file, the tests are skipped
(not failed), so they never block a normal `npm test` run.

---

## License

MIT
