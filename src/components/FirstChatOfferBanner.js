"use client";

import { useEffect, useState } from "react";

export default function FirstChatOfferBanner() {
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    checkOffer();
  }, []);

  async function checkOffer() {
    try {
      const userData = localStorage.getItem("astro-user");

      if (!userData) return;

      const user = JSON.parse(userData);

      if (!user?.id) return;

      const res = await fetch(
        `/api/offer/status?userId=${user.id}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (data.success && data.freeOfferAvailable) {
        setShowOffer(true);
      }
    } catch (error) {
      console.error("OFFER_BANNER_ERROR", error);
    }
  }

  if (!showOffer) return null;

  return (
    <div className="rounded-[28px] bg-gradient-to-r from-[#24110A] to-[#8B4A22] text-white p-4 shadow-xl border border-[#B8793E]/30">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🎁</div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#F7D9A4] font-bold">
            Limited Offer
          </p>

          <h3 className="text-lg font-extrabold mt-1">
            First 5 Minutes Free
          </h3>

          <p className="text-sm text-white/80 mt-1">
            Start your first astrology consultation absolutely free. No recharge required.
          </p>
        </div>
      </div>
    </div>
  );
}