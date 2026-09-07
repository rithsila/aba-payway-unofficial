import type { KHQROptions } from "./types";

const DEFAULT_HEADER_COLOR = "#bc271a";
const QR_API_BASE = "https://quickchart.io/qr";
const CARD_SHELL_PATH = "M189.868 10.8675H27.8677C18.4788 10.8675 10.8677 18.4787 10.8677 27.8675V287.867C10.8677 297.256 18.4788 304.867 27.8677 304.867H189.868C199.257 304.867 206.868 297.256 206.868 287.867V27.8675C206.868 18.4787 199.257 10.8675 189.868 10.8675Z";
const KHQR_HEADER_BACKGROUND_PATH = "M178.91 0C188.299 0.00000824649 195.91 7.61117 195.91 17V36.3516H196V54L178.582 37H0V17C0.00000103088 7.61116 7.61116 0 17 0H178.91Z";
const KHQR_HEADER_MARK_PATHS = [
  "M104.488 17.1027V20.5948H100.95C100.596 20.5948 100.331 20.3329 100.331 19.9836V17.1027C100.331 16.7535 100.596 16.4916 100.95 16.4916H103.781C104.223 16.4043 104.488 16.7535 104.488 17.1027Z",
  "M120.944 18.5H119.175C119.175 16.4047 117.494 14.746 115.371 14.746C113.69 14.746 112.274 15.7936 111.743 17.365C111.655 17.7143 111.566 18.1507 111.566 18.5V23.9999H111.478C110.505 23.9999 109.797 23.2142 109.797 22.3412V18.5C109.797 17.0159 110.416 15.5317 111.566 14.4841C112.628 13.5238 113.955 13 115.371 13C118.467 13 120.944 15.4444 120.944 18.5Z",
  "M120.945 24H118.467L117.848 23.3889L116.521 22.0794L114.663 20.2461H117.14L120.945 24Z",
  "M105.107 22.2539H99.7994C99.18 22.2539 98.6492 21.7301 98.6492 21.119V15.8809C98.6492 15.2698 99.18 14.746 99.7994 14.746H105.107C105.727 14.746 106.257 15.2698 106.257 15.8809V21.119L108.027 22.865V14.6587C108.027 13.6984 107.231 13 106.346 13H98.6492C97.6756 13 96.9683 13.7857 96.9683 14.6587V22.2539C96.9683 23.2142 97.7642 23.9126 98.6492 23.9126H106.877L105.107 22.2539Z",
  "M83.6093 23.9999H81.1318L76.0005 18.8492V23.9999H73.9658V13H76.0005V17.8888L80.9553 13H83.3436L78.0356 18.2381L83.6093 23.9999Z",
  "M92.898 13H94.8446V23.9999H92.898V19.1984H87.2358V23.9999H85.2012V13H87.2358V17.6269H92.898V13Z",
].map((path) => `<path d="${path}" fill="#ffffff"/>`).join("");

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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 218 316" width="218" height="316" role="img" aria-label="PayWay KHQR payment card">
  <defs>
    <filter id="card-shadow" x="0" y="0" width="217.735" height="315.735" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset/>
      <feGaussianBlur stdDeviation="5.43375"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
    </filter>
    <clipPath id="card-clip"><path d="${CARD_SHELL_PATH}"/></clipPath>
    <clipPath id="qr-clip"><rect id="qr-area" x="37" y="145" width="144" height="144"/></clipPath>
  </defs>
  <rect width="218" height="316" fill="#ffffff"/>
  <g filter="url(#card-shadow)">
    <path d="${CARD_SHELL_PATH}" fill="#ffffff"/>
  </g>
  <g clip-path="url(#card-clip)">
    <g id="khqr-header-logo" transform="translate(11,11)" aria-label="KHQR logo">
      <path d="${KHQR_HEADER_BACKGROUND_PATH}" fill="${headerColor}"/>
      ${KHQR_HEADER_MARK_PATHS}
    </g>
    <text x="51" y="81" fill="#111111" font-family="Arial, Helvetica, sans-serif" font-size="10">${safeMerchantName}</text>
    <text x="51" y="108" fill="#000000" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500">${formattedAmount}</text>
    <line x1="11" y1="124" x2="207" y2="124" stroke="#8a8a8a" stroke-width="1" stroke-dasharray="4 5"/>
    <rect x="37" y="145" width="144" height="144" fill="#ffffff"/>
    <g clip-path="url(#qr-clip)">
      <g transform="translate(37,145) scale(0.5142857143)">
        ${innerQr || '<svg width="280" height="280"><rect width="280" height="280" fill="#f5f5f5"/><text x="140" y="145" text-anchor="middle" fill="#777777" font-family="Arial, Helvetica, sans-serif" font-size="16">QR Code</text></svg>'}
      </g>
    </g>
    <g aria-label="KHQR brand mark">
      <circle cx="109" cy="217" r="17" fill="#ffffff"/>
      <circle cx="109" cy="217" r="13" fill="${headerColor}"/>
      <path d="M102 213h3v-3h8v3h3v8h-3v3h-8v-3h-3z" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M109 213v8M105 217h8" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

  return "data:image/svg+xml;base64," + btoa(svg);
}
