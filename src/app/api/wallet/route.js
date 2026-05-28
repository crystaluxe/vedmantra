import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let user = await prisma.user.findFirst({
      where: {
        email: "demo@astroplatform.com",
      },
      include: {
        wallet: {
          include: {
            transactions: {
              orderBy: { createdAt: "desc" },
              take: 20,
            },
          },
        },
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Demo User",
          email: "demo@astroplatform.com",
          wallet: {
            create: {
              balance: 0,
            },
          },
        },
        include: {
          wallet: {
            include: {
              transactions: {
                orderBy: { createdAt: "desc" },
                take: 20,
              },
            },
          },
        },
      });
    }

    let wallet = user.wallet;

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error("GET_WALLET_ERROR", error);

    return NextResponse.json(
      { error: "Unable to fetch wallet" },
      { status: 500 }
    );
  }
}