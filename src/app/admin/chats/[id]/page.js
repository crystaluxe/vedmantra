import { prisma } from "@/lib/prisma";
import AdminReplyBox from "@/components/AdminReplyBox";

export default async function AdminSingleChatPage({ params }) {
  const resolvedParams = await params;
  const chatId = Number(resolvedParams.id);

  const chat = await prisma.chatSession.findUnique({
    where: {
      id: chatId,
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
  });

  if (!chat) {
    return <div>Chat not found</div>;
  }

  return (
    <main className="min-h-screen bg-[#f7efe4]">
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col">
        <header className="bg-white border-b border-[#ead8c2] p-4 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2b1208] leading-tight">
            {chat.astrologer.name}
          </h1>

          <p className="text-sm text-[#7a5a3a] mt-1">
            User: {chat.user?.name || chat.user?.phone || "Guest User"}
          </p>
        </header>

        <AdminReplyBox chatId={chat.id} initialMessages={chat.messages} />
      </div>
    </main>
  );
}