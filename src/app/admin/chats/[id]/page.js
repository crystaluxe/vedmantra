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
      user: true,
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
      <div className="max-w-2xl mx-auto min-h-screen flex flex-col">
        <header className="bg-white p-5 shadow-sm border-b border-[#ead8c2]">
          <h1 className="text-2xl font-bold text-[#2b1208]">
            {chat.astrologer.name}
          </h1>

          <p className="text-sm text-[#7a5a3a] mt-1">
            User: {chat.user?.name || "Demo User"}
          </p>
        </header>

        <section className="flex-1 p-5 space-y-4 overflow-y-auto">
          {chat.messages.map((msg) => {
            const isAstrologer = msg.sender === "ASTROLOGER";

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isAstrologer ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-3xl shadow-md ${
                    isAstrologer
                      ? "bg-[#2b1208] text-white"
                      : "bg-white"
                  }`}
                >
                  <p>{msg.message}</p>

                  <p
                    className={`text-xs mt-2 ${
                      isAstrologer
                        ? "text-[#d8c2b2]"
                        : "text-[#7a5a3a]"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        <AdminReplyBox
  chatId={chat.id}
  initialMessages={chat.messages}
/>
      </div>
    </main>
  );
}