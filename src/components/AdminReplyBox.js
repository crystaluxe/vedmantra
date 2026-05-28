"use client";

import { useEffect, useRef, useState } from "react";

export default function AdminReplyBox({ chatId, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

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

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const res = await fetch(
        `/api/chat/messages?chatSessionId=${chatId}`,
        {
          cache: "no-store",
        }
      );

      const data = await safeJson(res);

      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("FETCH_ADMIN_MESSAGES_ERROR", error);
    }
  };

  useEffect(() => {
    fetchMessages();

    const interval = setInterval(fetchMessages, 2000);

    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const postMessageToServer = async (payload) => {
    const endpoints = ["/api/chat/message", "/api/chat/messages"];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (res.status === 404 || res.status === 405) {
          lastError = `Route not found: ${endpoint}`;
          continue;
        }

        const data = await safeJson(res);

        return data;
      } catch (error) {
        lastError = error;
      }
    }

    return {
      success: false,
      error:
        lastError?.message ||
        lastError ||
        "Unable to connect to chat API",
    };
  };

  const sendReply = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage || sending || !chatId) return;

    const tempMessage = {
      id: `temp-admin-${Date.now()}`,
      chatSessionId: Number(chatId),
      sender: "ASTROLOGER",
      message: cleanMessage,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    try {
      setSending(true);
      setMessages((prev) => [...prev, tempMessage]);
      setMessage("");

      const data = await postMessageToServer({
        chatSessionId: Number(chatId),
        sender: "ASTROLOGER",
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

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== tempMessage.id)
      );

      alert("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section className="flex-1 p-5 space-y-4 overflow-y-auto">
        {messages.map((msg) => {
          const isAstrologer = msg.sender === "ASTROLOGER";

          return (
            <div
              key={msg.id}
              className={`flex ${
                isAstrologer ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-3xl shadow-md ${
                  isAstrologer
                    ? "bg-[#2b1208] text-white"
                    : "bg-white"
                } ${msg.pending ? "opacity-70" : ""}`}
              >
                <p>{msg.message}</p>

                <p
                  className={`text-xs mt-2 ${
                    isAstrologer ? "text-[#d8c2b2]" : "text-[#7a5a3a]"
                  }`}
                >
                  {msg.pending
                    ? "Sending..."
                    : new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </section>

      <footer className="bg-white border-t border-[#ead8c2] p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reply as astrologer..."
            className="flex-1 h-14 rounded-2xl border border-[#ead8c2] px-4 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendReply();
              }
            }}
          />

          <button
            onClick={sendReply}
            disabled={sending || !message.trim()}
            className="px-6 rounded-2xl bg-[#2b1208] text-white font-semibold disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </footer>
    </>
  );
}