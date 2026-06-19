import { prisma } from "@/lib/prisma";
import AuthGuard from "@/components/AuthGuard";
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

function AstrologerCard({ astro, index, carousel = false, tag = "" }) {
  return (
    <div
      className={`bg-[#FFFDF9] rounded-[24px] p-3.5 shadow-sm border border-[#E8DCCB] transition-all duration-300 relative overflow-hidden ${
        carousel ? "min-w-[82%] snap-start" : ""
      }`}
      style={{
        animation: `premiumFloat ${5 + index * 0.18}s ease-in-out infinite`,
      }}
    >
      <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-[#C99055]/10 blur-xl" />

      <div className="flex gap-3 relative z-10">
        <img
          src={astro.image}
          alt={astro.name}
          referrerPolicy="no-referrer"
          className="w-16 h-16 rounded-2xl object-cover border border-[#E5D5C2]"
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-[16px] font-extrabold tracking-[-0.02em] truncate">
                  {astro.name}
                </h2>

                {tag && (
                  <span className="shrink-0 text-[9px] uppercase tracking-[0.12em] bg-[#F4E9DC] text-[#6F452B] border border-[#E5D5C2] rounded-full px-2 py-0.5 font-extrabold">
                    {tag}
                  </span>
                )}
              </div>

              <p className="text-[12px] text-[#7B5A43] mt-1 font-semibold line-clamp-1">
                {astro.skills}
              </p>
            </div>

            <span className="text-[#5A2A18] text-[13px] font-extrabold whitespace-nowrap">
              ₹{astro.price}/min
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p
              className={`text-[12px] font-bold ${
                astro.online ? "text-green-600" : "text-red-500"
              }`}
            >
              {astro.online ? "● Online" : "● Offline"}
            </p>

            <p className="text-[12px] font-bold text-[#6F452B]">
              ★ {astro.rating}
            </p>
          </div>
        </div>
      </div>

      <a
        href={`/astrologer/${astro.id}`}
        className="relative z-10 block w-full mt-3 bg-[#24110A] text-white rounded-xl py-2.5 font-bold text-center text-[14px]"
      >
        Chat Now
      </a>
    </div>
  );
}

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const selectedCategory = resolvedSearchParams?.category || "";

  const astrologersRaw = await prisma.astrologer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const uniqueAstrologers = removeDuplicateAstrologers(astrologersRaw);
  const astrologers = filterAstrologersByCategory(
    uniqueAstrologers,
    selectedCategory
  );
  const aiAstrologers = astrologers.filter(isAiAstrologer);
  const humanAstrologers = astrologers.filter((astro) => !isAiAstrologer(astro));
  const eliteAstrologerIds = new Set(
    humanAstrologers.slice(0, 3).map((astro) => astro.id)
  );
  const sortedHumanAstrologers = [
    ...humanAstrologers.filter((astro) => eliteAstrologerIds.has(astro.id)),
    ...humanAstrologers.filter((astro) => !eliteAstrologerIds.has(astro.id)),
  ];

  return (
    <AuthGuard>
      <PushNotificationRegister />

      <main
        className="min-h-screen bg-[#ECE0D2] text-[#1F130D]"
        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
      >
        <div className="max-w-md mx-auto min-h-screen relative overflow-hidden bg-[#FAF6EF]">
          <style>{`
            @keyframes premiumFloat {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-4px) scale(1.01); }
            }

            @keyframes softShine {
              0% { transform: translateX(-120%); opacity: 0; }
              35% { opacity: 0.45; }
              100% { transform: translateX(180%); opacity: 0; }
            }

            @keyframes cardGlow {
              0%, 100% { box-shadow: 0 10px 30px rgba(43, 22, 14, 0.08); }
              50% { box-shadow: 0 18px 44px rgba(43, 22, 14, 0.15); }
            }

            .premium-float {
              animation: premiumFloat 4.8s ease-in-out infinite;
            }

            .premium-glow {
              animation: cardGlow 4.2s ease-in-out infinite;
            }

            .shine-layer::after {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              width: 42%;
              background: linear-gradient(110deg, transparent, rgba(255,255,255,0.25), transparent);
              animation: softShine 4.2s ease-in-out infinite;
            }
          `}</style>

          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#B68455]/20 rounded-full blur-3xl premium-float" />
          <div className="absolute top-80 -left-28 w-72 h-72 bg-[#4E2617]/10 rounded-full blur-3xl premium-float" />

          <header className="sticky top-0 z-50 px-4 pt-4 pb-4 bg-[#FFFDF9]/90 backdrop-blur-xl border-b border-[#E6D7C5]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#8A5A35] font-bold">
                  Divine Guidance
                </p>

                <h1 className="text-[28px] font-extrabold tracking-[-0.04em] text-[#24110A]">
                  Vedmantra
                </h1>
              </div>

              <HomeWalletBalance />
            </div>

            <nav className="grid grid-cols-4 gap-2 text-[12px] font-bold mt-4">
              <a
                href="/"
                className="bg-[#2B1510] text-white rounded-full py-2.5 shadow-sm text-center"
              >
                Home
              </a>

              <a
                href="/wallet"
                className="bg-[#F4E9DC] border border-[#E5D5C2] text-[#6F452B] rounded-full py-2.5 text-center"
              >
                Wallet
              </a>

              <a
                href="/chat"
                className="bg-[#F4E9DC] border border-[#E5D5C2] text-[#6F452B] rounded-full py-2.5 text-center"
              >
                Chat
              </a>

              <a
                href="/profile"
                className="bg-[#F4E9DC] border border-[#E5D5C2] text-[#6F452B] rounded-full py-2.5 text-center"
              >
                Profile
              </a>
            </nav>
          </header>

          <section className="relative z-10 px-4 pt-5">
            <div className="rounded-[30px] bg-[#2B160E] text-white p-5 shadow-xl overflow-hidden relative shine-layer premium-glow">
              <div className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-[#D9A66B]/25 blur-2xl premium-float" />

              <p className="text-[11px] uppercase tracking-[0.22em] text-[#D8BFA8] font-bold">
                Live Astrology
              </p>

              <h2 className="text-[29px] leading-[1.1] mt-3 font-extrabold tracking-[-0.035em]">
                Get clarity from trusted astrologers
              </h2>

              <p className="text-[14px] text-[#E7D4C1] mt-3 leading-6 font-medium">
                Instant guidance for money, career, love, marriage, kundli and
                important life decisions.
              </p>

              <div className="grid grid-cols-3 gap-2 mt-5">
                <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
                  <p className="text-lg font-extrabold">24x7</p>
                  <p className="text-[10px] text-[#D8BFA8] font-bold">
                    Online
                  </p>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
                  <p className="text-lg font-extrabold">
                    {uniqueAstrologers.length}+
                  </p>
                  <p className="text-[10px] text-[#D8BFA8] font-bold">
                    Experts
                  </p>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
                  <p className="text-lg font-extrabold">₹5</p>
                  <p className="text-[10px] text-[#D8BFA8] font-bold">
                    Starting
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative z-10 px-4 mt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A5A35] font-bold">
                  Choose Concern
                </p>
                <h3 className="text-[22px] font-extrabold tracking-[-0.035em] text-[#24110A]">
                  What do you need help with?
                </h3>
              </div>

              {selectedCategory && (
                <a
                  href="/"
                  className="text-[11px] font-bold text-[#7A4A2A] underline"
                >
                  Clear
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((category, index) => {
                const active = selectedCategory === category.key;

                return (
                  <a
                    key={category.key}
                    href={`/?category=${category.key}`}
                    className={`rounded-[26px] p-4 min-h-[142px] border shadow-sm transition-all duration-300 active:scale-95 relative overflow-hidden ${
                      active
                        ? "bg-[#2B160E] text-white border-[#2B160E] premium-glow"
                        : "bg-[#FFFDF9] text-[#24110A] border-[#E8DCCB]"
                    }`}
                    style={{
                      animation: `premiumFloat ${
                        4.4 + index * 0.25
                      }s ease-in-out infinite`,
                    }}
                  >
                    <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-[#C99055]/15 blur-xl" />

                    <div className="text-2xl mb-3">{category.emoji}</div>

                    <p className="text-[16px] font-extrabold tracking-[-0.02em]">
                      {category.title}
                    </p>

                    <p
                      className={`text-[11px] mt-1 leading-4 font-semibold ${
                        active ? "text-[#E7D4C1]" : "text-[#7B5A43]"
                      }`}
                    >
                      {category.subtitle}
                    </p>
                  </a>
                );
              })}
            </div>
          </section>

          <section className="relative z-10 px-4 mt-5">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A5A35] font-bold">
                  Available Now
                </p>

                <h3 className="text-[24px] font-extrabold tracking-[-0.035em] text-[#24110A]">
                  Astrologers
                </h3>
              </div>

              <span className="text-[11px] bg-[#EAF7E9] text-green-700 px-3 py-1 rounded-full font-bold border border-green-200">
                Live
              </span>
            </div>

            {aiAstrologers.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[18px] font-extrabold tracking-[-0.03em] text-[#24110A]">
                    AI Astrologers
                  </h4>

                  <span className="text-[10px] uppercase tracking-[0.14em] bg-[#F4E9DC] text-[#6F452B] px-3 py-1 rounded-full font-extrabold border border-[#E5D5C2]">
                    AI
                  </span>
                </div>

                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4">
                  {aiAstrologers.map((astro, index) => (
                    <AstrologerCard
                      key={astro.id}
                      astro={astro}
                      index={index}
                      tag="AI Astrologer"
                      carousel
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {sortedHumanAstrologers.length > 0 ? (
                sortedHumanAstrologers.map((astro, index) => (
                  <AstrologerCard
                    key={astro.id}
                    astro={astro}
                    index={index}
                    tag={eliteAstrologerIds.has(astro.id) ? "Elite" : ""}
                  />
                ))
              ) : astrologers.length === 0 ? (
                <div className="bg-[#FFFDF9] rounded-[24px] p-5 border border-[#E8DCCB] text-center">
                  <p className="font-bold text-[#24110A]">
                    No astrologers found for this concern.
                  </p>
                  <a
                    href="/"
                    className="inline-block mt-3 text-sm font-bold text-[#8A5A35] underline"
                  >
                    View all astrologers
                  </a>
                </div>
              ) : null}
            </div>
          </section>

          <section className="relative z-10 px-4 mt-6 pb-10">
            <a
              href="https://crystaluxe.in"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[28px] bg-gradient-to-br from-[#FFFDF9] to-[#F1E2D0] border border-[#E5D5C2] p-5 shadow-sm overflow-hidden relative shine-layer premium-glow"
            >
              <div className="absolute -right-12 -top-12 w-36 h-36 bg-[#C99055]/20 rounded-full blur-2xl premium-float" />

              <p className="text-[11px] uppercase tracking-[0.22em] text-[#8A5A35] font-bold">
                Crystaluxe Mall
              </p>

              <h3 className="text-[24px] leading-tight font-extrabold tracking-[-0.035em] text-[#24110A] mt-2">
                Buy genuine spiritual items
              </h3>

              <p className="text-[14px] text-[#6F513F] mt-3 leading-6 font-medium">
                Shop crystals, bracelets, yantras and spiritual products at
                unbeatable prices from Crystaluxe.
              </p>

              <div className="mt-4 inline-flex items-center gap-2 bg-[#24110A] text-white rounded-full px-5 py-2.5 text-sm font-extrabold">
                Visit Crystaluxe Mall →
              </div>
            </a>
          </section>
        </div>
      </main>
    </AuthGuard>
  );
}
