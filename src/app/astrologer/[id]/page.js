import StartChatButton from "@/components/StartChatButton";
export default function AstrologerProfilePage() {
  return (
    <main
      className="min-h-screen bg-[#F7EFE4] text-[#1F130D]"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-[#FFF8EF] via-[#F7E9D9] to-[#EED8BE]">

        <div className="relative h-[320px] overflow-hidden">

          <img
            src="https://i.pravatar.cc/600?img=12"
            alt="astrologer"
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
                  Acharya Raj
                </h1>
              </div>

              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                Online
              </div>

            </div>

            <p className="text-[#E9D4C6] mt-3 text-sm leading-6">
              Vedic Astrology • Kundli • Love Guidance • Career
            </p>

          </div>

        </div>

        <div className="px-4 -mt-7 relative z-20">

          <div className="bg-white/45 backdrop-blur-2xl border border-white/60 rounded-[34px] p-5 shadow-2xl">

            <div className="grid grid-cols-3 gap-3">

              <div className="bg-white/50 rounded-2xl p-3 border border-white/60">
                <p className="text-2xl font-extrabold tracking-[-0.04em]">
                  4.9
                </p>
                <p className="text-xs text-[#7A5A45] font-bold mt-1">
                  Rating
                </p>
              </div>

              <div className="bg-white/50 rounded-2xl p-3 border border-white/60">
                <p className="text-2xl font-extrabold tracking-[-0.04em]">
                  12+
                </p>
                <p className="text-xs text-[#7A5A45] font-bold mt-1">
                  Years
                </p>
              </div>

              <div className="bg-white/50 rounded-2xl p-3 border border-white/60">
                <p className="text-2xl font-extrabold tracking-[-0.04em]">
                  ₹25
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
                Experienced Vedic astrologer helping people with relationship,
                career, business and marriage guidance through accurate kundli
                analysis and spiritual consultation.
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

                <span className="bg-white/50 border border-white/60 rounded-full px-4 py-2 text-sm font-bold">
                  Punjabi
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
                  “Very accurate prediction and calm guidance.”
                </p>

                <p className="text-sm text-[#7A5A45] mt-2">
                  — Priya Sharma
                </p>
              </div>

              <div className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4">
                <p className="font-bold">
                  “Helped me understand my career situation clearly.”
                </p>

                <p className="text-sm text-[#7A5A45] mt-2">
                  — Aman Verma
                </p>
              </div>

            </div>

          </div>

          <div className="sticky bottom-0 pt-6 pb-6 bg-gradient-to-t from-[#EFDCC8] to-transparent mt-8">

            <StartChatButton astrologerId={1} price={25} />
          </div>

        </div>

      </div>
    </main>
  );
}