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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const notificationSoundRef = useRef(null);

  useEffect(() => {
    if (!chatSessionId) return;

    const key = `chat-started-at-${chatSessionId}`;
    let startedAt = localStorage.getItem(key);

    if (!startedAt) {
      startedAt = new Date().toISOString();
      localStorage.setItem(key, startedAt);
    }

    const updateTimer = () => {
      const elapsed = Math.floor(
        (Date.now() - new Date(startedAt).getTime()) / 1000
      );
      setSeconds(elapsed);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [chatSessionId]);

  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();

    notificationSoundRef.current = new Audio("/notification.mp3");
    notificationSoundRef.current.preload = "auto";
  }, []);

  const safeJson = async (res) => {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      return { success: false, error: text || "Invalid server response" };
    }
  };

  const playSound = async () => {
    if (!soundEnabled) return;

    try {
      if (!notificationSoundRef.current) return;
      notificationSoundRef.current.currentTime = 0;
      await notificationSoundRef.current.play();
    } catch (error) {
      console.error("NOTIFICATION_SOUND_ERROR", error);
    }
  };

  const unlockSound = async () => {
    try {
      if (!notificationSoundRef.current) return;
      notificationSoundRef.current.volume = 0.6;
      await notificationSoundRef.current.play();
      notificationSoundRef.current.pause();
      notificationSoundRef.current.currentTime = 0;
      setSoundEnabled(true);
    } catch (error) {
      console.error("SOUND_UNLOCK_ERROR", error);
      setSoundEnabled(true);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/wallet", { cache: "no-store" });
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
          const alreadyHadMessages = lastMessageIdRef.current !== null;
          lastMessageIdRef.current = latestMessage.id;

          if (alreadyHadMessages) {
            await playSound();

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Vedmantra", {
                body: "Your astrologer has replied.",
                icon: "/favicon.ico",
              });
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

    const deductionInterval = setInterval(async () => {
      if (!chatSessionId || chatEnded || chatPaused) return;

      try {
        const res = await fetch("/api/chat/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatSessionId: Number(chatSessionId) }),
        });

        const data = await safeJson(res);

        if (data.success) {
          setWalletBalance(data.balance);

          if (data.deducted > 0) {
            setDeductedAmount(data.deducted);
            setTimeout(() => setDeductedAmount(null), 2500);
          }

          if (data.chatEnded || data.code === "LOW_BALANCE") {
            setChatPaused(true);
            setShowRechargePopup(true);
          }
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
    }, 10000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(walletInterval);
      clearInterval(deductionInterval);
    };
  }, [chatSessionId, chatEnded, chatPaused, soundEnabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const postMessageToServer = async (payload) => {
    const endpoints = ["/api/chat/message", "/api/chat/messages"];
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.status === 404 || res.status === 405) {
          lastError = `Route not found: ${endpoint}`;
          continue;
        }

        return await safeJson(res);
      } catch (error) {
        lastError = error;
      }
    }

    return {
      success: false,
      error: lastError?.message || lastError || "Unable to connect to chat API",
    };
  };

  const sendMessage = async () => {
    const cleanMessage = input.trim();

    if (!cleanMessage || sending || !chatSessionId || chatEnded || chatPaused) {
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
      setTyping(true);

      const data = await postMessageToServer({
        chatSessionId: Number(chatSessionId),
        message: cleanMessage,
        sender: "USER",
      });

      setTimeout(() => setTyping(false), 2200);

      if (!data.success) {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        alert(data.error || "Unable to send message");
        return;
      }

      await fetchMessages();
    } catch (error) {
      console.error("SEND_MESSAGE_CLIENT_ERROR", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setTyping(false);
      alert("Something went wrong while sending message.");
    } finally {
      setSending(false);
    }
  };

  const endChat = async () => {
    if (endingChat || !chatSessionId) return;

    const confirmed = window.confirm("Are you sure you want to end this consultation?");
    if (!confirmed) return;

    try {
      setEndingChat(true);

      const res = await fetch("/api/chat/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatSessionId: Number(chatSessionId) }),
      });

      const data = await safeJson(res);

      if (!data.success) {
        alert(data.error || "Unable to end chat");
        return;
      }

      localStorage.removeItem(`chat-started-at-${chatSessionId}`);
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
      <section className="shrink-0 bg-[#FFFDF9]/95 border-b border-[#E9DDCF] px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 px-3 rounded-full bg-[#F4E9DC] border border-[#E5D5C2] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-[11px] font-bold text-[#5D4031]">
                {chatPaused ? "Recharge" : chatEnded ? "Ended" : "Live"} · {formatTime()}
              </span>
            </div>

            {deductedAmount && (
              <span className="text-[11px] font-bold text-[#8B1E14]">
                ₹{deductedAmount} deducted
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) unlockSound();
              }}
              className="h-8 w-8 rounded-full bg-[#F4E9DC] border border-[#E5D5C2] text-[13px]"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>

            <button
              onClick={endChat}
              disabled={endingChat || chatEnded}
              className="h-8 px-3 rounded-full bg-[#3A1D12] text-white text-[11px] font-bold disabled:opacity-50"
            >
              {chatEnded ? "Ended" : endingChat ? "Ending" : "End"}
            </button>
          </div>
        </div>
      </section>

      <section
        className="relative flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-[#FAF7F2]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0% 100%, rgba(133, 89, 47, 0.08), transparent 32%)",
        }}
      >
        <div className="flex justify-center py-1">
          <div className="px-3 py-1 rounded-full bg-[#EFE5D8] text-[#7A624D] text-[10px] font-semibold">
            Today
          </div>
        </div>

        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="max-w-[76%] bg-white text-[#21150F] rounded-2xl rounded-tl-md px-3 py-2 shadow-sm border border-[#EFE7DD]">
              <p className="text-[13px] leading-5">
                Namaste 🙏 Batayein, kis baat par guidance chahiye?
              </p>
              <p className="text-[9px] text-[#9B8A7A] mt-1 text-right">
                Just now
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === "USER";

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] px-3 py-2 shadow-sm border ${
                  isUser
                    ? "bg-[#E8F7D9] border-[#D6EAC8] text-[#1B2514] rounded-2xl rounded-tr-md"
                    : "bg-white border-[#EFE7DD] text-[#21150F] rounded-2xl rounded-tl-md"
                } ${msg.pending ? "opacity-70" : ""}`}
              >
                <p className="text-[13.5px] leading-5 break-words">
                  {msg.message}
                </p>

                <div className="flex justify-end items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-[#9B8A7A]">
                    {msg.pending
                      ? "Sending"
                      : new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </span>

                  {isUser && !msg.pending && (
                    <span className="text-[9px] text-[#4B9DD8]">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#EFE7DD] rounded-2xl px-3 py-2 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#9B8A7A] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#9B8A7A] rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-1.5 h-1.5 bg-[#9B8A7A] rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          </div>
        )}

        {chatPaused && (
          <div className="space-y-2 py-2">
            <div className="flex justify-center">
              <div className="bg-white border border-[#E3D5C4] text-[#3A1D12] px-3 py-1.5 rounded-full text-[10px] font-extrabold shadow-sm">
                CHAT PAUSED
              </div>
            </div>

            <p className="text-center text-xs text-[#6F5B49] leading-5 px-6">
              Wallet balance is low. Please recharge to continue.
            </p>
          </div>
        )}

        {chatEnded && (
          <div className="flex justify-center">
            <div className="bg-white border border-[#E3D5C4] text-red-600 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm">
              Consultation ended
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      {showRechargePopup && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <div className="w-full max-w-md bg-[#FFFDF9] rounded-t-[26px] p-5 shadow-2xl">
            <div className="w-14 h-1 bg-[#D8C9B8] rounded-full mx-auto mb-4" />

            <h2 className="text-xl font-extrabold text-[#24110A] text-center">
              Continue This Chat
            </h2>

            <p className="text-[#6F5B49] text-center mt-2 text-sm leading-6">
              Your wallet balance is exhausted. Recharge now to continue your consultation.
            </p>

            <div className="mt-4 rounded-2xl bg-[#F4E9DC] border border-[#E5D5C2] px-4 py-3 text-[#3A1D12] font-bold text-center text-sm">
              🎁 Recharge ₹199 and Get ₹20 Extra
            </div>

            <button
              onClick={() => {
                window.location.href = "/wallet";
              }}
              className="w-full mt-4 h-12 rounded-2xl bg-[#3A1D12] text-white font-bold text-sm shadow-lg"
            >
              Recharge & Continue
            </button>
          </div>
        </div>
      )}

      <footer className="shrink-0 bg-[#FFFDF9] border-t border-[#E9DDCF] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            disabled={chatEnded || chatPaused}
            onChange={(e) => setInput(e.target.value)}
            onFocus={unlockSound}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder={
              chatPaused
                ? "Recharge required"
                : chatEnded
                ? "Consultation ended"
                : "Type your message..."
            }
            className="min-w-0 flex-1 h-11 rounded-full bg-[#F8F1E8] border border-[#E5D5C2] px-4 outline-none disabled:opacity-60 text-[13.5px] text-[#21150F] placeholder:text-[#9B8A7A]"
          />

          <button
            onClick={sendMessage}
            disabled={sending || !input.trim() || chatEnded || chatPaused}
            className="shrink-0 w-11 h-11 rounded-full bg-[#3A1D12] text-white text-[15px] font-bold flex items-center justify-center shadow-md disabled:opacity-45"
          >
            {sending ? "…" : "➤"}
          </button>
        </div>
      </footer>
    </>
  );
}