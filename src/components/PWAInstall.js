"use client";

import { useEffect, useState } from "react";

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.startsWith("android-app://");

    setIsStandalone(standalone);
    setLoaded(true);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (!loaded) return null;

  if (dismissed || isStandalone) return null;

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice?.outcome === "accepted") {
        setDismissed(true);
      }

      return;
    }

    alert(
      "To install Vedmantra, tap the browser menu and choose 'Add to Home screen' or 'Install app'."
    );
  };

  return (
    <>
      <div className="h-[70px]" />

      <div className="fixed top-0 left-0 right-0 z-[99999]">
        <div className="bg-gradient-to-r from-[#24110A] via-[#3A1D12] to-[#24110A] text-white px-4 py-1.5 shadow-lg border-b border-[#4B281A]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <button
              onClick={installApp}
              className="flex flex-col text-left min-w-0"
            >
              <div className="font-extrabold text-sm truncate">
                📲 Install Vedmantra
              </div>

              <div className="text-[11px] text-yellow-300 font-semibold">
                ⭐⭐⭐⭐⭐ 4.8 Rated
              </div>
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={installApp}
                className="bg-[#D4A373] text-[#24110A] px-4 py-2 rounded-full text-xs font-extrabold shadow-md"
              >
                Install
              </button>

              <button
                onClick={() => setDismissed(true)}
                className="text-white/70 text-xl leading-none px-1"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}