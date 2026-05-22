import { prisma } from "@/lib/prisma";
export default async function LiveChatPage({ params }) {
  const resolvedParams = await params;
  const astrologerId = Number(resolvedParams.id);

  const astrologer = await prisma.astrologer.findFirst({
    where: {
      id: astrologerId,
    },
  });

  if (!astrologer) {
    return <div>Astrologer not found</div>;
  }
  return (
    <main className="min-h-screen bg-[#F7EFE4] text-[#1F130D]">
      <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-[#FFF8EF] via-[#F7E9D9] to-[#EED8BE] flex flex-col">
        <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-2xl border-b border-white/60 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/chats" className="w-10 h-10 rounded-full bg-white/50 border border-white/60 flex items-center justify-center shadow-md">
                ←
              </a>

              <img
                src={astrologer.image}
                alt="{astrologer.name}"
                className="w-12 h-12 rounded-2xl object-cover shadow-md"
              />

              <div>
                <h1 className="font-extrabold tracking-[-0.02em]">
                  Acharya Raj
                </h1>
                <p className="text-xs text-green-600 font-bold">
                  ● Online • Typing...
                </p>
              </div>
            </div>

            <div className="bg-[#24110A] text-white px-3 py-2 rounded-2xl shadow-lg">
              <p className="text-[10px] text-[#D8C2B2] font-bold">Wallet</p>
              <p className="text-sm font-extrabold">₹500</p>
            </div>
          </div>
        </header>

        <section className="px-4 py-3">
          <div className="bg-[#24110A] text-white rounded-3xl p-4 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#D8C2B2] font-bold">
                Live Session
              </p>
              <p className="text-sm font-semibold mt-1">
                ₹{astrologer.price}/min is being deducted
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-[#D8C2B2] font-bold">Duration</p>
              <p className="text-xl font-extrabold">02:14</p>
            </div>
          </div>
        </section>

        <section className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">
          <div className="flex justify-start">
            <div className="max-w-[82%] bg-white/55 backdrop-blur-xl border border-white/60 rounded-[24px] rounded-tl-md px-4 py-3 shadow-md">
              <p className="text-sm leading-6 font-medium">
                Namaste 🙏 Please share your concern.
              </p>
              <p className="text-[11px] text-[#7A5A45] mt-2 font-semibold">
                10:02 AM
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="max-w-[82%] bg-[#24110A] text-white rounded-[24px] rounded-tr-md px-4 py-3 shadow-xl">
              <p className="text-sm leading-6">
                I want guidance regarding career and business.
              </p>
              <p className="text-[11px] text-[#D8C2B2] mt-2 font-semibold">
                10:03 AM
              </p>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[82%] bg-white/55 backdrop-blur-xl border border-white/60 rounded-[24px] rounded-tl-md px-4 py-3 shadow-md">
              <p className="text-sm leading-6 font-medium">
                I can see strong growth in the coming months. Stay consistent and avoid sudden decisions this week.
              </p>
              <p className="text-[11px] text-[#7A5A45] mt-2 font-semibold">
                10:04 AM
              </p>
            </div>
          </div>
        </section>

        <footer className="sticky bottom-0 bg-white/40 backdrop-blur-2xl border-t border-white/60 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 h-14 rounded-2xl bg-white/55 border border-white/70 px-5 outline-none placeholder:text-[#8A6B55] shadow-sm"
            />

            <button className="w-14 h-14 rounded-2xl bg-[#24110A] text-white text-xl font-bold shadow-xl">
              →
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}