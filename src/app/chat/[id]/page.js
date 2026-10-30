import { prisma } from "@/lib/prisma";
import ChatBox from "@/components/ChatBox";
import ChatHeaderStatus from "@/components/ChatHeaderStatus";

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
    <main className="min-h-[100dvh] bg-[#F6EFE5] text-[#390A1B]">
      <div className="mx-auto flex h-[100dvh] w-full max-w-7xl overflow-hidden bg-white shadow-2xl md:my-6 md:h-[calc(100dvh-48px)] md:rounded-3xl md:border md:border-[#E9D9C4]">
        <aside className="hidden w-[300px] shrink-0 flex-col border-r border-[#E9D9C4] bg-[#FFF9F0] p-6 lg:flex">
          <a href="/" className="font-serif text-3xl font-bold text-[#650D26]">✺ Vedmantra</a>
          <p className="mt-2 text-xs font-bold uppercase tracking-[.18em] text-[#A17A35]">Your consultation</p>
          <div className="mt-10 rounded-3xl border border-[#E9D9C4] bg-white p-5">
            <img src={astrologer.image} alt={astrologer.name} className="h-24 w-24 rounded-2xl border border-[#E9D9C4] object-cover" />
            <h2 className="mt-5 text-xl font-bold text-[#650D26]">{astrologer.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[#786B64]">{astrologer.skills}</p>
            <p className="mt-4 text-sm font-bold text-[#650D26]">₹{astrologer.price} / minute</p>
          </div>
          <div className="mt-6 rounded-2xl border border-[#E9D9C4] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#A17A35]">Wallet balance</p>
            <p className="mt-2 text-3xl font-extrabold text-[#650D26]">₹{walletBalance}</p>
            <a href="/wallet" className="mt-4 block rounded-full bg-[#650D26] px-5 py-3 text-center text-sm font-bold text-white">Add Balance</a>
          </div>
          <a href="/chat" className="mt-auto block rounded-full border border-[#C6A15B] px-5 py-3 text-center text-sm font-bold text-[#650D26]">← All conversations</a>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="z-40 shrink-0 border-b border-[#E9D9C4] bg-[#FFF9F0] px-4 py-3 md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <a href="/chat" aria-label="Back to chats" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E9D9C4] bg-white text-lg lg:hidden">←</a>
                <img src={astrologer.image} alt={astrologer.name} className="h-11 w-11 shrink-0 rounded-full border border-[#C6A15B] object-cover" />
                <div className="min-w-0">
                  <h1 className="truncate text-base font-extrabold text-[#650D26]">{astrologer.name}</h1>
                  <ChatHeaderStatus chatSessionId={chatSession.id} initialStatus={chatSession.status} />
                </div>
              </div>
              <div className="shrink-0 text-right lg:hidden">
                <p className="text-[10px] font-semibold text-[#786B64]">Wallet</p>
                <a href="/wallet" className="text-base font-extrabold text-[#650D26]">₹{walletBalance} +</a>
              </div>
              <a href="/wallet" className="hidden rounded-full border border-[#C6A15B] px-4 py-2 text-sm font-bold text-[#650D26] lg:block">Recharge Wallet</a>
            </div>
          </header>
          <ChatBox chatSessionId={chatSession.id} initialMessages={chatSession.messages} initialStatus={chatSession.status} />
        </div>
      </div>
    </main>
  );
}
