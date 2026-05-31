"use client";

import { useEffect, useState } from "react";

export default function ChatsPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const userData = localStorage.getItem("astro-user");

      if (!userData) {
        setChats([]);
        return;
      }

      const user = JSON.parse(userData);

      if (!user?.id) {
        setChats([]);
        return;
      }

      const res = await fetch(`/api/chat/history?userId=${user.id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setChats(data.chats || []);
      } else {
        setChats([]);
      }
    } catch (error) {
      console.error("FETCH_CHAT_HISTORY_ERROR:", error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main
      className="min-h-screen bg-[#F7EFE4] text-[#1F130D]"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="max-w-md mx-auto min-h-screen bg-gradient-to-br from-[#FFF8EF] via-[#F7E9D9] to-[#EED8BE] px-4 pt-5 pb-8">
        <div className="flex items-center justify-between mb-6">
          <a
            href="/"
            className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-md"
          >
            ←
          </a>

          <h1 className="text-2xl font-extrabold tracking-[-0.03em]">
            Chats
          </h1>

          <div className="w-10" />
        </div>

        {loading ? (
          <div className="bg-white/45 backdrop-blur-2xl rounded-[30px] p-6 shadow-xl border border-white/65 text-center">
            <p className="text-sm font-bold text-[#7A5A45]">
              Loading chats...
            </p>
          </div>
        ) : chats.length === 0 ? (
          <div className="bg-white/45 backdrop-blur-2xl rounded-[30px] p-8 shadow-xl border border-white/65 text-center mt-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF8EF] border border-[#EAD8C2] flex items-center justify-center text-2xl mb-4">
              💬
            </div>

            <h2 className="text-xl font-extrabold tracking-[-0.03em]">
              No Past Chat Available
            </h2>

            <p className="text-sm text-[#7A5A45] mt-2 leading-6">
              Start a chat with an astrologer and your history will appear here.
            </p>

            <a
              href="/"
              className="inline-flex mt-5 px-5 py-3 rounded-2xl bg-[#2b1208] text-white text-sm font-bold shadow-lg"
            >
              Start New Chat
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => {
              const lastMessage = chat.messages?.[0]?.message;
              const astrologer = chat.astrologer;

              return (
                <a
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="block bg-white/45 backdrop-blur-2xl rounded-[30px] p-4 shadow-xl border border-white/65 active:scale-[0.98] transition"
                >
                  <div className="flex gap-4">
                    <img
                      src={astrologer?.image}
                      alt={astrologer?.name || "Astrologer"}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between gap-3">
                        <h2 className="font-extrabold text-lg tracking-[-0.02em] line-clamp-1">
                          {astrologer?.name || "Astrologer"}
                        </h2>

                        <p className="text-xs text-[#7A5A45] font-bold shrink-0">
                          {formatTime(chat.startedAt)}
                        </p>
                      </div>

                      <p className="text-sm text-[#7A5A45] mt-1 leading-6 line-clamp-2">
                        {lastMessage || "Chat session started"}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <p
                          className={`text-xs font-bold ${
                            chat.status === "ACTIVE"
                              ? "text-green-600"
                              : "text-[#7A5A45]"
                          }`}
                        >
                          {chat.status === "ACTIVE"
                            ? "● Active Session"
                            : "Session Ended"}
                        </p>

                        <p className="text-xs font-bold text-[#8B4A22]">
                          ₹{astrologer?.price || 0}/min
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}