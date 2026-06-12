import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { chatSessionId } = await request.json();

    const chatSession = await prisma.chatSession.findUnique({
      where: {
        id: Number(chatSessionId),
      },
      include: {
        astrologer: true,
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!chatSession) {
      return Response.json(
        {
          success: false,
          error: "Chat session not found",
        },
        { status: 404 }
      );
    }

    if (chatSession.status !== "ACTIVE") {
      return Response.json({
        success: false,
        code: "CHAT_ENDED",
        error: "Chat already ended",
      });
    }

    const wallet = chatSession.user?.wallet;

    if (!wallet) {
      return Response.json(
        {
          success: false,
          error: "Wallet not found",
        },
        { status: 404 }
      );
    }

    const astrologerPrice = Number(chatSession.astrologer.price || 0);

    const lastDeductedAt =
      chatSession.lastDeductedAt || chatSession.startedAt;

    const now = new Date();

    const minutesElapsed = Math.floor(
      (now.getTime() - new Date(lastDeductedAt).getTime()) / 60000
    );

    if (minutesElapsed < 1) {
      return Response.json({
        success: true,
        balance: wallet.balance,
        deducted: 0,
        waiting: true,
      });
    }

    const totalCharge = minutesElapsed * astrologerPrice;

    const currentBalance = Number(wallet.balance || 0);

    const deductionAmount = Math.min(
      currentBalance,
      totalCharge
    );

    const newBalance = currentBalance - deductionAmount;

    const updatedWallet = await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: newBalance,
      },
    });

    await prisma.chatSession.update({
      where: {
        id: chatSession.id,
      },
      data: {
        lastDeductedAt: now,
      },
    });

    if (newBalance <= 0) {
      await prisma.chatSession.update({
        where: {
          id: chatSession.id,
        },
        data: {
          status: "ENDED",
          endedAt: now,
        },
      });

      return Response.json({
        success: true,
        code: "LOW_BALANCE",
        deducted: deductionAmount,
        balance: 0,
        chatEnded: true,
      });
    }

    return Response.json({
      success: true,
      deducted: deductionAmount,
      balance: updatedWallet.balance,
      minutesCharged: minutesElapsed,
      chatEnded: false,
    });
  } catch (error) {
    console.error("CHAT_DEDUCTION_ERROR", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}