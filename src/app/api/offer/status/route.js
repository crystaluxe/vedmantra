import { prisma } from "@/lib/prisma";
import { eligibleForFreeChat } from "@/lib/consultation-billing";
export async function GET(request) {
  try {
    const userId = Number(new URL(request.url).searchParams.get("userId"));
    if (!Number.isSafeInteger(userId) || userId < 1) return Response.json({ success: false, freeOfferAvailable: false });
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { _count: { select: { chatSessions: true } } } });
    return Response.json({ success: true, freeOfferAvailable: eligibleForFreeChat(user) });
  } catch {
    return Response.json({ success: false, freeOfferAvailable: false });
  }
}