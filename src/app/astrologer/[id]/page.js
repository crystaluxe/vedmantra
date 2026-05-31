import { prisma } from "@/lib/prisma";
import StartChatButton from "@/components/StartChatButton";

export default async function AstrologerProfilePage({ params }) {
  const resolvedParams = await params;
  const astrologerId = Number(resolvedParams.id);

  const astrologer = await prisma.astrologer.findUnique({
    where: {
      id: astrologerId,
    },
  });

  if (!astrologer) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F7EFE4]">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Astrologer Not Found</h1>

          <a
            href="/"
            className="inline-block mt-4 px-6 py-3 rounded-xl bg-[#24110A] text-white"
          >
            Go Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#F7EFE4] text-[#1F130D]"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-[#FFF8EF] via-[#F7E9D9] to-[#EED8BE]">

        <div className="relative h-[360px] overflow-hidden">

          <img
            src={astrologer.image}
            alt={astrologer.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E09] via-[#1A0E0920] to-transparent" />

          <div className="absolute top-5 left-4">
            <a
              href="/"
              className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white text-xl"
            >
              ←
            </a>
          </div>

          <div className="absolute bottom-5 left-5 right-5 text-white">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-[#E5C8B2] font-semibold">
                  Verified Astrologer
                </p>

                <h1 className="text-4xl font-extrabold tracking-[-0.04em] mt-1">
                  {astrologer.name}
                </h1>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
                  astrologer.online
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {astrologer.online ? "Online" : "Offline"}
              </div>

            </div>

            <p className="text-[#E9D4C6] mt-3 text-sm leading-6">
              {astrologer.skills}
            </p>

          </div>

        </div>

        <div className="px-4 -mt-7 relative z-20">

          <div className="bg-white/45 backdrop-blur-2xl border border-white/60 rounded-[34px] p-5 shadow-2xl">

            <div className="grid grid-cols-3 gap-3">

              <div className="bg-white/50 rounded-2xl p-3 border border-white/60">
                <p className="text-2xl font-extrabold">
                  {astrologer.rating}
                </p>

                <p className="text-xs text-[#7A5A45] font-bold mt-1">
                  Rating
                </p>
              </div>

              <div className="bg-white/50 rounded-2xl p-3 border border-white/60">
                <p className="text-2xl font-extrabold">
                  10+
                </p>

                <p className="text-xs text-[#7A5A45] font-bold mt-1">
                  Years
                </p>
              </div>

              <div className="bg-white/50 rounded-2xl p-3 border border-white/60">
                <p className="text-2xl font-extrabold">
                  ₹{astrologer.price}
                </p>

                <p className="text-xs text-[#7A5A45] font-bold mt-1">
                  Per Min
                </p>
              </div>

            </div>

            <div className="mt-6">

              <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-bold mb-3">
                About
              </p>

              <p className="text-[15px] leading-7 text-[#5F483A] font-medium">
                Expert astrologer specializing in {astrologer.skills}. Get guidance on relationships, career, finance, marriage, family matters, health concerns and spiritual growth through personalized consultation.
              </p>

            </div>

            <div className="mt-6">

              <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-bold mb-3">
                Languages
              </p>

              <div className="flex gap-2 flex-wrap">

                <span className="bg-white/50 border border-white/60 rounded-full px-4 py-2 text-sm font-bold">
                  Hindi
                </span>

                <span className="bg-white/50 border border-white/60 rounded-full px-4 py-2 text-sm font-bold">
                  English
                </span>

              </div>

            </div>

          </div>

          <div className="mt-6">

            <div className="flex items-center justify-between mb-4">

              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#8A5A35] font-bold">
                  User Reviews
                </p>

                <h2 className="text-2xl font-extrabold tracking-[-0.03em]">
                  Testimonials
                </h2>
              </div>

              <span className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-full px-4 py-2 text-sm font-bold">
                1.2k Reviews
              </span>

            </div>

            <div className="space-y-3">

              <div className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4">
                <p className="font-bold">
                  "Very accurate prediction and calm guidance."
                </p>

                <p className="text-sm text-[#7A5A45] mt-2">
                  — Priya Sharma
                </p>
              </div>

              <div className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4">
                <p className="font-bold">
                  "Helped me understand my career situation clearly."
                </p>

                <p className="text-sm text-[#7A5A45] mt-2">
                  — Aman Verma
                </p>
              </div>

            </div>

          </div>

          <div className="sticky bottom-0 pt-6 pb-6 bg-gradient-to-t from-[#EFDCC8] to-transparent mt-8">

            {astrologer.online ? (
              <StartChatButton astrologerId={astrologer.id} />
            ) : (
              <button
                disabled
                className="w-full py-4 rounded-2xl bg-gray-400 text-white font-semibold shadow-xl text-lg cursor-not-allowed"
              >
                Currently Offline
              </button>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}