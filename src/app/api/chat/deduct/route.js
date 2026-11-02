import { prisma } from "@/lib/prisma";
import { billConsultation } from "@/lib/consultation-billing";
export async function POST(request) {
  try {
    const body = await request.json();
    const id = Number(body.chatSessionId);
    if (!Number.isSafeInteger(id) || id < 1) return Response.json({ success: false, error: "Valid chat session ID required" }, { status: 400 });
    return Response.json(await billConsultation(prisma, id, { resume: body.resume === true }));
  } catch (error) {
    console.error("CHAT_DEDUCTION_ERROR", error);
    return Response.json({ success: false, error: "Unable to update consultation balance" }, { status: 500 });
  }
}