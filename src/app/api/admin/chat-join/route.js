import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return Response.json(
        { success: false, error: "Chat ID required" },
        { status: 400 }
      );
    }

    const chat = await prisma.chatSession.findUnique({
      where: { id: Number(chatId) },
    });

    if (!chat) {
      return Response.json(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    if (chat.status === "ENDED") {
      return Response.json(
        { success: false, error: "This chat has already ended." },
        { status: 400 }
      );
    }

    if (chat.status === "ACTIVE") {
      return Response.json({ success: true, chat });
    }

    const updatedChat = await prisma.chatSession.update({
      where: { id: Number(chatId) },
      data: {
        status: "ACTIVE",
        startedAt: new Date(),
        lastDeductedAt: new Date(),
      },
    });

    return Response.json({
      success: true,
      chat: updatedChat,
    });
  } catch (error) {
    console.error("ADMIN_CHAT_JOIN_ERROR", error);

    return Response.json(
      { success: false, error: error.message || "Unable to join chat" },
      { status: 500 }
    );
  }
}
