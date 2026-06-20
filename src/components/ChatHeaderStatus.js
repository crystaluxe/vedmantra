"use client";

import { useEffect, useState } from "react";

export default function ChatHeaderStatus({ chatSessionId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus || "ACTIVE");

  useEffect(() => {
    if (!chatSessionId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `/api/chat/status?chatSessionId=${chatSessionId}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (data.success && data.chat?.status) {
          setStatus(data.chat.status);
        }
      } catch (error) {
        console.error("FETCH_HEADER_CHAT_STATUS_ERROR", error);
      }
    };

    fetchStatus();

    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [chatSessionId]);

  const normalizedStatus = String(status || "").toUpperCase();
  const isQueued = normalizedStatus === "QUEUED";
  const isEnded = normalizedStatus === "ENDED";

  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isEnded ? "bg-red-500" : isQueued ? "bg-amber-500" : "bg-green-500"
        }`}
      ></span>
      <span
        className={`text-[11px] font-semibold ${
          isEnded
            ? "text-red-600"
            : isQueued
            ? "text-amber-700"
            : "text-[#287A3E]"
        }`}
      >
        {isEnded ? "Ended" : isQueued ? "Waiting" : "Active"}
      </span>
    </div>
  );
}
