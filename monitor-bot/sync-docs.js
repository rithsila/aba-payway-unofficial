const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const urls = [
  "https://developer.payway.com.kh/overview-865678m0.md",
  "https://developer.payway.com.kh/api-endpoints-984508m0.md",
  "https://developer.payway.com.kh/ecommerce-checkout-3158159f0.md",
  "https://developer.payway.com.kh/plugins-3186291f0.md",
  "https://developer.payway.com.kh/-902970m0.md",
  "https://developer.payway.com.kh/-871485m0.md",
  "https://developer.payway.com.kh/-873826m0.md",
  "https://developer.payway.com.kh/-2113617m0.md",
  "https://developer.payway.com.kh/credentials-on-file-4395178f0.md",
  "https://developer.payway.com.kh/unschedule-payment-2038908m0.md",
  "https://developer.payway.com.kh/schedule-payment-2038907m0.md",
  "https://developer.payway.com.kh/aba-qr-api-3158158f0.md",
  "https://developer.payway.com.kh/payment-link-3158157f0.md",
  "https://developer.payway.com.kh/pre-auth-3158156f0.md",
  "https://developer.payway.com.kh/payout-3158153f0.md",
  "https://developer.payway.com.kh/khqr-guideline-3192101f0.md",
  "https://developer.payway.com.kh/resources-3305682f0.md",
  "https://developer.payway.com.kh/purchase-14530820e0.md",
  "https://developer.payway.com.kh/get-a-transaction-details-14530824e0.md",
  "https://developer.payway.com.kh/close-transaction-14530822e0.md",
  "https://developer.payway.com.kh/check-transaction-14530826e0.md",
  "https://developer.payway.com.kh/refund-api-14530821e0.md",
  "https://developer.payway.com.kh/get-transaction-list-14530825e0.md",
  "https://developer.payway.com.kh/exchange-rate-14530823e0.md",
  "https://developer.payway.com.kh/link-account-19336820e0.md",
  "https://developer.payway.com.kh/link-card-19336819e0.md",
  "https://developer.payway.com.kh/payment-19336821e0.md",
  "https://developer.payway.com.kh/renew-token-19336823e0.md",
  "https://developer.payway.com.kh/get-token-details-19336824e0.md",
  "https://developer.payway.com.kh/remove-token-19336822e0.md",
  "https://developer.payway.com.kh/subscription-21402227e0.md",
  "https://developer.payway.com.kh/qr-api-14530840e0.md",
  "https://developer.payway.com.kh/create-payment-link-14530837e0.md",
  "https://developer.payway.com.kh/get-payment-link-details-14530838e0.md",
  "https://developer.payway.com.kh/complete-pre-auth-transactions-14530835e0.md",
  "https://developer.payway.com.kh/complete-pre-auh-transaction-with-payout-14666701e0.md",
  "https://developer.payway.com.kh/cancel-pre-purchase-transaction-14530836e0.md",
  "https://developer.payway.com.kh/payout-14530816e0.md",
  "https://developer.payway.com.kh/update-a-beneficiary-status-14530817e0.md",
  "https://developer.payway.com.kh/add-a-beneficiary-to-whitelist-14530818e0.md",
  "https://developer.payway.com.kh/get-transactions-22366268e0.md"
];

const docsDir = path.join(__dirname, 'docs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

function download(url) {
  const filename = path.basename(new URL(url).pathname);
  const targetPath = path.join(docsDir, filename);

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        fs.writeFileSync(targetPath, data, 'utf-8');
        resolve({ filename, bytes: data.length });
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log(`1. Downloading ${urls.length} files...`);
  for (const url of urls) {
    const res = await download(url);
    console.log(`   Saved ${res.filename}`);
  }

  console.log('2. Combining files into docs-all.md...');
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
  let combined = '';
  for (const file of files) {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
    combined += `\n\n# FILE: ${file}\n\n` + content;
  }
  const combinedPath = path.join(__dirname, 'docs-all.md');
  fs.writeFileSync(combinedPath, combined.trim(), 'utf-8');
  console.log(`   Combined ${files.length} files (${(combined.length / 1024).toFixed(2)} KB).`);

  console.log('3. Uploading to Cloudflare KV (aba_docs_context)...');
  try {
    execSync(`npx wrangler kv key put --binding=CACHE "aba_docs_context" --path="${combinedPath}" --remote`, {
      stdio: 'inherit'
    });
    console.log('✅ Docs successfully synced to Cloudflare KV!');
  } catch (err) {
    console.log('⚠️ Could not auto-upload to KV. You can run manually:');
    console.log(`npx wrangler kv key put --binding=CACHE "aba_docs_context" --path=./docs-all.md --remote`);
  }
}

main();
