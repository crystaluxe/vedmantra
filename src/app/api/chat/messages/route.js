import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const chatSessionId = Number(
      searchParams.get("chatSessionId")
    );

    const messages = await prisma.chatMessage.findMany({
      where: {
        chatSessionId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return Response.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: "Unable to fetch messages",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const { chatSessionId, sender, message } = await request.json();

    if (!chatSessionId || !message?.trim()) {
      return Response.json(
        { success: false, error: "Chat session and message are required" },
        { status: 400 }
      );
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: Number(chatSessionId) },
    });

    if (!session) {
      return Response.json(
        { success: false, error: "Chat session not found" },
        { status: 404 }
      );
    }

    if (session.status === "QUEUED") {
      return Response.json(
        {
          success: false,
          code: "CHAT_QUEUED",
          error: "Astrologer will join this chat shortly.",
        },
        { status: 409 }
      );
    }

    if (session.status !== "ACTIVE" && session.status !== "QUEUED") {
      return Response.json(
        {
          success: false,
          code: "CHAT_ENDED",
          error: "This chat is not active.",
        },
        { status: 400 }
      );
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        chatSessionId: Number(chatSessionId),
        sender: sender || "USER",
        message: message.trim(),
      },
    });

    return Response.json({
      success: true,
      message: chatMessage,
    });
  } catch (error) {
    console.error("SEND_CHAT_MESSAGES_ERROR:", error);

    return Response.json(
      { success: false, error: error.message || "Unable to send message" },
      { status: 500 }
    );
  }
}
