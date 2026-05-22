export default function ChatsPage() {
  return (
    <main
      className="min-h-screen bg-[#F7EFE4] text-[#1F130D]"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-[#FFF8EF] via-[#F7E9D9] to-[#EED8BE] px-4 pt-5">

        <div className="flex items-center justify-between mb-6">

          <a
            href="/"
            className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-md"
          >
            ←
          </a>

          <h1 className="text-2xl font-extrabold tracking-[-0.03em]">
            Chats
          </h1>

          <div className="w-10" />

        </div>

        <div className="space-y-4">

          <a
            href="/chat/1"
            className="block bg-white/45 backdrop-blur-2xl rounded-[30px] p-4 shadow-xl border border-white/65"
          >

            <div className="flex gap-4">

              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Acharya Raj"
                className="w-16 h-16 rounded-2xl object-cover"
              />

              <div className="flex-1">

                <div className="flex justify-between">

                  <h2 className="font-extrabold text-lg tracking-[-0.02em]">
                    Acharya Raj
                  </h2>

                  <p className="text-xs text-[#7A5A45] font-bold">
                    10:04 AM
                  </p>

                </div>

                <p className="text-sm text-[#7A5A45] mt-1 leading-6">
                  I can see strong growth in the coming months...
                </p>

                <div className="flex items-center justify-between mt-3">

                  <p className="text-xs text-green-600 font-bold">
                    ● Active Session
                  </p>

                  <p className="text-xs font-bold text-[#8B4A22]">
                    ₹25/min
                  </p>

                </div>

              </div>

            </div>

          </a>

          <a
            href="/chat/2"
            className="block bg-white/45 backdrop-blur-2xl rounded-[30px] p-4 shadow-xl border border-white/65"
          >

            <div className="flex gap-4">

              <img
                src="https://i.pravatar.cc/150?img=32"
                alt="Astro Dev"
                className="w-16 h-16 rounded-2xl object-cover"
              />

              <div className="flex-1">

                <div className="flex justify-between">

                  <h2 className="font-extrabold text-lg tracking-[-0.02em]">
                    Astro Dev
                  </h2>

                  <p className="text-xs text-[#7A5A45] font-bold">
                    Yesterday
                  </p>

                </div>

                <p className="text-sm text-[#7A5A45] mt-1 leading-6">
                  Your numerology chart indicates financial growth.
                </p>

                <div className="flex items-center justify-between mt-3">

                  <p className="text-xs text-[#7A5A45] font-bold">
                    Session Ended
                  </p>

                  <p className="text-xs font-bold text-[#8B4A22]">
                    ₹19/min
                  </p>

                </div>

              </div>

            </div>

          </a>

        </div>

      </div>
    </main>
  );
}