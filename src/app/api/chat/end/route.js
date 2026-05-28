import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { chatSessionId } = await request.json();

    if (!chatSessionId) {
      return Response.json(
        {
          success: false,
          error: "Chat session is required",
        },
        {
          status: 400,
        }
      );
    }

    const chatSession = await prisma.chatSession.update({
      where: {
        id: Number(chatSessionId),
      },
      data: {
        status: "ENDED",
        endedAt: new Date(),
      },
    });

    return Response.json({
      success: true,
      chatSession,
    });
  } catch (error) {
    console.error("END_CHAT_ERROR", error);

    return Response.json(
      {
        success: false,
        error: "Unable to end chat",
      },
      {
        status: 500,
      }
    );
  }
}