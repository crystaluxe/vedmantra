export const FREE_MINUTES = 5;
const MINUTE = 60_000;
const AI_NAMES = new Set(["guru vashisht", "acharya dev", "acharya gayatri", "pandit somesh", "acharya kavya", "guru anand"]);

export function eligibleForFreeChat(user) {
  return Boolean(user && !user.freeChatUsed && user._count.chatSessions === 0);
}

export function freeSecondsRemaining(chat, now = new Date()) {
  if (!chat || chat.freeMinutesRemaining <= 0) return 0;
  if (chat.status === "QUEUED") return chat.freeMinutesRemaining * 60;
  if (chat.status !== "ACTIVE") return 0;
  return Math.max(0, Math.ceil((new Date(chat.lastDeductedAt || chat.startedAt).getTime() + chat.freeMinutesRemaining * MINUTE - now.getTime()) / 1000));
}

export async function serializable(db, operation) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try { return await db.$transaction(operation, { isolationLevel: "Serializable" }); }
    catch (error) { if (error.code !== "P2034" || attempt === 2) throw error; }
  }
}

export async function beginConsultation(db, { userId, astrologerId }, now = new Date()) {
  return serializable(db, async (tx) => {
    const astrologer = await tx.astrologer.findUnique({ where: { id: astrologerId } });
    if (!astrologer || !astrologer.online) return { success: false, error: "Astrologer is unavailable", httpStatus: 400 };
    const user = await tx.user.findUnique({ where: { id: userId }, include: { wallet: true, _count: { select: { chatSessions: true } } } });
    if (!user) return { success: false, error: "User not found", httpStatus: 404 };
    const existing = await tx.chatSession.findFirst({ where: { userId, astrologerId, status: { in: ["ACTIVE", "QUEUED", "PAUSED_FREE"] } } });
    if (existing) return { success: true, chatSessionId: existing.id, freeMinutesRemaining: existing.freeMinutesRemaining, resumed: true };
    const wallet = user.wallet || await tx.wallet.upsert({ where: { userId }, create: { userId, balance: 0 }, update: {} });
    const freeOfferApplied = eligibleForFreeChat(user);
    if (!freeOfferApplied && wallet.balance < astrologer.price) return { success: false, code: "INSUFFICIENT_BALANCE", error: "Please recharge your wallet to start this consultation.", httpStatus: 402 };
    if (freeOfferApplied) {
      const claimed = await tx.user.updateMany({ where: { id: userId, freeChatUsed: false, chatSessions: { none: {} } }, data: { freeChatUsed: true } });
      if (claimed.count !== 1) throw Object.assign(new Error("Offer claim changed; retry"), { code: "P2034" });
    }
    const chat = await tx.chatSession.create({ data: { userId, astrologerId, status: AI_NAMES.has(astrologer.name.toLowerCase().trim()) ? "ACTIVE" : "QUEUED", startedAt: now, walletBalanceAtStart: wallet.balance, freeMinutesRemaining: freeOfferApplied ? FREE_MINUTES : 0 } });
    return { success: true, chatSessionId: chat.id, freeOfferApplied, freeMinutesRemaining: chat.freeMinutesRemaining, walletBalanceAtStart: wallet.balance, astrologerPrice: astrologer.price };
  });
}

export function billingPlan(chat, balance, price, now = new Date(), resume = false) {
  const result = { success: true, balance, deducted: 0, freeSecondsRemaining: freeSecondsRemaining(chat, now), freeMinutesRemaining: chat.freeMinutesRemaining, showFreeRechargePopup: false };
  if (chat.status === "QUEUED") return { result: { ...result, code: "CHAT_QUEUED" } };
  if (chat.status === "PAUSED_FREE") {
    if (resume && balance >= price) return { result, update: { status: "ACTIVE", lastDeductedAt: now } };
    return { result: { ...result, code: "FREE_OFFER_ENDED", paused: true, showFreeRechargePopup: true } };
  }
  if (chat.status !== "ACTIVE") return { result: { ...result, success: false, code: "CHAT_ENDED", chatEnded: true } };
  const cursor = new Date(chat.lastDeductedAt || chat.startedAt).getTime();
  const elapsed = Math.max(0, Math.floor((now.getTime() - cursor) / MINUTE));
  if (chat.freeMinutesRemaining > 0) {
    const consumed = Math.min(elapsed, chat.freeMinutesRemaining);
    const remaining = chat.freeMinutesRemaining - consumed;
    if (!remaining) return { result: { ...result, code: "FREE_OFFER_ENDED", freeMinutesRemaining: 0, freeSecondsRemaining: 0, paused: true, showFreeRechargePopup: true }, update: { status: "PAUSED_FREE", freeMinutesRemaining: 0, lastDeductedAt: new Date(cursor + consumed * MINUTE) } };
    return { result: { ...result, freeMinutesRemaining: remaining }, ...(consumed ? { update: { freeMinutesRemaining: remaining, lastDeductedAt: new Date(cursor + consumed * MINUTE) } } : {}) };
  }
  if (!elapsed) return { result };
  const deducted = Math.min(balance, elapsed * price);
  const newBalance = balance - deducted;
  return { result: { ...result, balance: newBalance, deducted, ...(newBalance <= 0 ? { code: "LOW_BALANCE", chatEnded: true } : {}) }, update: { lastDeductedAt: new Date(cursor + elapsed * MINUTE), ...(newBalance <= 0 ? { status: "ENDED", endedAt: now } : {}) } };
}

export async function billConsultation(db, chatSessionId, { now = new Date(), resume = false } = {}) {
  return serializable(db, async (tx) => {
    const chat = await tx.chatSession.findUnique({ where: { id: chatSessionId }, include: { astrologer: true, user: { include: { wallet: true } } } });
    if (!chat) return { success: false, code: "CHAT_NOT_FOUND", error: "Chat session not found" };
    const wallet = chat.user?.wallet;
    if (!wallet) return { success: false, error: "Wallet not found" };
    const plan = billingPlan(chat, wallet.balance, chat.astrologer.price, now, resume);
    if (plan.result.deducted) await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: plan.result.deducted } } });
    if (plan.update) await tx.chatSession.update({ where: { id: chat.id }, data: plan.update });
    return plan.result;
  });
}
