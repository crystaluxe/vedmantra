import { prisma } from "@/lib/prisma";

export default function ProfilePage() {
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
            Profile
          </h1>

          <div className="w-10" />
        </div>

        <div className="bg-white/45 backdrop-blur-2xl rounded-[34px] p-5 shadow-xl border border-white/65">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-[#24110A] text-white flex items-center justify-center text-3xl font-extrabold">
              S
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-[-0.03em]">
                Suraj
              </h2>

              <p className="text-sm text-[#7A5A45] font-semibold mt-1">
                +91 XXXXX XXXXX
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4">
            <p className="text-xs text-[#8A5A35] font-bold uppercase tracking-[0.18em]">
              Wallet
            </p>
            <p className="text-2xl font-extrabold mt-2">₹0</p>
          </div>

          <div className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4">
            <p className="text-xs text-[#8A5A35] font-bold uppercase tracking-[0.18em]">
              Chats
            </p>
            <p className="text-2xl font-extrabold mt-2">2</p>
          </div>
        </div>

        <div className="mt-7 space-y-3">
          <a
            href="/wallet"
            className="block bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4 font-bold"
          >
            Wallet & Recharge
          </a>

          <a
            href="/chats"
            className="block bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4 font-bold"
          >
            My Chats
          </a>

          <div className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4 font-bold">
            Help & Support
          </div>

          <div className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4 font-bold text-red-500">
            Logout
          </div>
        </div>
      </div>
    </main>
  );
}