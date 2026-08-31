/**
 * Renders the generateKHQR() branded card with sample data and saves it as
 * an SVG file you can open in a browser — no ABA credentials or network
 * call to ABA needed, since generateKHQR doesn't touch ABA's API itself.
 *
 * Usage: npm run preview:khqr
 */
import { writeFileSync } from "node:fs";
import { generateKHQR } from "../src/khqr";

// Made-up EMV payload — enough for the QR renderer to draw a scannable-looking
// pattern, but the CRC isn't real, so this is not a payable KHQR code. Swap in
// a real `qrResult.qrString` from createPurchase() to preview an actual one.
const cardImage = await generateKHQR({
  emvData: "00020101021229370016A00000067701011201150096123456780208QRPayment5204599953031165802KH5913Sample Store6009Phnom Penh6304ABCD",
  amount: 4.5,
  currency: "USD",
  merchantName: "Sample Store",
});

const base64Data = cardImage.replace(/^data:image\/svg\+xml;base64,/, "");
const outputPath = new URL("../khqr-preview.svg", import.meta.url);
writeFileSync(outputPath, Buffer.from(base64Data, "base64"));

console.log("Saved! Open this file in a browser to see the card:");
console.log(`  ${outputPath.pathname}`);
console.log("\nOn a Mac, you can also run:");
console.log("  open khqr-preview.svg");
