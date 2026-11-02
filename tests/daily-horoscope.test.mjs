import test from "node:test";
import assert from "node:assert/strict";
import { indiaDate, parseDailyHoroscope, validHoroscopeSign, HOROSCOPE_SIGNS } from "../src/lib/daily-horoscope.js";
const payload = { data: { sign: "Aries", period: "daily", date: "2026-11-02", horoscope: "Take a little time to reflect before choosing your next step." } };
test("uses India midnight for daily rollover", () => {
  assert.equal(indiaDate(new Date("2026-11-01T18:29:59Z")), "2026-11-01");
  assert.equal(indiaDate(new Date("2026-11-01T18:30:00Z")), "2026-11-02");
});
test("all twelve signs are supported; arbitrary inputs are rejected", () => {
  assert.equal(HOROSCOPE_SIGNS.length, 12);
  for (const [id] of HOROSCOPE_SIGNS) assert.equal(validHoroscopeSign(id), true);
  for (const id of [null, "", "../admin", "unknown"]) assert.equal(validHoroscopeSign(id), false);
});
test("validates sign, reading, date and daily period", () => {
  assert.equal(parseDailyHoroscope(payload, "aries", "2026-11-02").reading, payload.data.horoscope);
  for (const change of [{ sign: "Taurus" }, { date: "2026-11-01" }, { period: "weekly" }, { horoscope: "" }, { horoscope: null }]) assert.throws(() => parseDailyHoroscope({ data: { ...payload.data, ...change } }, "aries", "2026-11-02"));
  assert.throws(() => parseDailyHoroscope(null, "aries", "2026-11-02"));
});
