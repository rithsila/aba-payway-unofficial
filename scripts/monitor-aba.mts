import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const BOT_TOKEN = process.env.BOT_TOKEN;
// Group: ABA PayWay Unofficial Integrate
const CHAT_ID = "-1004383349237"; 
const ABA_DOCS_URL = "https://developer.payway.com.kh/";
const CACHE_FILE = ".aba_docs_hash";

async function sendTelegramMessage(text: string) {
  if (!BOT_TOKEN) {
    console.warn("No BOT_TOKEN provided, skipping alert.");
    return;
  }
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) console.error("Telegram API error:", await res.text());
}

async function checkUpdates() {
  console.log("Checking ABA PayWay Docs for changes...");
  
  const response = await fetch(ABA_DOCS_URL);
  const html = await response.text();
  
  // We hash the page to detect changes. 
  // In a real scenario, you'd strip out dynamic tokens/dates before hashing.
  const currentHash = createHash("sha256").update(html).digest("hex");
  
  let oldHash = "";
  if (existsSync(CACHE_FILE)) {
    oldHash = readFileSync(CACHE_FILE, "utf-8").trim();
  }
  
  if (oldHash && oldHash !== currentHash) {
    console.log("Change detected!");
    await sendTelegramMessage(
      `🚨 <b>ABA PayWay Update Detected!</b>\n\n` +
      `The official developer docs have changed. Check it out:\n` +
      `<a href="${ABA_DOCS_URL}">${ABA_DOCS_URL}</a>`
    );
  } else if (!oldHash) {
    console.log("Initial run, saving hash.");
    await sendTelegramMessage(`🤖 <b>ABA Monitor Bot Online</b>\nWatching for docs updates...`);
  } else {
    console.log("No changes detected.");
  }
  
  writeFileSync(CACHE_FILE, currentHash);
}

checkUpdates().catch(console.error);
