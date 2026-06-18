import { prisma } from "@/lib/prisma";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const AI_ASTROLOGER_PROFILES = {
  "guru vashisht": { gender: "male" },
  "acharya dev": { gender: "male" },
  "acharya gayatri": { gender: "female" },
  "pandit somesh": { gender: "male" },
  "acharya kavya": { gender: "female" },
  "guru anand": { gender: "male" },
};

const AI_ASTROLOGER_NAMES = Object.keys(AI_ASTROLOGER_PROFILES);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHumanDelay(message) {
  const length = message.length;
  if (length < 50) return Math.floor(Math.random() * 1200) + 1200;
  if (length < 150) return Math.floor(Math.random() * 1800) + 1800;
  return Math.floor(Math.random() * 2500) + 2500;
}

function normalizeText(text = "") {
  return String(text).toLowerCase().trim();
}

function getAstrologerProfile(astrologerName = "") {
  const key = normalizeText(astrologerName);
  return AI_ASTROLOGER_PROFILES[key] || { gender: "male" };
}

function getGenderWords(gender = "male") {
  if (gender === "female") {
    return {
      guidance: "guidance dungi",
      canAnswer: "sakti hoon",
      tell: "bataungi",
      explore: "samajhungi",
      give: "dungi",
    };
  }

  return {
    guidance: "guidance dunga",
    canAnswer: "sakta hoon",
    tell: "bataunga",
    explore: "samajhunga",
    give: "dunga",
  };
}

function getAstrologyRefusal(gender = "male") {
  const words = getGenderWords(gender);

  return `Main sirf astrology, kundli aur spiritual guidance se jude prashno ka uttar de ${words.canAnswer}. Kripya apna prashna janm kundli, career, business, marriage, health ya grah-dasha ke perspective se poochhein.`;
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

function extractConsultationData(messages = []) {
  const userMessages = messages.filter((msg) => msg.sender === "USER");
  const allText = userMessages.map((msg) => msg.message || "").join("\n");
  const lowerText = normalizeText(allText);

  const dobRegex =
    /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+\d{2,4})\b/i;

  const timeRegex =
    /\b(\d{1,2}:\d{2}\s?(am|pm)?|\d{1,2}\s?(am|pm))\b/i;

  const placeIndicators = [
    "birth place",
    "birthplace",
    "born in",
    "place of birth",
    "janm sthan",
    "janam sthan",
    "janm place",
  ];

  const nameIndicators = [
    "my name is",
    "name is",
    "mera naam",
    "mera name",
    "naam hai",
    "i am",
    "main",
  ];

  const hasDob = dobRegex.test(allText);
  const hasBirthTime = timeRegex.test(allText);

  const hasBirthPlace =
    placeIndicators.some((item) => lowerText.includes(item)) ||
    userMessages.some((msg) => {
      const text = normalizeText(msg.message || "");
      return (
        text.length >= 3 &&
        text.length <= 40 &&
        !dobRegex.test(text) &&
        !timeRegex.test(text) &&
        /^[a-zA-Z\s,.-]+$/.test(text) &&
        userMessages.length >= 3
      );
    });

  const hasName =
    nameIndicators.some((item) => lowerText.includes(item)) ||
    userMessages.some((msg, index) => {
      const text = normalizeText(msg.message || "");
      if (index > 2) return false;
      if (isGreetingOnly(text)) return false;
      if (dobRegex.test(text)) return false;
      if (timeRegex.test(text)) return false;
      if (isLifeProblemAllowedForAstrology(text)) return false;
      if (isClearlyAstrologyRelated(text)) return false;
      return (
        text.length >= 2 && text.length <= 35 && /^[a-zA-Z\s.]+$/.test(text)
      );
    });

  const hasQuestion = userMessages.some((msg) => {
    const text = normalizeText(msg.message || "");
    if (isGreetingOnly(text)) return false;
    if (dobRegex.test(text)) return false;
    if (timeRegex.test(text)) return false;

    return (
      isLifeProblemAllowedForAstrology(text) ||
      text.includes("?") ||
      text.includes("problem") ||
      text.includes("issue") ||
      text.includes("pareshan") ||
      text.includes("dikkat") ||
      text.includes("kab") ||
      text.includes("kaise") ||
      text.includes("kyu") ||
      text.includes("future") ||
      text.includes("shaadi") ||
      text.includes("career") ||
      text.includes("business") ||
      text.includes("money") ||
      text.includes("love")
    );
  });

  return {
    hasName,
    hasDob,
    hasBirthTime,
    hasBirthPlace,
    hasQuestion,
  };
}

function getNextRequiredQuestion({ consultationData, astrologerGender }) {
  const words = getGenderWords(astrologerGender);

  if (!consultationData.hasName) {
    return "Namaste 🙏 Sabse pehle apna naam batayiye.";
  }

  if (!consultationData.hasDob) {
    return "Kripya apni Date of Birth batayiye. Format: DD/MM/YYYY";
  }

  if (!consultationData.hasBirthTime) {
    return "Kripya apna exact birth time batayiye, jaise 10:30 AM.";
  }

  if (!consultationData.hasBirthPlace) {
    return "Kripya apna birth place batayiye, jaise Delhi, Mumbai ya Bangalore.";
  }

  if (!consultationData.hasQuestion) {
    return `Ab apna main prashna batayiye. Main isse kundli ke deeper angle se ${words.explore}.`;
  }

  return null;
}

function ensureFollowUpQuestion(reply, userMessage) {
  const text = String(reply || "").trim();
  if (text.includes("?") || text.includes("batayiye") || text.includes("batayenge")) {
    return text;
  }

  const userText = normalizeText(userMessage);

  if (
    userText.includes("exam") ||
    userText.includes("result") ||
    userText.includes("selection") ||
    userText.includes("promotion")
  ) {
    return `${text}\n\nIs result ke baad interview/document verification bhi hoga ya direct selection hai?`;
  }

  if (
    userText.includes("career") ||
    userText.includes("job") ||
    userText.includes("office") ||
    userText.includes("work")
  ) {
    return `${text}\n\nYe issue manager approval, office politics, job change ya workload se related hai?`;
  }

  if (
    userText.includes("business") ||
    userText.includes("money") ||
    userText.includes("finance") ||
    userText.includes("debt") ||
    userText.includes("loss")
  ) {
    return `${text}\n\nAapki main problem cashflow, sales, debt ya partnership se related hai?`;
  }

  if (
    userText.includes("love") ||
    userText.includes("relationship") ||
    userText.includes("breakup")
  ) {
    return `${text}\n\nYe relationship current chal raha hai, breakup phase mein hai ya one-sided situation hai?`;
  }

  if (
    userText.includes("marriage") ||
    userText.includes("shaadi") ||
    userText.includes("vivah")
  ) {
    return `${text}\n\nYe love marriage ka case hai, arranged marriage ka ya family delay chal raha hai?`;
  }

  if (
    userText.includes("pregnancy") ||
    userText.includes("baby") ||
    userText.includes("child")
  ) {
    return `${text}\n\nAapki current concern pregnancy journey, baby health ya conception timing se related hai?`;
  }

  if (
    userText.includes("family") ||
    userText.includes("property") ||
    userText.includes("legal") ||
    userText.includes("court")
  ) {
    return `${text}\n\nIs issue mein family pressure zyada hai, property matter hai ya legal delay chal raha hai?`;
  }

  if (
    userText.includes("health") ||
    userText.includes("medical") ||
    userText.includes("bimari")
  ) {
    return `${text}\n\nYe issue recent start hua hai ya kaafi time se chal raha hai?`;
  }

  return `${text}\n\nIs point ko aur clearly samajhne ke liye aap apni situation thodi detail mein batayenge?`;
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
  astrologerGender,
  consultationData,
}) {
  const history = previousMessages
    .slice(-14)
    .map((msg) => `${msg.sender}: ${msg.message}`)
    .join("\n");

  const prompt = `
You are "${astrologerName}" from Vedmantra.

Astrologer gender: ${astrologerGender}

Gender speaking rule:
- If gender is male, always say: dunga, bataunga, dekhunga, karunga, sakta hoon.
- If gender is female, always say: dungi, bataungi, dekhungi, karungi, sakti hoon.
- Never write combined words like dunga/dungi, bataunga/bataungi, karunga/karungi, sakta/sakti.

Structured consultation details collected:
Name collected: ${consultationData.hasName ? "Yes" : "No"}
DOB collected: ${consultationData.hasDob ? "Yes" : "No"}
Birth time collected: ${consultationData.hasBirthTime ? "Yes" : "No"}
Birth place collected: ${consultationData.hasBirthPlace ? "Yes" : "No"}
Main question collected: ${consultationData.hasQuestion ? "Yes" : "No"}

CRITICAL FLOW RULE:
The system has already collected Name, DOB, Birth Time, Birth Place and Question.
Do NOT ask for these again unless user clearly says something is wrong.
Do NOT restart the onboarding flow.

ABSOLUTE SCOPE RULE:
You must answer ONLY astrology, horoscope, kundli, numerology, vastu, spiritual remedies, muhurat, dasha, graha, nakshatra and spiritual guidance related questions.

NEVER ASK USER FOR:
- Graha dasha
- Mahadasha
- Antardasha
- Planetary positions
- Ascendant
- Houses
- Kundli calculations

NEVER SAY:
- Main check kar raha hoon
- Main dekh raha hoon
- Main calculate kar raha hoon
- Ek minute
- Thodi der rukiyega
- Kripya wait kariye

MANDATORY ENGAGEMENT RULE:
Every astrology reply must end with exactly ONE relevant follow-up question.
Never end with final reassurance like:
- achha hoga
- sab theek hoga
- vishwas rakhiye
- dhairya rakhiye
- positive rahiye
- chances acche hain

Do not satisfy the user fully in one answer.
Give partial insight + one hidden factor + one follow-up question.
Reveal final conclusion slowly over multiple exchanges.

QUERY-SPECIFIC HOOK RULES:

Exam / Result / Selection:
Mention supportive yog + one risk/delay factor.
Ask about interview, document verification, direct selection, exam confidence, or result process.

Career / Job / Promotion:
Mention growth possibility + obstacle.
Ask whether issue is manager approval, office politics, workload, job change, exam, or appraisal.

Business / Finance / Money:
Mention money flow/recovery/blockage.
Ask whether issue is cashflow, sales, debt, partnership, customer acquisition, or stuck payment.

Love / Relationship:
Mention emotional connection/confusion/delay.
Ask whether relationship is current, breakup phase, one-sided, long distance, or family pressure.

Marriage:
Mention marriage yog/delay/family influence.
Ask whether it is love marriage, arranged marriage, family delay, compatibility issue, or partner search.

Pregnancy / Child:
Say this is spiritual guidance only.
Mention emotional/spiritual indication.
Ask whether concern is conception, pregnancy journey, baby health, scan, or stress.

Health:
Say this is spiritual guidance only.
Mention stress/energy/planetary pressure.
Ask whether issue is recent, recurring, stress-related, or already under treatment.

Family:
Mention emotional pressure or misunderstanding.
Ask whether issue is parents, spouse, in-laws, siblings, or property.

Property / Legal:
Mention delay/conflict/pressure.
Ask whether issue is paperwork, court case, family dispute, loan, or possession.

Education / Studies:
Mention focus, delay, or exam pressure.
Ask whether issue is concentration, result, admission, exam, or subject confusion.

Foreign / Abroad:
Mention travel/settlement possibility with delay factor.
Ask whether concern is visa, job, study, PR, or relocation.

Remedy:
Do not give full remedy immediately.
First ask whether user wants simple daily remedy, mantra, puja, or gemstone guidance.

CHAT STYLE:
- Hinglish.
- 2 to 3 short lines only.
- Warm human astrologer tone.
- No long paragraph.
- No chatbot tone.
- Never say ChatGPT, OpenAI, or AI.
- Never give medical/legal/financial certainty.
- For serious health/pregnancy/legal/financial topics, say professional advice should also be taken.

Previous conversation:
${history || "No previous messages."}

User message:
${userMessage}

Reply in 2 to 3 short lines only.
End with exactly ONE relevant follow-up question.
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
      max_output_tokens: 170,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("OPENAI_ERROR:", data);
    throw new Error(data.error?.message || "AI reply failed");
  }

  const rawReply =
    extractOpenAIText(data) ||
    "Is prashna mein ek deeper point dikh raha hai.";

  return ensureFollowUpQuestion(rawReply, userMessage);
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
    const astrologerProfile = getAstrologerProfile(astrologerName);
    const astrologerGender = astrologerProfile.gender || "male";

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

      const fullMessagesForMemory = [
        ...(session.messages || []),
        {
          sender: "USER",
          message,
          createdAt: new Date(),
        },
      ];

      if (isClearlyNonAstrologyQuestion(message)) {
        aiReply = getAstrologyRefusal(astrologerGender);
      } else {
        const consultationData = extractConsultationData(fullMessagesForMemory);
        const nextRequiredQuestion = getNextRequiredQuestion({
          consultationData,
          astrologerGender,
        });

        if (nextRequiredQuestion) {
          aiReply = nextRequiredQuestion;
        } else {
          aiReply = await generateAiAstrologyReply({
            userMessage: message,
            previousMessages: fullMessagesForMemory,
            astrologerName,
            astrologerGender,
            consultationData,
          });
        }
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