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
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    notificationSoundRef.current = new Audio("/notification.mp3");
    notificationSoundRef.current.preload = "auto";
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
          const alreadyHadMessages = lastMessageIdRef.current !== null;
          lastMessageIdRef.current = latestMessage.id;

          if (alreadyHadMessages) {
            await playSound();

            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
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

          if (data.deducted > 0) {
            setDeductedAmount(data.deducted);

            setTimeout(() => {
              setDeductedAmount(null);
            }, 2500);
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
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

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

      setTimeout(() => {
        setTyping(false);
      }, 2200);

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
      <section className="px-4 py-3">
        <div className="bg-gradient-to-r from-[#052F36] via-[#073E45] to-[#052F36] rounded-[28px] p-5 shadow-2xl grid grid-cols-2 gap-4 text-white border border-white/10">
          <div className="border-r border-white/20 pr-4">
            <p className="text-[11px] uppercase font-extrabold tracking-[0.16em] text-white/65">
              Timer
            </p>
            <p className="text-3xl font-black mt-2 tracking-tight">
              {formatTime()}
            </p>
          </div>

          <div className="pl-2">
            <p className="text-[11px] uppercase font-extrabold tracking-[0.16em] text-white/65">
              Status
            </p>
            <p className="text-2xl font-black mt-2 text-[#38E27C]">
              {chatPaused ? "Recharge" : chatEnded ? "Ended" : "Live"}
            </p>
          </div>
        </div>

        {deductedAmount && (
          <div className="mt-3 text-center text-xs font-bold text-[#5A120D] animate-bounce">
            ₹{deductedAmount} deducted
          </div>
        )}

        <button
          onClick={endChat}
          disabled={endingChat || chatEnded}
          className="mt-3 w-full h-12 rounded-[24px] bg-gradient-to-r from-[#5A120D] via-[#6B170F] to-[#4A0C08] text-white text-sm font-extrabold disabled:opacity-50 shadow-xl"
        >
          {chatEnded
            ? "Consultation Ended"
            : endingChat
            ? "Ending..."
            : "☎ End Consultation"}
        </button>
      </section>

      <section
        className="relative flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[#F6F1EA]"
        style={{
          backgroundImage:
            "radial-gradient(circle at left bottom, rgba(139, 92, 45, 0.10), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0))",
          backgroundSize: "100% 100%",
          backgroundPosition: "left bottom",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex justify-center mb-4">
          <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white text-[#2E7D32] text-xs font-semibold shadow-sm">
            🔒 Your conversation is secure and private
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[88%] bg-white text-[#111B21] rounded-3xl rounded-tl-sm px-5 py-3 shadow-md">
            <p className="text-[15px] leading-6">
              Namaste 🙏 Please share your concern.
            </p>
            <p className="text-[10px] text-[#667781] mt-1 text-right">
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
                className={`max-w-[84%] px-4 py-2.5 shadow-md ${
                  isUser
                    ? "bg-[#DDF8C8] text-[#111B21] rounded-3xl rounded-tr-sm"
                    : "bg-white text-[#111B21] rounded-3xl rounded-tl-sm"
                } ${msg.pending ? "opacity-70" : ""}`}
              >
                <p className="text-[15px] leading-6 break-words">
                  {msg.message}
                </p>

                <div className="flex justify-end items-center gap-1">
                  <span className="text-[10px] text-[#667781] mt-1">
                    {msg.pending
                      ? "Sending..."
                      : new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </span>

                  {isUser && !msg.pending && (
                    <span className="text-[10px] text-[#53bdeb] mt-1">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          </div>
        )}

        {chatPaused && (
          <div className="space-y-3 py-2">
            <div className="flex justify-center">
              <div className="bg-white border border-[#ddd] text-[#111B21] px-4 py-2 rounded-full text-xs font-extrabold shadow-sm">
                CHAT PAUSED
              </div>
            </div>

            <p className="text-center text-sm text-[#3b4a54] leading-6 px-4">
              Your chat paused due to low wallet balance. Please recharge to
              continue this consultation.
            </p>
          </div>
        )}

        {chatEnded && (
          <div className="flex justify-center">
            <div className="bg-white border border-[#ddd] text-red-600 px-4 py-2 rounded-full text-xs font-bold shadow-sm">
              This consultation has ended
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      <button
        onClick={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          if (next) unlockSound();
        }}
        className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-30 px-5 py-3 rounded-full bg-[#24110A] text-white text-sm font-extrabold shadow-2xl border border-white/10"
      >
        {soundEnabled ? "🔊 Sound on" : "🔇 Sound off"}
      </button>

      {showRechargePopup && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-[32px] p-6 shadow-2xl">
            <div className="w-16 h-1.5 bg-[#d9d9d9] rounded-full mx-auto mb-5" />

            <h2 className="text-2xl font-extrabold text-[#111B21] text-center">
              Continue This Chat
            </h2>

            <p className="text-[#667781] text-center mt-3 leading-7">
              Your wallet balance is exhausted. Recharge now to continue your
              consultation.
            </p>

            <div className="mt-5 rounded-2xl bg-[#E7FCE3] border border-[#C8E6C9] px-4 py-4 text-[#128C7E] font-bold text-center">
              🎁 Recharge ₹199 and Get ₹20 Extra
            </div>

            <button
              onClick={() => {
                window.location.href = "/wallet";
              }}
              className="w-full mt-5 h-14 rounded-2xl bg-[#25D366] text-white font-bold text-lg shadow-lg"
            >
              Yes, Continue this chat
            </button>
          </div>
        </div>
      )}

      <footer className="sticky bottom-0 bg-[#F7F8FA] border-t border-[#e8e8e8] p-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            disabled={chatEnded || chatPaused}
            onChange={(e) => setInput(e.target.value)}
            onFocus={unlockSound}
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
                : "Type a message..."
            }
            className="min-w-0 flex-1 h-14 rounded-full bg-white shadow-lg border border-[#ECECEC] px-6 outline-none disabled:opacity-60 text-[15px]"
          />

          <button
            onClick={sendMessage}
            disabled={sending || !input.trim() || chatEnded || chatPaused}
            className="shrink-0 w-14 h-14 rounded-full bg-[#16A34A] text-white text-xl font-bold flex items-center justify-center shadow-xl disabled:opacity-50"
          >
            {sending ? "…" : "➤"}
          </button>
        </div>
      </footer>
    </>
  );
}