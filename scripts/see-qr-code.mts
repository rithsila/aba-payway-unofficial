/**
 * Creates one real $1.00 sandbox purchase and saves the KHQR code ABA
 * returns as a PNG file you can open and look at.
 *
 * Usage: npm run see:qr
 */
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { ABAPayWay } from "../src/client";
import { generateTransactionId } from "../src/utils";

const merchantId = process.env.ABA_MERCHANT_ID;
const apiKey = process.env.ABA_API_KEY;
const baseUrl = process.env.ABA_BASE_URL;

if (!merchantId || !apiKey || !baseUrl) {
  console.error("Missing credentials. Fill in .env first (see .env.example).");
  process.exit(1);
}

const aba = new ABAPayWay({ merchantId, apiKey, baseUrl });
const transactionId = generateTransactionId();

console.log(`Creating a $1.00 test purchase (tran_id: ${transactionId}) …`);

const purchase = await aba.createPurchase({
  transactionId,
  amount: 1.0,
  currency: "USD",
  items: "See QR Test",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  paymentOption: "abapay_khqr",
  returnUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
});

if (!purchase.success) {
  console.error(`\nFailed. ABA said (code ${purchase.errorCode ?? "?"}): ${purchase.error}`);
  process.exit(1);
}

if (!purchase.qrImage) {
  console.error("\nABA did not return a QR image for this request.");
  process.exit(1);
}

// purchase.qrImage looks like "data:image/png;base64,iVBORw0KG..."
// Strip the "data:image/png;base64," part and decode the rest.
const base64Data = purchase.qrImage.replace(/^data:image\/png;base64,/, "");
const outputPath = new URL("../qr-code.png", import.meta.url);
writeFileSync(outputPath, Buffer.from(base64Data, "base64"));

console.log("\nSaved! Open this file to see the real QR code:");
console.log(`  ${outputPath.pathname}`);
console.log("\nOn a Mac, you can also run:");
console.log("  open qr-code.png");
