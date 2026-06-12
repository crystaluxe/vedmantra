import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { chatSessionId } = await request.json();

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: Number(chatSessionId) },
      include: {
        astrologer: true,
        user: {
          include: { wallet: true },
        },
      },
    });

    if (!chatSession) {
      return Response.json(
        { success: false, error: "Chat session not found" },
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
        { success: false, error: "Wallet not found" },
        { status: 404 }
      );
    }

    const astrologerPrice = Number(chatSession.astrologer.price || 0);
    const currentBalance = Number(wallet.balance || 0);

    if (currentBalance <= 0) {
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: {
          status: "ENDED",
          endedAt: new Date(),
        },
      });

      return Response.json({
        success: false,
        code: "LOW_BALANCE",
        error: "Wallet balance exhausted",
        balance: 0,
        required: astrologerPrice,
        chatEnded: true,
      });
    }

    const deductionAmount = Math.min(currentBalance, astrologerPrice);
    const newBalance = currentBalance - deductionAmount;

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance },
    });

    if (newBalance <= 0) {
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: {
          status: "ENDED",
          endedAt: new Date(),
        },
      });

      return Response.json({
        success: true,
        code: "LOW_BALANCE",
        balance: updatedWallet.balance,
        deducted: deductionAmount,
        chatEnded: true,
        message: "Wallet exhausted. Please recharge to continue.",
      });
    }

    return Response.json({
      success: true,
      balance: updatedWallet.balance,
      deducted: deductionAmount,
      chatEnded: false,
    });
  } catch (error) {
    console.error("CHAT_DEDUCTION_ERROR", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}