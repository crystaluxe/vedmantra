import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));

    if (!userId) {
      return Response.json(
        { success: false, error: "User ID is required", chats: [] },
        { status: 400 }
      );
    }

    const chats = await prisma.chatSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        startedAt: "desc",
      },
      include: {
        astrologer: true,
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return Response.json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("CHAT_HISTORY_ERROR:", error);

    return Response.json(
      { success: false, error: "Unable to fetch chat history", chats: [] },
      { status: 500 }
    );
  }
}