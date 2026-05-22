import { prisma } from "@/lib/prisma";
export default async function HomePage() {
  const astrologers = await prisma.astrologer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <main
      className="min-h-screen bg-[#F7EFE4] text-[#1F130D]"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="max-w-md mx-auto min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FFF8EF] via-[#F7E9D9] to-[#EED8BE]">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C99055]/25 rounded-full blur-3xl" />
        <div className="absolute top-72 -left-28 w-72 h-72 bg-[#6B2D1A]/15 rounded-full blur-3xl" />

        <header className="sticky top-0 z-50 px-4 pt-4 pb-4 bg-white/35 backdrop-blur-2xl border-b border-white/50 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#8A5A35] font-bold">
                Divine Guidance
              </p>

              <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-[#24110A]">
                Vedmantra
              </h1>
            </div>

            <a
              href="/wallet"
              className="bg-white/50 backdrop-blur-xl border border-white/70 shadow-lg px-4 py-2 rounded-full"
            >
              <p className="text-[10px] text-[#8A5A35] font-bold leading-none">
                Wallet
              </p>

              <p className="text-sm font-extrabold">₹0</p>
            </a>
          </div>

          <nav className="grid grid-cols-4 gap-2 text-[13px] font-bold">
            <a
              href="/"
              className="bg-[#2B1510] text-white rounded-full py-2.5 shadow-lg text-center"
            >
              Home
            </a>

            <a
              href="/wallet"
              className="bg-white/45 backdrop-blur-xl border border-white/60 text-[#6F452B] rounded-full py-2.5 text-center"
            >
              Wallet
            </a>

            <a
              href="/chats"
              className="bg-white/45 backdrop-blur-xl border border-white/60 text-[#6F452B] rounded-full py-2.5 text-center"
            >
              Chats
            </a>

            <a
              href="/profile"
              className="bg-white/45 backdrop-blur-xl border border-white/60 text-[#6F452B] rounded-full py-2.5 text-center"
            >
              Profile
            </a>
          </nav>
        </header>

        <section className="relative z-10 px-4 pt-6">
          <div className="rounded-[34px] bg-white/38 backdrop-blur-2xl border border-white/65 shadow-2xl p-6 overflow-hidden relative">
            <div className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-[#B8793E]/25 blur-2xl" />

            <p className="text-xs uppercase tracking-[0.24em] text-[#8A5A35] font-bold">
              Live Consultation
            </p>

            <h2 className="text-[32px] leading-[1.12] mt-3 text-[#24110A] font-extrabold tracking-[-0.025em]">
              Find clarity through trusted astrologers
            </h2>

            <p className="text-[15px] text-[#6F513F] mt-4 leading-7 font-medium">
              Instant chat guidance for career, love, marriage, kundli and life
              decisions.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-6">
              <div className="bg-white/45 border border-white/60 rounded-2xl p-3">
                <p className="text-lg font-extrabold tracking-[-0.02em]">
                  24x7
                </p>

                <p className="text-[11px] text-[#7A5A45] font-bold">
                  Available
                </p>
              </div>

              <div className="bg-white/45 border border-white/60 rounded-2xl p-3">
                <p className="text-lg font-extrabold tracking-[-0.02em]">
                  100+
                </p>

                <p className="text-[11px] text-[#7A5A45] font-bold">
                  Experts
                </p>
              </div>

              <div className="bg-white/45 border border-white/60 rounded-2xl p-3">
                <p className="text-lg font-extrabold tracking-[-0.02em]">
                  ₹19
                </p>

                <p className="text-[11px] text-[#7A5A45] font-bold">
                  Starting
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 px-4 mt-6 pb-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8A5A35] font-bold">
                Online Now
              </p>

              <h3 className="text-2xl font-extrabold tracking-[-0.025em] text-[#24110A]">
                Astrologers
              </h3>
            </div>

            <span className="text-xs bg-green-100/80 text-green-700 px-3 py-1 rounded-full font-bold border border-green-200">
              Live
            </span>
          </div>

          <div className="space-y-4">
            {astrologers.map((astro) => (
              <div
                key={astro.id}
                className="bg-white/45 backdrop-blur-2xl rounded-[30px] p-4 shadow-xl border border-white/65"
              >
                <div className="flex gap-4">
                  <img
                    src={astro.image}
                    alt={astro.name}
                      referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-[24px] object-cover shadow-md"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-extrabold tracking-[-0.02em]">
                          {astro.name}
                        </h2>

                        <p className="text-sm text-[#7B5A43] mt-1 font-semibold">
                          {astro.skills}
                        </p>
                      </div>

                      <span className="text-[#8B4A22] font-extrabold whitespace-nowrap tracking-[-0.02em]">
                        ₹{astro.price}/min
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p
                        className={`text-sm font-bold ${
                          astro.online ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {astro.online ? "● Online" : "● Offline"}
                      </p>

                      <p className="text-sm font-bold text-[#6F452B]">
                        ★ {astro.rating}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={`/astrologer/${astro.id}`}
                  className="block w-full mt-4 bg-[#24110A] text-white rounded-2xl py-3 font-bold shadow-xl text-center"
                >
                  Chat Now
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}