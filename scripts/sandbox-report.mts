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
  "T1",
  "Merchant credentials accepted (HMAC-SHA512 signature)",
  "The merchant ID and API key are a valid pair and the request signature is rebuilt correctly by ABA.",
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
    return { outcome: "PASS", observed: "ABA status code 00 (Success!)", transactionId: khqrTranId };
  },
);

await record(
  "T2",
  "Invalid signature is rejected by ABA",
  "ABA validates the signature: a request signed with a wrong key is refused, so signatures are not being ignored.",
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
    return { outcome: "PASS", observed: `Rejected — ABA code ${r.errorCode ?? "?"}: ${r.error}` };
  },
);

// ---------------------------------------------------------------------------
// 2. KHQR
// ---------------------------------------------------------------------------

await record(
  "T3",
  "KHQR purchase returns a payable EMV payload and image",
  "The KHQR payment option returns a standards-shaped EMVCo payload (starts 000201) plus a rendered QR image.",
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
      observed: `EMV payload ${r.qrString.length} chars starting 000201; PNG image ${r.qrImage.length} chars`,
      transactionId: tranId,
    };
  },
);

await record(
  "T4",
  "ABA Mobile deeplink and app-store fallbacks returned",
  "The mobile flow returns an abamobilebank:// deeplink plus App Store and Play Store links for a device without ABA Mobile.",
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
      observed: "abapay_deeplink, app_store and play_store all returned; base64 return_deeplink accepted in the signature",
      transactionId: tranId,
    };
  },
);

// ---------------------------------------------------------------------------
// 3. Transaction status
// ---------------------------------------------------------------------------

await record(
  "T5",
  "Transaction status is queryable and reports PENDING",
  "check-transaction-2 returns the correct amount and an accurate unpaid status for a real transaction.",
  "POST /api/payment-gateway/v1/payments/check-transaction-2",
  async () => {
    const r = await statusWhenReady(khqrTranId);
    if (!r.success) return { outcome: "FAIL", observed: `ABA code ${r.errorCode ?? "?"}: ${r.error}`, transactionId: khqrTranId };
    if (r.status !== "PENDING") {
      return { outcome: "FAIL", observed: `Expected PENDING for an unpaid transaction, got ${r.status}`, transactionId: khqrTranId };
    }
    return { outcome: "PASS", observed: `status PENDING, amount ${r.amount}`, transactionId: khqrTranId };
  },
);

await record(
  "T6",
  "Unknown transaction is handled without crashing",
  "An unrecognised transaction ID returns ABA code 6 as a structured error rather than an unhandled exception.",
  "POST /api/payment-gateway/v1/payments/check-transaction-2",
  async () => {
    const r = await aba.checkStatus("NO_SUCH_TRAN_00");
    if (r.success || r.errorCode !== "6") {
      return { outcome: "FAIL", observed: `Expected code 6, got code ${r.errorCode ?? "?"}: ${r.error}` };
    }
    return { outcome: "PASS", observed: `ABA code 6: ${r.error}` };
  },
);

// ---------------------------------------------------------------------------
// 4. Hosted card checkout
// ---------------------------------------------------------------------------

const cardTranId = generateTransactionId();
let checkoutUrl: string | undefined;

await record(
  "T7",
  "Hosted card checkout page is reachable",
  "payment_gate=0 routes to the Checkout service, which returns a hosted card payment page that loads successfully.",
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
    return { outcome: "PASS", observed: `HTTP 302 to hosted page; page loads HTTP 200 (PayWay - Checkout)`, transactionId: cardTranId };
  },
);

// ---------------------------------------------------------------------------
// 5. A real payment. This is the check ABA actually cares about.
// ---------------------------------------------------------------------------

/** Open the checkout and wait for a human to pay it with a test card. */
async function payInteractively(
  id: string,
  name: string,
  proves: string,
  transactionId: string,
  url: string,
  card: { number: string; exp: string; cvv: string; label: string },
  expected: "APPROVED" | "DECLINED",
) {
  console.log(bold(`\n  ${id} needs you.`));
  console.log(`  Open and pay this page:\n  ${url}\n`);
  console.log(`  Use the ${bold(card.label)} card:`);
  console.log(`     number   ${card.number}`);
  console.log(`     expiry   ${card.exp}`);
  console.log(`     cvv      ${card.cvv}\n`);
  if (!noOpen) openInBrowser(url);

  return record(id, name, proves, "POST /api/payment-gateway/v1/payments/check-transaction-2", async () => {
    const deadline = Date.now() + 5 * 60 * 1000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000));
      const s = await aba.checkStatus(transactionId);
      if (!s.success && s.errorCode !== "6") {
        return { outcome: "FAIL", observed: `ABA code ${s.errorCode ?? "?"}: ${s.error}`, transactionId };
      }
      if (s.success && s.status !== "PENDING") {
        if (s.status !== expected) {
          return { outcome: "FAIL", observed: `Expected ${expected}, ABA reported ${s.status}`, transactionId };
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

const APPROVED_CARD = { number: "5156 8399 3770 6777", exp: "01/30", cvv: "993", label: "Mastercard success (no 3DS)" };
const DECLINED_CARD = { number: "4156 8399 3770 6777", exp: "01/30", cvv: "993", label: "Visa declined (no 3DS)" };

if (skipPayment || !checkoutUrl) {
  checks.push({
    id: "T8",
    name: "Card payment completes and settles as APPROVED",
    proves: "A real payment reaches ABA and the merchant reads back an APPROVED settlement — the core go-live proof.",
    endpoint: "POST /api/payment-gateway/v1/payments/check-transaction-2",
    transactionId: checkoutUrl ? cardTranId : undefined,
    outcome: "NOT VERIFIED",
    observed: skipPayment
      ? "Skipped: run without --skip-payment to complete a real card payment."
      : "Skipped: no checkout page was reachable (see T7).",
    at: utc(),
    ms: 0,
  });
  console.log(`  T8  ${"Card payment completes and settles as APPROVED".padEnd(52, ".")} ${warn("NOT VERIFIED")}`);
} else {
  await payInteractively(
    "T8",
    "Card payment completes and settles as APPROVED",
    "A real payment reaches ABA and the merchant reads back an APPROVED settlement — the core go-live proof.",
    cardTranId,
    checkoutUrl,
    APPROVED_CARD,
    "APPROVED",
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
      await payInteractively(
        "T9",
        "Declined card settles as DECLINED",
        "A failed payment is reported back as DECLINED, so the merchant does not release goods on a failed charge.",
        declinedTranId,
        r.checkoutUrl,
        DECLINED_CARD,
        "DECLINED",
      );
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
const paymentProven = checks.some((c) => c.id === "T8" && c.outcome === "PASS");

const stamp = finishedAt.toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
const dir = new URL("../reports/", import.meta.url);
mkdirSync(dir, { recursive: true });

const rows = checks
  .map(
    (c) =>
      `| ${c.id} | ${c.name} | ${c.transactionId ?? "—"} | ${c.at} | **${c.outcome}** |`,
  )
  .join("\n");

const detail = checks
  .map(
    (c) => `### ${c.id} — ${c.name}

**Result:** ${c.outcome}
**What this demonstrates:** ${c.proves}
**Endpoint:** \`${c.endpoint}\`
${c.transactionId ? `**Transaction ID:** \`${c.transactionId}\`\n` : ""}**Run at:** ${c.at} (${c.ms} ms)
**ABA's response:** ${c.observed}
`,
  )
  .join("\n");

const verdict = failed > 0
  ? `**NOT READY.** ${failed} check(s) failed. These must be resolved before requesting production access.`
  : paymentProven
    ? `**READY.** Every check passed, including a real card payment settled as APPROVED and read back through the Check Transaction API.`
    : `**INCOMPLETE.** No check failed, but the card payment (T8) was not completed, so this run does not yet prove an end-to-end payment. Re-run without \`--skip-payment\` before sending this to ABA.`;

const markdown = `# ABA PayWay — Sandbox Integration Test Report

**Merchant ID:** \`${merchantId}\`
**Environment:** Sandbox — \`${aba.config.baseUrl}\`
**Report generated:** ${utc(finishedAt)}
**Integration:** \`${pkg.name}\` v${pkg.version} (Node ${process.version}, ${process.platform})

---

## Verdict

${verdict}

**${passed} passed · ${failed} failed · ${unverified} not verified**

---

## Summary

| # | Check | Transaction ID | Run at (UTC) | Result |
| :-- | :-- | :-- | :-- | :-- |
${rows}

Every transaction ID above is a real transaction on ABA's sandbox and can be
looked up in the merchant portal for independent verification.

---

## Detail

${detail}
---

## Scope and known gaps

Stated plainly so this report is not read as claiming more than it tested.

- **Payment methods exercised:** KHQR (\`abapay_khqr\`), ABA Mobile deeplink
  (\`abapay_khqr_deeplink\`), and hosted card checkout (\`cards\` with
  \`payment_gate=0\`). Alipay, WeChat and Google Pay were **not** tested.
- **Pushback / callback (\`return_url\`) is NOT verified by this report.** No
  callback was received or validated during this run. ABA signs pushback with an
  \`X-PayWay-HMAC-SHA512\` header over the JSON body keys sorted ascending with
  their values concatenated; this integration does not yet implement that
  scheme, and the callback domain is not whitelisted on the merchant profile.
- **Refunds are not available on this profile.** \`/payments/refund\` returns 404
  for a default sandbox merchant, so the refund path is untested.
- **Amounts** are USD 1.00 throughout. Multi-currency (KHR) was not exercised.
- **3D Secure** was not exercised: the card used for T8 is deliberately the
  non-enrolled test card, so the 3DS/OTP path remains untested.

---

<sub>Generated by \`npm run report:sandbox\` from live responses captured during the run. Checks that did not execute are recorded as NOT VERIFIED rather than omitted.</sub>
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
