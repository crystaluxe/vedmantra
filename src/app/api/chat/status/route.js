import { prisma } from "@/lib/prisma";
import { freeSecondsRemaining } from "@/lib/consultation-billing";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatSessionId = searchParams.get("chatSessionId");

    if (!chatSessionId) {
      return Response.json(
        { success: false, error: "Chat session ID required" },
        { status: 400 }
      );
    }

    const chat = await prisma.chatSession.findUnique({
      where: { id: Number(chatSessionId) },
      select: {
        id: true,
        status: true,
        startedAt: true,
        endedAt: true,
        freeMinutesRemaining: true,
        lastDeductedAt: true,
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
      chat: { ...chat, freeSecondsRemaining: freeSecondsRemaining(chat), showFreeRechargePopup: chat.status === "PAUSED_FREE" },
    });
  } catch (error) {
    console.error("CHAT_STATUS_ERROR", error);

    return Response.json(
      { success: false, error: error.message || "Unable to fetch chat status" },
      { status: 500 }
    );
  }
}
