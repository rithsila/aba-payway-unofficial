/**
 * Drives one sandbox transaction all the way to PAID, using ABA's test cards.
 *
 *   npm run pay:sandbox
 *   npm run pay:sandbox -- --amount 2.50 --currency USD --no-open
 *
 * Why this exists: a sandbox KHQR code cannot be scanned by the real ABA
 * Mobile app, so `abapay_khqr` transactions sit at PENDING forever and the
 * paid half of an integration — APPROVED, DECLINED, the pushback — never gets
 * exercised. The hosted card checkout is the one flow a human can finish in
 * sandbox, so this script opens it, then polls until ABA reports the outcome.
 *
 * It creates a real purchase on ABA's sandbox. No real money is involved.
 */
import "dotenv/config";
import { spawn } from "node:child_process";
import { ABAPayWay } from "../src/client";
import { generateTransactionId } from "../src/utils";

const RESET = "\x1b[0m";
const ok = (s: string) => `\x1b[32m${s}${RESET}`;
const bad = (s: string) => `\x1b[31m${s}${RESET}`;
const warn = (s: string) => `\x1b[33m${s}${RESET}`;
const dim = (s: string) => `\x1b[2m${s}${RESET}`;
const bold = (s: string) => `\x1b[1m${s}${RESET}`;

/** ABA's sandbox test cards. Real card numbers are rejected here. */
const TEST_CARDS = [
  { outcome: "Success ", brand: "Mastercard", number: "5156 8399 3770 6777", exp: "01/30", cvv: "993", threeDS: "No" },
  { outcome: "Success ", brand: "Visa      ", number: "4286 0900 0000 0206", exp: "04/30", cvv: "777", threeDS: "Yes" },
  { outcome: "Declined", brand: "Mastercard", number: "5156 8302 7256 1029", exp: "04/30", cvv: "777", threeDS: "Yes" },
  { outcome: "Declined", brand: "Visa      ", number: "4156 8399 3770 6777", exp: "01/30", cvv: "993", threeDS: "No" },
];

function flag(name: string): string | undefined {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? undefined : process.argv[at + 1];
}

const amount = Number(flag("amount") ?? "1.00");
const currency = (flag("currency") ?? "USD").toUpperCase() as "USD" | "KHR";
const paymentOption = flag("option") ?? "cards";
const shouldOpen = !process.argv.includes("--no-open");

const merchantId = process.env.ABA_MERCHANT_ID;
const apiKey = process.env.ABA_API_KEY;
const baseUrl = process.env.ABA_BASE_URL;

if (!merchantId || !apiKey || !baseUrl) {
  console.error(bad("Missing credentials. Fill in .env first (see .env.example)."));
  process.exit(1);
}

if (!baseUrl.includes("sandbox")) {
  console.error(bad("ABA_BASE_URL is not a sandbox URL. Refusing to run against production."));
  console.error(dim(`  got: ${baseUrl}`));
  process.exit(1);
}

if (Number.isNaN(amount) || amount <= 0) {
  console.error(bad(`--amount must be a positive number, got "${flag("amount")}".`));
  process.exit(1);
}

/** Open a URL in the operating system's default browser. */
function openInBrowser(url: string): void {
  const command =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  spawn(command, [url], { stdio: "ignore", detached: true, shell: process.platform === "win32" })
    .on("error", () => {
      console.log(warn("  Could not open a browser automatically — copy the link above."));
    })
    .unref();
}

const aba = new ABAPayWay({ merchantId, apiKey, baseUrl });
const transactionId = generateTransactionId();

console.log(bold("\nABA PayWay sandbox — pay a transaction for real\n"));
console.log(`  merchant id  ${merchantId}`);
console.log(`  base url     ${aba.config.baseUrl}`);
console.log(`  tran id      ${transactionId}`);
console.log(`  amount       ${amount.toFixed(2)} ${currency}`);
console.log(`  option       ${paymentOption} ${dim("(payment_gate=0 → hosted checkout)")}\n`);

console.log("  creating the purchase … ");

const purchase = await aba.createPurchase({
  transactionId,
  amount,
  currency,
  items: "Sandbox Card Test",
  firstName: "Sandbox",
  lastName: "Tester",
  email: "sandbox@example.com",
  paymentOption,
  // The switch that makes this work. Without it a profile with the QR Payment
  // API service enabled answers with KHQR JSON and ignores paymentOption.
  paymentGate: 0,
  viewType: "hosted_view",
});

if (!purchase.success) {
  console.error(bad(`\n  failed — ABA code ${purchase.errorCode ?? "?"}: ${purchase.error}`));
  if (purchase.errorCode === "23") {
    console.error(dim("  Code 23 means card payment is not enabled on this merchant profile."));
    console.error(dim("  Ask ABA to enable Card Payment for the sandbox profile."));
  }
  process.exit(1);
}

if (!purchase.checkoutUrl) {
  console.error(bad("\n  ABA accepted the purchase but returned no checkout URL."));
  console.error(dim("  It answered with the QR API shape instead of a 302 — check payment_gate."));
  process.exit(1);
}

console.log(ok("  ok\n"));
console.log(bold("  Open this page and pay:"));
console.log(`  ${purchase.checkoutUrl}\n`);

console.log(bold("  Test cards ") + dim("(real cards are rejected in sandbox)"));
console.log(dim("  outcome    brand        number                 exp     cvv   3DS"));
for (const c of TEST_CARDS) {
  const line = `  ${c.outcome}   ${c.brand}   ${c.number}    ${c.exp}   ${c.cvv}   ${c.threeDS}`;
  console.log(c.outcome.trim() === "Success" ? ok(line) : bad(line));
}
console.log(dim("\n  A 3DS card sends its OTP to the email registered on your ABA account."));
console.log(dim("  Start with the Mastercard success card — it skips 3DS entirely.\n"));

if (shouldOpen) {
  console.log(dim("  Opening your browser …\n"));
  openInBrowser(purchase.checkoutUrl);
}

// ABA's checkout token is good for 3 minutes, but the transaction itself
// stays payable longer, so poll past the page expiring rather than giving up.
const TIMEOUT_MS = 5 * 60 * 1000;
const POLL_MS = 3000;
const startedAt = Date.now();

console.log("  waiting for you to pay " + dim("(Ctrl+C to stop)"));

let settled = false;
while (Date.now() - startedAt < TIMEOUT_MS) {
  await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  const status = await aba.checkStatus(transactionId);

  // Code 6 is "tran_id not found", which a freshly created transaction returns
  // for a moment. Treat it as "not yet", not as a failure.
  if (!status.success && status.errorCode !== "6") {
    console.error(bad(`\n  status check failed — ABA code ${status.errorCode ?? "?"}: ${status.error}`));
    process.exit(1);
  }

  const elapsed = Math.round((Date.now() - startedAt) / 1000);
  process.stdout.write(`\r  ${dim(`${elapsed}s`)} status: ${status.status}          `);

  if (status.success && status.status !== "PENDING") {
    settled = true;
    console.log("\n");
    if (status.status === "APPROVED") {
      console.log(ok(bold("  PAID.")) + " ABA reports the transaction as APPROVED.");
      console.log(`     amount      ${status.amount} ${status.currency ?? ""}`);
      console.log(`     paid at     ${status.paymentTime ?? "(not reported)"}`);
      console.log(dim("\n  This is the state your webhook/pushback handler needs to handle."));
    } else {
      console.log(bold(`  ${status.status}.`) + " ABA settled the transaction as not paid.");
      console.log(dim("  That is the expected result for a declined test card."));
    }
    break;
  }
}

if (!settled) {
  console.log("\n");
  console.log(warn("  Timed out after 5 minutes still PENDING."));
  console.log(dim(`  The transaction is still open. Re-check it any time with:`));
  console.log(dim(`    npx vite-node -e "…checkStatus('${transactionId}')"`));
  process.exit(1);
}
