export interface Env {
  BOT_TOKEN: string;
  CACHE: KVNamespace;
}

const CHAT_ID = "-1004383349237"; // @abaunofficialintegrate
const ABA_DOCS_URL = "https://developer.payway.com.kh/";

async function sendTelegramMessage(token: string, chatId: string | number, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    if (!env.BOT_TOKEN) return;
    await checkDocs(env);
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (!env.BOT_TOKEN) return new Response("Missing BOT_TOKEN", { status: 500 });
    
    // For manual triggers or setting up webhook
    if (request.method === "GET") {
      const url = new URL(request.url);
      if (url.searchParams.get("setup") === "true") {
        // Automatically set the webhook to this worker's URL
        const webhookUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook?url=${url.origin}`;
        await fetch(webhookUrl);
        return new Response("Webhook set successfully!");
      }
      return new Response("Worker is running. Add ?setup=true to set the Telegram webhook.", { status: 200 });
    }

    // Handle Telegram Webhook (POST requests)
    if (request.method === "POST") {
      try {
        const update: any = await request.json();
        
        if (update.message && update.message.text) {
          const text = update.message.text.trim();
          const chatId = update.message.chat.id;

          // Check if command is /status or /status@BotName
          if (text.startsWith("/status")) {
            await handleStatusCommand(env.BOT_TOKEN, chatId);
          }
        }
      } catch (e) {
        console.error("Failed to parse Telegram update", e);
      }
      // Telegram requires a 200 OK response quickly
      return new Response("OK", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  }
};

async function handleStatusCommand(token: string, chatId: string | number) {
  try {
    // Ping the sandbox checkout server to see if it responds
    const res = await fetch("https://checkout-sandbox.payway.com.kh/");
    
    // As long as we get a response (even a 403/404), the server is online
    if (res.status >= 200 && res.status < 500) {
       await sendTelegramMessage(token, chatId, "<b>ABA Sandbox Status</b>\n\nAll systems operational! The testing environment is online.");
    } else {
       await sendTelegramMessage(token, chatId, "<b>ABA Sandbox Status</b>\n\nThe testing environment might be experiencing issues (Status: " + res.status + ").");
    }
  } catch (err) {
    await sendTelegramMessage(token, chatId, "<b>ABA Sandbox Status</b>\n\nThe server is unreachable. ABA might be doing maintenance.");
  }
}

async function checkDocs(env: Env) {
    try {
      const response = await fetch(ABA_DOCS_URL);
      const html = await response.text();

      const encoder = new TextEncoder();
      const data = encoder.encode(html);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const currentHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const oldHash = await env.CACHE.get("docs_hash");

      if (oldHash && oldHash !== currentHash) {
        await sendTelegramMessage(
          env.BOT_TOKEN,
          CHAT_ID,
          `🚨 <b>ABA PayWay Update Detected!</b>\n\n` +
          `The official developer docs have changed. Check it out:\n` +
          `<a href="${ABA_DOCS_URL}">${ABA_DOCS_URL}</a>`
        );
      } else if (!oldHash) {
        // Initial setup notification
        await sendTelegramMessage(env.BOT_TOKEN, CHAT_ID, `🤖 <b>ABA Monitor Bot Online (Cloudflare)</b>\nWatching for docs updates...`);
      }

      await env.CACHE.put("docs_hash", currentHash);
    } catch (err) {
      console.error(err);
    }
}
