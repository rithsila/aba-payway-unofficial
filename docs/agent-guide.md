# ABA PayWay Integration Guide for LLM Agents

You are an AI coding assistant tasked with integrating `aba-payway-sdk-unofficial` into this project. Follow these steps sequentially.

---

## Step 1: Detect Project Stack

Don't stop at dependency names in `package.json` — look at the actual folder
layout and how an existing route/controller in the project is written, and
match its conventions. Only fall back to a default pattern once you're
confident there's nothing existing to match.

### A. JavaScript/TypeScript backend present

1. Check `package.json` (or `deno.json`/`deno.jsonc`) and folder layout:
   - **Next.js (App Router)**: has `next` and an `app/` folder -> route in `app/api/payway/.../route.ts`
   - **Next.js (Pages Router)**: has `next` and a `pages/` folder (no `app/`) -> route in `pages/api/payway/...ts`
   - **Express**: has `express` -> add a router/endpoint the same way other routes in the project are registered
   - **Fastify**: has `fastify` -> register a route/plugin matching the existing plugin structure
   - **Koa**: has `koa` -> add a route via the existing `koa-router`/`@koa/router` if one is set up
   - **Hono / Cloudflare Workers**: has `hono`, or a `wrangler.toml` is present -> Hono route handler
   - **NestJS**: has `@nestjs/core` -> a `PaywayModule` with a service + controller, matching existing module structure
   - **SvelteKit**: has `@sveltejs/kit` -> `+server.ts` route under `src/routes/api/payway/...`
   - **Nuxt**: has `nuxt` -> server route under `server/api/payway/...`
   - **Remix**: has `@remix-run/*` -> resource route under `app/routes/api.payway.*.ts`
   - **Astro**: has `astro` -> API route under `src/pages/api/payway/...`
   - **Plain Node.js (no framework)**: only `http`/`https`, no framework dependency -> add a branch to the existing request handler, or a small handler function the app already calls into
   - **Deno**: `deno.json`/`deno.jsonc` present, no `package.json` -> import via `npm:aba-payway-sdk-unofficial`, add a route to the existing `Deno.serve` (or Oak/Fresh/Hono) handler
   - **Bun-native (no framework)**: a `Bun.serve` entrypoint, `bun.lockb`/`bun.lock`, and none of the frameworks above -> add a route to that `Bun.serve` handler

   If nothing above matches confidently, ask which file handles HTTP routes
   before generating anything — don't invent a framework that isn't there.

2. Detect package manager:
   - `bun.lockb` or `bun.lock` -> `bun add aba-payway-sdk-unofficial`
   - `pnpm-lock.yaml` -> `pnpm add aba-payway-sdk-unofficial`
   - `yarn.lock` -> `yarn add aba-payway-sdk-unofficial`
   - Default -> `npm install aba-payway-sdk-unofficial`

### B. Non-JS/TS backend (Python, Go, PHP, Java, Ruby, etc.)

This SDK is a TypeScript/JavaScript package — it only runs in a JS/TS runtime
(Node 18+, Deno, Bun, Cloudflare Workers) and cannot be imported directly into
a Python/Go/PHP/Java/Ruby codebase.

For these stacks, scaffold a small standalone Node (or Deno) service that
wraps the SDK and exposes plain HTTP endpoints, and have the main app call it
over HTTP instead of importing the SDK directly:

1. Create a minimal sidecar (or a single serverless function, if the project
   already deploys to Vercel/Cloudflare/Lambda):
   ```bash
   mkdir payway-service && cd payway-service
   npm init -y
   npm install aba-payway-sdk-unofficial express
   ```
2. Expose endpoints that mirror the SDK methods 1:1 — `POST /create-payment`,
   `POST /check-status`, `POST /verify-webhook` — using the same Express
   pattern as Step 5 below.
3. Point the existing backend at this sidecar with a plain HTTP client
   (`requests` in Python, `net/http` in Go, Guzzle in PHP, etc.) instead of
   reimplementing the signing logic.
4. Never reimplement `generateABAHash` in another language for this
   integration — exact parameter order matters, and getting it subtly wrong
   is exactly the kind of bug this SDK exists to prevent.

---

## Step 2: Install Package

Run the install command using the detected package manager:
```bash
npm install aba-payway-sdk-unofficial
```

---

## Step 3: Configure Environment Variables

Check if `.env` (or `.env.local`) exists. Add these variables if missing:

```env
ABA_MERCHANT_ID="your_merchant_id"
ABA_API_KEY="your_public_key"
ABA_BASE_URL="https://checkout.payway.com.kh" # or sandbox: https://checkout-sandbox.payway.com.kh
```

Do not add a webhook secret variable — ABA does not issue one. If you find
one in an older example, drop it.

---

## Step 4: Implement PayWay Client

Create a singleton helper (e.g. `lib/payway.ts` or `src/lib/payway.ts`):

```typescript
import { ABAPayWay } from "aba-payway-sdk-unofficial";

export const abaPayWay = new ABAPayWay({
  merchantId: process.env.ABA_MERCHANT_ID!,
  apiKey: process.env.ABA_API_KEY!,
  baseUrl: process.env.ABA_BASE_URL || "https://checkout.payway.com.kh",
});
```

---

## Step 5: Implement Payment Endpoints

Choose the pattern matching the user's framework:

### A. Next.js App Router (`app/api/payway/create-payment/route.ts`)
```typescript
import { NextResponse } from "next/server";
import { abaPayWay } from "@/lib/payway";
import { generateTransactionId } from "aba-payway-sdk-unofficial";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const txnId = generateTransactionId();

    const purchase = await abaPayWay.createPurchase({
      transactionId: txnId,
      amount: body.amount,
      currency: body.currency || "USD",
      items: body.items || "Order Payment",
      firstName: body.firstName || "Customer",
      lastName: body.lastName || "Name",
      email: body.email || "customer@example.com",
      returnUrl: body.returnUrl || `${req.headers.get("origin")}/payment/success`,
      cancelUrl: body.cancelUrl || `${req.headers.get("origin")}/payment/cancel`,
    });

    return NextResponse.json(purchase);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

On the frontend, check `purchase.success` first. Then prefer `purchase.qrImage`
(a ready-to-render PNG data URI) or `purchase.qrString` — ABA's current API
does not reliably return `purchase.checkoutUrl`, so don't build a flow that
assumes it's always there.

### B. Express.js (`src/routes/payment.ts`)
```typescript
import { Router } from "express";
import { abaPayWay } from "../lib/payway";
import { generateTransactionId } from "aba-payway-sdk-unofficial";

const router = Router();

router.post("/api/payway/create-payment", async (req, res) => {
  try {
    const txnId = generateTransactionId();
    const purchase = await abaPayWay.createPurchase({
      transactionId: txnId,
      amount: req.body.amount,
      currency: req.body.currency || "USD",
      items: req.body.items || "Order Payment",
      firstName: req.body.firstName || "Customer",
      lastName: req.body.lastName || "Name",
      email: req.body.email || "customer@example.com",
      returnUrl: req.body.returnUrl,
      cancelUrl: req.body.cancelUrl,
    });

    res.json(purchase);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### C. KHQR-Only Purchase (`app/api/payway/create-qr/route.ts` or Express)

There is no separate "create QR" method — pass `paymentOption: "abapay_khqr"`
to the same `createPurchase()` call to get a KHQR-focused response:

```typescript
import { NextResponse } from "next/server";
import { abaPayWay } from "@/lib/payway";
import { generateTransactionId } from "aba-payway-sdk-unofficial";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const txnId = generateTransactionId();

    const qrResult = await abaPayWay.createPurchase({
      transactionId: txnId,
      amount: body.amount,
      currency: body.currency || "USD",
      items: body.items || "Order Payment",
      paymentOption: "abapay_khqr",
    });

    // qrResult.qrImage is a bare, unbranded PNG data URI straight from ABA —
    // ready for <img src>, but see the "branded card" option below.
    return NextResponse.json(qrResult);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

There are two ways to show the QR to a customer — pick one, don't build both:

- **Fast path**: render `qrResult.qrImage` directly in an `<img>` tag. It's
  ABA's own PNG, bare (no merchant name, amount, or branding around it).
- **Branded card**: pass `qrResult.qrString` (the raw EMV data) through
  `generateKHQR()` to get a styled, self-contained card — merchant name,
  formatted amount, a "Scan • Pay • Done" viewfinder frame around the QR,
  and a footer — as one base64 SVG data URI. Use this when the QR is shown
  on its own (a checkout page, a printed counter stand), not the bare image.

```typescript
import { generateKHQR } from "aba-payway-sdk-unofficial";

const cardImage = await generateKHQR({
  emvData: qrResult.qrString!,
  amount: qrResult.amount,
  currency: qrResult.currency as "USD" | "KHR",
  merchantName: "Your Business Name",
  // headerColor?: e.g. "#0057b8" to match your brand instead of the default red
});

// cardImage is `data:image/svg+xml;base64,...` — ready for <img src>.
```

`generateKHQR` is a standalone utility: it doesn't call ABA's API itself, so
it works with any EMV/KHQR string, not just ones from `createPurchase`.

---

## Step 6: Verify & Check Status Endpoint

Add a status check route (e.g. `app/api/payway/check-status/route.ts`):

```typescript
import { NextResponse } from "next/server";
import { abaPayWay } from "@/lib/payway";

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();
    const status = await abaPayWay.checkStatus(transactionId);
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

If `status.success` is `false`, `status.errorCode` tells you why — `"6"`
means the transaction isn't found yet (a brand-new one can take about a
second to become queryable; retry once), `"21"` means the API key expired.

---

## Step 7: Final Check

1. Verify environment variables are loaded properly.
2. Ensure TypeScript types compile without errors (`npm run build` or `npx tsc --noEmit`).
3. Never expose `ABA_API_KEY` to the client/browser bundle.
4. Only call methods that actually exist: `createPurchase`, `checkStatus`,
   and `verifyWebhook` on `ABAPayWay`, plus the standalone `generateKHQR` and
   `generateTransactionId` exports. Don't invent method names — if unsure,
   check `node_modules/aba-payway-sdk-unofficial/dist/index.d.ts`.
