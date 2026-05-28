import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const phone = searchParams.get("phone");

    let user = null;

    if (userId) {
      user = await prisma.user.findUnique({
        where: {
          id: Number(userId),
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

    if (!user && phone) {
      user = await prisma.user.findUnique({
        where: {
          phone,
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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 404,
        }
      );
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
      {
        success: false,
        error: "Unable to fetch wallet",
      },
      {
        status: 500,
      }
    );
  }
}