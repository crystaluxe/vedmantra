import { indiaDate, parseDailyHoroscope, validHoroscopeSign } from "@/lib/daily-horoscope";

export async function GET(request) {
  const sign = new URL(request.url).searchParams.get("sign")?.toLowerCase() || "aries";
  if (!validHoroscopeSign(sign)) return Response.json({ success: false, error: "Choose a valid zodiac sign." }, { status: 400 });
  try {
    const response = await fetch(`https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${sign}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error("Feed unavailable");
    const data = parseDailyHoroscope(await response.json(), sign, indiaDate());
    return Response.json({ success: true, ...data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ success: false, error: "Today's reading is temporarily unavailable. Please try again shortly." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
