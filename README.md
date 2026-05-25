# aba-payway-sdk-unofficial

![npm version](https://img.shields.io/npm/v/aba-payway-sdk-unofficial)

Unofficial ABA PayWay SDK for Cambodia. Supports KHQR generation, purchase creation, status checking, and webhook verification. Works in Node.js 18+ and Deno.

> **Disclaimer**: This is an unofficial SDK. It is not affiliated with, endorsed by, or supported by ABA Bank or ABA PayWay.

---

## Installation

```bash
npm install aba-payway-sdk-unofficial
```

---

## Quick Start

```typescript
import { ABAPayWay, generateKHQR, generateTransactionId } from "aba-payway-sdk-unofficial";

// 1. Create client
const aba = new ABAPayWay({
  merchantId: "your_merchant_id",
  apiKey: "your_api_key",
  baseUrl: "https://checkout.payway.com.kh",
  webhookSecret: "your_webhook_secret", // optional
});

// 2. Create a purchase
const txnId = generateTransactionId();

const purchase = await aba.createPurchase({
  transactionId: txnId,
  amount: 10.00,
  currency: "USD",
  items: "Product A",
  firstName: "Dara",
  lastName: "Chan",
  email: "dara@example.com",
  returnUrl: "https://yoursite.com/success",
  cancelUrl: "https://yoursite.com/cancel",
});

if (purchase.success) {
  console.log("Checkout URL:", purchase.checkoutUrl);
}

// 3. Check payment status
const status = await aba.checkStatus(txnId);
console.log("Payment status:", status.status); // "APPROVED" | "PENDING" | ...

// 4. Verify a webhook
const isValid = await aba.verifyWebhook(rawBody, signatureHeader, webhookSecret);

// 5. Generate a KHQR image URL
const khqrUrl = generateKHQR({
  emvData: purchase.qrString ?? "",
  amount: 10.00,
  currency: "USD",
  merchantName: "My Shop",
  headerColor: "#d42b2b",
  logoUrl: "https://yoursite.com/logo.png",
});
console.log("KHQR URL:", khqrUrl);
```

---

## API Reference

| Export | Type | Description |
|---|---|---|
| `ABAPayWay` | class | Main client. Constructor takes `ABAConfig`. |
| `ABAPayWay.createPurchase` | method | Create a payment. Returns `PurchaseResponse`. |
| `ABAPayWay.checkStatus` | method | Check transaction status. Returns `StatusResponse`. |
| `ABAPayWay.verifyWebhook` | method | Verify webhook signature. Returns `boolean`. |
| `generateKHQR` | function | Build KHQR image URL from EMV data. |
| `generateABAHash` | function | Generate HMAC-SHA512 hash for ABA API calls. |
| `generateTransactionId` | function | Generate a unique transaction ID. |
| `getABATimestamp` | function | Get current timestamp in ABA format. |
| `formatPhoneForABA` | function | Normalize phone number for ABA API. |
| `getQRExpiration` | function | Get QR code expiration timestamp. |

### Types

| Type | Description |
|---|---|
| `ABAConfig` | SDK configuration (merchantId, apiKey, baseUrl, webhookSecret) |
| `PurchaseRequest` | Input for `createPurchase` |
| `PurchaseResponse` | Result from `createPurchase` |
| `StatusResponse` | Result from `checkStatus` |
| `PaymentStatus` | `"PENDING" \| "APPROVED" \| "DECLINED" \| "REFUNDED" \| "ERROR"` |
| `KHQROptions` | Input for `generateKHQR` |
| `HashParams` | Raw parameters for hash generation |

---

## KHQR Customization

Use `KHQROptions` to customize the QR code display:

```typescript
import { generateKHQR } from "aba-payway-sdk-unofficial";

const url = generateKHQR({
  emvData: "your_emv_qr_string",
  amount: 5.50,
  currency: "USD",
  merchantName: "Rith Shop",       // shown above the QR code
  headerColor: "#1a73e8",          // hex color for the header bar
  logoUrl: "https://example.com/logo.png", // your logo inside the QR
});
```

---

## Environment Setup

You need ABA PayWay merchant credentials to use this SDK:

| Variable | Description |
|---|---|
| `merchantId` | Your ABA PayWay merchant ID |
| `apiKey` | Your ABA PayWay API key |
| `baseUrl` | ABA PayWay base URL (e.g. `https://checkout.payway.com.kh`) |
| `webhookSecret` | Secret for webhook signature verification (optional) |

Contact ABA Bank to get these credentials.

---

## Development

```bash
# Run tests
npm test

# Build the package
npm run build
```

---

## License

MIT
