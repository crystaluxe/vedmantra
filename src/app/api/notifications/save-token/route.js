import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId, token } = await request.json();

    await prisma.userPushToken.upsert({
      where: {
        token,
      },
      update: {},
      create: {
        userId: Number(userId),
        token,
      },
    });

    return Response.json({
      success: true,
    });
  } catch (error) {
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