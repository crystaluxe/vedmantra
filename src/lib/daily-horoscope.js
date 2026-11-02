export const HOROSCOPE_SIGNS = [
  ["aries", "Aries", "♈"], ["taurus", "Taurus", "♉"], ["gemini", "Gemini", "♊"],
  ["cancer", "Cancer", "♋"], ["leo", "Leo", "♌"], ["virgo", "Virgo", "♍"],
  ["libra", "Libra", "♎"], ["scorpio", "Scorpio", "♏"], ["sagittarius", "Sagittarius", "♐"],
  ["capricorn", "Capricorn", "♑"], ["aquarius", "Aquarius", "♒"], ["pisces", "Pisces", "♓"],
];

export function indiaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = type => parts.find(part => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function validHoroscopeSign(sign) {
  return HOROSCOPE_SIGNS.some(([id]) => id === sign);
}

export function parseDailyHoroscope(payload, sign, date = indiaDate()) {
  const data = payload?.data;
  if (!validHoroscopeSign(sign) || data?.period !== "daily" || data?.sign?.toLowerCase() !== sign || data?.date !== date || typeof data?.horoscope !== "string" || data.horoscope.trim().length < 20 || data.horoscope.length > 8000) throw new Error("Today's reading is not available yet.");
  return { sign, date: data.date, reading: data.horoscope.trim() };
}
