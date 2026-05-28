import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let astrologers = await prisma.astrologer.findMany({
      orderBy: {
        id: "asc",
      },
    });

    if (astrologers.length === 0) {
      await prisma.astrologer.createMany({
        data: [
          {
            name: "Acharya Raj",
            skills: "Vedic Astrology, Career, Marriage",
            price: 19,
            image: "https://api.dicebear.com/7.x/personas/svg?seed=raj",
            online: true,
            rating: 4.9,
          },
          {
            name: "Tarot Sonia",
            skills: "Tarot Reading, Love, Relationship",
            price: 25,
            image: "https://api.dicebear.com/7.x/personas/svg?seed=sonia",
            online: true,
            rating: 4.8,
          },
          {
            name: "Astro Dev",
            skills: "Kundli, Business, Finance",
            price: 21,
            image: "https://api.dicebear.com/7.x/personas/svg?seed=dev",
            online: true,
            rating: 4.7,
          },
        ],
      });

      astrologers = await prisma.astrologer.findMany({
        orderBy: {
          id: "asc",
        },
      });
    }

    return NextResponse.json({
      success: true,
      astrologers,
    });
  } catch (error) {
    console.error("GET_ASTROLOGERS_ERROR", error);

    return NextResponse.json(
      { error: "Unable to fetch astrologers" },
      { status: 500 }
    );
  }
}