# ABA Monitor Bot Setup Guide

This guide shows how to set up the ABA Monitor Bot from zero. The bot answers questions about ABA PayWay using Gemini AI and checks ABA Sandbox status.

## 1. What You Need
Before you start, you need these API keys:
- **Telegram Bot Token** (from BotFather)
- **Gemini API Key** (from Google AI Studio)

---

## 2. Telegram Setup
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the steps to create your bot.
3. Save the **Bot Token** it gives you.

---

## 3. Cloudflare Worker Setup
1. Install Cloudflare Wrangler on your computer:
   ```bash
   npm install -g wrangler
   ```
2. Login to Cloudflare:
   ```bash
   npx wrangler login
   ```
3. Create a KV Namespace for the bot to store the cache:
   ```bash
   npx wrangler kv:namespace create CACHE
   ```
4. Copy the `id` it gives you and paste it into `wrangler.toml` under `kv_namespaces`.

---

## 4. Add Secrets to Cloudflare
Go to your terminal in the `monitor-bot` folder and run these commands one by one. Paste the keys when asked.

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put GEMINI_API_KEY

# Optional: Facebook Page posting for announcements
npx wrangler secret put FB_PAGE_ID
npx wrangler secret put FB_PAGE_TOKEN
```

---

## 5. Sync Docs to Cloudflare KV
Run the sync script to download the latest docs and load them into KV:
```bash
npm run sync-docs
```

---

## 6. Deploy the Bot
Push your code live to Cloudflare:
```bash
npx wrangler deploy
```

---

## 7. Connect Telegram Webhook
To make Telegram talk to your Cloudflare Worker, open this URL in your web browser:

`https://<YOUR-WORKER-URL>/?setup=true`

*(Replace `<YOUR-WORKER-URL>` with the URL from Cloudflare, like `https://aba-monitor-bot.yourname.workers.dev`)*.

---

## 8. Test the Bot
1. Open Telegram and chat with your bot.
2. Send `/status` to check ABA Sandbox status.
3. Send `/ask How do I create a purchase?` to test the AI assistant!
4. Send `/announce <message>` to broadcast an announcement to your Telegram Channel and Facebook Page (Admin only).

