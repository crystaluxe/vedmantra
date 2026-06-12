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
  const shouldAutoScroll = useRef(true);

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
        setMessages((prev) => {
          const oldLength = prev.length;
          const newMessages = data.messages || [];

          if (newMessages.length > oldLength && !shouldAutoScroll.current) {
            setShowNewMessageButton(true);
          }

          return newMessages;
        });
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

  useEffect(() => {
    if (shouldAutoScroll.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleScroll = (e) => {
    const el = e.target;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    shouldAutoScroll.current = distanceFromBottom < 150;

    if (shouldAutoScroll.current) {
      setShowNewMessageButton(false);
    }
  };

  const scrollToBottom = () => {
    shouldAutoScroll.current = true;
    setShowNewMessageButton(false);

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
      shouldAutoScroll.current = true;

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
    } catch (error) {
      console.error("SEND_ADMIN_REPLY_ERROR", error);

      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));

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
      <section className="bg-white border-b border-[#ead8c2] px-3 py-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[#fff8ef] border border-[#ead8c2] p-3">
            <p className="text-[10px] font-bold text-[#7a5a3a] uppercase">
              Wallet
            </p>
            <p className="text-lg font-extrabold text-green-700 mt-1">
              ₹{chatMeta?.walletBalance ?? "..."}
            </p>
          </div>

          <div className="rounded-xl bg-[#fff8ef] border border-[#ead8c2] p-3">
            <p className="text-[10px] font-bold text-[#7a5a3a] uppercase">
              Timer
            </p>
            <p className="text-lg font-extrabold text-[#2b1208] mt-1">
              {duration}
            </p>
          </div>

          <div className="rounded-xl bg-[#fff8ef] border border-[#ead8c2] p-3">
            <p className="text-[10px] font-bold text-[#7a5a3a] uppercase">
              Rate
            </p>
            <p className="text-lg font-extrabold text-[#2b1208] mt-1">
              ₹{chatMeta?.astrologerPrice ?? "..."}
            </p>
          </div>

          <div className="rounded-xl bg-[#fff8ef] border border-[#ead8c2] p-3">
            <p className="text-[10px] font-bold text-[#7a5a3a] uppercase">
              Status
            </p>
            <p
              className={`text-lg font-extrabold mt-1 ${
                isChatEnded ? "text-red-600" : "text-green-600"
              }`}
            >
              {chatMeta?.status || "..."}
            </p>
          </div>
        </div>

        <button
          onClick={endChat}
          disabled={ending || isChatEnded}
          className="mt-3 w-full h-11 rounded-xl bg-red-600 text-white text-sm font-bold disabled:opacity-50"
        >
          {isChatEnded ? "Chat Ended" : ending ? "Ending..." : "End Chat"}
        </button>
      </section>

      <section
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto px-3 py-4 md:p-6 bg-[#f7efe4]"
      >
        <div className="space-y-4">
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
                  className={`max-w-[88%] md:max-w-[78%] rounded-3xl px-4 md:px-5 py-3 md:py-4 shadow-md ${
                    isAstrologer
                      ? "bg-[#2b1208] text-white rounded-br-md"
                      : "bg-[#fff8ef] border border-[#ead8c2] text-[#2b1208] rounded-bl-md"
                  } ${msg.pending ? "opacity-70" : ""}`}
                >
                  <div className="text-[11px] md:text-xs font-bold mb-1.5 opacity-70">
                    {isAstrologer ? "Astrologer" : "Customer"}
                  </div>

                  <p className="text-sm md:text-[15px] leading-6 md:leading-7 break-words">
                    {msg.message}
                  </p>

                  <div
                    className={`text-[11px] mt-2 ${
                      isAstrologer ? "text-[#d8c2b2]" : "text-[#7a5a3a]"
                    }`}
                  >
                    {msg.pending
                      ? "Sending..."
                      : new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && !isChatEnded && (
            <div className="flex justify-end">
              <div className="bg-[#2b1208] text-white rounded-3xl rounded-br-md px-4 py-3 shadow-md flex items-center gap-2">
                <span className="text-xs font-semibold opacity-80">
                  Typing
                </span>

                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showNewMessageButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#2b1208] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl"
          >
            New message ↓
          </button>
        )}
      </section>

      <footer className="bg-white border-t border-[#ead8c2] p-3 md:p-5">
        {isChatEnded && (
          <div className="mb-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm font-bold text-center">
            This chat has ended. Replies are disabled.
          </div>
        )}

        <div className="flex gap-2 md:gap-3">
          <input
            type="text"
            value={message}
            disabled={isChatEnded}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={isChatEnded ? "Chat ended" : "Reply as astrologer..."}
            className="min-w-0 flex-1 h-12 md:h-14 rounded-2xl border border-[#ead8c2] px-4 md:px-5 outline-none bg-white disabled:opacity-60 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendReply();
              }
            }}
          />

          <button
            onClick={sendReply}
            disabled={sending || !message.trim() || isChatEnded}
            className="shrink-0 px-4 md:px-8 rounded-2xl bg-[#2b1208] text-white text-sm md:text-base font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </footer>
    </>
  );
}