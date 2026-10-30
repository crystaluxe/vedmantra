import { prisma } from "@/lib/prisma";
import HomeHero from "@/components/HomeHero";
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
      <main className="min-h-screen bg-[#F6EFE5] text-[#302321]">
        <header className="sticky top-0 z-50 border-b border-[#EEE9D9] bg-[#FFFEF7]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-4 lg:px-8">
            <a href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E6D536] bg-[#F8ED6C] text-2xl text-[#302719]">✺</span>
              <span><span className="block font-display text-2xl font-semibold tracking-tight text-[#650D26]">Vedmantra</span><span className="block text-[9px] font-bold uppercase tracking-[.22em] text-[#A17A35]">Divine Guidance</span></span>
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

        <HomeHero astrologers={uniqueAstrologers.map((astro) => ({ ...astro, isAi: isAiAstrologer(astro) }))} />

        <section id="explore" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.24em] text-[#A17A35]">Your Journey</p><h2 className="mt-3 font-display text-3xl font-semibold text-[#4A102A] md:text-4xl">What is on your mind?</h2><p className="mt-3 text-sm text-[#786B64]">Choose an area of life to find relevant astrologers.</p></div>{selectedCategory && <a href="/" className="text-sm font-bold text-[#650D26] underline">Clear filter</a>}</div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORIES.map((cat) => <a key={cat.key} href={`/?category=${cat.key}#astrologers`} className={`group rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-xl md:p-7 ${selectedCategory === cat.key ? "border-[#C6A15B] bg-[#650D26] text-white" : "border-[#E9D9C4] bg-[#FFF9F0] text-[#4A102A]"}`}><span className="mb-6 block text-4xl">{cat.emoji}</span><h3 className="text-lg font-extrabold">{cat.title}</h3><p className={`mt-2 text-xs leading-5 ${selectedCategory === cat.key ? "text-[#F3DDE4]" : "text-[#786B64]"}`}>{cat.subtitle}</p><span className="mt-5 block text-xl text-[#C6A15B]">↗</span></a>)}
          </div>
        </section>

        <section id="astrologers" className="bg-[#FFF9F0] py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[.24em] text-[#A17A35]">Expert Guidance</p><h2 className="mt-3 font-display text-3xl font-semibold text-[#4A102A] md:text-4xl">Connect with an Astrologer</h2><p className="mt-3 mb-9 text-sm text-[#786B64]">Browse available profiles and choose the consultation that feels right for you.</p>
            {aiAstrologers.length > 0 && <div className="mb-12"><div className="mb-5 flex items-center gap-3"><h3 className="font-display text-2xl font-semibold text-[#4A102A]">Instant AI Guidance</h3><span className="rounded-full bg-[#F2E4CC] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#650D26]">AI-powered</span></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{aiAstrologers.map(astro => <AstrologerCard key={astro.id} astro={astro} tag="AI Astrologer" />)}</div></div>}
            {humanAstrologers.length > 0 && <div><h3 className="mb-5 font-display text-2xl font-semibold text-[#4A102A]">Astrology Consultants</h3><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{humanAstrologers.map(astro => <AstrologerCard key={astro.id} astro={astro} />)}</div></div>}
            {astrologers.length === 0 && <div className="rounded-3xl border border-[#E9D9C4] bg-white p-10 text-center"><p className="font-bold text-[#4A102A]">No astrologers found for this concern.</p><a href="/#astrologers" className="mt-3 inline-block text-sm font-bold text-[#650D26] underline">View all astrologers</a></div>}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.24em] text-[#A17A35]">Simple & Personal</p><h2 className="mt-3 font-display text-3xl font-semibold text-[#4A102A] md:text-4xl">Your guidance, in three steps</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{[["01","Find your astrologer","Explore profiles and select a consultant."],["02","Prepare your wallet","Add balance securely before your consultation."],["03","Start your conversation","Chat online and explore your questions."]].map(([n,t,d])=><div key={n} className="rounded-3xl border border-[#E9D9C4] bg-[#FFF9F0] p-8"><span className="font-display text-4xl text-[#C6A15B]">{n}</span><h3 className="mt-5 text-lg font-bold text-[#4A102A]">{t}</h3><p className="mt-3 text-sm leading-6 text-[#786B64]">{d}</p></div>)}</div></section>

        <section className="bg-[#4A102A] px-5 py-16 text-center text-[#FFF9F0]"><p className="text-xs font-bold uppercase tracking-[.24em] text-[#E8D19B]">The Zodiac</p><h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">A universe of possibilities</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#EBD9DF]">Every sign has its own story. Discover guidance tailored to your journey.</p><div className="mx-auto mt-10 grid max-w-5xl grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">{ZODIAC.map(([symbol,name])=><div key={name} className="rounded-2xl border border-[#C6A15B]/35 bg-white/5 p-4"><div className="text-3xl text-[#E8D19B]">{symbol}</div><p className="mt-2 text-xs font-semibold">{name}</p></div>)}</div></section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="flex flex-col items-center justify-between gap-6 rounded-[32px] border border-[#E9D9C4] bg-[#FFF9F0] p-8 md:flex-row md:p-12"><div><p className="text-xs font-bold uppercase tracking-[.24em] text-[#A17A35]">Crystaluxe Mall</p><h2 className="mt-3 font-display text-3xl font-semibold text-[#4A102A]">Bring intention into everyday life.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-[#786B64]">Explore crystals, bracelets and thoughtfully selected spiritual products.</p></div><a href="https://crystaluxe.in" target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full bg-[#650D26] px-7 py-4 text-sm font-bold text-white">Explore Crystaluxe →</a></div></section>
        <footer className="border-t border-[#D9C8AE] bg-[#FFF9F0] px-5 py-9"><div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 text-sm"><span className="font-display text-2xl font-semibold text-[#650D26]">✺ Vedmantra</span><div className="flex flex-wrap gap-5 font-semibold text-[#650D26]"><a href="/">Home</a><a href="/wallet">Wallet</a><a href="/chat">Chats</a><a href="/profile">Profile</a></div><span className="text-xs text-[#786B64]">Vedic wisdom for modern lives.</span></div></footer>
      </main>
    </>
  );
}
