import { prisma } from "@/lib/prisma";
import ChatBox from "@/components/ChatBox";

export default async function LiveChatPage({ params }) {
  const resolvedParams = await params;
  const chatSessionId = Number(resolvedParams.id);

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: chatSessionId },
    include: {
      astrologer: true,
      messages: { orderBy: { createdAt: "asc" } },
      user: { include: { wallet: true } },
    },
  });

  if (!chatSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-[#1F130D]">
        <p className="text-sm font-semibold">Chat session not found</p>
      </main>
    );
  }

  const astrologer = chatSession.astrologer;
  const walletBalance = chatSession.user?.wallet?.balance || 0;

  return (
    <main className="min-h-[100dvh] bg-[#EEE3D6] text-[#1F130D]">
      <div className="max-w-md mx-auto h-[100dvh] bg-[#FAF7F2] flex flex-col overflow-hidden shadow-2xl">
        <header className="shrink-0 z-40 bg-[#FFFDF9]/92 backdrop-blur-xl border-b border-[#E7D9C7] px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <a
                href="/chat"
                className="w-8 h-8 rounded-full bg-[#F3E8DA] border border-[#E6D8C5] flex items-center justify-center text-[17px] font-bold shrink-0"
              >
                ←
              </a>

              <img
                src={astrologer.image}
                alt={astrologer.name}
                className="w-10 h-10 rounded-full object-cover border border-[#E1CFB8] shrink-0"
              />

              <div className="min-w-0">
                <h1 className="font-bold tracking-[-0.02em] text-[15px] leading-tight truncate">
                  {astrologer.name}
                </h1>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span className="text-[11px] text-[#287A3E] font-semibold">
                    Online
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[10px] text-[#8B735E] font-semibold leading-none">
                Wallet
              </p>
              <p className="text-[15px] font-extrabold text-[#2B160E] leading-tight mt-0.5">
                ₹{walletBalance}
              </p>
            </div>
          </div>
        </header>

        <ChatBox
          chatSessionId={chatSession.id}
          initialMessages={chatSession.messages}
        />
      </div>
    </main>
  );
}