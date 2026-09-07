import type { KHQROptions } from "./types";

const DEFAULT_HEADER_COLOR = "#bc271a";
const QR_API_BASE = "https://quickchart.io/qr";

function formatAmount(amount: number, currency: string): string {
  if (currency === "KHR") {
    return amount.toLocaleString("en-US", { maximumFractionDigits: 0 }) + " KHR";
  }
  return "$" + amount.toFixed(2);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function generateKHQR(options: KHQROptions): Promise<string> {
  const {
    emvData,
    amount,
    currency,
    merchantName,
    headerColor = DEFAULT_HEADER_COLOR,
  } = options;

  let qrSvgContent = "";
  try {
    const qrUrl = `${QR_API_BASE}?text=${encodeURIComponent(emvData)}&size=280&margin=1&format=svg`;
    const qrResponse = await fetch(qrUrl);
    if (qrResponse.ok) qrSvgContent = await qrResponse.text();
  } catch { /* fallback: empty QR area */ }

  // Keep the fetched QR's own <svg> wrapper intact (only strip a leading XML
  // declaration) — quickchart draws the QR modules in a small unit grid (e.g.
  // viewBox="0 0 43 43") and relies on its own width/height="280" to scale
  // that up. Stripping the wrapper loses that scale, rendering the QR at
  // native module size (a few percent of the intended 280px).
  const innerQr = qrSvgContent.replace(/<\?xml[^>]*\?>/g, "");

  const formattedAmount = formatAmount(amount, currency);
  const safeMerchantName = escapeXml(merchantName);

  // The QR itself is clipped and translated in two nested <g>s rather than
  // one: putting both `clip-path` and `transform` on the same element shifts
  // the clip rect's coordinates by that same transform, clipping away most
  // of the actual QR pattern.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 407" width="244" height="407" role="img" aria-label="PayWay KHQR screen branding">
  <defs>
    <filter id="card-shadow" x="6" y="101" width="232" height="295" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.13"/>
    </filter>
    <clipPath id="card-clip"><rect x="24" y="105" width="196" height="267" rx="16"/></clipPath>
    <clipPath id="qr-clip"><rect id="qr-area" x="50" y="218" width="144" height="144"/></clipPath>
  </defs>
  <rect width="244" height="407" fill="#ffffff"/>
  <g id="aba-pay-logo" transform="translate(24,24)" aria-label="ABA PAY Logo">
    <rect width="196" height="31" fill="#ffffff" fill-opacity="0"/>
    <text x="0" y="31" fill="#005b7f" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="4" textLength="86" lengthAdjust="spacingAndGlyphs">ABA</text>
    <text x="110" y="31" fill="#00a9c8" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="1" textLength="86" lengthAdjust="spacingAndGlyphs">PAY</text>
  </g>
  <g filter="url(#card-shadow)">
    <rect x="24" y="105" width="196" height="267" rx="16" fill="#ffffff"/>
  </g>
  <g clip-path="url(#card-clip)">
    <rect x="24" y="105" width="196" height="38" fill="${headerColor}"/>
    <polygon points="198,143 220,143 220,165" fill="#ffffff"/>
    <text x="122" y="130" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700">KHQR</text>
    <text x="50" y="169" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="10">${safeMerchantName}</text>
    <text x="50" y="194" fill="#000000" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500">${formattedAmount}</text>
    <line x1="24" y1="207" x2="220" y2="207" stroke="#d9d9d9" stroke-width="1.2" stroke-dasharray="4 5"/>
    <rect x="50" y="218" width="144" height="144" fill="#ffffff"/>
    <g clip-path="url(#qr-clip)">
      <g transform="translate(50,218) scale(0.5142857143)">
        ${innerQr || '<svg width="280" height="280"><rect width="280" height="280" fill="#f5f5f5"/><text x="140" y="145" text-anchor="middle" fill="#777777" font-family="Arial, Helvetica, sans-serif" font-size="16">QR Code</text></svg>'}
      </g>
    </g>
    <g aria-label="KHQR brand mark">
      <circle cx="122" cy="290" r="17" fill="#ffffff"/>
      <circle cx="122" cy="290" r="13" fill="${headerColor}"/>
      <path d="M115 286h3v-3h8v3h3v8h-3v3h-8v-3h-3z" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M122 286v8M118 290h8" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
    </g>
  </g>
  <text x="122" y="385" text-anchor="middle" fill="#777777" font-family="Arial, Helvetica, sans-serif" font-size="11">Scan with ABA Mobile or any KHQR</text>
  <text x="122" y="399" text-anchor="middle" fill="#777777" font-family="Arial, Helvetica, sans-serif" font-size="11">supported banking app</text>
</svg>`;

  return "data:image/svg+xml;base64," + btoa(svg);
}
