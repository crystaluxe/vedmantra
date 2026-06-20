import { prisma } from "@/lib/prisma";

const AI_ASTROLOGER_NAMES = new Set([
  "guru vashisht",
  "acharya dev",
  "acharya gayatri",
  "pandit somesh",
  "acharya kavya",
  "guru anand",
]);

function isAiAstrologer(astrologer) {
  return AI_ASTROLOGER_NAMES.has(
    String(astrologer?.name || "")
      .toLowerCase()
      .trim()
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { astrologerId, userId } = body;

    if (!astrologerId) {
      return Response.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return Response.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const astrologer = await prisma.astrologer.findUnique({
      where: {
        id: Number(astrologerId),
      },
    });

    if (!astrologer) {
      return Response.json(
        { success: false, error: "Astrologer not found" },
        { status: 404 }
      );
    }

    if (!astrologer.online) {
      return Response.json(
        { success: false, error: "Astrologer is currently offline" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let wallet = user.wallet;

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });
    }

    const currentBalance = Number(wallet.balance || 0);
    const minimumBalanceRequired = Number(astrologer.price || 0);

    if (currentBalance < minimumBalanceRequired) {
      return Response.json(
        {
          success: false,
          code: "INSUFFICIENT_BALANCE",
          error: `Your wallet balance is ₹${currentBalance}. Please recharge to start chat with this astrologer.`,
          balance: currentBalance,
          required: minimumBalanceRequired,
          redirectTo: "/wallet",
        },
        { status: 402 }
      );
    }

    const chatSession = await prisma.chatSession.create({
      data: {
        astrologerId: astrologer.id,
        userId: user.id,
        status: isAiAstrologer(astrologer) ? "ACTIVE" : "QUEUED",
        walletBalanceAtStart: currentBalance,
        freeMinutesRemaining: 0,
      },
    });

    return Response.json({
      success: true,
      chatSessionId: chatSession.id,
      walletBalanceAtStart: currentBalance,
      astrologerPrice: minimumBalanceRequired,
      freeOfferApplied: false,
      freeMinutesRemaining: 0,
    });
  } catch (error) {
    console.error("START_CHAT_ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}
