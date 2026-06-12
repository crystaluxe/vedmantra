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

  const walletBalance = chat.user?.wallet?.balance || 0;

  const startedAt = new Date(chat.startedAt);
  const now = new Date();

  const totalMinutes = Math.floor(
    (now.getTime() - startedAt.getTime()) / 60000
  );

  return (
    <main className="min-h-screen bg-[#f7efe4]">
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col">

        <header className="bg-white border-b border-[#ead8c2] p-5 shadow-sm">

          <div className="flex justify-between items-start">

            <div>
              <h1 className="text-3xl font-bold text-[#2b1208]">
                {chat.astrologer.name}
              </h1>

              <p className="text-[#7a5a3a] mt-1">
                User: {chat.user?.name || "Guest User"}
              </p>
            </div>

            <div>
              <form action="/api/end" method="POST">
                <input
                  type="hidden"
                  name="chatSessionId"
                  value={chat.id}
                />

                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
                >
                  End Chat
                </button>
              </form>
            </div>

          </div>

          <div className="grid grid-cols-4 gap-4 mt-5">

            <div className="bg-[#fff8ef] border border-[#ead8c2] rounded-xl p-4">
              <p className="text-xs text-[#7a5a3a] font-semibold">
                Wallet Balance
              </p>

              <p className="text-2xl font-bold text-green-600">
                ₹{walletBalance}
              </p>
            </div>

            <div className="bg-[#fff8ef] border border-[#ead8c2] rounded-xl p-4">
              <p className="text-xs text-[#7a5a3a] font-semibold">
                Rate
              </p>

              <p className="text-2xl font-bold">
                ₹{chat.astrologer.price}/min
              </p>
            </div>

            <div className="bg-[#fff8ef] border border-[#ead8c2] rounded-xl p-4">
              <p className="text-xs text-[#7a5a3a] font-semibold">
                Session Time
              </p>

              <p className="text-2xl font-bold">
                {totalMinutes} min
              </p>
            </div>

            <div className="bg-[#fff8ef] border border-[#ead8c2] rounded-xl p-4">
              <p className="text-xs text-[#7a5a3a] font-semibold">
                Status
              </p>

              <p
                className={`text-xl font-bold ${
                  chat.status === "ACTIVE"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {chat.status}
              </p>
            </div>

          </div>

        </header>

        <AdminReplyBox
          chatId={chat.id}
          initialMessages={chat.messages}
        />

      </div>
    </main>
  );
}