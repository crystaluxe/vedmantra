import { prisma } from "@/lib/prisma";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const AI_ASTROLOGER_NAMES = [
  "guru vashisht",
  "acharya dev",
  "acharya gayatri",
  "pandit somesh",
  "acharya kavya",
  "guru anand",
];

const ASTROLOGY_REFUSAL =
  "Main sirf astrology, kundli aur spiritual guidance se jude prashno ka uttar de sakta/sakti hoon. Kripya apna prashna janm kundli, career, business, marriage, health ya grah-dasha ke perspective se poochhein.";

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

function normalizeText(text = "") {
  return String(text).toLowerCase().trim();
}

function isGreetingOnly(message) {
  const text = normalizeText(message);

  const greetings = [
    "hi",
    "hii",
    "hello",
    "hey",
    "namaste",
    "namaskar",
    "pranam",
    "radhe radhe",
    "jai shree ram",
    "jai shri ram",
    "jai mata di",
    "ram ram",
  ];

  return greetings.includes(text);
}

function isClearlyAstrologyRelated(message) {
  const text = normalizeText(message);

  const astrologyKeywords = [
    "astrology",
    "jyotish",
    "kundli",
    "kundali",
    "horoscope",
    "rashifal",
    "rashi",
    "lagna",
    "nakshatra",
    "grah",
    "graha",
    "dasha",
    "mahadasha",
    "antardasha",
    "gochar",
    "transit",
    "shani",
    "sade sati",
    "mangal",
    "rahu",
    "ketu",
    "guru",
    "jupiter",
    "venus",
    "shukra",
    "budh",
    "mercury",
    "surya",
    "chandra",
    "mars",
    "saturn",
    "remedy",
    "upay",
    "mantra",
    "puja",
    "pooja",
    "yantra",
    "gemstone",
    "rudraksha",
    "vastu",
    "numerology",
    "muhurat",
    "vivah",
    "marriage",
    "love life",
    "career astrology",
    "business astrology",
    "finance astrology",
    "job astrology",
    "health astrology",
    "pregnancy astrology",
    "child astrology",
    "baby astrology",
    "dob",
    "date of birth",
    "birth time",
    "birth place",
    "janam",
    "janm",
    "janam kundli",
    "janm kundali",
  ];

  return astrologyKeywords.some((word) => text.includes(word));
}

function isLifeProblemAllowedForAstrology(message) {
  const text = normalizeText(message);

  const allowedLifeTopics = [
    "business problem",
    "business issue",
    "business loss",
    "business",
    "career",
    "job",
    "money",
    "finance",
    "financial",
    "loan",
    "debt",
    "marriage",
    "relationship",
    "love",
    "breakup",
    "divorce",
    "family",
    "health",
    "pregnancy",
    "child",
    "baby",
    "education",
    "study",
    "foreign",
    "abroad",
    "property",
    "court case",
    "legal problem",
  ];

  return allowedLifeTopics.some((word) => text.includes(word));
}

function isClearlyNonAstrologyQuestion(message) {
  const text = normalizeText(message);

  if (isGreetingOnly(text)) return false;
  if (isClearlyAstrologyRelated(text)) return false;
  if (isLifeProblemAllowedForAstrology(text)) return false;

  const blockedKeywords = [
    "9/11",
    "911 attack",
    "twin tower",
    "world trade center",
    "world war",
    "history of",
    "who is",
    "what is",
    "explain",
    "news",
    "latest news",
    "president",
    "prime minister",
    "election",
    "politics",
    "cricket",
    "football",
    "score",
    "stock price",
    "share price",
    "bitcoin",
    "crypto",
    "code",
    "coding",
    "javascript",
    "react",
    "next js",
    "shopify code",
    "html",
    "css",
    "seo",
    "marketing strategy",
    "facebook ads",
    "meta ads",
    "google ads",
    "business strategy",
    "sales strategy",
    "write email",
    "write caption",
    "create image",
    "make logo",
    "translate",
    "summarize",
  ];

  return blockedKeywords.some((word) => text.includes(word));
}

function needsAstrologyFraming(message) {
  const text = normalizeText(message);

  return (
    isLifeProblemAllowedForAstrology(text) &&
    !isClearlyAstrologyRelated(text) &&
    !text.includes("dob") &&
    !text.includes("date of birth") &&
    !text.includes("birth time") &&
    !text.includes("birth place")
  );
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

async function generateAiAstrologyReply({
  userMessage,
  previousMessages,
  astrologerName,
}) {
  const history = previousMessages
    .slice(-12)
    .map((msg) => `${msg.sender}: ${msg.message}`)
    .join("\n");

  const prompt = `
You are "${astrologerName}" from Vedmantra.

You are chatting live with the user like a real human astrologer on WhatsApp.

ABSOLUTE SCOPE RULE:
You must answer ONLY astrology, horoscope, kundli, numerology, vastu, spiritual remedies, muhurat, dasha, graha, nakshatra and spiritual guidance related questions.

VERY IMPORTANT:
- If user asks about business, career, money, relationship, health, pregnancy, family, legal or life problems, answer ONLY from astrology/kundli/graha-dasha perspective.
- Do NOT give marketing strategy.
- Do NOT give business consulting.
- Do NOT give startup advice.
- Do NOT give medical advice.
- Do NOT give legal advice.
- Do NOT give investment advice.
- Do NOT answer general knowledge, history, politics, science, coding, news, celebrities, sports or random questions.
- If the question is outside astrology/spiritual guidance, politely refuse using this exact meaning:
"${ASTROLOGY_REFUSAL}"

MOST IMPORTANT CHAT STYLE:
- Do NOT give long paragraphs.
- Do NOT give remedies in every reply.
- Do NOT explain everything at once.
- Reply step by step.
- Ask only ONE question at a time.
- Keep replies short: 1 to 3 lines maximum.
- Sound human, warm and natural.

Conversation behaviour:
- If user says hi, hello, hey, namaste, greet them and ask what problem they want astrology guidance on.
- If user shares a problem but no birth details, first ask for DOB only.
- After DOB is given, ask for birth time only.
- After birth time is given, ask for birth place only.
- After all details are complete, give a short astrology-style insight.
- Give remedy only when user asks for solution/remedy or after enough context is collected.
- Do not dump a full reading in one message.

Business/career rule:
- If user says "I have business problem", do NOT give business strategy.
- Ask for DOB first and say you will check business through kundli, 10th house, 11th house, Mercury, Saturn, Jupiter and current dasha.

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
      temperature: 0.45,
      max_output_tokens: 120,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("OPENAI_ERROR:", data);
    throw new Error(data.error?.message || "AI reply failed");
  }

  return extractOpenAIText(data) || "Namaste 🙏 Batayein, kis baat par astrology guidance chahiye?";
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
    const isAiAstrologer = AI_ASTROLOGER_NAMES.includes(
      astrologerName.toLowerCase().trim()
    );

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

      let aiReply;

      if (isClearlyNonAstrologyQuestion(message)) {
        aiReply = ASTROLOGY_REFUSAL;
      } else if (needsAstrologyFraming(message)) {
        aiReply =
          "Is problem ko astrology ke perspective se dekhne ke liye pehle apni DOB batayein. Main kundli, grah-dasha aur business/career yog ke basis par guidance dunga/dungi.";
      } else {
        aiReply = await generateAiAstrologyReply({
          userMessage: message,
          previousMessages: session.messages || [],
          astrologerName,
        });
      }

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