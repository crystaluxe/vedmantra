import { prisma } from "@/lib/prisma";
import AdminChatsDashboard from "@/components/AdminChatsDashboard";

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

  const formattedChats = chats.map((chat) => ({
    id: chat.id,
    status: chat.status,
    startedAt: chat.startedAt,
    astrologerName: chat.astrologer?.name || "Astrologer",
    userName: chat.user?.name || chat.user?.phone || "Customer",
    walletBalance: chat.user?.wallet?.balance || 0,
    lastMessage: chat.messages[0] || null,
  }));

  return (
    <AdminChatsDashboard
      initialChats={formattedChats}
      selectedChatId={selectedChatId}
    />
  );
}