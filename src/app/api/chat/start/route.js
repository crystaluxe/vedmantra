import { prisma } from "@/lib/prisma";
import { beginConsultation } from "@/lib/consultation-billing";
export async function POST(request) {
  try {
    const body = await request.json();
    const userId = Number(body.userId), astrologerId = Number(body.astrologerId);
    if (!Number.isSafeInteger(userId) || userId < 1 || !Number.isSafeInteger(astrologerId) || astrologerId < 1) return Response.json({ success: false, error: "Valid user and astrologer IDs are required" }, { status: 400 });
    const result = await beginConsultation(prisma, { userId, astrologerId });
    return Response.json(result, { status: result.httpStatus || 200 });
  } catch (error) {
    console.error("START_CHAT_ERROR", error);
    return Response.json({ success: false, error: "Unable to start consultation. Please try again." }, { status: 500 });
  }
}