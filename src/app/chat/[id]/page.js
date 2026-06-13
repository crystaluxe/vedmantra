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
        <header className="sticky top-0 z-50 bg-white/45 backdrop-blur-2xl border-b border-white/60 px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <a
                href="/chat"
                className="w-11 h-11 rounded-full bg-white/70 border border-white/70 flex items-center justify-center shadow-md text-lg font-bold shrink-0"
              >
                ←
              </a>

              <img
                src={astrologer.image}
                alt={astrologer.name}
                className="w-13 h-13 rounded-2xl object-cover shadow-md shrink-0"
              />

              <div className="min-w-0">
                <h1 className="font-black tracking-[-0.03em] text-[17px] leading-tight truncate">
                  {astrologer.name}
                </h1>

                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>

                  <span className="text-sm text-green-600 font-bold">
                    Online
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#24110A] text-white px-4 py-3 rounded-[22px] shadow-xl shrink-0">
              <p className="text-[10px] text-[#D8C2B2] font-bold leading-none">
                Wallet
              </p>

              <p className="text-lg font-black leading-tight mt-1">
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