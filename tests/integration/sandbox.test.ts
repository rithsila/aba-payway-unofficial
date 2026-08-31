// Integration tests against the live ABA PayWay sandbox.
//
// These tests make REAL network calls, so they are opt-in:
// they run only when sandbox credentials are present in the
// environment. Copy ".env.example" to ".env", fill in your
// sandbox values, then run:  npm run test:sandbox
//
// Without credentials the whole suite is skipped, so the
// default "npm test" stays green in CI.

import "dotenv/config";
import { describe, it, expect, beforeAll } from "vitest";
import { ABAPayWay } from "../../src/client";
import { generateTransactionId } from "../../src/utils";

const merchantId = process.env.ABA_MERCHANT_ID;
const apiKey = process.env.ABA_API_KEY;
const baseUrl = process.env.ABA_BASE_URL;

const hasCredentials = Boolean(merchantId && apiKey && baseUrl);

// ABA returns code 21 with "End of API lifetime" when the API key
// has passed its valid-until date, and code 1 "Wrong Hash." when the
// key or merchant ID does not match.
const EXPIRED_MESSAGE =
  "ABA credential expired (code 21: End of API lifetime). " +
  "Request a new sandbox key from ABA and update ABA_API_KEY in .env.";

const WRONG_HASH_MESSAGE =
  "ABA rejected the signature (code 1: Wrong Hash.). " +
  "Check that ABA_MERCHANT_ID and ABA_API_KEY are the matching pair from your credential sheet.";

/** Turn ABA's error codes into advice instead of a bare assertion failure. */
function explainFailure(errorCode: string | undefined, error: string | undefined): string | undefined {
  if (errorCode === "21") return EXPIRED_MESSAGE;
  if (errorCode === "1" || errorCode === "5") return WRONG_HASH_MESSAGE;
  if (error) return `ABA returned code ${errorCode ?? "?"}: ${error}`;
  return undefined;
}

/** Poll past ABA's brief "not yet queryable" window after a purchase. */
async function retryWhileNotFound<T extends { errorCode?: string }>(
  call: () => Promise<T>,
  attempts = 5,
): Promise<T> {
  let result = await call();
  for (let i = 1; i < attempts && result.errorCode === "6"; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    result = await call();
  }
  return result;
}

if (!hasCredentials) {
  // Make the skip reason visible when running the sandbox suite.
  console.warn(
    "[sandbox] Skipping integration tests: set ABA_MERCHANT_ID, ABA_API_KEY, and ABA_BASE_URL in .env",
  );
}

// describe.skipIf keeps the suite green when no credentials are set.
describe.skipIf(!hasCredentials)("ABA PayWay sandbox (live)", () => {
  // Built in beforeAll so a skipped suite never touches the
  // (absent) credentials. A skipped suite runs no hooks.
  let aba: ABAPayWay;

  beforeAll(() => {
    aba = new ABAPayWay({
      merchantId: merchantId!,
      apiKey: apiKey!,
      baseUrl: baseUrl!,
      webhookSecret: process.env.ABA_WEBHOOK_SECRET,
    });
  });

  // A single transaction ID shared by the tests in this run.
  const transactionId = generateTransactionId();

  // Set by the purchase test when the credential itself is bad, so the
  // later tests fail fast with the same clear message instead of making
  // more pointless calls.
  let credentialBroken: string | undefined;

  it(
    "creates a purchase and returns a KHQR string and image",
    async () => {
      const result = await aba.createPurchase({
        transactionId,
        amount: 1.0,
        currency: "USD",
        items: "Sandbox Test Item",
        firstName: "Sandbox",
        lastName: "Tester",
        email: "sandbox@example.com",
        paymentOption: "abapay_khqr",
        returnUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });

      credentialBroken = explainFailure(result.errorCode, result.error);
      if (credentialBroken) throw new Error(credentialBroken);

      expect(result.success).toBe(true);
      // The v3 API answers with the KHQR payload and a rendered PNG.
      // It does NOT return a checkout_url for this flow, so don't
      // assert one — the browser checkout is reached by POSTing the
      // same form to the purchase endpoint instead.
      expect(result.qrString).toMatch(/^000201/);
      expect(result.qrImage).toMatch(/^data:image\/png;base64,/);
      expect(result.abapayDeeplink).toContain("abamobilebank://");
    },
    20_000, // real network call: allow up to 20s
  );

  it(
    "checks status of the new transaction and reports PENDING",
    async () => {
      if (credentialBroken) throw new Error(credentialBroken);

      // A freshly created abapay_khqr transaction is not queryable for a
      // moment — ABA answers code 6 ("tran_id not found") for a second or
      // so before it settles. Retry rather than treating that as a failure;
      // the SDK deliberately does not hide this, because code 6 also means
      // a genuinely unknown transaction.
      const result = await retryWhileNotFound(() => aba.checkStatus(transactionId));

      const failure = explainFailure(result.errorCode, result.error);
      if (failure) throw new Error(failure);

      expect(result.success).toBe(true);
      // An unpaid sandbox transaction stays PENDING until it is paid.
      expect(result.status).toBe("PENDING");
      expect(result.amount).toBe(1.0);
    },
    20_000,
  );

  it(
    "reports an unknown transaction as code 6 rather than throwing",
    async () => {
      if (credentialBroken) throw new Error(credentialBroken);

      const result = await aba.checkStatus("NO_SUCH_TRAN_00");

      expect(result.success).toBe(false);
      expect(result.status).toBe("ERROR");
      expect(result.errorCode).toBe("6");
    },
    20_000,
  );
});
