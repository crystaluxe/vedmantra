import test from "node:test";
import assert from "node:assert/strict";
import { eligibleForFreeChat, billingPlan, freeSecondsRemaining, beginConsultation, billConsultation, serializable } from "../src/lib/consultation-billing.js";

const start = new Date("2026-11-02T00:00:00Z");
const at = (seconds) => new Date(start.getTime() + seconds * 1000);
const trial = { id: 1, status: "ACTIVE", startedAt: start, lastDeductedAt: null, freeMinutesRemaining: 5 };

test("only first-time consultants qualify, including existing accounts with no chats", () => {
  assert.equal(eligibleForFreeChat({ freeChatUsed: false, _count: { chatSessions: 0 } }), true);
  assert.equal(eligibleForFreeChat({ freeChatUsed: false, _count: { chatSessions: 1 } }), false);
  assert.equal(eligibleForFreeChat({ freeChatUsed: true, _count: { chatSessions: 0 } }), false);
  assert.equal(eligibleForFreeChat(null), false);
});
test("zero wallet receives the full 300 seconds without any charge", () => {
  for (const seconds of [0, 59, 60, 119, 240, 299]) {
    const { result } = billingPlan(trial, 0, 25, at(seconds));
    assert.equal(result.deducted, 0);
    assert.equal(result.showFreeRechargePopup, false);
    assert.equal(result.freeSecondsRemaining, 300 - seconds);
  }
});
test("at exactly five minutes pause and request recharge, without debiting funded wallet", () => {
  for (const seconds of [300, 301, 3600]) {
    const { result, update } = billingPlan(trial, 100, 25, at(seconds));
    assert.equal(update.status, "PAUSED_FREE");
    assert.equal(result.showFreeRechargePopup, true);
    assert.equal(result.balance, 100);
    assert.equal(result.deducted, 0);
  }
});
test("waiting for a human does not consume the offer", () => {
  const queued = { ...trial, status: "QUEUED" };
  assert.equal(freeSecondsRemaining(queued, at(3600)), 300);
  assert.equal(billingPlan(queued, 0, 25, at(3600)).result.code, "CHAT_QUEUED");
});
test("minute checkpoints retain seconds rather than resetting the clock", () => {
  const first = billingPlan(trial, 0, 25, at(65));
  assert.equal(first.update.lastDeductedAt.getTime(), at(60).getTime());
  const next = { ...trial, ...first.update };
  assert.equal(freeSecondsRemaining(next, at(299)), 1);
  assert.equal(billingPlan(next, 0, 25, at(300)).result.code, "FREE_OFFER_ENDED");
});
test("paid users never receive the promotional recharge popup", () => {
  const paid = { ...trial, freeMinutesRemaining: 0 };
  const result = billingPlan(paid, 25, 25, at(60)).result;
  assert.equal(result.deducted, 25);
  assert.equal(result.code, "LOW_BALANCE");
  assert.equal(result.showFreeRechargePopup, false);
});
test("recharge resumes the same session, with no charge for paused time", () => {
  const paused = { ...trial, status: "PAUSED_FREE", freeMinutesRemaining: 0 };
  assert.equal(billingPlan(paused, 0, 25, at(3600), true).result.paused, true);
  assert.equal(billingPlan(paused, 100, 25, at(3600)).result.paused, true);
  const resumed = billingPlan(paused, 100, 25, at(3600), true);
  assert.equal(resumed.update.status, "ACTIVE");
  assert.equal(resumed.result.deducted, 0);
  assert.equal(billingPlan({ ...paused, ...resumed.update }, 100, 25, at(3659)).result.deducted, 0);
  assert.equal(billingPlan({ ...paused, ...resumed.update }, 100, 25, at(3660)).result.deducted, 25);
});
test("transaction conflicts retry, other errors do not", async () => {
  let calls = 0;
  const db = { $transaction: async () => { if (++calls < 3) throw { code: "P2034" }; return "ok"; } };
  assert.equal(await serializable(db, () => {}), "ok");
  assert.equal(calls, 3);
  await assert.rejects(serializable({ $transaction: async () => { throw new Error("offline"); } }, () => {}), /offline/);
});

function fakeDatabase({ history = 0, balance = 0 } = {}) {
  const chats = [];
  const wallet = { id: 1, balance };
  const user = { id: 1, freeChatUsed: false, wallet, _count: { chatSessions: history } };
  const astro = { id: 22, name: "Guru Vashisht", online: true, price: 5 };
  const tx = {
    user: { findUnique: async () => user, updateMany: async () => { if (user.freeChatUsed || user._count.chatSessions) return { count: 0 }; user.freeChatUsed = true; return { count: 1 }; } },
    astrologer: { findUnique: async () => astro },
    wallet: { update: async ({ data }) => { wallet.balance -= data.balance.decrement; return wallet; } },
    chatSession: {
      findFirst: async () => chats.find(c => ["ACTIVE", "QUEUED", "PAUSED_FREE"].includes(c.status)),
      create: async ({ data }) => { const chat = { id: chats.length + 1, lastDeductedAt: null, ...data }; chats.push(chat); user._count.chatSessions++; return chat; },
      findUnique: async () => chats[0] ? { ...chats[0], astrologer: astro, user } : null,
      update: async ({ data }) => Object.assign(chats[0], data),
    },
  };
  return { db: { $transaction: async fn => fn(tx) }, chats, user, wallet };
}
test("first consultation starts free at zero balance; repeat start reuses it", async () => {
  const { db, chats, user } = fakeDatabase();
  const first = await beginConsultation(db, { userId: 1, astrologerId: 22 }, start);
  assert.equal(first.freeOfferApplied, true);
  assert.equal(first.freeMinutesRemaining, 5);
  const repeat = await beginConsultation(db, { userId: 1, astrologerId: 22 }, at(10));
  assert.equal(repeat.chatSessionId, first.chatSessionId);
  assert.equal(chats.length, 1);
  assert.equal(user.freeChatUsed, true);
});
test("prior history cannot obtain another free consultation", async () => {
  const { db, chats } = fakeDatabase({ history: 1 });
  assert.equal((await beginConsultation(db, { userId: 1, astrologerId: 22 }, start)).code, "INSUFFICIENT_BALANCE");
  assert.equal(chats.length, 0);
});
test("service survives reload/repeated billing calls and expires once without wallet charges", async () => {
  const { db, chats, wallet } = fakeDatabase();
  await beginConsultation(db, { userId: 1, astrologerId: 22 }, start);
  for (const seconds of [59, 65, 65, 122, 180, 241, 299]) assert.equal((await billConsultation(db, 1, { now: at(seconds) })).deducted, 0);
  assert.equal((await billConsultation(db, 1, { now: at(300) })).code, "FREE_OFFER_ENDED");
  assert.equal(chats[0].status, "PAUSED_FREE");
  wallet.balance = 99;
  await billConsultation(db, 1, { now: at(3600), resume: true });
  assert.equal((await billConsultation(db, 1, { now: at(3660) })).deducted, 5);
  assert.equal((await billConsultation(db, 1, { now: at(3660) })).deducted, 0);
  assert.equal(wallet.balance, 94);
});
