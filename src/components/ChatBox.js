"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatBox({ chatSessionId, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [walletBalance, setWalletBalance] = useState(0);
  const [showRechargePopup, setShowRechargePopup] = useState(false);
  const [deductedAmount, setDeductedAmount] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [endingChat, setEndingChat] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [chatPaused, setChatPaused] = useState(false);

  const messagesEndRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const notificationSoundRef = useRef(null);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    notificationSoundRef.current = new Audio("/notification.mp3");
  }, []);

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

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/wallet", {
        cache: "no-store",
      });

      const data = await safeJson(res);

      if (data.success && data.wallet) {
        setWalletBalance(data.wallet.balance);
      }
    } catch (error) {
      console.error("FETCH_WALLET_ERROR", error);
    }
  };

  const fetchMessages = async () => {
    if (!chatSessionId) return;

    try {
      const res = await fetch(
        `/api/chat/messages?chatSessionId=${chatSessionId}`,
        { cache: "no-store" }
      );

      const data = await safeJson(res);

      if (data.success) {
        const newMessages = data.messages || [];
        const latestMessage =
          newMessages.length > 0 ? newMessages[newMessages.length - 1] : null;

        if (
          latestMessage &&
          latestMessage.sender === "ADMIN" &&
          latestMessage.id !== lastMessageIdRef.current
        ) {
          lastMessageIdRef.current = latestMessage.id;

          if (document.visibilityState !== "visible") {
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("Vedmantra", {
                body: "Your astrologer has replied.",
                icon: "/favicon.ico",
              });
            }

            try {
              notificationSoundRef.current?.play();
            } catch (error) {
              console.error("NOTIFICATION_SOUND_ERROR", error);
            }
          }
        }

        setMessages(newMessages);
      }
    } catch (error) {
      console.error("FETCH_MESSAGES_ERROR", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchWallet();

    const messageInterval = setInterval(fetchMessages, 2000);
    const walletInterval = setInterval(fetchWallet, 5000);

    const timerInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    const deductionInterval = setInterval(async () => {
      if (!chatSessionId || chatEnded || chatPaused) return;

      try {
        const res = await fetch("/api/chat/deduct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatSessionId: Number(chatSessionId),
          }),
        });

        const data = await safeJson(res);

        if (data.success) {
          setWalletBalance(data.balance);
          setDeductedAmount(data.deducted);

          setTimeout(() => {
            setDeductedAmount(null);
          }, 2500);
        }

        if (!data.success && data.code === "LOW_BALANCE") {
          setChatPaused(true);
          setShowRechargePopup(true);
        }

        if (!data.success && data.code === "CHAT_ENDED") {
          setChatEnded(true);
        }
      } catch (error) {
        console.error("DEDUCTION_ERROR", error);
      }
    }, 60000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(walletInterval);
      clearInterval(timerInterval);
      clearInterval(deductionInterval);
    };
  }, [chatSessionId, chatEnded, chatPaused]);

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
        lastError?.message || lastError || "Unable to connect to chat API",
    };
  };

  const sendMessage = async () => {
    const cleanMessage = input.trim();

    if (
      !cleanMessage ||
      sending ||
      !chatSessionId ||
      chatEnded ||
      chatPaused
    ) {
      return;
    }

    const tempMessage = {
      id: `temp-${Date.now()}`,
      chatSessionId: Number(chatSessionId),
      message: cleanMessage,
      sender: "USER",
      createdAt: new Date().toISOString(),
      pending: true,
    };

    try {
      setSending(true);
      setMessages((prev) => [...prev, tempMessage]);
      setInput("");

      const data = await postMessageToServer({
        chatSessionId: Number(chatSessionId),
        message: cleanMessage,
        sender: "USER",
      });

      if (!data.success) {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== tempMessage.id)
        );

        alert(data.error || "Unable to send message");
        return;
      }

      await fetchMessages();
    } catch (error) {
      console.error("SEND_MESSAGE_CLIENT_ERROR", error);

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== tempMessage.id)
      );

      alert("Something went wrong while sending message.");
    } finally {
      setSending(false);
    }
  };

  const endChat = async () => {
    if (endingChat || !chatSessionId) return;

    const confirmed = window.confirm(
      "Are you sure you want to end this consultation?"
    );

    if (!confirmed) return;

    try {
      setEndingChat(true);

      const res = await fetch("/api/chat/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatSessionId: Number(chatSessionId),
        }),
      });

      const data = await safeJson(res);

      if (!data.success) {
        alert(data.error || "Unable to end chat");
        return;
      }

      setChatEnded(true);
      alert("Consultation ended successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("END_CHAT_ERROR", error);
      alert("Unable to end chat");
    } finally {
      setEndingChat(false);
    }
  };

  const formatTime = () => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");

    return `${mins}:${secs}`;
  };

  return (
    <>
      <div className="px-4 pt-2">
        <div className="bg-[#24110A] text-white rounded-3xl p-4 shadow-xl flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#D8C2B2] font-bold">
              Live Session
            </p>

            <p className="text-sm font-semibold mt-1">
              {chatPaused
                ? "Recharge required"
                : chatEnded
                ? "Session ended"
                : "Session running"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-[#D8C2B2] font-bold">Duration</p>
            <p className="text-2xl font-extrabold">{formatTime()}</p>
          </div>

          {deductedAmount && (
            <div className="absolute right-5 bottom-3 text-red-300 text-sm font-bold animate-bounce">
              -₹{deductedAmount}
            </div>
          )}
        </div>

        <div className="mt-3">
          <button
            onClick={endChat}
            disabled={endingChat || chatEnded}
            className="w-full h-12 rounded-2xl bg-red-500 text-white font-bold shadow-lg disabled:opacity-60"
          >
            {chatEnded
              ? "Consultation Ended"
              : endingChat
              ? "Ending..."
              : "End Consultation"}
          </button>
        </div>
      </div>

      <section className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">
        <div className="flex justify-start">
          <div className="max-w-[82%] bg-white/55 backdrop-blur-xl border border-white/60 rounded-[24px] rounded-tl-md px-4 py-3 shadow-md">
            <p className="text-sm leading-6 font-medium">
              Namaste 🙏 Please share your concern.
            </p>

            <p className="text-[11px] text-[#7A5A45] mt-2 font-semibold">
              Just now
            </p>
          </div>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === "USER";

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-[24px] px-4 py-3 shadow-md ${
                  isUser
                    ? "bg-[#24110A] text-white rounded-tr-md"
                    : "bg-white/55 backdrop-blur-xl border border-white/60 rounded-tl-md"
                } ${msg.pending ? "opacity-70" : ""}`}
              >
                <p className="text-sm leading-6 font-medium">{msg.message}</p>

                <p
                  className={`text-[11px] mt-2 font-semibold ${
                    isUser ? "text-[#D8C2B2]" : "text-[#7A5A45]"
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

        {chatPaused && (
          <div className="flex justify-center">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-full text-xs font-bold">
              Recharge required to continue this chat
            </div>
          </div>
        )}

        {chatEnded && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-full text-xs font-bold">
              This consultation has ended
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      {showRechargePopup && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl">
            <div className="w-16 h-1.5 bg-[#e7d4bf] rounded-full mx-auto mb-5" />

            <h2 className="text-2xl font-extrabold text-[#24110A] text-center">
              Recharge Required
            </h2>

            <p className="text-[#6b4b36] text-center mt-3 leading-7">
              Your wallet balance is below the astrologer&apos;s per minute
              price. Please recharge to continue this consultation.
            </p>

            <div className="mt-6">
              <button
                onClick={() => {
                  window.location.href = "/wallet";
                }}
                className="w-full h-14 rounded-2xl bg-[#24110A] text-white font-bold text-lg shadow-xl"
              >
                Recharge Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="sticky bottom-0 bg-white/40 backdrop-blur-2xl border-t border-white/60 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            disabled={chatEnded || chatPaused}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder={
              chatPaused
                ? "Recharge required to continue chat"
                : chatEnded
                ? "Consultation has ended"
                : "Type your message..."
            }
            className="flex-1 h-14 rounded-2xl bg-white/55 border border-white/70 px-5 outline-none placeholder:text-[#8A6B55] shadow-sm disabled:opacity-60"
          />

          <button
            onClick={sendMessage}
            disabled={sending || !input.trim() || chatEnded || chatPaused}
            className="w-14 h-14 rounded-2xl bg-[#24110A] text-white text-xl font-bold shadow-xl disabled:opacity-60"
          >
            {sending ? "…" : "→"}
          </button>
        </div>
      </footer>
    </>
  );
}