export interface Env {
  BOT_TOKEN: string;
  OPENROUTER_API_KEY: string;
  FIRECRAWL_API_KEY: string;
  CACHE: KVNamespace;
}

const CHAT_ID = "-1004383349237"; // @abaunofficialintegrate
const ABA_DOCS_URL = "https://developer.payway.com.kh/";
const SDK_DOCS_URL = "https://raw.githubusercontent.com/rithsila/aba-payway-unofficial/main/README.md";

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
    await updateDocsCache(env);
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (!env.BOT_TOKEN) return new Response("Missing BOT_TOKEN", { status: 500 });
    
    if (request.method === "GET") {
      const url = new URL(request.url);
      if (url.searchParams.get("setup") === "true") {
        const webhookUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook?url=${url.origin}`;
        await fetch(webhookUrl);
        return new Response("Webhook set successfully!");
      }
      return new Response("Worker is running.", { status: 200 });
    }

    if (request.method === "POST") {
      try {
        const update: any = await request.json();
        
        if (update.message && update.message.text) {
          const text = update.message.text.trim();
          const chatId = update.message.chat.id;

          if (text.startsWith("/status")) {
            ctx.waitUntil(handleStatusCommand(env.BOT_TOKEN, chatId));
          } else if (text.startsWith("/ask")) {
            const question = text.replace("/ask", "").trim();
            if (question) {
              ctx.waitUntil(handleAskCommand(env, chatId, question));
            } else {
              ctx.waitUntil(sendTelegramMessage(env.BOT_TOKEN, chatId, "Please ask a question! Example: `/ask How do I create a purchase?`"));
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse Telegram update", e);
      }
      return new Response("OK", { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  }
};

async function handleStatusCommand(token: string, chatId: string | number) {
  try {
    const res = await fetch("https://checkout-sandbox.payway.com.kh/");
    if (res.status >= 200 && res.status < 500) {
       await sendTelegramMessage(token, chatId, "🟢 <b>ABA Sandbox Status</b>\n\nAll systems operational! The testing environment is online.");
    } else {
       await sendTelegramMessage(token, chatId, "🔴 <b>ABA Sandbox Status</b>\n\nThe testing environment might be experiencing issues.");
    }
  } catch (err) {
    await sendTelegramMessage(token, chatId, "🔴 <b>ABA Sandbox Status</b>\n\nThe server is unreachable.");
  }
}

async function handleAskCommand(env: Env, chatId: string | number, question: string) {
  if (!env.OPENROUTER_API_KEY) {
    await sendTelegramMessage(env.BOT_TOKEN, chatId, "The AI is currently resting. API key is missing.");
    return;
  }

  // 1. Get cached ABA docs (from the hourly Firecrawl job)
  let abaContext = await env.CACHE.get("aba_docs_context");
  if (!abaContext) {
    abaContext = "No ABA Docs context cached yet. Try again later.";
  }

  // 2. Fetch SDK README for fresh project context
  const sdkRes = await fetch(SDK_DOCS_URL);
  const sdkContext = await sdkRes.text();

  // 3. Prepare AI Prompt
  const systemPrompt = `You are an expert AI assistant for the ABA PayWay Unofficial SDK community.
Answer the user's question based ONLY on the provided context below. Be concise, friendly, and include code snippets if helpful.
Format the output in clean HTML supported by Telegram (<b>, <i>, <code>, <pre>).

--- ABA OFFICIAL DOCS ---
${abaContext}

--- UNOFFICIAL SDK DOCS ---
${sdkContext}`;

  try {
    // 4. Call OpenRouter API (using Solar Pro 4 free)
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aba-monitor-bot.com",
        "X-Title": "ABA Monitor Bot"
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free", // using a reliable free model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ]
      })
    });

    const aiData: any = await aiRes.json();
    let reply = aiData.choices?.[0]?.message?.content;
    
    if (!reply) {
       // Debugging info if it fails
       await sendTelegramMessage(env.BOT_TOKEN, chatId, `🤖 <b>AI Error:</b>\n\nAPI Response: <code>${JSON.stringify(aiData)}</code>`);
       return;
    }
    
    // Convert basic markdown to Telegram HTML to avoid parsing errors
    reply = reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    reply = reply.replace(/\*(.*?)\*/g, '<i>$1</i>');
    reply = reply.replace(/`(.*?)`/g, '<code>$1</code>');

    await sendTelegramMessage(env.BOT_TOKEN, chatId, `🤖 <b>AI Assistant:</b>\n\n${reply}`);
  } catch (err) {
    await sendTelegramMessage(env.BOT_TOKEN, chatId, "Sorry, I had an error talking to the AI.");
  }
}

// Hourly cron job to scrape the latest docs and save them to KV
async function updateDocsCache(env: Env) {
    if (!env.FIRECRAWL_API_KEY) return;

    // We send announcements to the channel instead of the group
    const ANNOUNCEMENT_CHANNEL = "@abapaywayunofficial";

    try {
      // Scrape ABA docs using Firecrawl API
      const res = await fetch("https://api.firecrawl.dev/v0/scrape", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: ABA_DOCS_URL,
          pageOptions: { onlyMainContent: true }
        })
      });

      const data: any = await res.json();
      const markdown = data.data?.markdown;

      if (markdown) {
        const oldHash = await env.CACHE.get("docs_hash");
        
        // Simple hash check
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(markdown));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const currentHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        if (oldHash && oldHash !== currentHash) {
          await sendTelegramMessage(env.BOT_TOKEN, ANNOUNCEMENT_CHANNEL, `🚨 <b>ABA PayWay Update Detected!</b>\nThe official docs have changed. Check it out: <a href="${ABA_DOCS_URL}">${ABA_DOCS_URL}</a>`);
        }
        
        // Save both the hash for comparison and the markdown content for the AI!
        await env.CACHE.put("docs_hash", currentHash);
        await env.CACHE.put("aba_docs_context", markdown);
      }
    } catch (err) {
      console.error(err);
    }
}
