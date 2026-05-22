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

    const chatSession = await prisma.chatSession.create({
      data: {
        astrologerId: Number(astrologerId),
        status: "ACTIVE",
        walletBalanceAtStart: 500,
      },
    });

    return Response.json({
      success: true,
      chatSessionId: chatSession.id,
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