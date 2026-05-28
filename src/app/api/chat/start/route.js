import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { astrologerId } = body;

    if (!astrologerId) {
      return Response.json(
        { success: false, error: "Astrologer ID is required" },
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

    let user = await prisma.user.findFirst({
      where: {
        email: "demo@astroplatform.com",
      },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Demo User",
          email: "demo@astroplatform.com",
          wallet: {
            create: {
              balance: 0,
            },
          },
        },
        include: {
          wallet: true,
        },
      });
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

    const minimumBalanceRequired = astrologer.price;

    if (wallet.balance < minimumBalanceRequired) {
      return Response.json(
        {
          success: false,
          error: `Insufficient wallet balance. Recharge at least ₹${minimumBalanceRequired} to start chat.`,
          code: "INSUFFICIENT_BALANCE",
          balance: wallet.balance,
          required: minimumBalanceRequired,
        },
        { status: 402 }
      );
    }

    const chatSession = await prisma.chatSession.create({
      data: {
        astrologerId: astrologer.id,
        userId: user.id,
        status: "ACTIVE",
        walletBalanceAtStart: wallet.balance,
      },
    });

    return Response.json({
      success: true,
      chatSessionId: chatSession.id,
      walletBalanceAtStart: wallet.balance,
      astrologerPrice: astrologer.price,
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