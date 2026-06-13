"use client";

import { useEffect, useRef, useState } from "react";
import AdminReplyBox from "@/components/AdminReplyBox";

export default function AdminChatsDashboard({ initialChats, selectedChatId }) {
  const [chats, setChats] = useState(initialChats || []);
  const [activeChatId, setActiveChatId] = useState(selectedChatId || null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const audioRef = useRef(null);
  const latestMessageMapRef = useRef({});
  const firstLoadRef = useRef(true);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");

    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const enableSound = async () => {
    try {
      setSoundEnabled(true);
      await audioRef.current?.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } catch (error) {
      console.log("Sound will work after interaction.");
    }
  };

  const playSound = async () => {
    if (!soundEnabled) return;

    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      console.error("ADMIN_SOUND_ERROR", error);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/admin/chats-list", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) return;

      const newChats = data.chats || [];

      if (!firstLoadRef.current) {
        newChats.forEach((chat) => {
          const lastMessage = chat.lastMessage;
          if (!lastMessage) return;

          const oldMessageId = latestMessageMapRef.current[chat.id];

          if (
            oldMessageId &&
            oldMessageId !== lastMessage.id &&
            lastMessage.sender === "USER"
          ) {
            playSound();

            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("New Vedmantra Message", {
                body: `${chat.userName}: ${lastMessage.message}`,
              });
            }
          }
        });
      }

      newChats.forEach((chat) => {
        if (chat.lastMessage?.id) {
          latestMessageMapRef.current[chat.id] = chat.lastMessage.id;
        }
      });

      firstLoadRef.current = false;
      setChats(newChats);
    } catch (error) {
      console.error("FETCH_ADMIN_CHATS_ERROR", error);
    }
  };

  useEffect(() => {
    fetchChats();

    const interval = setInterval(fetchChats, 3000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  return (
    <main className="h-screen bg-[#111b21] overflow-hidden">
      <div className="h-full max-w-[1600px] mx-auto flex bg-[#efeae2]">
        <aside
          className={`w-full md:w-[390px] lg:w-[430px] bg-white border-r border-[#d9d9d9] flex flex-col ${
            activeChatId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="bg-[#075E54] text-white px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold">Vedmantra Admin</h1>
                <p className="text-xs text-white/75 mt-1">
                  Live chat dashboard
                </p>
              </div>

              <button
                onClick={enableSound}
                className="text-xs bg-white/15 px-3 py-2 rounded-full font-bold"
              >
                {soundEnabled ? "Sound On" : "Enable Sound"}
              </button>
            </div>
          </div>

          <div className="px-4 py-3 bg-[#f0f2f5] border-b border-[#e5e5e5]">
            <div className="h-10 rounded-full bg-white px-4 flex items-center text-sm text-[#667781]">
              Search chats
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-bold text-[#111b21]">No chats yet</p>
                <p className="text-sm text-[#667781] mt-2">
                  New customer chats will auto appear here.
                </p>
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = activeChatId === chat.id;

                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`w-full text-left px-4 py-4 border-b border-[#f0f2f5] transition ${
                      isActive ? "bg-[#e9edef]" : "bg-white hover:bg-[#f5f6f6]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#075E54] text-white flex items-center justify-center font-extrabold shrink-0">
                        {chat.userName?.slice(0, 1) || "U"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="font-bold text-[#111b21] truncate">
                            {chat.userName}
                          </h2>

                          <span className="text-[11px] text-[#667781] shrink-0">
                            #{chat.id}
                          </span>
                        </div>

                        <p className="text-xs text-[#667781] mt-0.5 truncate">
                          {chat.astrologerName} • ₹{chat.walletBalance}
                        </p>

                        <p className="text-sm text-[#3b4a54] mt-1 truncate">
                          {chat.lastMessage?.message || "No messages yet"}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                              chat.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {chat.status}
                          </span>

                          {chat.lastMessage?.sender === "USER" && (
                            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section
          className={`flex-1 flex-col bg-[#efeae2] ${
            activeChatId ? "flex" : "hidden md:flex"
          }`}
        >
          {activeChat ? (
            <>
              <header className="bg-[#075E54] text-white px-4 py-4 border-b border-[#064d45]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setActiveChatId(null)}
                      className="md:hidden w-9 h-9 rounded-full bg-white/15"
                    >
                      ←
                    </button>

                    <div className="min-w-0">
                      <h2 className="text-lg font-extrabold truncate">
                        {activeChat.userName}
                      </h2>

                      <p className="text-xs text-white/75 mt-1 truncate">
                        {activeChat.astrologerName} • Chat #{activeChat.id}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-white/75">Wallet</p>
                    <p className="font-extrabold">
                      ₹{activeChat.walletBalance}
                    </p>
                  </div>
                </div>
              </header>

              <AdminReplyBox
                key={activeChat.id}
                chatId={activeChat.id}
                initialMessages={[]}
              />
            </>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-[#efeae2]">
              <div className="text-center max-w-md px-6">
                <div className="w-28 h-28 rounded-full bg-[#075E54] mx-auto flex items-center justify-center text-white text-5xl">
                  💬
                </div>

                <h2 className="text-3xl font-bold text-[#111b21] mt-6">
                  Vedmantra Admin
                </h2>

                <p className="text-[#667781] mt-3">
                  Select a conversation from the left panel to start chatting.
                </p>

                <p className="text-sm text-[#8696A0] mt-2">
                  New chats and messages will appear automatically.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}