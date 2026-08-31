import type { KHQROptions } from "./types";

const DEFAULT_HEADER_COLOR = "#e63946";
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

  const innerQr = qrSvgContent
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<svg[^>]*>/g, "")
    .replace(/<\/svg>/g, "");

  const formattedAmount = formatAmount(amount, currency);
  const safeMerchantName = escapeXml(merchantName);

  // Viewfinder-style corner brackets framing the QR, 16px outside the
  // 280x280 box at (60,160) — 22px arms, drawn as open polylines so the
  // frame reads as a "scan here" cue rather than a plain border.
  //
  // The QR itself is clipped and translated in two nested <g>s rather than
  // one: putting both `clip-path` and `transform` on the same element shifts
  // the clip rect's coordinates by that same transform, clipping away most
  // of the actual QR pattern.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 540" width="400" height="540">
  <defs><clipPath id="qr-clip"><rect x="60" y="160" width="280" height="280" rx="8"/></clipPath></defs>
  <rect width="400" height="540" rx="16" fill="white" stroke="#e0e0e0" stroke-width="1"/>
  <rect width="400" height="80" rx="16" fill="${headerColor}"/>
  <rect y="16" width="400" height="64" fill="${headerColor}"/>
  <text x="200" y="42" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="18" font-weight="bold">${safeMerchantName}</text>
  <text x="200" y="65" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui,sans-serif" font-size="13">KHQR Payment</text>
  <text x="200" y="108" text-anchor="middle" fill="#1a1a1a" font-family="system-ui,sans-serif" font-size="28" font-weight="bold">${formattedAmount}</text>
  <text x="200" y="128" text-anchor="middle" fill="#999" font-family="system-ui,sans-serif" font-size="12" letter-spacing="2">SCAN &#8226; PAY &#8226; DONE</text>
  <g stroke="#c9c9c9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <polyline points="44,166 44,144 66,144"/>
    <polyline points="334,144 356,144 356,166"/>
    <polyline points="44,434 44,456 66,456"/>
    <polyline points="334,456 356,456 356,434"/>
  </g>
  <g clip-path="url(#qr-clip)">
    <g transform="translate(60,160)">
      ${innerQr || '<rect width="280" height="280" fill="#f5f5f5"/><text x="140" y="140" text-anchor="middle" fill="#999" font-size="14">QR Code</text>'}
    </g>
  </g>
  <text x="200" y="480" text-anchor="middle" fill="#666" font-family="system-ui,sans-serif" font-size="11">Scan with any KHQR-compatible app</text>
  <text x="200" y="501" text-anchor="middle" fill="#999" font-family="system-ui,sans-serif" font-size="10">Powered by Bakong</text>
  <text x="200" y="521" text-anchor="middle" fill="#555" font-family="system-ui,sans-serif" font-size="11" font-weight="bold" letter-spacing="1">KHQR</text>
</svg>`;

  return "data:image/svg+xml;base64," + btoa(svg);
}
