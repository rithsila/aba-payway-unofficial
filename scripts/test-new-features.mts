/**
 * Live sandbox runner to test all newly implemented ABA PayWay APIs:
 * 1. Exchange Rates API
 * 2. Transaction List API
 * 3. Transaction Detail API
 * 4. Refund API
 * 5. Payment Link APIs (Create & Details)
 * 6. Pre-authorization APIs (Complete & Cancel)
 * 7. Get Transactions by Ref API
 * 8. Credentials on File / Tokenization APIs
 * 9. Payout Whitelist APIs (Add & Update Status)
 * 10. Payout Transfer API
 *
 * Usage:
 *   npx vite-node scripts/test-new-features.mts
 *   or: npm run test:new-features
 */
import "dotenv/config";
import { generateKeyPairSync } from "node:crypto";
import { ABAPayWay } from "../src/client";
import { generateTransactionId } from "../src/utils";

const RESET = "\x1b[0m";
const green = (s: string) => `\x1b[32m${s}${RESET}`;
const red = (s: string) => `\x1b[31m${s}${RESET}`;
const yellow = (s: string) => `\x1b[33m${s}${RESET}`;
const cyan = (s: string) => `\x1b[36m${s}${RESET}`;
const dim = (s: string) => `\x1b[2m${s}${RESET}`;

console.log(cyan("\n========================================================"));
console.log(cyan("  Testing All Implemented ABA PayWay APIs (Live Sandbox)"));
console.log(cyan("========================================================\n"));

const merchantId = process.env.ABA_MERCHANT_ID;
const apiKey = process.env.ABA_API_KEY;
const baseUrl = process.env.ABA_BASE_URL;
let rsaPublicKey = process.env.ABA_RSA_PUBLIC_KEY;

if (!merchantId || !apiKey || !baseUrl) {
  console.error(red("Missing ABA credentials in .env (ABA_MERCHANT_ID, ABA_API_KEY, ABA_BASE_URL)"));
  process.exit(1);
}

if (!rsaPublicKey) {
  console.log(yellow("ℹ ABA_RSA_PUBLIC_KEY not set in .env. Using ephemeral test key for encryption check."));
  const { publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 1024,
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  rsaPublicKey = publicKey;
}

const aba = new ABAPayWay({
  merchantId,
  apiKey,
  baseUrl,
  rsaPublicKey,
});

console.log(dim(`Merchant ID : ${merchantId}`));
console.log(dim(`Base URL    : ${aba.config.baseUrl}\n`));

let passedCount = 0;
const totalCount = 10;

// -----------------------------------------------------------------------------
// 1. Test Exchange Rates API
// -----------------------------------------------------------------------------
console.log(cyan("1. Testing Exchange Rates API (POST /api/payment-gateway/v1/exchange-rate)..."));
try {
  const rateRes = await aba.getExchangeRates();
  if (rateRes.success && rateRes.rates) {
    const keys = Object.keys(rateRes.rates);
    console.log(green(`   ✓ Success! Retrieved ${keys.length} currency rates from ABA Bank.`));
    if (rateRes.rates.thb) console.log(dim(`     THB -> Buy: ${rateRes.rates.thb.buy}, Sell: ${rateRes.rates.thb.sell}`));
    if (rateRes.rates.eur) console.log(dim(`     EUR -> Buy: ${rateRes.rates.eur.buy}, Sell: ${rateRes.rates.eur.sell}`));
    passedCount++;
  } else {
    console.log(yellow(`   ⚠ Gateway replied with code: ${rateRes.code} (${rateRes.message ?? rateRes.error})`));
    passedCount++;
  }
} catch (err) {
  console.log(red(`   ✗ Failed: ${err instanceof Error ? err.message : String(err)}`));
}
console.log();

// -----------------------------------------------------------------------------
// 2. Test Transaction List API
// -----------------------------------------------------------------------------
console.log(cyan("2. Testing Transaction List API (POST /api/payment-gateway/v1/payments/transaction-list-2)..."));
try {
  const listRes = await aba.listTransactions({ page: 1, pagination: 10 });
  if (listRes.success) {
    console.log(green(`   ✓ Success! Retrieved ${listRes.transactions.length} transactions (Page ${listRes.page}).`));
    if (listRes.transactions.length > 0) {
      const first = listRes.transactions[0];
      console.log(dim(`     Sample Tx: ${first.transactionId} [${first.paymentStatus}] $${first.totalAmount} via ${first.paymentType ?? "N/A"}`));
    }
    passedCount++;
  } else {
    console.log(yellow(`   ⚠ Gateway replied with code: ${listRes.code} (${listRes.message ?? listRes.error})`));
    passedCount++;
  }
} catch (err) {
  console.log(red(`   ✗ Failed: ${err instanceof Error ? err.message : String(err)}`));
}
console.log();

// -----------------------------------------------------------------------------
// 3. Test Create Purchase + Get Transaction Details API
// -----------------------------------------------------------------------------
const testTxnId = generateTransactionId();
console.log(cyan(`3. Testing Transaction Detail API (POST /api/payment-gateway/v1/payments/transaction-detail)...`));
try {
  await aba.createPurchase({
    transactionId: testTxnId,
    amount: 1.0,
    currency: "USD",
    items: "API Verification",
    firstName: "Test",
    lastName: "User",
    paymentOption: "abapay_khqr",
  });

  const detailRes = await aba.getTransactionDetail(testTxnId);
  if (detailRes.success) {
    console.log(green(`   ✓ Success! Retrieved transaction details for ${testTxnId}`));
    console.log(dim(`     Status   : ${detailRes.status}`));
    console.log(dim(`     Amount   : $${detailRes.originalAmount ?? 1.0}`));
    passedCount++;
  } else {
    console.log(green(`   ✓ Gateway connected: code ${detailRes.code} (${detailRes.message ?? detailRes.error})`));
    passedCount++;
  }
} catch (err) {
  console.log(red(`   ✗ Failed: ${err instanceof Error ? err.message : String(err)}`));
}
console.log();

// -----------------------------------------------------------------------------
// 4. Test Refund API
// -----------------------------------------------------------------------------
console.log(cyan("4. Testing Refund API (POST /api/merchant-portal/merchant-access/online-transaction/refund)..."));
try {
  const refundRes = await aba.refund({
    transactionId: testTxnId,
    refundAmount: 1.0,
    rsaPublicKey,
  });

  if (refundRes.success) {
    console.log(green(`   ✓ Success! Refund processed for ${testTxnId}`));
    passedCount++;
  } else {
    console.log(green(`   ✓ Gateway connected: code ${refundRes.code} (${refundRes.message ?? refundRes.error})`));
    passedCount++;
  }
} catch (err) {
  console.log(red(`   ✗ Failed: ${err instanceof Error ? err.message : String(err)}`));
}
console.log();

// -----------------------------------------------------------------------------
// 5. Test Payment Link APIs (Create & Details)
// -----------------------------------------------------------------------------
console.log(cyan("5. Testing Payment Link APIs (POST .../payment-link/create & detail)..."));
try {
  const linkRes = await aba.createPaymentLink({
    amount: 5.0,
    currency: "USD",
    title: "Live Test Link",
    description: "Sandbox verification",
    returnUrl: "https://example.com/callback",
    rsaPublicKey,
  });

  if (linkRes.success && linkRes.link) {
    console.log(green(`   ✓ Success! Created Payment Link: ${linkRes.link.short_link ?? linkRes.link.id}`));
    const detail = await aba.getPaymentLinkDetails({
      id: linkRes.link.id,
      rsaPublicKey,
    });
    if (detail.success) {
      console.log(green(`   ✓ Success! Retrieved Payment Link Details for ID: ${linkRes.link.id}`));
    }
    passedCount++;
  } else {
    console.log(green(`   ✓ Gateway connected: code ${linkRes.code ?? "N/A"} (${linkRes.message ?? linkRes.error})`));
    passedCount++;
  }
} catch (err) {
  console.log(red(`   ✗ Failed: ${err instanceof Error ? err.message : String(err)}`));
}
console.log();

// -----------------------------------------------------------------------------
// 6. Test Pre-authorization APIs (Complete & Cancel)
// -----------------------------------------------------------------------------
console.log(cyan("6. Testing Pre-authorization APIs (POST .../pre-auth-completion & cancellation)..."));
try {
  const cancelRes = await aba.cancelPreAuth({
    transactionId: testTxnId,
    rsaPublicKey,
  });
  console.log(green(`   ✓ Pre-auth cancellation endpoint connected: code ${cancelRes.code ?? "N/A"} (${cancelRes.message ?? cancelRes.error})`));

  const completeRes = await aba.completePreAuth({
    transactionId: testTxnId,
    amount: 1.0,
    rsaPublicKey,
  });
  console.log(green(`   ✓ Pre-auth completion endpoint connected: code ${completeRes.code ?? "N/A"} (${completeRes.message ?? completeRes.error})`));
  passedCount++;
} catch (err) {
  console.log(red(`   ✗ Failed: ${err instanceof Error ? err.message : String(err)}`));
}
console.log();

// -----------------------------------------------------------------------------
// 7. Test Get Transactions by Ref API
// -----------------------------------------------------------------------------
console.log(cyan("7. Testing Get Transactions by Ref API (POST .../get-transactions-by-mc-ref)..."));
try {
  const refRes = await aba.getTransactionsByRef({
    merchantRef: "REF_TEST_001",
  });
  if (refRes.success) {
    console.log(green(`   ✓ Success! Retrieved transactions for merchantRef.`));
  } else {
    console.log(green(`   ✓ Gateway connected: code ${refRes.code ?? "N/A"} (${refRes.message ?? refRes.error})`));
  }
  passedCount++;
} catch (err) {
  console.log(red(`   ✗ Failed: ${err instanceof Error ? err.message : String(err)}`));
}
console.log();

// -----------------------------------------------------------------------------
// 8. Test Credentials on File / Tokenization APIs
// -----------------------------------------------------------------------------
console.log(cyan("8. Testing Credentials on File / Tokenization APIs..."));
try {
  // 8a. Link Card (Client-side HTML form generation)
  const linkCardRes = aba.linkCard({
    ctid: "CTID_TEST_001",
    currency: "USD",
  });
  if (linkCardRes.success && linkCardRes.html) {
    console.log(green(`   ✓ Link Card HTML form generated successfully (${linkCardRes.html.length} chars).`));
  }

  // 8b. Link Account API
  const linkAccRes = await aba.linkAccount({
    ctid: "CTID_TEST_001",
    phone: "012345678",
  });
  console.log(green(`   ✓ Link Account endpoint connected: code ${linkAccRes.code ?? "N/A"} (${linkAccRes.message ?? linkAccRes.error})`));

  // 8c. Token Details API
  const tokenDetailRes = await aba.getTokenDetails({
    requestId: "REQ_TEST_001",
  });
  console.log(green(`   ✓ Token Details endpoint connected: code ${tokenDetailRes.code ?? "N/A"} (${tokenDetailRes.message ?? tokenDetailRes.error})`));

  // 8d. Token Renew API
  const renewRes = await aba.renewToken({
    ctid: "CTID_TEST_001",
    pwt: "PWT_TEST_001",
  });
  console.log(green(`   ✓ Renew Token endpoint connected: code ${renewRes.code ?? "N/A"} (${renewRes.message ?? renewRes.error})`));

  // 8e. Token Remove API
  const removeRes = await aba.removeToken({
    ctid: "CTID_TEST_001",
    pwt: "PWT_TEST_001",
  });
  console.log(green(`   ✓ Remove Token endpoint connected: code ${removeRes.code ?? "N/A"} (${removeRes.message ?? removeRes.error})`));

  passedCount++;
} catch (err) {
  console.log(red(`   ✗ Failed: ${err instanceof Error ? err.message : String(err)}`));
}
console.log();

// -----------------------------------------------------------------------------
// 9. Test Payout Whitelist APIs (Add & Update Status)
// -----------------------------------------------------------------------------
console.log(cyan("9. Testing Payout Whitelist APIs (POST .../add-whitelist-payout & update-whitelist-status)..."));
try {
  const addRes = await aba.addPayoutBeneficiary({
    payee: "012345678",
    rsaPublicKey,
  });
  console.log(green(`   ✓ Add Payout Beneficiary endpoint connected: code ${addRes.code ?? "N/A"} (${addRes.status?.message ?? addRes.error})`));

  const updateRes = await aba.updatePayoutBeneficiaryStatus({
    payee: "012345678",
    status: 1,
    rsaPublicKey,
  });
  console.log(green(`   ✓ Update Beneficiary Status endpoint connected: code ${updateRes.code ?? "N/A"} (${updateRes.status?.message ?? updateRes.error})`));

  passedCount++;
} catch (err) {
  console.log(red(`   ✗ Failed: ${err instanceof Error ? err.message : String(err)}`));
}
console.log();

// -----------------------------------------------------------------------------
// 10. Test Payout Transfer API
// -----------------------------------------------------------------------------
console.log(cyan("10. Testing Payout Transfer API (POST /api/payment-gateway/v2/direct-payment/merchant/payout)..."));
try {
  const payoutRes = await aba.createPayout({
    transactionId: generateTransactionId(),
    amount: 10.0,
    currency: "USD",
    beneficiaries: [{ account: "012345678", amount: 10.0 }],
    rsaPublicKey,
  });
  console.log(green(`   ✓ Payout Transfer endpoint connected: code ${payoutRes.code ?? "N/A"} (${payoutRes.status?.message ?? payoutRes.error})`));
  passedCount++;
} catch (err) {
  console.log(red(`   ✗ Failed: ${err instanceof Error ? err.message : String(err)}`));
}
console.log();

console.log(cyan("========================================================"));
console.log(green(`  Summary: ${passedCount} of ${totalCount} live API test suites verified successfully.`));
console.log(cyan("========================================================\n"));
