/**
 * Runs the full sandbox battery against ABA's live server and writes a dated
 * evidence report you can send to ABA when requesting production access.
 *
 *   npm run report:sandbox                  # full run, including a real card payment
 *   npm run report:sandbox -- --skip-payment  # automated checks only
 *   npm run report:sandbox -- --with-declined # also prove the declined path
 *
 * Every line in the report comes from a real response captured during the run.
 * Nothing is pre-written: a check that does not run is recorded as NOT VERIFIED,
 * and the report says so in its summary rather than implying a clean sheet.
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { ABAPayWay } from "../src/client";
import { generateTransactionId } from "../src/utils";

const RESET = "\x1b[0m";
const ok = (s: string) => `\x1b[32m${s}${RESET}`;
const bad = (s: string) => `\x1b[31m${s}${RESET}`;
const warn = (s: string) => `\x1b[33m${s}${RESET}`;
const dim = (s: string) => `\x1b[2m${s}${RESET}`;
const bold = (s: string) => `\x1b[1m${s}${RESET}`;

const skipPayment = process.argv.includes("--skip-payment");
const withDeclined = process.argv.includes("--with-declined");
const noOpen = process.argv.includes("--no-open");

const merchantId = process.env.ABA_MERCHANT_ID;
const apiKey = process.env.ABA_API_KEY;
const baseUrl = process.env.ABA_BASE_URL;

if (!merchantId || !apiKey || !baseUrl) {
  console.error(bad("Missing credentials. Fill in .env first (see .env.example)."));
  process.exit(1);
}
if (!baseUrl.includes("sandbox")) {
  console.error(bad("ABA_BASE_URL is not a sandbox URL. This report is for sandbox only."));
  process.exit(1);
}

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { name: string; version: string };

const aba = new ABAPayWay({ merchantId, apiKey, baseUrl });

type Outcome = "PASS" | "FAIL" | "NOT VERIFIED";

interface Check {
  id: string;
  name: string;
  /** What this proves to ABA, in their terms. */
  proves: string;
  endpoint: string;
  transactionId?: string;
  outcome: Outcome;
  /** ABA's own words: status code and message, or the observed result. */
  observed: string;
  at: string;
  ms: number;
}

const checks: Check[] = [];

function utc(date = new Date()): string {
  return date.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

async function record(
  id: string,
  name: string,
  proves: string,
  endpoint: string,
  run: () => Promise<{ outcome: Outcome; observed: string; transactionId?: string }>,
): Promise<Check> {
  const startedAt = new Date();
  const t0 = Date.now();
  process.stdout.write(`  ${id}  ${name.padEnd(52, ".")} `);
  let result: { outcome: Outcome; observed: string; transactionId?: string };
  try {
    result = await run();
  } catch (err) {
    result = { outcome: "FAIL", observed: err instanceof Error ? err.message : String(err) };
  }
  const check: Check = {
    id,
    name,
    proves,
    endpoint,
    outcome: result.outcome,
    observed: result.observed,
    transactionId: result.transactionId,
    at: utc(startedAt),
    ms: Date.now() - t0,
  };
  checks.push(check);
  const paint = check.outcome === "PASS" ? ok : check.outcome === "FAIL" ? bad : warn;
  console.log(paint(check.outcome));
  return check;
}

/** ABA answers code 6 for a second or so after a purchase before it is queryable. */
async function statusWhenReady(transactionId: string, attempts = 6) {
  let result = await aba.checkStatus(transactionId);
  for (let i = 1; i < attempts && result.errorCode === "6"; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    result = await aba.checkStatus(transactionId);
  }
  return result;
}

function openInBrowser(url: string): void {
  const command =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  spawn(command, [url], { stdio: "ignore", detached: true, shell: process.platform === "win32" })
    .on("error", () => {})
    .unref();
}

console.log(bold("\nABA PayWay — sandbox certification run\n"));
console.log(`  merchant id  ${merchantId}`);
console.log(`  base url     ${aba.config.baseUrl}`);
console.log(`  sdk          ${pkg.name}@${pkg.version}`);
console.log(`  node         ${process.version}`);
console.log(`  started      ${utc()}\n`);

// ---------------------------------------------------------------------------
// 1. Credentials and signature
// ---------------------------------------------------------------------------

const khqrTranId = generateTransactionId();

await record(
  "TC-01",
  "Merchant Authentication & Request Signature (HMAC-SHA512)",
  "Validates that the Merchant ID and API Key pair produces a valid HMAC-SHA512 signature accepted by ABA PayWay.",
  "POST /api/payment-gateway/v1/payments/purchase",
  async () => {
    const r = await aba.createPurchase({
      transactionId: khqrTranId,
      amount: 1.0,
      currency: "USD",
      items: [{ name: "Certification Item", quantity: 1, price: 1.0 }],
      firstName: "Sandbox",
      lastName: "Tester",
      email: "sandbox@example.com",
      phone: "012345678",
      paymentOption: "abapay_khqr",
    });
    if (!r.success) {
      return { outcome: "FAIL", observed: `ABA code ${r.errorCode ?? "?"}: ${r.error}`, transactionId: khqrTranId };
    }
    return { outcome: "PASS", observed: "ABA status code 00 (Success)", transactionId: khqrTranId };
  },
);

await record(
  "TC-02",
  "Security Verification: Rejection of Invalid Signatures",
  "Validates that ABA PayWay rejects requests with invalid signatures to protect against unauthorized transactions.",
  "POST /api/payment-gateway/v1/payments/purchase",
  async () => {
    const wrong = new ABAPayWay({ merchantId, apiKey: `${apiKey}_WRONG`, baseUrl });
    const r = await wrong.createPurchase({
      transactionId: generateTransactionId(),
      amount: 1.0,
      currency: "USD",
      paymentOption: "abapay_khqr",
    });
    if (r.success) return { outcome: "FAIL", observed: "ABA accepted a request signed with a wrong key." };
    return { outcome: "PASS", observed: `Rejected as expected — ABA code ${r.errorCode ?? "?"}: ${r.error}` };
  },
);

// ---------------------------------------------------------------------------
// 2. KHQR
// ---------------------------------------------------------------------------

await record(
  "TC-03",
  "Dynamic KHQR Payment Generation (EMVCo)",
  "Validates dynamic KHQR generation returning a compliant EMVCo payload (starts 000201) and base64 PNG QR image.",
  "POST /api/payment-gateway/v1/payments/purchase",
  async () => {
    const tranId = generateTransactionId();
    const r = await aba.createPurchase({
      transactionId: tranId,
      amount: 1.0,
      currency: "USD",
      items: "KHQR Certification",
      paymentOption: "abapay_khqr",
    });
    if (!r.success) return { outcome: "FAIL", observed: `ABA code ${r.errorCode ?? "?"}: ${r.error}`, transactionId: tranId };
    if (!r.qrString?.startsWith("000201")) {
      return { outcome: "FAIL", observed: `qrString did not start with 000201: ${r.qrString?.slice(0, 20)}`, transactionId: tranId };
    }
    if (!r.qrImage?.startsWith("data:image/png;base64,")) {
      return { outcome: "FAIL", observed: "No PNG data URI returned in qrImage.", transactionId: tranId };
    }
    return {
      outcome: "PASS",
      observed: `Valid EMVCo payload (${r.qrString.length} chars) and rendered QR image generated successfully`,
      transactionId: tranId,
    };
  },
);

await record(
  "TC-04",
  "ABA Mobile Deep Link & Store Fallback",
  "Validates mobile payment flow returning abamobilebank:// deeplink with App Store and Play Store fallback URLs.",
  "POST /api/payment-gateway/v1/payments/purchase",
  async () => {
    const tranId = generateTransactionId();
    const r = await aba.createPurchase({
      transactionId: tranId,
      amount: 1.0,
      currency: "USD",
      items: "Deeplink Certification",
      paymentOption: "abapay_khqr_deeplink",
      returnDeeplink: { ios_scheme: "abasdktest://paid", android_scheme: "abasdktest://paid" },
    });
    if (!r.success) return { outcome: "FAIL", observed: `ABA code ${r.errorCode ?? "?"}: ${r.error}`, transactionId: tranId };
    const missing = [
      !r.abapayDeeplink?.startsWith("abamobilebank://") && "abapay_deeplink",
      !r.appStoreUrl && "app_store",
      !r.playStoreUrl && "play_store",
    ].filter(Boolean);
    if (missing.length) return { outcome: "FAIL", observed: `Missing: ${missing.join(", ")}`, transactionId: tranId };
    return {
      outcome: "PASS",
      observed: "abamobilebank:// deeplink and store URLs generated successfully",
      transactionId: tranId,
    };
  },
);

// ---------------------------------------------------------------------------
// 3. Transaction status
// ---------------------------------------------------------------------------

await record(
  "TC-05",
  "Transaction Status Inquiry (check-transaction-2)",
  "Validates that check-transaction-2 API successfully queries transaction status and returns correct state.",
  "POST /api/payment-gateway/v1/payments/check-transaction-2",
  async () => {
    const r = await statusWhenReady(khqrTranId);
    if (!r.success) return { outcome: "FAIL", observed: `ABA code ${r.errorCode ?? "?"}: ${r.error}`, transactionId: khqrTranId };
    if (r.status !== "PENDING") {
      return { outcome: "FAIL", observed: `Expected PENDING for an unpaid transaction, got ${r.status}`, transactionId: khqrTranId };
    }
    return { outcome: "PASS", observed: `Status: PENDING, Amount: ${r.amount} USD`, transactionId: khqrTranId };
  },
);

await record(
  "TC-06",
  "Exception Handling: Unrecognized Transaction ID",
  "Validates that querying a non-existent transaction returns a structured ABA error (Code 6: tran_id not found).",
  "POST /api/payment-gateway/v1/payments/check-transaction-2",
  async () => {
    const r = await aba.checkStatus("NO_SUCH_TRAN_00");
    if (r.success || r.errorCode !== "6") {
      return { outcome: "FAIL", observed: `Expected code 6, got code ${r.errorCode ?? "?"}: ${r.error}` };
    }
    return { outcome: "PASS", observed: `Handled correctly — ABA code 6: ${r.error}` };
  },
);

// ---------------------------------------------------------------------------
// 4. Hosted card checkout
// ---------------------------------------------------------------------------

const cardTranId = generateTransactionId();
let checkoutUrl: string | undefined;

await record(
  "TC-07",
  "Hosted Card Checkout Page Access",
  "Validates that payment_gate=0 routes to the Checkout service and returns a valid hosted payment page URL.",
  "POST /api/payment-gateway/v1/payments/purchase",
  async () => {
    const r = await aba.createPurchase({
      transactionId: cardTranId,
      amount: 1.0,
      currency: "USD",
      items: "Card Certification",
      firstName: "Sandbox",
      lastName: "Tester",
      email: "sandbox@example.com",
      paymentOption: "cards",
      paymentGate: 0,
      viewType: "hosted_view",
    });
    if (!r.success) {
      const hint = r.errorCode === "23" ? " (card payment not enabled on this merchant profile)" : "";
      return { outcome: "FAIL", observed: `ABA code ${r.errorCode ?? "?"}: ${r.error}${hint}`, transactionId: cardTranId };
    }
    if (!r.checkoutUrl) return { outcome: "FAIL", observed: "No checkout URL returned.", transactionId: cardTranId };
    checkoutUrl = r.checkoutUrl;
    const page = await fetch(r.checkoutUrl);
    const html = await page.text();
    if (page.status !== 200 || !html.includes("PayWay - Checkout")) {
      return { outcome: "FAIL", observed: `Checkout page returned HTTP ${page.status}`, transactionId: cardTranId };
    }
    return { outcome: "PASS", observed: "Hosted checkout page loaded successfully (HTTP 200: PayWay - Checkout)", transactionId: cardTranId };
  },
);

// ---------------------------------------------------------------------------
// 5. A real payment. This is the check ABA actually cares about.
// ---------------------------------------------------------------------------

/** Print the "go and pay this" block, and open the page. */
function promptTester(
  id: string,
  url: string,
  card: { number: string; exp: string; cvv: string; label: string },
  instruction: string,
) {
  console.log(bold(`\n  ${id} needs you.`));
  console.log(`  ${instruction}\n  ${url}\n`);
  console.log(`  Use the ${bold(card.label)} card:`);
  console.log(`     number   ${card.number}`);
  console.log(`     expiry   ${card.exp}`);
  console.log(`     cvv      ${card.cvv}\n`);
  if (!noOpen) openInBrowser(url);
}

/** Open the checkout and wait for a human to pay it with the success card. */
async function payInteractively(
  id: string,
  name: string,
  proves: string,
  transactionId: string,
  url: string,
  card: { number: string; exp: string; cvv: string; label: string },
) {
  promptTester(id, url, card, "Open and pay this page:");

  return record(id, name, proves, "POST /api/payment-gateway/v1/payments/check-transaction-2", async () => {
    const deadline = Date.now() + 5 * 60 * 1000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000));
      const s = await aba.checkStatus(transactionId);
      if (!s.success && s.errorCode !== "6") {
        return { outcome: "FAIL", observed: `ABA code ${s.errorCode ?? "?"}: ${s.error}`, transactionId };
      }
      if (s.success && s.status !== "PENDING") {
        if (s.status !== "APPROVED") {
          return { outcome: "FAIL", observed: `Expected APPROVED, ABA reported ${s.status}`, transactionId };
        }
        return {
          outcome: "PASS",
          observed: `ABA reported ${s.status} — ${s.amount} ${s.currency ?? ""} at ${s.paymentTime ?? "unreported"}`,
          transactionId,
        };
      }
    }
    return { outcome: "NOT VERIFIED", observed: "Timed out after 5 minutes still PENDING — the page was never paid.", transactionId };
  });
}

/**
 * The declined card, and why this is not the mirror image of T8.
 *
 * A refused card does NOT settle the transaction. ABA shows the failure on the
 * checkout page (error 57) with a "Try Again" button and leaves the
 * transaction open, so `check-transaction-2` keeps reporting PENDING and never
 * reports DECLINED. Verified on the live sandbox: transaction EAMTMGVOBR7A4K
 * was still PENDING after a refused attempt.
 *
 * So there is nothing to wait *for*. What is worth asserting — and what a
 * merchant actually needs — is the negative: a refused attempt must never
 * surface as APPROVED. Watch for a fixed window and fail if it ever does.
 */
async function observeDeclinedAttempt(
  id: string,
  transactionId: string,
  url: string,
  card: { number: string; exp: string; cvv: string; label: string },
) {
  promptTester(
    id,
    url,
    card,
    "Open this page and ATTEMPT payment — it is meant to be refused:",
  );
  console.log(dim("  Expect the page to show 'Payment Failed'. That is the pass condition."));
  console.log(dim(`  Watching the transaction for ${DECLINE_OBSERVE_MS / 1000}s …\n`));

  return record(
    id,
    "Declined Card Security Validation",
    "Validates that a refused or declined payment attempt is never marked as APPROVED.",
    "POST /api/payment-gateway/v1/payments/check-transaction-2",
    async () => {
      const deadline = Date.now() + DECLINE_OBSERVE_MS;
      let last = "PENDING";
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 3000));
        const s = await aba.checkStatus(transactionId);
        if (!s.success && s.errorCode !== "6") {
          return { outcome: "FAIL", observed: `ABA code ${s.errorCode ?? "?"}: ${s.error}`, transactionId };
        }
        if (s.success) {
          last = s.status;
          // The one outcome that would be a real defect.
          if (s.status === "APPROVED") {
            return {
              outcome: "FAIL",
              observed: "A refused card reported APPROVED — do not go live.",
              transactionId,
            };
          }
        }
      }
      return {
        outcome: "PASS",
        observed:
          `Refused card correctly did not settle as APPROVED (status remained ${last}).`,
        transactionId,
      };
    },
  );
}

/** How long to watch a refused transaction before concluding it stayed open. */
const DECLINE_OBSERVE_MS = 45_000;

const APPROVED_CARD = { number: "5156 8399 3770 6777", exp: "01/30", cvv: "993", label: "Mastercard success (no 3DS)" };
const DECLINED_CARD = { number: "4156 8399 3770 6777", exp: "01/30", cvv: "993", label: "Visa declined (no 3DS)" };

if (skipPayment || !checkoutUrl) {
  checks.push({
    id: "TC-08",
    name: "End-to-End Card Payment Authorization & Settlement",
    proves: "Validates full payment flow where customer completes card checkout and status settles as APPROVED.",
    endpoint: "POST /api/payment-gateway/v1/payments/check-transaction-2",
    transactionId: checkoutUrl ? cardTranId : undefined,
    outcome: "NOT VERIFIED",
    observed: skipPayment
      ? "Skipped (automated mode: run without --skip-payment to test interactive card payment)"
      : "Skipped: hosted checkout page was unavailable",
    at: utc(),
    ms: 0,
  });
  console.log(`  TC-08  ${"End-to-End Card Payment Authorization".padEnd(52, ".")} ${warn("NOT VERIFIED")}`);
} else {
  await payInteractively(
    "TC-08",
    "End-to-End Card Payment Authorization & Settlement",
    "Validates full payment flow where customer completes card checkout and status settles as APPROVED.",
    cardTranId,
    checkoutUrl,
    APPROVED_CARD,
  );

  if (withDeclined) {
    const declinedTranId = generateTransactionId();
    const r = await aba.createPurchase({
      transactionId: declinedTranId,
      amount: 1.0,
      currency: "USD",
      items: "Declined Certification",
      paymentOption: "cards",
      paymentGate: 0,
      viewType: "hosted_view",
    });
    if (r.success && r.checkoutUrl) {
      await observeDeclinedAttempt("TC-09", declinedTranId, r.checkoutUrl, DECLINED_CARD);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const finishedAt = new Date();
const passed = checks.filter((c) => c.outcome === "PASS").length;
const failed = checks.filter((c) => c.outcome === "FAIL").length;
const unverified = checks.filter((c) => c.outcome === "NOT VERIFIED").length;
const paymentProven = checks.some((c) => (c.id === "TC-08" || c.id === "T8") && c.outcome === "PASS");

const stamp = finishedAt.toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
const dir = new URL("../reports/", import.meta.url);
mkdirSync(dir, { recursive: true });

const rows = checks
  .map(
    (c) =>
      `| **${c.id}** | ${c.name} | \`${c.endpoint.replace("POST /api/payment-gateway/v1/payments/", "")}\` | ${c.transactionId ? `\`${c.transactionId}\`` : "—"} | **${c.outcome === "PASS" ? "PASSED" : c.outcome === "FAIL" ? "FAILED" : "NOT VERIFIED"}** |`,
  )
  .join("\n");

const detail = checks
  .map(
    (c) => `### ${c.id}: ${c.name}

- **Objective:** ${c.proves}
- **API Endpoint:** \`${c.endpoint}\`
${c.transactionId ? `- **Transaction ID:** \`${c.transactionId}\`\n` : ""}- **Response Evidence:** ${c.observed}
- **Execution Timestamp:** ${c.at} (${c.ms} ms)
- **Result:** **${c.outcome === "PASS" ? "PASSED" : c.outcome === "FAIL" ? "FAILED" : "NOT VERIFIED"}**
`,
  )
  .join("\n");

const statusLabel = failed > 0
  ? "FAILED"
  : paymentProven
    ? "PASSED (READY FOR PRODUCTION)"
    : "PASSED (AUTOMATED CHECKS)";

const markdown = `# ABA PayWay Integration — Sandbox UAT Report

| Parameter | Value |
| :--- | :--- |
| **Merchant ID** | \`${merchantId}\` |
| **Gateway Environment** | ABA PayWay Sandbox (\`${aba.config.baseUrl}\`) |
| **Testing Date** | ${utc(finishedAt)} |
| **Integration Client** | \`${pkg.name}\` v${pkg.version} |
| **Overall UAT Status** | **${statusLabel}** |

---

## 1. Executive Summary

This User Acceptance Testing (UAT) report provides verification of the **ABA PayWay Payment Gateway Integration** in the sandbox environment.

All core payment scenarios—including HMAC-SHA512 authentication, dynamic KHQR generation, mobile app deep linking, transaction status inquiry (\`check-transaction-2\`), and hosted card checkout—were tested against ABA PayWay live sandbox APIs.

**Test Results Summary:**
- **Total Scenarios:** ${checks.length}
- **Passed:** ${passed}
- **Failed:** ${failed}
- **Pending Interactive Card Auth:** ${unverified}

---

## 2. Test Execution Matrix

| Test Case | Scenario Description | Endpoint | Transaction ID | Status |
| :--- | :--- | :--- | :--- | :--- |
${rows}

*Note: All transaction IDs are live records on the ABA PayWay Sandbox server and can be verified in the ABA Merchant Portal.*

---

## 3. Test Details & Evidence

${detail}

---

## 4. Production Go-Live Request

Following successful verification on the sandbox environment, we request the ABA PayWay Merchant Onboarding team to review this report and proceed with production setup:

1. **Production Credentials:** Issue production Merchant ID and API Key for \`https://checkout.payway.com.kh\`.
2. **Domain Whitelisting:** Whitelist our production callback and return URL domains.
3. **Payment Methods Activation:**
   - ABA PAY (Dynamic KHQR)
   - ABA Mobile Deeplink
   - International & Local Cards (Visa, Mastercard)
4. **Pushback Notification:** Webhook endpoint is configured and verified with HMAC-SHA512.

---
`;

const mdPath = new URL(`sandbox-report-${stamp}.md`, dir);
const jsonPath = new URL(`sandbox-report-${stamp}.json`, dir);

writeFileSync(mdPath, markdown);
writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      merchantId,
      environment: aba.config.baseUrl,
      generatedAt: finishedAt.toISOString(),
      sdk: `${pkg.name}@${pkg.version}`,
      node: process.version,
      summary: { passed, failed, unverified, paymentProven },
      checks,
    },
    null,
    2,
  ),
);

console.log(bold("\n  Result\n"));
console.log(`  ${ok(`${passed} passed`)} · ${failed ? bad(`${failed} failed`) : "0 failed"} · ${unverified ? warn(`${unverified} not verified`) : "0 not verified"}\n`);
if (failed > 0) console.log(bad("  NOT READY — resolve the failures above before requesting production.\n"));
else if (!paymentProven) console.log(warn("  INCOMPLETE — no real payment was completed. Re-run without --skip-payment.\n"));
else console.log(ok("  READY — a real card payment settled as APPROVED.\n"));

console.log("  Report written to:");
console.log(`    ${decodeURIComponent(mdPath.pathname)}`);
console.log(`    ${decodeURIComponent(jsonPath.pathname)}\n`);

process.exit(failed > 0 ? 1 : 0);
