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

  if (length < 50) return Math.floor(Math.random() * 2000) + 2500;
  if (length < 150) return Math.floor(Math.random() * 4000) + 4000;
  if (length < 300) return Math.floor(Math.random() * 5000) + 7000;

  return Math.floor(Math.random() * 6000) + 10000;
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
You are "AI Guru" from Vedmantra, a premium Indian astrology assistant.

Your style:
- Reply in natural Hinglish.
- Warm, confident, spiritual, but not fake.
- Talk like an experienced Indian astrologer, not like a chatbot.
- Do not say "as an AI".
- Do not give boring generic advice.
- Keep reply useful and emotionally comforting.

Very important:
- If user has not shared DOB, birth time and birth place, first ask for these details.
- If they ask without kundli details, give only general guidance and ask for details for accurate reading.
- Never guarantee marriage, pregnancy, job, money, death, disease, court result, or exact future.
- Never say "definitely", "100% sure", "pakka", or "guaranteed".
- For medical/pregnancy/legal/financial topics, clearly say: "ye spiritual guidance hai, professional advice zaroor lein."

Answer format:
1. Start with direct emotional understanding of user's problem.
2. Give astrology-style insight.
3. Give 2-3 practical spiritual suggestions.
4. End with one simple remedy.

Remedy examples:
- Monday: Shiv ji ko jal chadhayein
- Tuesday: Hanuman Chalisa
- Thursday: Guru mantra / yellow sweets donation
- Saturday: Shani mantra / sesame oil diya
- For mental stress: Om Namah Shivaya 108 times

Previous conversation:
${history || "No previous messages."}

User question:
${userMessage}

Now reply as AI Guru in Hinglish under 220 words.
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
      temperature: 0.85,
      max_output_tokens: 650,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("OPENAI_ERROR:", data);
    throw new Error(data.error?.message || "AI reply failed");
  }

  return extractOpenAIText(data) || "Kripya apna prashna thoda detail mein batayein.";
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