export default function WalletPage() {
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
            Wallet
          </h1>

          <div className="w-10" />

        </div>

        <div className="rounded-[34px] bg-[#24110A] text-white p-6 shadow-2xl">

          <p className="text-sm text-[#D8C2B2] font-semibold">
            Available Balance
          </p>

          <h2 className="text-5xl font-extrabold tracking-[-0.05em] mt-3">
            ₹0
          </h2>

          <p className="text-sm text-[#CBAF9C] mt-3">
            Recharge wallet to start chatting instantly.
          </p>

        </div>

        <div className="mt-7">

          <p className="text-sm uppercase tracking-[0.22em] text-[#8A5A35] font-bold mb-4">
            Quick Recharge
          </p>

          <div className="grid grid-cols-2 gap-3">

            {[100, 200, 500, 1000].map((amount) => (
              <button
                key={amount}
                className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl py-5 shadow-lg"
              >
                <p className="text-2xl font-extrabold tracking-[-0.04em]">
                  ₹{amount}
                </p>

                <p className="text-sm text-[#7A5A45] font-semibold mt-1">
                  Add Money
                </p>
              </button>
            ))}

          </div>

        </div>

        <button className="w-full mt-8 bg-[#24110A] text-white rounded-3xl py-4 text-lg font-bold shadow-xl">
          Proceed to Recharge
        </button>

        <div className="mt-10">

          <p className="text-sm uppercase tracking-[0.22em] text-[#8A5A35] font-bold mb-4">
            Recent Transactions
          </p>

          <div className="space-y-3">

            <div className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Wallet Recharge</p>
                  <p className="text-sm text-[#7A5A45]">
                    Today • 10:30 AM
                  </p>
                </div>

                <p className="font-extrabold text-green-600">
                  +₹500
                </p>
              </div>
            </div>

            <div className="bg-white/45 backdrop-blur-xl border border-white/60 rounded-3xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Chat Session</p>
                  <p className="text-sm text-[#7A5A45]">
                    Yesterday • 08:15 PM
                  </p>
                </div>

                <p className="font-extrabold text-red-500">
                  -₹75
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}