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