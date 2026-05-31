import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId, name } = await request.json();

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: "User ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        name: name?.trim() || null,
      },
    });

    return Response.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("USER_UPDATE_ERROR", error);

    return Response.json(
      {
        success: false,
        error: "Unable to update profile",
      },
      {
        status: 500,
      }
    );
  }
}