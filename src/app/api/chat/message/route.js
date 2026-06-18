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
    "promotion",
    "increment",
    "salary",
    "transfer",
    "government job",
    "govt job",
    "exam result",
    "selection",
    "result",
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
      text.includes("love") ||
      text.includes("promotion") ||
      text.includes("increment") ||
      text.includes("salary") ||
      text.includes("transfer") ||
      text.includes("govt job") ||
      text.includes("government job") ||
      text.includes("result") ||
      text.includes("selection") ||
      text.includes("exam")
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
    return `Ab apna main prashna batayiye. Aap career, job, promotion, marriage, love, money ya family se related kuch bhi pooch sakte hain. Main kundli ke deeper angle se ${words.explore}.`;
  }

  return null;
}

function ensureAstrologyFollowUp(reply, userMessage) {
  const text = String(reply || "").trim();
  const userText = normalizeText(userMessage);

  const hasQuestion =
    text.includes("?") || text.includes("batayiye") || text.includes("batayenge");

  const bannedGenericPhrases = [
    "feedback",
    "skills",
    "skill",
    "certification",
    "time management",
    "stress management",
    "strategy",
    "routine",
    "mentor",
    "seniors",
    "workload manage",
  ];

  const containsGenericCoaching = bannedGenericPhrases.some((phrase) =>
    normalizeText(text).includes(phrase)
  );

  if (hasQuestion && !containsGenericCoaching) {
    return text;
  }

  let base = text
    .replace(/.*feedback.*\?/gi, "")
    .replace(/.*skills.*\?/gi, "")
    .replace(/.*certification.*\?/gi, "")
    .replace(/.*stress management.*\?/gi, "")
    .trim();

  if (!base) {
    base = "Is prashna mein kundli ke hisaab se ek delay factor dikh raha hai.";
  }

  if (
    userText.includes("exam") ||
    userText.includes("result") ||
    userText.includes("selection")
  ) {
    return `${base}\n\nYeh result written exam ka hai ya final selection list ka?`;
  }

  if (
    userText.includes("promotion") ||
    userText.includes("increment") ||
    userText.includes("salary") ||
    userText.includes("transfer")
  ) {
    return `${base}\n\nYeh promotion departmental exam based hai, appraisal based hai ya manager approval based?`;
  }

  if (
    userText.includes("career") ||
    userText.includes("job") ||
    userText.includes("office") ||
    userText.includes("work")
  ) {
    return `${base}\n\nYeh issue job change, promotion, appraisal ya office politics se related hai?`;
  }

  if (
    userText.includes("business") ||
    userText.includes("money") ||
    userText.includes("finance") ||
    userText.includes("debt") ||
    userText.includes("loss")
  ) {
    return `${base}\n\nAapki main concern cashflow, stuck payment, partnership ya business growth se related hai?`;
  }

  if (
    userText.includes("love") ||
    userText.includes("relationship") ||
    userText.includes("breakup")
  ) {
    return `${base}\n\nYeh relationship current chal raha hai, breakup phase mein hai ya family pressure hai?`;
  }

  if (
    userText.includes("marriage") ||
    userText.includes("shaadi") ||
    userText.includes("vivah")
  ) {
    return `${base}\n\nYeh love marriage ka case hai, arranged marriage ka ya family delay chal raha hai?`;
  }

  if (
    userText.includes("pregnancy") ||
    userText.includes("baby") ||
    userText.includes("child")
  ) {
    return `${base}\n\nAapki concern pregnancy journey, conception timing ya baby ke health astrology se related hai?`;
  }

  if (
    userText.includes("family") ||
    userText.includes("property") ||
    userText.includes("legal") ||
    userText.includes("court")
  ) {
    return `${base}\n\nIs issue mein family dispute, property paperwork ya legal delay ka angle hai?`;
  }

  if (
    userText.includes("health") ||
    userText.includes("medical") ||
    userText.includes("bimari")
  ) {
    return `${base}\n\nYeh health concern recent hai ya kaafi time se repeat ho raha hai?`;
  }

  return `${base}\n\nIs problem ko astrology se aur clearly samajhne ke liye yeh issue kab se chal raha hai?`;
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

STRICT ASTROLOGY-ONLY FOLLOW-UP RULE:
Every follow-up question must stay related to astrology context, issue category, timing, dasha, delay, remedy, or consultation details.

Allowed follow-up style:
- Yeh promotion departmental exam based hai, appraisal based hai ya manager approval based?
- Yeh result written exam ka hai ya final selection list ka?
- Yeh problem kab se chal rahi hai?
- Is period mein delay, conflict ya pressure zyada feel ho raha hai?
- Aap timing detail samajhna chahenge ya remedy guidance chahenge?
- Yeh issue love marriage, arranged marriage ya family delay se related hai?
- Aapki concern cashflow, stuck payment, partnership ya business growth se related hai?

Never ask generic coaching questions like:
- Are you improving your skills?
- Did you take feedback?
- Are you doing certification?
- Are you managing stress?
- Are you managing time?
- Are you working on strategy?
- Did you talk to seniors or mentors?

MANDATORY ENGAGEMENT RULE:
Every astrology reply must end with exactly ONE relevant astrology-context follow-up question.
Never end with final reassurance like:
- achha hoga
- sab theek hoga
- vishwas rakhiye
- dhairya rakhiye
- positive rahiye
- chances acche hain

Do not satisfy the user fully in one answer.
Give partial astrology insight + one hidden factor + one astrology-context follow-up question.
Reveal final conclusion slowly over multiple exchanges.

QUERY-SPECIFIC HOOK RULES:

Exam / Result / Selection:
Mention supportive yog + one risk/delay factor.
Ask only about written result, final list, interview, document verification, direct selection, or result process.

Career / Job / Promotion:
Mention only astrology factors like 10th house, 11th house, Sun, Saturn, Mars, Mercury, Jupiter, dasha, delay yog, promotion yog.
Ask only whether issue is departmental exam, appraisal, manager approval, office politics, job change, transfer, or result-based.
Do NOT ask about skills, feedback, certifications, time management, strategy or stress management.

Business / Finance / Money:
Mention 2nd house, 10th house, 11th house, Mercury, Jupiter, Saturn, Rahu, cashflow yog, blockage yog, debt pressure.
Ask only whether issue is cashflow, stuck payment, partnership, business growth, debt, or customer flow.
Do NOT give business strategy.

Love / Relationship:
Mention Venus, Moon, 5th house, 7th house, Rahu/Ketu confusion, family influence, delay yog.
Ask only whether relationship is current, breakup phase, one-sided, long distance, family pressure, or marriage discussion.

Marriage:
Mention 7th house, Venus/Jupiter, family delay, compatibility, mangal influence, dasha timing.
Ask only whether it is love marriage, arranged marriage, family delay, partner search, or compatibility issue.

Pregnancy / Child:
Say this is spiritual guidance only.
Mention 5th house, Jupiter, Moon, emotional/spiritual indication.
Ask only whether concern is conception, pregnancy journey, scan anxiety, baby health astrology, or timing.

Health:
Say this is spiritual guidance only and professional advice should be taken.
Mention Moon, Saturn, Mars, 6th house, stress/energy imbalance.
Ask only whether issue is recent, recurring, stress-related, or already under treatment.

Family:
Mention Moon, 4th house, Saturn, Rahu/Ketu, emotional pressure or misunderstanding.
Ask only whether issue is parents, spouse, in-laws, siblings, property, or family pressure.

Property / Legal:
Mention Mars, Saturn, 4th house, 6th house, delay/conflict/pressure.
Ask only whether issue is paperwork, court case, family dispute, loan, possession, or delay.

Education / Studies:
Mention Mercury, Jupiter, 5th house, focus, delay, exam pressure.
Ask only whether issue is concentration, result, admission, exam, or subject confusion.

Foreign / Abroad:
Mention Rahu, 9th house, 12th house, travel/settlement possibility with delay factor.
Ask only whether concern is visa, job, study, PR, relocation, or foreign settlement timing.

Remedy:
Do not give full remedy immediately.
Ask whether user wants simple daily remedy, mantra, puja, or gemstone guidance.

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
End with exactly ONE relevant astrology-context follow-up question.
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
      temperature: 0.35,
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
    "Is prashna mein kundli ke hisaab se ek delay factor dikh raha hai.";

  return ensureAstrologyFollowUp(rawReply, userMessage);
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