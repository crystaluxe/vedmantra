import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));

    if (!userId) {
      return Response.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const chats = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        astrologer: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return Response.json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("CHAT_LIST_ERROR", error);

    return Response.json(
      { success: false, error: "Unable to fetch chats" },
      { status: 500 }
    );
  }
}