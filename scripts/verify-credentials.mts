/**
 * Credential preflight. Run after pasting a fresh ABA credential sheet into
 * ".env" to confirm the values work before touching anything else:
 *
 *   npm run verify:credentials
 *
 * It makes two real sandbox calls (a $1.00 purchase that is never paid, then
 * a status lookup) and translates ABA's numeric codes into what to fix.
 */
import "dotenv/config";
import { ABAPayWay } from "../src/client";
import { generateTransactionId } from "../src/utils";

const RESET = "\x1b[0m";
const ok = (s: string) => `\x1b[32m${s}${RESET}`;
const bad = (s: string) => `\x1b[31m${s}${RESET}`;
const dim = (s: string) => `\x1b[2m${s}${RESET}`;

/** Show enough of a secret to tell two keys apart, never the whole thing. */
function preview(value: string): string {
  if (value.length <= 10) return `${value.slice(0, 2)}… (${value.length} chars)`;
  return `${value.slice(0, 6)}…${value.slice(-4)} (${value.length} chars)`;
}

const merchantId = process.env.ABA_MERCHANT_ID;
const apiKey = process.env.ABA_API_KEY;
const baseUrl = process.env.ABA_BASE_URL;

console.log("ABA PayWay credential check\n");

const missing = [
  ["ABA_MERCHANT_ID", merchantId],
  ["ABA_API_KEY", apiKey],
  ["ABA_BASE_URL", baseUrl],
].filter(([, value]) => !value).map(([name]) => name);

if (missing.length > 0) {
  console.error(bad(`Missing in .env: ${missing.join(", ")}`));
  console.error("Copy .env.example to .env and fill in your credential sheet.");
  process.exit(1);
}

const aba = new ABAPayWay({
  merchantId: merchantId!,
  apiKey: apiKey!,
  baseUrl: baseUrl!,
  webhookSecret: process.env.ABA_WEBHOOK_SECRET,
});

console.log(`  merchant id  ${merchantId}`);
console.log(`  api key      ${preview(apiKey!)}`);
console.log(`  base url     ${aba.config.baseUrl}`);
if (aba.config.baseUrl !== baseUrl!.trim().replace(/\/+$/, "")) {
  console.log(dim(`               (reduced from ${baseUrl})`));
}
if (process.env.ABA_RSA_PRIVATE_KEY || process.env.ABA_RSA_PUBLIC_KEY) {
  console.log(dim("  rsa keys     set, but unused by this SDK (payout/refund APIs only)"));
}
console.log();

/** Map ABA's status codes to the thing the operator actually has to change. */
function advise(code: string | undefined): string | undefined {
  switch (code) {
    case "1":
    case "5":
      return "Wrong hash. ABA_MERCHANT_ID and ABA_API_KEY must be the matching pair from one credential sheet.";
    case "21":
      return "The API key has expired. Ask ABA for a fresh sandbox key.";
    case "6":
      return "Transaction not found.";
    default:
      return undefined;
  }
}

const transactionId = generateTransactionId();
process.stdout.write("  creating a $1.00 test purchase … ");

const purchase = await aba.createPurchase({
  transactionId,
  amount: 1.0,
  currency: "USD",
  items: "Credential check",
  firstName: "Preflight",
  lastName: "Check",
  email: "preflight@example.com",
  paymentOption: "abapay_khqr",
  returnUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
});

if (!purchase.success) {
  console.log(bad("failed"));
  console.error(`\n  ABA code ${purchase.errorCode ?? "?"}: ${purchase.error}`);
  const advice = advise(purchase.errorCode);
  if (advice) console.error(`  → ${advice}`);
  process.exit(1);
}

console.log(ok("ok"));
console.log(`     tran id     ${transactionId}`);
console.log(`     qr payload  ${purchase.qrString?.slice(0, 40)}…`);
console.log(`     qr image    ${purchase.qrImage ? `${purchase.qrImage.length} chars of PNG data URI` : dim("none")}`);
console.log(`     deeplink    ${purchase.abapayDeeplink?.slice(0, 40)}…`);

// A new abapay_khqr transaction reports code 6 for a moment before it is
// queryable, so poll rather than calling the first answer a failure.
process.stdout.write("\n  checking its status … ");
let status = await aba.checkStatus(transactionId);
for (let i = 0; i < 4 && status.errorCode === "6"; i++) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  status = await aba.checkStatus(transactionId);
}

if (!status.success) {
  console.log(bad("failed"));
  console.error(`\n  ABA code ${status.errorCode ?? "?"}: ${status.error}`);
  const advice = advise(status.errorCode);
  if (advice) console.error(`  → ${advice}`);
  process.exit(1);
}

console.log(ok("ok"));
console.log(`     status      ${status.status} ${dim("(expected: unpaid transactions stay PENDING)")}`);
console.log(`     amount      ${status.amount} ${status.currency ?? dim("(currency blank until paid)")}`);

console.log(`\n${ok("Credentials work.")} Run the full suite with: npm run test:sandbox`);
