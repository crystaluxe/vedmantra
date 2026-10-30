import { prisma } from "@/lib/prisma";
import HomeWalletBalance from "@/components/HomeWalletBalance";
import PushNotificationRegister from "@/components/PushNotificationRegister";

const CATEGORIES = [
  {
    key: "money",
    title: "Money",
    subtitle: "Finance, wealth & debt",
    emoji: "💰",
  },
  {
    key: "career",
    title: "Career",
    subtitle: "Job, business & growth",
    emoji: "🚀",
  },
  {
    key: "love",
    title: "Love",
    subtitle: "Relationship & marriage",
    emoji: "❤️",
  },
  {
    key: "women",
    title: "Women Only",
    subtitle: "Family, pregnancy & emotions",
    emoji: "🌸",
  },
];

const AI_ASTROLOGER_NAMES = new Set([
  "guru vashisht",
  "acharya dev",
  "acharya gayatri",
  "pandit somesh",
  "acharya kavya",
  "guru anand",
]);

function normalizeAstrologerName(name = "") {
  return String(name).toLowerCase().trim();
}

function isAiAstrologer(astrologer) {
  return AI_ASTROLOGER_NAMES.has(normalizeAstrologerName(astrologer.name));
}

function removeDuplicateAstrologers(astrologers) {
  return Array.from(
    new Map(
      astrologers.map((astro) => [normalizeAstrologerName(astro.name), astro])
    ).values()
  );
}

function filterAstrologersByCategory(astrologers, category) {
  if (!category) return astrologers;

  const categoryMap = {
    money: ["money", "finance", "business", "wealth", "career", "financial"],
    career: ["career", "job", "business", "education", "exam", "growth"],
    love: ["love", "relationship", "marriage", "family", "compatibility"],
    women: ["women", "pregnancy", "family", "relationship", "emotional", "love"],
  };

  const keywords = categoryMap[category] || [];

  return astrologers.filter((astro) => {
    const text = `${astro.name || ""} ${astro.skills || ""}`.toLowerCase();
    return keywords.some((keyword) => text.includes(keyword));
  });
}


function AstrologerCard({ astro, tag = "" }) {
  return (
    <article className="group rounded-3xl border border-[#E9D9C4] bg-[#FFFDF8] p-5 shadow-[0_12px_35px_rgba(69,15,34,.06)] transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start gap-4">
        <img src={astro.image} alt={astro.name} referrerPolicy="no-referrer" className="h-20 w-20 rounded-2xl border-2 border-[#D4B676] object-cover" />
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#A17A35]">{tag || "Vedic Guidance"}</p>
          <h3 className="truncate text-lg font-bold text-[#4A102A]">{astro.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#76635C]">{astro.skills}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className={astro.online ? "text-emerald-700" : "text-[#947C70]"}>{astro.online ? "● Online" : "● Offline"}</span>
            {astro.rating != null && <span className="text-[#8D682A]">★ {astro.rating}</span>}
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#F0E5D8] pt-4">
        <div><span className="text-xl font-bold text-[#4A102A]">₹{astro.price}</span><span className="text-xs text-[#786B64]"> / min</span></div>
        <a href={`/astrologer/${astro.id}`} className="rounded-full bg-[#650D26] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#44091A]">Chat Now →</a>
      </div>
    </article>
  );
}

const ZODIAC = [
  ["♈", "Aries"], ["♉", "Taurus"], ["♊", "Gemini"], ["♋", "Cancer"],
  ["♌", "Leo"], ["♍", "Virgo"], ["♎", "Libra"], ["♏", "Scorpio"],
  ["♐", "Sagittarius"], ["♑", "Capricorn"], ["♒", "Aquarius"], ["♓", "Pisces"],
];

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const selectedCategory = params?.category || "";
  const astrologersRaw = await prisma.astrologer.findMany({ orderBy: { createdAt: "desc" } });
  const uniqueAstrologers = removeDuplicateAstrologers(astrologersRaw);
  const astrologers = filterAstrologersByCategory(uniqueAstrologers, selectedCategory);
  const aiAstrologers = astrologers.filter(isAiAstrologer);
  const humanAstrologers = astrologers.filter((astro) => !isAiAstrologer(astro));
  return (
    <>
      <PushNotificationRegister />
      <main className="min-h-screen bg-[#F6EFE5] text-[#302321]" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        <div className="border-b border-[#DCC49B] bg-[#4A102A] px-4 py-2 text-center text-[11px] font-semibold tracking-wide text-[#F3DEB0]">✦ Timeless Vedic wisdom, thoughtfully delivered ✦</div>
        <header className="sticky top-0 z-50 border-b border-[#EADBC5] bg-[#FFF9F0]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 lg:px-8">
            <a href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C6A15B] bg-[#650D26] text-2xl text-[#E8D19B]">✺</span>
              <span><span className="block font-serif text-2xl font-bold tracking-tight text-[#650D26]">Vedmantra</span><span className="block text-[9px] font-bold uppercase tracking-[.22em] text-[#A17A35]">Divine Guidance</span></span>
            </a>
            <nav className="order-3 flex w-full items-center justify-between gap-3 overflow-x-auto border-t border-[#EADBC5] pt-3 text-xs font-semibold text-[#650D26] sm:order-none sm:w-auto sm:border-0 sm:pt-0 sm:text-sm">
              <a href="/" className="whitespace-nowrap hover:text-[#B18B43]">Home</a>
              <a href="#astrologers" className="whitespace-nowrap hover:text-[#B18B43]">Astrologers</a>
              <a href="#explore" className="whitespace-nowrap hover:text-[#B18B43]">Explore</a>
              <a href="/chat" className="whitespace-nowrap hover:text-[#B18B43]">My Chats</a>
              <a href="/profile" className="whitespace-nowrap hover:text-[#B18B43]">Profile</a>
            </nav>
            <HomeWalletBalance />
          </div>
        </header>

        <section className="relative isolate overflow-hidden bg-[#4A102A] text-[#FFF9F0]">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 78% 35%, #E8D19B 0, transparent 34%), radial-gradient(circle at 5% 95%, #C6A15B 0, transparent 28%)" }} />
          <div className="pointer-events-none absolute -right-28 top-12 hidden h-[520px] w-[520px] rounded-full border border-[#C6A15B]/40 lg:block" />
          <div className="pointer-events-none absolute -right-14 top-24 hidden h-[410px] w-[410px] rounded-full border border-[#C6A15B]/30 lg:flex items-center justify-center text-[240px] font-serif text-[#C6A15B]/30">✺</div>
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-[1.3fr_.7fr] md:py-28 lg:px-8">
            <div>
              <p className="mb-6 inline-flex items-center rounded-full border border-[#D9BC7B]/50 px-4 py-2 text-[11px] font-bold uppercase tracking-[.22em] text-[#E8D19B]">✦ Welcome to Vedmantra</p>
              <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">Ancient Wisdom.<br /><span className="text-[#E8D19B]">Modern Guidance.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#F1DDE2] md:text-lg">Find perspective on love, career, relationships and life's important questions with personalized Vedic astrology consultations.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#astrologers" className="rounded-full bg-[#E8D19B] px-7 py-4 text-sm font-extrabold text-[#4A102A] shadow-lg transition hover:bg-white">Consult an Astrologer →</a>
                <a href="#explore" className="rounded-full border border-[#E8D19B]/70 px-7 py-4 text-sm font-bold text-[#FFF9F0] transition hover:bg-white/10">Explore Guidance</a>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6 text-sm text-[#EEDFE2]"><span>✧ Personalised Consultations</span><span>✧ Transparent Pricing</span><span>✧ Convenient Online Chat</span></div>
            </div>
            <div className="relative mx-auto flex aspect-square w-full max-w-[380px] items-center justify-center rounded-full border border-[#D9BC7B]/40 bg-[#6A1B37]/40 shadow-[0_0_90px_rgba(232,209,155,.13)]">
              <div className="absolute inset-5 rounded-full border border-dashed border-[#E8D19B]/50" />
              <div className="absolute inset-12 rounded-full border border-[#E8D19B]/40" />
              <div className="text-center"><div className="font-serif text-[120px] leading-none text-[#E8D19B]">✺</div><p className="mt-2 text-xs font-bold uppercase tracking-[.32em] text-[#E8D19B]">Discover Your Path</p></div>
            </div>
          </div>
        </section>

        <section id="explore" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.24em] text-[#A17A35]">Your Journey</p><h2 className="mt-3 font-serif text-3xl font-bold text-[#4A102A] md:text-4xl">What is on your mind?</h2><p className="mt-3 text-sm text-[#786B64]">Choose an area of life to find relevant astrologers.</p></div>{selectedCategory && <a href="/" className="text-sm font-bold text-[#650D26] underline">Clear filter</a>}</div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORIES.map((cat) => <a key={cat.key} href={`/?category=${cat.key}#astrologers`} className={`group rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-xl md:p-7 ${selectedCategory === cat.key ? "border-[#C6A15B] bg-[#650D26] text-white" : "border-[#E9D9C4] bg-[#FFF9F0] text-[#4A102A]"}`}><span className="mb-6 block text-4xl">{cat.emoji}</span><h3 className="text-lg font-extrabold">{cat.title}</h3><p className={`mt-2 text-xs leading-5 ${selectedCategory === cat.key ? "text-[#F3DDE4]" : "text-[#786B64]"}`}>{cat.subtitle}</p><span className="mt-5 block text-xl text-[#C6A15B]">↗</span></a>)}
          </div>
        </section>

        <section id="astrologers" className="bg-[#FFF9F0] py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[.24em] text-[#A17A35]">Expert Guidance</p><h2 className="mt-3 font-serif text-3xl font-bold text-[#4A102A] md:text-4xl">Connect with an Astrologer</h2><p className="mt-3 mb-9 text-sm text-[#786B64]">Browse available profiles and choose the consultation that feels right for you.</p>
            {aiAstrologers.length > 0 && <div className="mb-12"><div className="mb-5 flex items-center gap-3"><h3 className="font-serif text-2xl font-bold text-[#4A102A]">Instant AI Guidance</h3><span className="rounded-full bg-[#F2E4CC] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#650D26]">AI-powered</span></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{aiAstrologers.map(astro => <AstrologerCard key={astro.id} astro={astro} tag="AI Astrologer" />)}</div></div>}
            {humanAstrologers.length > 0 && <div><h3 className="mb-5 font-serif text-2xl font-bold text-[#4A102A]">Astrology Consultants</h3><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{humanAstrologers.map(astro => <AstrologerCard key={astro.id} astro={astro} />)}</div></div>}
            {astrologers.length === 0 && <div className="rounded-3xl border border-[#E9D9C4] bg-white p-10 text-center"><p className="font-bold text-[#4A102A]">No astrologers found for this concern.</p><a href="/#astrologers" className="mt-3 inline-block text-sm font-bold text-[#650D26] underline">View all astrologers</a></div>}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.24em] text-[#A17A35]">Simple & Personal</p><h2 className="mt-3 font-serif text-3xl font-bold text-[#4A102A] md:text-4xl">Your guidance, in three steps</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{[["01","Find your astrologer","Explore profiles and select a consultant."],["02","Prepare your wallet","Add balance securely before your consultation."],["03","Start your conversation","Chat online and explore your questions."]].map(([n,t,d])=><div key={n} className="rounded-3xl border border-[#E9D9C4] bg-[#FFF9F0] p-8"><span className="font-serif text-4xl text-[#C6A15B]">{n}</span><h3 className="mt-5 text-lg font-bold text-[#4A102A]">{t}</h3><p className="mt-3 text-sm leading-6 text-[#786B64]">{d}</p></div>)}</div></section>

        <section className="bg-[#4A102A] px-5 py-16 text-center text-[#FFF9F0]"><p className="text-xs font-bold uppercase tracking-[.24em] text-[#E8D19B]">The Zodiac</p><h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">A universe of possibilities</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#EBD9DF]">Every sign has its own story. Discover guidance tailored to your journey.</p><div className="mx-auto mt-10 grid max-w-5xl grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">{ZODIAC.map(([symbol,name])=><div key={name} className="rounded-2xl border border-[#C6A15B]/35 bg-white/5 p-4"><div className="text-3xl text-[#E8D19B]">{symbol}</div><p className="mt-2 text-xs font-semibold">{name}</p></div>)}</div></section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="flex flex-col items-center justify-between gap-6 rounded-[32px] border border-[#E9D9C4] bg-[#FFF9F0] p-8 md:flex-row md:p-12"><div><p className="text-xs font-bold uppercase tracking-[.24em] text-[#A17A35]">Crystaluxe Mall</p><h2 className="mt-3 font-serif text-3xl font-bold text-[#4A102A]">Bring intention into everyday life.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-[#786B64]">Explore crystals, bracelets and thoughtfully selected spiritual products.</p></div><a href="https://crystaluxe.in" target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full bg-[#650D26] px-7 py-4 text-sm font-bold text-white">Explore Crystaluxe →</a></div></section>
        <footer className="border-t border-[#D9C8AE] bg-[#FFF9F0] px-5 py-9"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm"><span className="font-serif text-2xl font-bold text-[#650D26]">✺ Vedmantra</span><div className="flex flex-wrap gap-5 font-semibold text-[#650D26]"><a href="/">Home</a><a href="/wallet">Wallet</a><a href="/chat">Chats</a><a href="/profile">Profile</a></div><span className="text-xs text-[#786B64]">Vedic wisdom for modern lives.</span></div></footer>
      </main>
    </>
  );
}
