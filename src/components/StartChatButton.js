"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartChatButton({ astrologerId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ astrologerId }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.code === "INSUFFICIENT_BALANCE") {
          alert(data.error);
          router.push("/wallet");
          return;
        }

        alert(data.error || "Unable to start chat");
        return;
      }

      router.push(`/chat/${data.chatSessionId}`);
    } catch (error) {
      console.error("START_CHAT_BUTTON_ERROR", error);
      alert("Something went wrong while starting chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startChat}
      disabled={loading}
      className="w-full py-4 rounded-2xl bg-[#2b1208] text-white font-semibold shadow-xl disabled:opacity-60 text-lg active:scale-[0.98] transition"
    >
      {loading ? "Starting..." : "Start Chat"}
    </button>
  );
}