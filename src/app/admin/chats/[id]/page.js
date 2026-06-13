import { redirect } from "next/navigation";

export default async function AdminSingleChatRedirect({ params }) {
  const resolvedParams = await params;

  redirect(`/admin/chats?chatId=${resolvedParams.id}`);
}