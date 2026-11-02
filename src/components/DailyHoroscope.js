"use client";

import { useEffect, useState } from "react";
import { HOROSCOPE_SIGNS, indiaDate, validHoroscopeSign } from "@/lib/daily-horoscope";

export default function DailyHoroscope() {
  const [sign, setSign] = useState("aries");
  const [date, setDate] = useState("");
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const selected = HOROSCOPE_SIGNS.find(([id]) => id === sign);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vedmantra-horoscope-sign");
      if (validHoroscopeSign(saved)) setSign(saved);
    } catch { /* Browsing remains available when storage is disabled. */ }
    setDate(indiaDate());
    const timer = setInterval(() => setDate(indiaDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setReading(null);
    fetch(`/api/horoscope/daily?sign=${sign}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Unable to load today's reading.");
        if (!controller.signal.aborted) setReading(data);
      })
      .catch(err => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [sign, date, retry]);

  function chooseSign(id) {
    if (id === sign) return;
    setLoading(true);
    setReading(null);
    setError("");
    setSign(id);
    try { localStorage.setItem("vedmantra-horoscope-sign", id); } catch { /* Optional preference only. */ }
  }

  return (
    <section id="daily-horoscope" aria-labelledby="horoscope-title" className="border-y border-[#EADDE1] bg-[#FFFCF8] px-5 py-12 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#A17A35]">A little perspective, every day</p><h2 id="horoscope-title" className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#4A102A] md:text-4xl">Your daily horoscope</h2><p className="mt-3 text-sm leading-7 text-[#806B70]">Choose your sun sign for today’s reading.</p></div><span className="rounded-full border border-[#EADDE1] bg-white px-4 py-2 text-xs text-[#806B70]">{date ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${date}T12:00:00+05:30`)) : "Daily readings"}</span></div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
          <div role="group" aria-label="Choose your zodiac sign" className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
            {HOROSCOPE_SIGNS.map(([id, name, symbol]) => <button key={id} type="button" aria-pressed={sign === id} onClick={() => chooseSign(id)} className={`min-h-24 rounded-2xl border p-3 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#650D26] ${sign === id ? "border-[#650D26] bg-[#650D26] text-white shadow-sm" : "border-[#EADDE1] bg-white text-[#650D26] hover:border-[#BA8C9B] hover:bg-[#FAF1F4]"}`}><span aria-hidden="true" className="block text-2xl">{symbol}{"\uFE0E"}</span><span className="mt-2 block text-xs font-medium">{name}</span></button>)}
          </div>
          <article aria-labelledby="selected-horoscope-title" aria-busy={loading} className="flex min-h-80 flex-col rounded-[28px] border border-[#EADDE1] bg-[linear-gradient(135deg,#FFFFFF,#FAF0F3)] p-6 sm:p-8">
            <div className="flex items-center gap-4"><span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F1DFE6] text-4xl text-[#650D26]">{selected[2]}{"\uFE0E"}</span><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#A17A35]">Today’s reading</p><h3 id="selected-horoscope-title" className="mt-1 font-display text-2xl font-semibold text-[#4A102A]">{selected[1]}</h3></div></div>
            <div className="mt-6 flex-1" aria-live="polite" aria-atomic="true">
              {loading ? <p role="status" className="text-sm leading-8 text-[#806B70]">Finding today’s perspective for {selected[1]}…</p> : error ? <div><p className="text-sm leading-7 text-[#806B70]">{error}</p><button type="button" onClick={() => setRetry(value => value + 1)} className="mt-4 rounded-full border border-[#DFC7D0] bg-white px-5 py-3 text-xs font-semibold text-[#650D26] hover:bg-[#FAF1F4]">Try again</button></div> : <p className="text-sm leading-8 text-[#6E5960]">{reading?.reading}</p>}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#EADDE1] pt-5"><p className="max-w-56 text-[10px] leading-5 text-[#A08B90]">General sun-sign guidance. For a personal reading, share your birth details with an astrologer.</p><a href="#astrologers" className="rounded-full bg-[#650D26] px-5 py-3 text-xs font-semibold text-white hover:bg-[#44091A]">Get personal guidance →</a></div>
          </article>
        </div>
        <a href="https://freehoroscopeapi.com" target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-[10px] text-[#A08B90] underline underline-offset-4 hover:text-[#650D26]">Powered by FreeHoroscopeAPI</a>
      </div>
    </section>
  );
}
