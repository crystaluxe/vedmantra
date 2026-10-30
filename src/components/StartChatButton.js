"use client";
import { useSiteDialog } from "@/components/DialogProvider";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartChatButton({ astrologerId }) {
  const { notify, confirm: confirmDialog } = useSiteDialog();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const returnPath = `/astrologer/${astrologerId}`;

  const promptLogin = async () => {
    const proceed = await confirmDialog("Sign in with your mobile number to start your consultation. We will bring you right back to this astrologer.", { tone: "info", title: "A moment to connect", confirmLabel: "Sign in & continue", cancelLabel: "Keep exploring" });
    if (proceed) router.push(`/login?next=${encodeURIComponent(returnPath)}`);
  };

  const startChat = async () => {
    try {
      setLoading(true);

      const userData = localStorage.getItem("astro-user");

      if (!userData) {
        await promptLogin();
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
      } catch {
        localStorage.removeItem("astro-user");
        await promptLogin();
        return;
      }

      if (!user?.id) {
        localStorage.removeItem("astro-user");
        await promptLogin();
        return;
      }

      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          astrologerId,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.code === "INSUFFICIENT_BALANCE") {
          await notify(data.error);
          router.push("/wallet");
          return;
        }

        await notify(data.error || "Unable to start chat");
        return;
      }

      router.push(`/chat/${data.chatSessionId}`);
    } catch (error) {
      console.error("START_CHAT_BUTTON_ERROR", error);
      await notify("Something went wrong while starting chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <button
      onClick={startChat}
      disabled={loading}
      className="w-full py-4 rounded-2xl bg-[#650D26] text-white font-semibold shadow-xl hover:bg-[#44091A] disabled:opacity-60 text-lg active:scale-[0.98] transition"
    >
      {loading ? "Starting..." : "Start Chat"}
    </button>

    </>
  );
}
