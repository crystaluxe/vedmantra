"use client";

import { useEffect, useState } from "react";

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={async () => {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-[#24110A] text-white rounded-full shadow-xl font-bold"
    >
      📲 Install Vedmantra
    </button>
  );
}