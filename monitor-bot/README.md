# ABA Monitor Bot Setup Guide

This guide shows how to set up the ABA Monitor Bot from zero. The bot checks ABA Payway official docs for updates. If it finds a change, it sends an alert to a Telegram channel and a Facebook Page.

## 1. What You Need
Before you start, you need these API keys:
- **Telegram Bot Token** (from BotFather)
- **Gemini API Key** (from Google AI Studio)
- **Firecrawl API Key** (from Firecrawl.dev)
- **Facebook Page ID & Token** (from Meta for Developers)

---

## 2. Telegram Setup
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the steps to create your bot.
3. Save the **Bot Token** it gives you.
4. Create a new Telegram Channel for announcements.
5. Add your new bot to the channel as an **Administrator**.
6. Find your Channel ID (you can use bots like @RawDataBot or forward a message).

---

## 3. Facebook Setup
1. Create a Facebook Page at [facebook.com/pages/create](https://www.facebook.com/pages/create/).
2. Go to [developers.facebook.com](https://developers.facebook.com/) and create a new **Business App**.
3. In your App Dashboard, go to **Use Cases** on the left.
4. Edit "Manage Pages" and add these permissions:
   - `pages_manage_posts`
   - `pages_show_list`
   - `pages_read_engagement`
5. Go to the top menu: **Tools** -> **Graph API Explorer**.
6. In the **User or Page** dropdown, select your **Facebook Page**.
7. Copy the **Page Access Token** at the top.
8. Click **Submit** to get your **Page ID**.

---

## 4. Cloudflare Worker Setup
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

## 5. Add Secrets to Cloudflare
Go to your terminal in the `monitor-bot` folder and run these commands one by one. Paste the keys when asked.

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put FIRECRAWL_API_KEY
npx wrangler secret put FB_PAGE_ID
npx wrangler secret put FB_PAGE_TOKEN
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
1. Go to your Cloudflare Dashboard -> **KV** -> open the `CACHE` namespace.
2. Edit the `docs_hash` key value to `123` and save.
3. Open Telegram and send `/updatedocs` to your bot.
4. Check your Telegram Channel and Facebook Page for the new post!
