"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartChatButton({ astrologerId, price }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startChat() {
    setLoading(true);

    const res = await fetch("/api/chat/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ astrologerId }),
    });

    const data = await res.json();

    if (data.success) {
      router.push(`/chat/${data.chatSessionId}`);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={startChat}
      disabled={loading}
      className="w-full bg-[#24110A] text-white py-4 rounded-3xl text-lg font-bold shadow-2xl"
    >
      {loading ? "Starting Chat..." : `Start Chat • ₹${price}/min`}
    </button>
  );
}