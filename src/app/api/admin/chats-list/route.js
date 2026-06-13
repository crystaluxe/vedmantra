import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const chats = await prisma.chatSession.findMany({
      include: {
        astrologer: true,
        user: {
          include: {
            wallet: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return Response.json({
      success: true,
      chats: chats.map((chat) => ({
        id: chat.id,
        status: chat.status,
        startedAt: chat.startedAt,

        astrologerName:
          chat.astrologer?.name || "Astrologer",

        userName:
          chat.user?.name ||
          chat.user?.phone ||
          "Customer",

        walletBalance:
          chat.user?.wallet?.balance || 0,

        lastMessage: chat.messages[0] || null,
      })),
    });
  } catch (error) {
    console.error("ADMIN_CHATS_LIST_ERROR", error);

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