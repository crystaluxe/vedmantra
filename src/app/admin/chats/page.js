import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminReplyBox from "@/components/AdminReplyBox";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminChatsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const selectedChatId = resolvedSearchParams?.chatId
    ? Number(resolvedSearchParams.chatId)
    : null;

  const chats = await prisma.chatSession.findMany({
    include: {
      astrologer: true,
      user: {
        include: {
          wallet: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });

  const selectedChat =
    chats.find((chat) => chat.id === selectedChatId) || chats[0] || null;

  const fullSelectedChat = selectedChat
    ? await prisma.chatSession.findUnique({
        where: {
          id: selectedChat.id,
        },
        include: {
          astrologer: true,
          user: {
            include: {
              wallet: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })
    : null;

  return (
    <main className="h-screen bg-[#111b21] overflow-hidden">
      <div className="h-full max-w-[1600px] mx-auto flex bg-[#efeae2]">
        <aside className="w-full md:w-[380px] lg:w-[430px] bg-white border-r border-[#d9d9d9] flex flex-col">
          <div className="bg-[#075E54] text-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold">Vedmantra Admin</h1>
                <p className="text-xs text-white/75 mt-1">
                  Live chat dashboard
                </p>
              </div>

              <a
                href="/admin/chats"
                className="text-xs bg-white/15 px-3 py-2 rounded-full font-bold"
              >
                Refresh
              </a>
            </div>
          </div>

          <div className="px-4 py-3 bg-[#f0f2f5] border-b border-[#e5e5e5]">
            <div className="h-10 rounded-full bg-white px-4 flex items-center text-sm text-[#667781]">
              Search or start new chat
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-bold text-[#111b21]">No chats yet</p>
                <p className="text-sm text-[#667781] mt-2">
                  New customer chats will appear here.
                </p>
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = fullSelectedChat?.id === chat.id;
                const lastMessage = chat.messages[0]?.message || "No messages yet";
                const walletBalance = chat.user?.wallet?.balance || 0;

                return (
                  <Link
                    key={chat.id}
                    href={`/admin/chats?chatId=${chat.id}`}
                    className={`block px-4 py-4 border-b border-[#f0f2f5] transition ${
                      isActive ? "bg-[#e9edef]" : "bg-white hover:bg-[#f5f6f6]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#075E54] text-white flex items-center justify-center font-extrabold shrink-0">
                        {(chat.user?.name || chat.user?.phone || "U")
                          .toString()
                          .slice(0, 1)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="font-bold text-[#111b21] truncate">
                            {chat.user?.name || chat.user?.phone || "Customer"}
                          </h2>

                          <span className="text-[11px] text-[#667781] shrink-0">
                            #{chat.id}
                          </span>
                        </div>

                        <p className="text-xs text-[#667781] mt-0.5 truncate">
                          {chat.astrologer?.name || "Astrologer"} • ₹
                          {walletBalance}
                        </p>

                        <p className="text-sm text-[#3b4a54] mt-1 truncate">
                          {lastMessage}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                              chat.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {chat.status}
                          </span>

                          {chat.status === "ACTIVE" && (
                            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </aside>

        <section className="hidden md:flex flex-1 flex-col bg-[#efeae2]">
          {fullSelectedChat ? (
            <>
              <header className="bg-[#075E54] text-white px-5 py-4 border-b border-[#064d45]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold">
                      {fullSelectedChat.user?.name ||
                        fullSelectedChat.user?.phone ||
                        "Customer"}
                    </h2>

                    <p className="text-xs text-white/75 mt-1">
                      {fullSelectedChat.astrologer?.name} • Chat #
                      {fullSelectedChat.id}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-white/75">Wallet</p>
                    <p className="font-extrabold">
                      ₹{fullSelectedChat.user?.wallet?.balance || 0}
                    </p>
                  </div>
                </div>
              </header>

              <AdminReplyBox
                chatId={fullSelectedChat.id}
                initialMessages={fullSelectedChat.messages}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-[#075E54] mx-auto flex items-center justify-center text-white text-4xl">
                  💬
                </div>

                <h2 className="text-2xl font-extrabold text-[#111b21] mt-5">
                  Select a chat
                </h2>

                <p className="text-[#667781] mt-2">
                  Choose a customer conversation from the left panel.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}