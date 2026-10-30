"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function StartChatButton({ astrologerId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const loginDialog = useRef(null);
  const returnPath = `/astrologer/${astrologerId}`;

  const promptLogin = () => loginDialog.current?.showModal();

  const startChat = async () => {
    try {
      setLoading(true);

      const userData = localStorage.getItem("astro-user");

      if (!userData) {
        promptLogin();
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
      } catch {
        localStorage.removeItem("astro-user");
        promptLogin();
        return;
      }

      if (!user?.id) {
        localStorage.removeItem("astro-user");
        promptLogin();
        return;
      }

      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          astrologerId,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.code === "INSUFFICIENT_BALANCE") {
          alert(data.error);
          router.push("/wallet");
          return;
        }

        alert(data.error || "Unable to start chat");
        return;
      }

      router.push(`/chat/${data.chatSessionId}`);
    } catch (error) {
      console.error("START_CHAT_BUTTON_ERROR", error);
      alert("Something went wrong while starting chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <button
      onClick={startChat}
      disabled={loading}
      className="w-full py-4 rounded-2xl bg-[#650D26] text-white font-semibold shadow-xl hover:bg-[#44091A] disabled:opacity-60 text-lg active:scale-[0.98] transition"
    >
      {loading ? "Starting..." : "Start Chat"}
    </button>
    <dialog
      ref={loginDialog}
      aria-labelledby="chat-login-title"
      aria-describedby="chat-login-description"
      className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-[28px] border border-[#E8D7DC] bg-[#FFFCF8] p-7 text-center text-[#4A102A] shadow-2xl backdrop:bg-[#24111B]/60 backdrop:backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
        }
      }}
    >
      <form method="dialog" className="absolute right-4 top-3">
        <button aria-label="Close sign-in prompt" className="rounded-full px-2 py-1 text-xl text-[#8E747A] hover:bg-[#F3E5E9]">×</button>
      </form>
      <div aria-hidden="true" className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E5E9] text-3xl text-[#650D26]">✺</div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.22em] text-[#997345]">Your guidance awaits</p>
      <h2 id="chat-login-title" className="text-2xl font-semibold tracking-tight">A moment to connect</h2>
      <p id="chat-login-description" className="mt-3 text-sm leading-7 text-[#806B70]">Sign in with your mobile number to start your consultation. We’ll bring you right back to this astrologer.</p>
      <a href={`/login?next=${encodeURIComponent(returnPath)}`} className="mt-6 block rounded-full bg-[#650D26] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#44091A]">Sign in & continue →</a>
      <form method="dialog"><button className="mt-3 rounded-full px-5 py-3 text-sm font-medium text-[#806B70]">Keep exploring</button></form>
      <p className="mt-3 text-[10px] text-[#A08B90]">Secure sign-in with a one-time code</p>
    </dialog>
    </>
  );
}
