import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { chatSessionId, message, sender } = await request.json();

    if (!chatSessionId || !message) {
      return Response.json(
        { success: false, error: "Chat session and message are required" },
        { status: 400 }
      );
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        chatSessionId: Number(chatSessionId),
        sender: sender || "USER",
        message,
      },
    });

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