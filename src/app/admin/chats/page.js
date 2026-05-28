import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
        <h1 className="text-3xl font-bold mb-6 text-[#2b1208]">
          Live Chats
        </h1>

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
                    {chat.astrologer.name}
                  </h2>

                  <p className="text-sm text-[#7a5a3a]">
                    User: {chat.user?.name || "Demo User"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {chat.status}
                  </p>

                  <p className="text-xs text-[#7a5a3a]">
                    #{chat.id}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-[#5e4634]">
                {chat.messages[0]?.message || "No messages yet"}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}