import { DOCS_MAP } from "./docsMap";

export interface DocRule {
  name: string;
  keywords: string[];
  files: string[];
}

export const KEYWORD_RULES: DocRule[] = [
  {
    name: "Refund",
    keywords: [
      "refund", "reverse", "chargeback", "return money", "cancel payment", 
      "money back", "rollback", "failed payment", "give back money", 
      "send money back", "return cash", "refund api"
    ],
    files: ["refund-api-14530821e0.md"]
  },
  {
    name: "QR & KHQR",
    keywords: [
      "qr", "khqr", "bakong", "scan", "dynamic qr", "static qr", 
      "show qr", "generate qr", "qr code", "aba mobile scan", "scan to pay",
      "display qr", "print qr", "qr api"
    ],
    files: ["aba-qr-api-3158158f0.md", "khqr-guideline-3192101f0.md", "qr-api-14530840e0.md"]
  },
  {
    name: "Exchange Rate & Currency",
    keywords: [
      "exchange", "rate", "currency", "forex", "usd", "khr", "riel", 
      "dollar", "exchange rate", "convert currency", "forex rate", "price exchange"
    ],
    files: ["exchange-rate-14530823e0.md"]
  },
  {
    name: "Payment Link",
    keywords: [
      "payment link", "create payment link", "pay link", "link details", 
      "invoice link", "send link", "bill link", "payment url", "share link",
      "generate link", "web link", "sms link"
    ],
    files: ["payment-link-3158157f0.md", "create-payment-link-14530837e0.md", "get-payment-link-details-14530838e0.md"]
  },
  {
    name: "Pre-Auth & Fund Hold",
    keywords: [
      "pre-auth", "preauth", "hold", "capture", "authorize", "block money", 
      "temporary hold", "hotel booking", "deposit", "cancel hold", 
      "complete pre-auth", "release hold", "capture fund"
    ],
    files: [
      "pre-auth-3158156f0.md",
      "complete-pre-auth-transactions-14530835e0.md",
      "complete-pre-auh-transaction-with-payout-14666701e0.md",
      "cancel-pre-purchase-transaction-14530836e0.md"
    ]
  },
  {
    name: "Payout & Split Payment",
    keywords: [
      "payout", "split payment", "beneficiary", "whitelist", "split money", 
      "share profit", "transfer vendor", "distribute payment", "route funds", 
      "sub merchant", "vendor payout", "route api"
    ],
    files: [
      "payout-3158153f0.md",
      "payout-14530816e0.md",
      "update-a-beneficiary-status-14530817e0.md",
      "add-a-beneficiary-to-whitelist-14530818e0.md"
    ]
  },
  {
    name: "Token, Cards, Link Account & Subscription",
    keywords: [
      "token", "link card", "link account", "card", "subscription", "renew", 
      "unschedule", "schedule", "save card", "store card", "remember card", 
      "credit card", "debit card", "visa", "mastercard", "recurring", 
      "monthly charge", "auto pay", "citi_flex", "cito_flex", "citr_fix",
      "saved card", "remove token", "delete card"
    ],
    files: [
      "credentials-on-file-4395178f0.md",
      "link-account-19336820e0.md",
      "link-card-19336819e0.md",
      "payment-19336821e0.md",
      "renew-token-19336823e0.md",
      "get-token-details-19336824e0.md",
      "remove-token-19336822e0.md",
      "subscription-21402227e0.md",
      "unschedule-payment-2038908m0.md",
      "schedule-payment-2038907m0.md"
    ]
  },
  {
    name: "Check & Transaction Status",
    keywords: [
      "check", "status", "history", "transaction detail", "check transaction", 
      "list", "is transaction paid", "verify payment", "check status", 
      "transaction list", "find transaction", "check ref", "merchant_ref", "tran_id"
    ],
    files: [
      "check-transaction-14530826e0.md",
      "get-a-transaction-details-14530824e0.md",
      "get-transaction-list-14530825e0.md",
      "get-transactions-22366268e0.md"
    ]
  },
  {
    name: "Close Transaction",
    keywords: [
      "close", "close transaction", "cancel transaction", "expire payment", 
      "stop payment", "flash sale cancel", "close api"
    ],
    files: ["close-transaction-14530822e0.md"]
  },
  {
    name: "Purchase & Checkout",
    keywords: [
      "purchase", "checkout", "buy", "payway checkout", "create payment", 
      "start payment", "popup", "hosted page", "integrate payment", 
      "make payment", "payment gateway", "create purchase"
    ],
    files: ["purchase-14530820e0.md", "ecommerce-checkout-3158159f0.md"]
  },
  {
    name: "Plugins",
    keywords: [
      "plugin", "shopify", "woocommerce", "wordpress", "install plugin", 
      "store plugin", "cms", "ecommerce plugin"
    ],
    files: [
      "plugins-3186291f0.md",
      "-902970m0.md",
      "-873826m0.md",
      "-871485m0.md",
      "-2113617m0.md"
    ]
  },
  {
    name: "Credentials & Endpoints",
    keywords: [
      "endpoint", "sandbox url", "base url", "production url", "api key", 
      "merchant id", "hash", "secret key", "overview", "setup", "credential"
    ],
    files: [
      "overview-865678m0.md",
      "api-endpoints-984508m0.md",
      "resources-3305682f0.md"
    ]
  }
];

export function getRelevantDocs(question: string): string {
  const q = question.toLowerCase();
  const matchedFiles = new Set<string>();

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some(kw => q.includes(kw))) {
      for (const file of rule.files) {
        matchedFiles.add(file);
      }
    }
  }

  // If no specific keywords matched at all, include all files as full fallback!
  // Gemini 2.5 Flash has 1M context, so it will read all docs and find the answer.
  const filesToInclude = matchedFiles.size > 0 
    ? Array.from(matchedFiles) 
    : Object.keys(DOCS_MAP);

  let result = "";
  for (const file of filesToInclude) {
    if (DOCS_MAP[file]) {
      result += `\n\n--- DOC: ${file} ---\n` + DOCS_MAP[file];
    }
  }

  return result.trim();
}
