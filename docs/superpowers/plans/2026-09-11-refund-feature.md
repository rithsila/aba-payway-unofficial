# ABA PayWay Refund Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the ABA PayWay Refund API in `aba-payway-sdk-unofficial` and add comprehensive documentation to `aba-payway-docs`.

**Architecture:** Add RSA public key chunk encryption and HMAC-SHA512 signature generation to support the ABA refund endpoint (`/api/merchant-portal/merchant-access/online-transaction/refund`). Expose `client.refund()` on the main `ABAPayWay` class, and document the feature with a dedicated guide and updated API reference in Fumadocs.

**Tech Stack:** TypeScript, Node.js `crypto`, Vitest, Next.js / Fumadocs (MDX).

**Spec:** ABA PayWay Refund API OpenAPI Specification (`monitor-bot/docs/refund-api-14530821e0.md`) & ABA KHQR Refund Email Update.

## Global Constraints

- Never break existing `ABAPayWay` constructor signatures (keep `rsaPublicKey` optional in `ABAConfig`).
- Use exact ABA parameter format: `request_time` (UTC YYYYMMDDHHmmss), `merchant_id`, `merchant_auth` (RSA chunk encrypted Base64), and `hash` (HMAC-SHA512 Base64).
- Chunk size for RSA encryption is 117 bytes using PKCS#1 v1.5 padding.
- Error handling follows existing SDK convention: return `{ success: false, error, code }` instead of unhandled throws.

---

### Task 1: Add Refund Types to SDK

**Files:**
- Modify: `src/types.ts`
- Test: `tests/types.test.ts`

**Interfaces:**
- Consumes: Existing `ABAConfig`
- Produces: `RefundRequest`, `RefundResponse`, updated `ABAConfig` with `rsaPublicKey?: string`

- [ ] **Step 1: Write test checking export of refund types**
- [ ] **Step 2: Add `rsaPublicKey` to `ABAConfig` and define `RefundRequest` and `RefundResponse`**
- [ ] **Step 3: Run `npm test` to verify types compile and pass**
- [ ] **Step 4: Commit types update**

---

### Task 2: Implement RSA Chunk Encryption Helper

**Files:**
- Create: `src/rsa.ts`
- Test: `tests/rsa.test.ts`

**Interfaces:**
- Consumes: Node.js `crypto` (`publicEncrypt`, `constants.RSA_PKCS1_PADDING`)
- Produces: `encryptRsaChunks(data: string, rsaPublicKey: string, chunkSize?: number): string`

- [ ] **Step 1: Write test for `encryptRsaChunks` with generated keypair and mock verification**
- [ ] **Step 2: Implement `encryptRsaChunks` chunking data into 117-byte blocks, encrypting each with PKCS1 padding, and returning Base64 string**
- [ ] **Step 3: Run `npm test` to verify encryption works**
- [ ] **Step 4: Commit RSA helper**

---

### Task 3: Implement `refund()` Method in `ABAPayWay` Client

**Files:**
- Modify: `src/client.ts`
- Modify: `src/index.ts`
- Test: `tests/client.test.ts`

**Interfaces:**
- Consumes: `encryptRsaChunks`, `hmacSha512Base64`, `getABATimestamp`, `readAbaStatus`
- Produces: `ABAPayWay.prototype.refund(request: RefundRequest): Promise<RefundResponse>`

- [ ] **Step 1: Write unit tests with mocked fetch covering successful refund, API error responses (PTL37, PTL02), and missing RSA key error**
- [ ] **Step 2: Implement `refund` in `src/client.ts` calling `/api/merchant-portal/merchant-access/online-transaction/refund`**
- [ ] **Step 3: Run `npm test` and `npm run build`**
- [ ] **Step 4: Commit refund implementation**

---

### Task 4: Add Refund Documentation to `aba-payway-docs`

**Files:**
- Create: `/Users/rithsila/orca/aba-payway-docs/content/docs/refund.mdx`
- Modify: `/Users/rithsila/orca/aba-payway-docs/content/docs/meta.json`
- Modify: `/Users/rithsila/orca/aba-payway-docs/content/docs/api-reference.mdx`

**Interfaces:**
- Consumes: SDK `refund()` method signatures and error codes
- Produces: Live documentation page `/docs/refund`, updated navigation, and API reference entry

- [ ] **Step 1: Create `/Users/rithsila/orca/aba-payway-docs/content/docs/refund.mdx` with usage instructions, KHQR notes (30-day window, immediate settlement), full & partial refund examples**
- [ ] **Step 2: Update `meta.json` in `aba-payway-docs` to include `"refund"` in page ordering**
- [ ] **Step 3: Update `api-reference.mdx` in `aba-payway-docs` with `refund()` method and refund types**
- [ ] **Step 4: Verify build in `aba-payway-docs` (`npm run build`)**
- [ ] **Step 5: Commit documentation changes**
