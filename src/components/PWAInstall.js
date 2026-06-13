"use client";

import { useEffect, useState } from "react";

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const installApp = async () => {
    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    if (choice?.outcome === "accepted") {
      setDismissed(true);
    }
  };

  return (
    <div className="sticky top-0 z-[9999] w-full">
      <div className="bg-gradient-to-r from-[#24110A] via-[#3A1D12] to-[#24110A] text-white px-4 py-2 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">

          <div className="flex flex-col min-w-0">
            <div className="font-bold text-sm truncate">
              📲 Install Vedmantra
            </div>

            <div className="text-[11px] text-yellow-300 font-medium">
              ⭐⭐⭐⭐⭐ 4.8 Rated Astrology Platform
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">

            <button
              onClick={installApp}
              className="bg-[#D4A373] text-[#24110A] px-4 py-2 rounded-full text-xs font-extrabold"
            >
              Install
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="text-white/70 text-lg leading-none"
            >
              ×
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}