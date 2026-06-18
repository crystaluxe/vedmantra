import { prisma } from "@/lib/prisma";
import AuthGuard from "@/components/AuthGuard";
import HomeWalletBalance from "@/components/HomeWalletBalance";
import PushNotificationRegister from "@/components/PushNotificationRegister";

export default async function HomePage() {
  const astrologersRaw = await prisma.astrologer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const astrologers = Array.from(
    new Map(
      astrologersRaw.map((astro) => [
        astro.name?.toLowerCase().trim(),
        astro,
      ])
    ).values()
  );

  return (
    <AuthGuard>
      <PushNotificationRegister />

      <main
        className="min-h-screen bg-[#ECE0D2] text-[#1F130D]"
        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
      >
        <div className="max-w-md mx-auto min-h-screen relative overflow-hidden bg-[#FAF6EF] pb-24">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#B68455]/20 rounded-full blur-3xl" />
          <div className="absolute top-80 -left-28 w-72 h-72 bg-[#4E2617]/10 rounded-full blur-3xl" />

          <header className="sticky top-0 z-50 px-4 pt-4 pb-3 bg-[#FFFDF9]/90 backdrop-blur-xl border-b border-[#E6D7C5]">
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
          </header>

          <section className="relative z-10 px-4 pt-5">
            <div className="rounded-[28px] bg-[#2B160E] text-white p-5 shadow-xl overflow-hidden relative">
              <div className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-[#D9A66B]/20 blur-2xl" />

              <p className="text-[11px] uppercase tracking-[0.22em] text-[#D8BFA8] font-bold">
                Live Astrology
              </p>

              <h2 className="text-[28px] leading-[1.12] mt-3 font-extrabold tracking-[-0.035em]">
                Talk to trusted astrologers instantly
              </h2>

              <p className="text-[14px] text-[#E7D4C1] mt-3 leading-6 font-medium">
                Get guidance for career, love, marriage, kundli, money and life
                decisions.
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
                    {astrologers.length}+
                  </p>
                  <p className="text-[10px] text-[#D8BFA8] font-bold">
                    Experts
                  </p>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
                  <p className="text-lg font-extrabold">₹19</p>
                  <p className="text-[10px] text-[#D8BFA8] font-bold">
                    Starting
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative z-10 px-4 mt-6">
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

            <div className="space-y-3">
              {astrologers.map((astro) => (
                <div
                  key={astro.id}
                  className="bg-[#FFFDF9] rounded-[24px] p-3.5 shadow-sm border border-[#E8DCCB]"
                >
                  <div className="flex gap-3">
                    <img
                      src={astro.image}
                      alt={astro.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border border-[#E5D5C2]"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="text-[16px] font-extrabold tracking-[-0.02em] truncate">
                            {astro.name}
                          </h2>

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
                    className="block w-full mt-3 bg-[#24110A] text-white rounded-xl py-2.5 font-bold text-center text-[14px]"
                  >
                    Chat Now
                  </a>
                </div>
              ))}
            </div>
          </section>

          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-[#FFFDF9]/95 backdrop-blur-xl border-t border-[#E6D7C5] px-4 py-2.5">
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/"
                className="h-11 rounded-2xl bg-[#24110A] text-white flex items-center justify-center text-sm font-extrabold"
              >
                Home
              </a>

              <a
                href="https://crystaluxe.in"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 rounded-2xl bg-[#F4E9DC] border border-[#E5D5C2] text-[#3A1D12] flex items-center justify-center text-sm font-extrabold"
              >
                Crystaluxe Mall
              </a>
            </div>
          </nav>
        </div>
      </main>
    </AuthGuard>
  );
}