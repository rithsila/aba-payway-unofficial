# aba-payway-sdk-unofficial

![npm version](https://img.shields.io/npm/v/aba-payway-sdk-unofficial)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/aba-payway-sdk-unofficial)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Edge Ready](https://img.shields.io/badge/Edge-Ready-success)

Unofficial ABA PayWay SDK for Cambodia. The lightweight, zero-dependency, edge-ready TypeScript SDK to integrate ABA PayWay. Creates instant **KHQR** codes, generates 1-tap mobile deeplinks, checks transactions, and verifies webhooks.

Works natively on Next.js, Node.js 18+, Deno, Bun, and Cloudflare Workers using standard Web Crypto and native `fetch`.

> **Why this project exists**: Online guides for ABA PayWay can look confusing and risky. Many developers fear losing money from wrong setups. We built this simple SDK with AI help so any developer can integrate ABA PayWay quickly and safely.

## Official ABA PayWay Links
- **Official Developer Docs**: [https://developer.payway.com.kh/](https://developer.payway.com.kh/)
- **Register Free Sandbox (Testing Account)**: [https://sandbox.payway.com.kh/register-sandbox/](https://sandbox.payway.com.kh/register-sandbox/)
- **ABA PayWay Business & Pricing**: [https://www.payway.com.kh/business](https://www.payway.com.kh/business)
- **NBC Bakong API Docs**: [https://api-bakong.nbc.gov.kh/document](https://api-bakong.nbc.gov.kh/document)

> **Disclaimer**: This is an unofficial open-source community project. It is not affiliated with, endorsed by, or supported by ABA Bank or ABA PayWay.

---

## Features

- 🇰🇭 **Universal KHQR & Deeplinks**: Generates standard EMVCo KHQR payload strings, pre-rendered QR image URLs, and 1-tap mobile deeplinks for ABA Mobile.
- ⚡ **Zero Dependencies & Edge Ready**: Built on standard Web Crypto (`crypto.subtle`) and native `fetch`. Bundle size is < 4kB minified.
- 🛡️ **Automatic HMAC-SHA512 Security**: Eliminates hash sorting errors. Automatically arranges parameters and computes cryptographic signatures, with constant-time safe compare for webhooks.
- 💎 **Strict TypeScript Safety**: Every request and response is strictly typed. Catch bugs at compile time with full IDE autocompletion.

---

## 🤖 For LLM Agents

Fetch the full integration guide and follow it step by step:

```bash
Integrate aba-payway-sdk-unofficial into this project following: https://raw.githubusercontent.com/rithsila/aba-payway-unofficial/main/docs/agent-guide.md
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
  // The current (v3) API answers with the KHQR payload and a PNG that ABA rendered
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

For a mobile checkout — a Telegram mini app, a WebView, a native app — you want the payer to land *inside* ABA Mobile. Ask for it with `paymentOption` and ABA answers with a link:

```typescript
const purchase = await aba.createPurchase({
  transactionId: txnId,
  amount: 4.5,
  currency: "USD",
  items: [{ name: "Fried rice", quantity: 1, price: 4.5 }],
  paymentOption: "abapay_khqr_deeplink",
  // Where ABA Mobile sends the payer back once they have paid
  returnDeeplink: {
    ios_scheme: "myapp://order/42",
    android_scheme: "myapp://order/42",
  },
});

purchase.abapayDeeplink; // "abamobilebank://ababank.com?type=payway&qrcode=..."
purchase.qrString;       // same payment, as EMV data — for desktop
purchase.qrImage;        // same payment, as a PNG data URI
```

Then poll `checkStatus(txnId)` until it leaves `PENDING`. **Never treat the payer returning through your `returnDeeplink` as proof of payment** — anyone can open that URL. `checkStatus` is the only authority.

### `returnDeeplink` encoding

ABA wants `return_deeplink` as base64-encoded JSON. Pass the object and the SDK encodes it. Pass a string and it goes through untouched.

---

## API Reference

| Export                     | Type     | Description                                         |
| -------------------------- | -------- | --------------------------------------------------- |
| `ABAPayWay`                | class    | Main client. Constructor takes `ABAConfig`.         |
| `ABAPayWay.createPurchase` | method   | Create a payment. Returns `PurchaseResponse`.       |
| `ABAPayWay.checkStatus`    | method   | Check transaction status. Returns `StatusResponse`. |
| `ABAPayWay.verifyWebhook`  | method   | Verify webhook signature. Returns `boolean`.        |
| `generateKHQR`             | function | Build a KHQR image (base64 SVG data URI). Async.    |

---

## Environment Setup

You need ABA PayWay merchant credentials:

| Variable        | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `merchantId`    | Your ABA PayWay merchant ID                                |
| `apiKey`        | Your ABA PayWay API key                                    |
| `baseUrl`       | ABA PayWay base URL (e.g.`https://checkout.payway.com.kh`) |
| `webhookSecret` | Accepted but currently unused (see note below)             |

> **`webhookSecret`:** ABA does not issue one and the SDK never reads it. ABA signs pushback with an `X-PayWay-HMAC-SHA512` header that `verifyWebhook()` supports.

---

## Sandbox Testing

Register at [Sandbox Portal](https://sandbox.payway.com.kh/register-sandbox/). ABA will email you credentials.

Copy `.env.example` to `.env` and fill in your values:

```bash
ABA_MERCHANT_ID=your_sandbox_merchant_id
ABA_API_KEY=your_sandbox_api_key
ABA_BASE_URL=https://checkout-sandbox.payway.com.kh
```

Run sandbox tests:

```bash
npm run test:sandbox
```

### Actually paying a sandbox transaction

A sandbox KHQR code **cannot** be scanned by the real ABA Mobile app, so
`abapay_khqr` transactions sit at `PENDING` forever. To exercise `APPROVED`,
`DECLINED`, and your pushback handler you need the hosted **card** checkout and
one of [ABA's test cards](docs/ABA%20Test%20Cards.md):

```bash
npm run pay:sandbox
```

It creates a $1 card purchase, opens the checkout page in your browser, and
polls until ABA settles the transaction.

The switch that makes this work is **`paymentGate: 0`**. A merchant profile with
the QR Payment API service enabled answers every purchase with KHQR JSON and
ignores `paymentOption`, so `"cards"` on its own never reaches a card form:

```ts
const purchase = await aba.createPurchase({
  transactionId: generateTransactionId(),
  amount: 1.0,
  currency: "USD",
  paymentOption: "cards",
  paymentGate: 0,        // route to the Checkout service, not the QR API
  viewType: "hosted_view",
});

// ABA answers 302; the SDK hands back the page to send the payer to.
console.log(purchase.checkoutUrl);
```

---

## Community & Support

Connect with fellow developers building with ABA PayWay in Cambodia:
- 📢 **Announcements**: [Telegram Channel (@abapaywayunofficial)](https://t.me/abapaywayunofficial)
- 💬 **Q&A & Support**: [Telegram Group (@abaunofficialintegrate)](https://t.me/abaunofficialintegrate)

---

## License

MIT
