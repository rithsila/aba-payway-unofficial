export interface Env {
  BOT_TOKEN: string;
  OPENROUTER_API_KEY: string;
  GEMINI_API_KEY: string;
  FB_PAGE_ID: string;
  FB_PAGE_TOKEN: string;
  CACHE: KVNamespace;
}

import { getRelevantDocs } from "./docsMatcher";

const ANNOUNCEMENT_CHANNEL = "@abapaywayunofficial";
const ADMIN_ID = 715714775;
const SDK_DOCS_URL = "https://raw.githubusercontent.com/rithsila/aba-payway-unofficial/main/README.md";

async function sendTelegramMessage(token: string, chatId: string | number, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText);
  }
}

export default {
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
              { command: "announce", description: "Post announcement (Admin only)" }
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
          } else if (text.startsWith("/announce")) {
            ctx.waitUntil(handleAnnounceCommand(env, chatId, userId, text));
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

  // Match user query and reply context to relevant docs
  const fullQuery = (question + " " + replyContext).trim();
  let abaContext = getRelevantDocs(fullQuery);

  if (!abaContext) {
    abaContext = (await env.CACHE.get("aba_docs_context")) || "No ABA Docs context available.";
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
    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
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

async function handleAnnounceCommand(env: Env, chatId: string | number, userId: number, text: string) {
  if (userId !== ADMIN_ID) {
    await sendTelegramMessage(env.BOT_TOKEN, chatId, "⛔ <b>Access Denied:</b> Only the admin can post announcements.");
    return;
  }

  const announcement = text.replace("/announce", "").trim();
  if (!announcement) {
    await sendTelegramMessage(
      env.BOT_TOKEN,
      chatId,
      "Please enter your announcement text.\n\nExample:\n<code>/announce We released ABA PayWay SDK v1.2.0!</code>"
    );
    return;
  }

  // 1. Post ONLY to Telegram Channel (never to the group directly)
  let tgSuccess = false;
  let tgError = "";
  try {
    await sendTelegramMessage(env.BOT_TOKEN, ANNOUNCEMENT_CHANNEL, announcement);
    tgSuccess = true;
  } catch (err: any) {
    tgError = err.message || "Failed to send";
  }

  // 2. Post to Facebook Page (if credentials exist)
  let fbResult = "Skipped (no Facebook secrets set)";
  if (env.FB_PAGE_ID && env.FB_PAGE_TOKEN) {
    fbResult = await sendFacebookPost(env.FB_PAGE_ID, env.FB_PAGE_TOKEN, announcement);
  }

  const report = `📢 <b>Announcement Report</b>\n\n` +
    `• Telegram Channel (${ANNOUNCEMENT_CHANNEL}): ${tgSuccess ? "✅ Sent" : `❌ Error: <code>${tgError}</code>`}\n` +
    `• Facebook Page: ${fbResult === "Success" ? "✅ Posted" : `⚠️ ${fbResult}`}`;

  await sendTelegramMessage(env.BOT_TOKEN, chatId, report);
}

async function sendFacebookPost(pageId: string, token: string, message: string): Promise<string> {
  const url = `https://graph.facebook.com/v20.0/${pageId}/feed`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        access_token: token
      })
    });
    const data: any = await res.json();
    if (data.error) {
      return `Error: ${data.error.message}`;
    }
    return "Success";
  } catch (err: any) {
    return `Error: ${err.message}`;
  }
}


