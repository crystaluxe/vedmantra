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
        {
          status: 404,
        }
      );
    }

    if (chatSession.status !== "ACTIVE") {
      return Response.json({
        success: false,
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
        {
          status: 404,
        }
      );
    }

    const deductionAmount = chatSession.astrologer.price;

    if (wallet.balance < deductionAmount) {
      return Response.json({
        success: false,
        code: "LOW_BALANCE",
        error: "Low wallet balance",
        balance: wallet.balance,
        required: deductionAmount,
      });
    }

    const updatedWallet = await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: wallet.balance - deductionAmount,
      },
    });

    return Response.json({
      success: true,
      balance: updatedWallet.balance,
      deducted: deductionAmount,
    });
  } catch (error) {
    console.error("CHAT_DEDUCTION_ERROR", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}