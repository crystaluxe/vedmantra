import { prisma } from "@/lib/prisma";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const AI_ASTROLOGER_NAME = process.env.AI_ASTROLOGER_NAME || "AI Guru";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHumanDelay(message) {
  const length = message.length;

  if (length < 50) return Math.floor(Math.random() * 1500) + 2000;
  if (length < 150) return Math.floor(Math.random() * 2500) + 3500;
  if (length < 300) return Math.floor(Math.random() * 3500) + 5000;

  return Math.floor(Math.random() * 4000) + 7000;
}

function extractOpenAIText(data) {
  if (data.output_text) return data.output_text;

  const texts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.text) texts.push(content.text);
    }
  }

  return texts.join("\n").trim();
}

async function sendPushToUser({ session, message }) {
  try {
    if (!session?.userId) return;

    const tokens = await prisma.userPushToken.findMany({
      where: { userId: session.userId },
    });

    const admin = getFirebaseAdmin();

    for (const tokenRow of tokens) {
      try {
        await admin.messaging().send({
          token: tokenRow.token,
          notification: {
            title: `New message from ${session.astrologer?.name || "Astrologer"}`,
            body: message.length > 100 ? message.slice(0, 100) + "..." : message,
          },
          webpush: {
            notification: {
              icon: "/favicon.ico",
              badge: "/favicon.ico",
            },
          },
        });

        console.log("PUSH_SENT", session.userId);
      } catch (pushError) {
        console.error("PUSH_SEND_ERROR", pushError);
      }
    }
  } catch (notificationError) {
    console.error("NOTIFICATION_ERROR", notificationError);
  }
}

async function generateAiAstrologyReply({ userMessage, previousMessages }) {
  const history = previousMessages
    .slice(-12)
    .map((msg) => `${msg.sender}: ${msg.message}`)
    .join("\n");

  const prompt = `
You are "AI Guru" from Vedmantra.

You are chatting live with the user like a real human astrologer on WhatsApp.

MOST IMPORTANT:
- Do NOT give long paragraphs.
- Do NOT give remedies in every reply.
- Do NOT explain everything at once.
- Reply step by step.
- Ask only ONE question at a time.
- Keep replies short: 1 to 3 lines maximum.
- Sound human, warm and natural.

Conversation behaviour:
- If user says hi, hello, hey, namaste, greet them and ask what problem they want guidance on.
- If user shares a problem but no birth details, first ask for DOB only.
- After DOB is given, ask for birth time only.
- After birth time is given, ask for birth place only.
- After all details are complete, give a short astrology-style insight.
- Give remedy only when user asks for solution/remedy or after enough context is collected.
- Do not dump a full reading in one message.

Style:
- Hinglish.
- Simple words.
- Human astrologer tone.
- No chatbot tone.
- Never say "as an AI".
- Never say ChatGPT or OpenAI.

Safety:
- Never guarantee future events.
- For pregnancy, health, legal, financial investment topics, say it is spiritual guidance only and professional advice should also be taken.

Previous conversation:
${history || "No previous messages."}

User message:
${userMessage}

Reply naturally in 1 to 3 short lines only.
`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: prompt,
      temperature: 0.75,
      max_output_tokens: 120,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("OPENAI_ERROR:", data);
    throw new Error(data.error?.message || "AI reply failed");
  }

  return extractOpenAIText(data) || "Namaste 🙏 Batayein, kis baat par guidance chahiye?";
}

export async function POST(request) {
  try {
    const { chatSessionId, message, sender } = await request.json();

    if (!chatSessionId || !message) {
      return Response.json(
        { success: false, error: "Chat session and message are required" },
        { status: 400 }
      );
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: Number(chatSessionId) },
      include: {
        astrologer: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return Response.json(
        { success: false, error: "Chat session not found" },
        { status: 404 }
      );
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        chatSessionId: Number(chatSessionId),
        sender: sender || "USER",
        message,
      },
    });

    if (sender === "ADMIN") {
      await sendPushToUser({ session, message });
    }

    const astrologerName = session.astrologer?.name || "";
    const isAiAstrologer =
      astrologerName.toLowerCase() === AI_ASTROLOGER_NAME.toLowerCase() ||
      astrologerName.toLowerCase().includes("ai");

    if (isAiAstrologer && (sender || "USER") === "USER") {
      if (!OPENAI_API_KEY) {
        return Response.json(
          {
            success: false,
            error: "OPENAI_API_KEY is missing in Railway variables",
          },
          { status: 500 }
        );
      }

      const aiReply = await generateAiAstrologyReply({
        userMessage: message,
        previousMessages: session.messages || [],
      });

      await sleep(getHumanDelay(aiReply));

      const aiMessage = await prisma.chatMessage.create({
        data: {
          chatSessionId: Number(chatSessionId),
          sender: "ADMIN",
          message: aiReply,
        },
      });

      await sendPushToUser({ session, message: aiReply });

      return Response.json({
        success: true,
        message: chatMessage,
        aiReply: aiMessage,
      });
    }

    return Response.json({
      success: true,
      message: chatMessage,
    });
  } catch (error) {
    console.error("SEND_MESSAGE_ERROR:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}