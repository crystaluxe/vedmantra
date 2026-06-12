import { prisma } from "@/lib/prisma";
import ChatBox from "@/components/ChatBox";

export default async function LiveChatPage({ params }) {
  const resolvedParams = await params;
  const chatSessionId = Number(resolvedParams.id);

  const chatSession = await prisma.chatSession.findUnique({
    where: {
      id: chatSessionId,
    },
    include: {
      astrologer: true,
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
      user: {
        include: {
          wallet: true,
        },
      },
    },
  });

  if (!chatSession) {
    return <div>Chat session not found</div>;
  }

  const astrologer = chatSession.astrologer;
  const walletBalance = chatSession.user?.wallet?.balance || 0;

  return (
    <main className="min-h-screen bg-[#F7EFE4] text-[#1F130D]">
      <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-[#FFF8EF] via-[#F7E9D9] to-[#EED8BE] flex flex-col">
        <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-2xl border-b border-white/60 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="/chat"
                className="w-10 h-10 rounded-full bg-white/50 border border-white/60 flex items-center justify-center shadow-md"
              >
                ←
              </a>

              <img
                src={astrologer.image}
                alt={astrologer.name}
                className="w-12 h-12 rounded-2xl object-cover shadow-md"
              />

              <div>
                <h1 className="font-extrabold tracking-[-0.02em]">
                  {astrologer.name}
                </h1>

                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>

                  <span className="text-xs text-green-600 font-semibold">
                    Online
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#24110A] text-white px-3 py-2 rounded-2xl shadow-lg">
              <p className="text-[10px] text-[#D8C2B2] font-bold">
                Wallet
              </p>

              <p className="text-sm font-extrabold">
                ₹{walletBalance}
              </p>
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
              <p className="text-xs text-[#D8C2B2] font-bold">
                Status
              </p>

              <p className="text-xl font-extrabold">
                {chatSession.status}
              </p>
            </div>
          </div>
        </section>

        <ChatBox
          chatSessionId={chatSession.id}
          initialMessages={chatSession.messages}
        />
      </div>
    </main>
  );
}