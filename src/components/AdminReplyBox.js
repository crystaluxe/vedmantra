"use client";

import { useEffect, useRef, useState } from "react";

export default function AdminReplyBox({ chatId, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);

  const [chatMeta, setChatMeta] = useState(null);
  const [duration, setDuration] = useState("00:00");
  const [isTyping, setIsTyping] = useState(false);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesLengthRef = useRef(initialMessages?.length || 0);
  const manuallyScrolledRef = useRef(false);

  const safeJson = async (res) => {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      return {
        success: false,
        error: text || "Invalid server response",
      };
    }
  };

  const fetchMeta = async () => {
    if (!chatId) return;

    try {
      const res = await fetch(`/api/admin/chat-meta?chatId=${chatId}`, {
        cache: "no-store",
      });

      const data = await safeJson(res);

      if (data.success) {
        setChatMeta(data.chat);
      }
    } catch (error) {
      console.error("FETCH_ADMIN_META_ERROR", error);
    }
  };

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const res = await fetch(`/api/chat/messages?chatSessionId=${chatId}`, {
        cache: "no-store",
      });

      const data = await safeJson(res);

      if (data.success) {
        const newMessages = data.messages || [];

        if (
          newMessages.length > messagesLengthRef.current &&
          manuallyScrolledRef.current
        ) {
          setShowNewMessageButton(true);
        }

        messagesLengthRef.current = newMessages.length;
        setMessages(newMessages);
      }
    } catch (error) {
      console.error("FETCH_ADMIN_MESSAGES_ERROR", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchMeta();

    const messageInterval = setInterval(fetchMessages, 2000);
    const metaInterval = setInterval(fetchMeta, 5000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(metaInterval);
    };
  }, [chatId]);

  useEffect(() => {
    if (!chatMeta?.startedAt) return;

    const updateDuration = () => {
      const start = new Date(chatMeta.startedAt).getTime();

      const end =
        chatMeta.status === "ENDED" && chatMeta.endedAt
          ? new Date(chatMeta.endedAt).getTime()
          : Date.now();

      const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
      const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
      const secs = (totalSeconds % 60).toString().padStart(2, "0");

      setDuration(`${mins}:${secs}`);
    };

    updateDuration();

    const timer = setInterval(updateDuration, 1000);

    return () => clearInterval(timer);
  }, [chatMeta?.startedAt, chatMeta?.status, chatMeta?.endedAt]);

  const handleScroll = () => {
    manuallyScrolledRef.current = true;
  };

  const scrollToBottom = () => {
    setShowNewMessageButton(false);
    manuallyScrolledRef.current = false;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const postMessageToServer = async (payload) => {
    const endpoints = ["/api/chat/message", "/api/chat/messages"];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (res.status === 404 || res.status === 405) continue;

        return await safeJson(res);
      } catch (error) {
        console.error("ADMIN_SEND_ENDPOINT_ERROR", error);
      }
    }

    return {
      success: false,
      error: "Unable to send message",
    };
  };

  const sendReply = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage || sending || !chatId || chatMeta?.status === "ENDED") {
      return;
    }

    const tempMessage = {
      id: `temp-admin-${Date.now()}`,
      chatSessionId: Number(chatId),
      sender: "ADMIN",
      message: cleanMessage,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    try {
      setSending(true);
      setMessages((prev) => [...prev, tempMessage]);
      setMessage("");
      setIsTyping(false);

      const data = await postMessageToServer({
        chatSessionId: Number(chatId),
        sender: "ADMIN",
        message: cleanMessage,
      });

      if (!data.success) {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== tempMessage.id)
        );

        alert(data.error || "Unable to send reply");
        return;
      }

      await fetchMessages();

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      console.error("SEND_ADMIN_REPLY_ERROR", error);
      alert("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const endChat = async () => {
    if (ending || !chatId) return;

    const confirmed = window.confirm("End this chat now?");
    if (!confirmed) return;

    try {
      setEnding(true);

      const res = await fetch("/api/chat/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatSessionId: Number(chatId),
        }),
      });

      const data = await safeJson(res);

      if (!data.success) {
        alert(data.error || "Unable to end chat");
        return;
      }

      await fetchMeta();
      alert("Chat ended successfully");
    } catch (error) {
      console.error("ADMIN_END_CHAT_ERROR", error);
      alert("Unable to end chat");
    } finally {
      setEnding(false);
    }
  };

  const handleTyping = (value) => {
    setMessage(value);
    setIsTyping(Boolean(value.trim()));

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1200);
  };

  const isChatEnded = chatMeta?.status === "ENDED";

  return (
    <>
      <section className="bg-[#075E54] text-white px-3 py-3 shadow-md">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/12 border border-white/15 p-3">
            <p className="text-[10px] font-bold uppercase opacity-75">
              Wallet
            </p>
            <p className="text-lg font-extrabold mt-1">
              ₹{chatMeta?.walletBalance ?? "..."}
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 border border-white/15 p-3">
            <p className="text-[10px] font-bold uppercase opacity-75">
              Timer
            </p>
            <p className="text-lg font-extrabold mt-1">{duration}</p>
          </div>

          <div className="rounded-2xl bg-white/12 border border-white/15 p-3">
            <p className="text-[10px] font-bold uppercase opacity-75">
              Rate
            </p>
            <p className="text-lg font-extrabold mt-1">
              ₹{chatMeta?.astrologerPrice ?? "..."}
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 border border-white/15 p-3">
            <p className="text-[10px] font-bold uppercase opacity-75">
              Status
            </p>
            <p
              className={`text-lg font-extrabold mt-1 ${
                isChatEnded ? "text-red-200" : "text-green-200"
              }`}
            >
              {chatMeta?.status || "..."}
            </p>
          </div>
        </div>

        <button
          onClick={endChat}
          disabled={ending || isChatEnded}
          className="mt-3 w-full h-11 rounded-2xl bg-red-500 text-white text-sm font-bold disabled:opacity-50"
        >
          {isChatEnded ? "Chat Ended" : ending ? "Ending..." : "End Chat"}
        </button>
      </section>

      <section
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto px-3 py-4 md:p-6 bg-[#ECE5DD]"
      >
        <div className="space-y-3">
          {messages.map((msg) => {
            const isAstrologer =
              msg.sender === "ASTROLOGER" || msg.sender === "ADMIN";

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isAstrologer ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] md:max-w-[75%] px-4 py-2.5 shadow-sm ${
                    isAstrologer
                      ? "bg-[#DCF8C6] text-[#111B21] rounded-2xl rounded-tr-sm"
                      : "bg-white text-[#111B21] rounded-2xl rounded-tl-sm"
                  } ${msg.pending ? "opacity-70" : ""}`}
                >
                  <div
                    className={`text-[11px] font-bold mb-1 ${
                      isAstrologer ? "text-[#128C7E]" : "text-[#6B7280]"
                    }`}
                  >
                    {isAstrologer ? "Astrologer" : "Customer"}
                  </div>

                  <p className="text-[15px] leading-6 break-words">
                    {msg.message}
                  </p>

                  <div className="flex justify-end">
                    <span className="text-[10px] text-[#667781] mt-1">
                      {msg.pending
                        ? "Sending..."
                        : new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && !isChatEnded && (
            <div className="flex justify-end">
              <div className="bg-[#DCF8C6] text-[#111B21] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm flex items-center gap-2">
                <span className="text-xs font-semibold text-[#128C7E]">
                  Typing
                </span>

                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#128C7E] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#128C7E] rounded-full animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 bg-[#128C7E] rounded-full animate-bounce [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showNewMessageButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#25D366] text-[#111B21] px-4 py-2 rounded-full text-xs font-bold shadow-xl"
          >
            New message ↓
          </button>
        )}
      </section>

      <footer className="bg-[#F0F2F5] border-t border-[#d9d9d9] p-3 md:p-4">
        {isChatEnded && (
          <div className="mb-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm font-bold text-center">
            This chat has ended. Replies are disabled.
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-3">
          <input
            type="text"
            value={message}
            disabled={isChatEnded}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={isChatEnded ? "Chat ended" : "Type a message"}
            className="min-w-0 flex-1 h-12 rounded-full border border-transparent px-5 outline-none bg-white disabled:opacity-60 text-sm shadow-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendReply();
              }
            }}
          />

          <button
            onClick={sendReply}
            disabled={sending || !message.trim() || isChatEnded}
            className="shrink-0 w-12 h-12 rounded-full bg-[#25D366] text-white text-lg font-bold flex items-center justify-center shadow-md disabled:opacity-50"
          >
            {sending ? "…" : "➤"}
          </button>
        </div>
      </footer>
    </>
  );
}