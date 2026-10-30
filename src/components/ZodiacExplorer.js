"use client";

import { useState } from "react";
import SiteDialog from "./SiteDialog";

const SIGNS = [
  { name: "Aries", symbol: "♈", element: "Fire", theme: "Courage & initiative", reflection: "Where could one small, confident step help you move forward? Balance the urge to act with a moment to listen.", question: "How can I approach a new beginning with more clarity?" },
  { name: "Taurus", symbol: "♉", element: "Earth", theme: "Stability & patience", reflection: "Consider what makes you feel grounded. A steady routine can support progress, while a little flexibility can make room for something new.", question: "What would help me build a more secure foundation?" },
  { name: "Gemini", symbol: "♊", element: "Air", theme: "Curiosity & communication", reflection: "Make space for a conversation you have been putting off. Ask a thoughtful question, listen closely, and give your ideas a clear direction.", question: "How can I communicate my needs more clearly?" },
  { name: "Cancer", symbol: "♋", element: "Water", theme: "Care & belonging", reflection: "Notice where you give your emotional energy. Caring for others and protecting your own boundaries can exist together.", question: "How can I balance family responsibilities with my own needs?" },
  { name: "Leo", symbol: "♌", element: "Fire", theme: "Expression & confidence", reflection: "Think about something you would like to create or share. Let confidence come from doing meaningful work, rather than waiting for recognition.", question: "Where can I express myself with greater confidence?" },
  { name: "Virgo", symbol: "♍", element: "Earth", theme: "Purpose & practical progress", reflection: "Choose one manageable improvement instead of trying to perfect everything. A useful next step is often more valuable than a flawless plan.", question: "What practical changes could support my career and routines?" },
  { name: "Libra", symbol: "♎", element: "Air", theme: "Balance & connection", reflection: "Reflect on whether a relationship feels balanced. Honest, kind communication can help you make room for both your needs and someone else's.", question: "How can I bring more balance to my relationships?" },
  { name: "Scorpio", symbol: "♏", element: "Water", theme: "Depth & transformation", reflection: "Consider a pattern you are ready to leave behind. You can take time to understand your feelings before deciding what should change.", question: "How can I navigate a period of personal change?" },
  { name: "Sagittarius", symbol: "♐", element: "Fire", theme: "Discovery & perspective", reflection: "Explore an idea beyond your usual routine. Keep your wider ambitions in view while choosing a realistic next step toward them.", question: "What direction would help me grow and find purpose?" },
  { name: "Capricorn", symbol: "♑", element: "Earth", theme: "Commitment & direction", reflection: "Look at a long-term goal and the demands it places on you. Sustainable progress includes rest, realistic milestones, and support.", question: "How can I align my career goals with a sustainable pace?" },
  { name: "Aquarius", symbol: "♒", element: "Air", theme: "Originality & community", reflection: "Think about where your ideas could help others. Share a fresh perspective while staying open to what your community can teach you.", question: "How can I make space for new ideas and meaningful connections?" },
  { name: "Pisces", symbol: "♓", element: "Water", theme: "Imagination & compassion", reflection: "Give yourself space to reflect, create, or recharge. Pair a feeling or inspiration with a small, practical action you can take.", question: "How can I balance my intuition with practical decisions?" },
];

export default function ZodiacExplorer() {
  const [selected, setSelected] = useState(null);
  return (
    <section id="zodiac" aria-labelledby="zodiac-title" className="bg-[#4A102A] px-5 py-16 text-center text-[#FFF9F0]">
      <p className="text-xs font-semibold uppercase tracking-[.24em] text-[#E8D19B]">The Zodiac</p>
      <h2 id="zodiac-title" className="mt-3 font-display text-3xl font-semibold md:text-4xl">A universe of possibilities</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#EBD9DF]">Choose your sign to explore its themes and find inspiration for your next conversation.</p>
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {SIGNS.map((sign) => <button key={sign.name} type="button" aria-label={`Explore ${sign.name}`} aria-haspopup="dialog" onClick={() => setSelected(sign)} className="group cursor-pointer rounded-2xl border border-[#C6A15B]/35 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-[#E8D19B] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E8D19B] motion-reduce:transform-none motion-reduce:transition-none"><span aria-hidden="true" className="block text-3xl text-[#E8D19B]">{sign.symbol}{"\uFE0E"}</span><span className="mt-2 block text-xs font-semibold">{sign.name}</span><span aria-hidden="true" className="mt-2 block text-[10px] text-[#E8D19B]/70 group-hover:text-[#E8D19B]">Explore →</span></button>)}
      </div>
      {selected && <SiteDialog title={selected.name} onDismiss={() => setSelected(null)}>
        <span aria-hidden="true" className="text-4xl text-[#650D26]">{selected.symbol}{"\uFE0E"}</span>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#997345]">{selected.element} · {selected.theme}</p>
        <h3 className="mt-5 text-base font-semibold">A moment of reflection</h3>
        <p className="mt-2 text-sm leading-7 text-[#806B70]">{selected.reflection}</p>
        <div className="mt-5 rounded-2xl border border-[#E8D7DC] bg-[#FAF1F4] p-4 text-left"><p className="text-[10px] font-semibold uppercase tracking-wider text-[#997345]">A question to explore</p><p className="mt-2 text-sm leading-6 text-[#650D26]">{selected.question}</p></div>
        <p className="mt-4 text-[11px] leading-5 text-[#A08B90]">General zodiac inspiration. For a personal reading based on your birth details, consult an astrologer.</p>
        <a href="#astrologers" onClick={() => setSelected(null)} className="mt-5 block rounded-full bg-[#650D26] px-5 py-4 text-sm font-semibold text-white hover:bg-[#44091A]">Consult an astrologer →</a>
        <button type="button" onClick={() => setSelected(null)} className="mt-2 rounded-full px-5 py-3 text-sm font-medium text-[#806B70]">Explore another sign</button>
      </SiteDialog>}
    </section>
  );
}
