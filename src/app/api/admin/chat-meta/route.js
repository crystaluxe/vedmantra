import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return Response.json(
        { success: false, error: "Chat ID required" },
        { status: 400 }
      );
    }

    const chat = await prisma.chatSession.findUnique({
      where: { id: Number(chatId) },
      include: {
        astrologer: true,
        user: {
          include: { wallet: true },
        },
      },
    });

    if (!chat) {
      return Response.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      chat: {
        id: chat.id,
        status: chat.status,
        startedAt: chat.startedAt,
        endedAt: chat.endedAt,
        walletBalance: chat.user?.wallet?.balance || 0,
        userName: chat.user?.name || chat.user?.phone || "Customer",
        astrologerName: chat.astrologer?.name || "Astrologer",
        astrologerPrice: chat.astrologer?.price || 0,
      },
    });
  } catch (error) {
    console.error("ADMIN_CHAT_META_ERROR", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}