import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminChatsPage() {
  const chats = await prisma.chatSession.findMany({
    include: {
      astrologer: true,
      user: true,
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

  return (
    <main className="min-h-screen bg-[#f7efe4] p-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#2b1208]">
            Live Chats
          </h1>

          <a
            href="/admin/chats"
            className="px-4 py-2 rounded-xl bg-[#2b1208] text-white text-sm font-bold"
          >
            Refresh
          </a>
        </div>

        {chats.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-[#ead8c2] text-center">
            <p className="font-bold text-[#2b1208]">No chats yet</p>
            <p className="text-sm text-[#7a5a3a] mt-2">
              New customer chats will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/admin/chats/${chat.id}`}
                className="block bg-white rounded-3xl p-5 shadow-md border border-[#ead8c2]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-[#2b1208]">
                      {chat.astrologer?.name || "Astrologer"}
                    </h2>

                    <p className="text-sm text-[#7a5a3a]">
                      User: {chat.user?.name || chat.user?.phone || "User"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        chat.status === "ACTIVE"
                          ? "text-green-600"
                          : "text-[#7a5a3a]"
                      }`}
                    >
                      {chat.status}
                    </p>

                    <p className="text-xs text-[#7a5a3a]">#{chat.id}</p>
                  </div>
                </div>

                <div className="mt-4 text-sm text-[#5e4634]">
                  {chat.messages[0]?.message || "No messages yet"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}