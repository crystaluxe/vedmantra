import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let user = await prisma.user.findFirst({
      where: {
        email: "demo@astroplatform.com",
      },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Demo User",
          email: "demo@astroplatform.com",
        },
      });
    }

    let wallet = await prisma.wallet.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        wallet,
      },
    });
  } catch (error) {
    console.error("DEMO_USER_ERROR_FULL:", error);

    return NextResponse.json(
      {
        error: "Unable to create demo user",
        details: error.message,
      },
      { status: 500 }
    );
  }
}