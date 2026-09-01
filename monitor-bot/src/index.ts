export interface Env {
  BOT_TOKEN: string;
  OPENROUTER_API_KEY: string;
  GEMINI_API_KEY: string;
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
        
        // Setup the slash command popup menu
        const commandsUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/setMyCommands`;
        await fetch(commandsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commands: [
              { command: "status", description: "Check ABA Sandbox status" },
              { command: "ask", description: "Ask the AI a question" },
              { command: "updatedocs", description: "Trigger docs scraping" }
            ]
          })
        });

        return new Response("Webhook and commands set successfully!");
      }
      return new Response("Worker is running.", { status: 200 });
    }

    if (request.method === "POST") {
      try {
        const update: any = await request.json();
        
        if (update.message && update.message.text) {
          const text = update.message.text.trim();
          const chatId = update.message.chat.id;
          const userId = update.message.from?.id;

          if (text.startsWith("/status")) {
            ctx.waitUntil(handleStatusCommand(env.BOT_TOKEN, chatId));
          } else if (text.startsWith("/updatedocs")) {
            ctx.waitUntil(triggerDocsUpdate(env, chatId));
          } else if (text.startsWith("/ask")) {
            const question = text.replace("/ask", "").trim();
            const replyContext = update.message.reply_to_message?.text || update.message.reply_to_message?.caption || "";
            
            if (question || replyContext) {
              ctx.waitUntil(handleAskCommand(env, chatId, userId, question, replyContext));
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

async function handleAskCommand(env: Env, chatId: string | number, userId: number, question: string, replyContext: string = "") {
  const ADMIN_ID = 715714775;
  const DAILY_LIMIT = 5;

  if (userId !== ADMIN_ID) {
    const today = new Date().toISOString().split("T")[0];
    const limitKey = `ask_limit_${userId}_${today}`;
    const currentUsage = parseInt(await env.CACHE.get(limitKey) || "0");

    if (currentUsage >= DAILY_LIMIT) {
      await sendTelegramMessage(env.BOT_TOKEN, chatId, `⚠️ <b>Limit Reached</b>\n\nYou have used your daily limit of ${DAILY_LIMIT} questions. Please try again tomorrow.`);
      return;
    }
    await env.CACHE.put(limitKey, (currentUsage + 1).toString(), { expirationTtl: 86400 });
  }

  if (!env.GEMINI_API_KEY) {
    await sendTelegramMessage(env.BOT_TOKEN, chatId, "The AI is currently resting. Gemini API key is missing.");
    return;
  }

  let abaContext = await env.CACHE.get("aba_docs_context");
  if (!abaContext) {
    abaContext = "No ABA Docs context cached yet. Try again later.";
  }

  const sdkRes = await fetch(SDK_DOCS_URL);
  const sdkContext = await sdkRes.text();

  let promptText = `You are an expert AI assistant for the ABA PayWay Unofficial SDK community.
Answer the user's question based ONLY on the provided context below. Be concise, friendly, and include code snippets if helpful.
Format the output in clean HTML supported by Telegram (<b>, <i>, <code>, <pre>).

--- ABA OFFICIAL DOCS ---
${abaContext}

--- UNOFFICIAL SDK DOCS ---
${sdkContext}

`;

  if (replyContext) {
    promptText += `--- PREVIOUS MESSAGE CONTEXT (User is replying to this) ---\n${replyContext}\n\n`;
  }

  promptText += `--- USER QUESTION ---\n${question}`;

  try {
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const aiData: any = await aiRes.json();
    let reply = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) {
       await sendTelegramMessage(env.BOT_TOKEN, chatId, `🤖 <b>AI Error:</b>\n\nAPI Response: <code>${JSON.stringify(aiData)}</code>`);
       return;
    }
    
    // Convert basic markdown to Telegram HTML to avoid parsing errors
    reply = reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    reply = reply.replace(/\*(.*?)\*/g, '<i>$1</i>');
    reply = reply.replace(/`(.*?)`/g, '<code>$1</code>');

    await sendTelegramMessage(env.BOT_TOKEN, chatId, `🤖 <b>Gemini Assistant:</b>\n\n${reply}`);
  } catch (err) {
    await sendTelegramMessage(env.BOT_TOKEN, chatId, "Sorry, I had an error talking to Gemini.");
  }
}

async function triggerDocsUpdate(env: Env, chatId: string | number) {
  await sendTelegramMessage(env.BOT_TOKEN, chatId, "🔄 Starting Firecrawl to scrape the latest ABA docs...");
  await updateDocsCache(env);
  await sendTelegramMessage(env.BOT_TOKEN, chatId, "✅ Firecrawl finished! The AI context is now updated.");
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
