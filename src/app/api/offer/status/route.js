import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = Number(searchParams.get("userId"));

    if (!userId) {
      return Response.json({
        success: false,
        freeOfferAvailable: false,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        freeChatUsed: true,
      },
    });

    return Response.json({
      success: true,
      freeOfferAvailable: !user?.freeChatUsed,
    });
  } catch (error) {
    console.error("OFFER_STATUS_ERROR:", error);

    return Response.json({
      success: false,
      freeOfferAvailable: false,
    });
  }
}