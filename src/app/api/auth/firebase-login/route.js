import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { uid, phone } = await request.json();

    if (!phone) {
      return Response.json(
        {
          success: false,
          error: "Phone number required",
        },
        {
          status: 400,
        }
      );
    }

    let user = await prisma.user.findFirst({
      where: {
        phone,
      },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          wallet: {
            create: {
              balance: 0,
            },
          },
        },
        include: {
          wallet: true,
        },
      });
    }

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("FIREBASE_LOGIN_ERROR", error);

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