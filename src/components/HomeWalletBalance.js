"use client";

import { useEffect, useState } from "react";

export default function HomeWalletBalance() {
  const [balance, setBalance] = useState(0);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const fetchWallet = async () => {
    try {
      const userData = localStorage.getItem("astro-user");

      if (!userData) {
        setIsSignedIn(false);
        setBalance(0);
        return;
      }

      const user = JSON.parse(userData);
      setIsSignedIn(Boolean(user?.id || user?.phone));

      const userId = user?.id;
      const phone = user?.phone;

      if (!userId && !phone) {
        setBalance(0);
        return;
      }

      const query = userId
        ? `userId=${userId}`
        : `phone=${encodeURIComponent(phone)}`;

      const res = await fetch(`/api/wallet?${query}`, {
        cache: "no-store",
      });

      const data = await res.json();

      console.log("HOME WALLET RESPONSE:", data);

      if (data.success) {
        const currentBalance =
          data?.wallet?.balance ??
          data?.balance ??
          user?.wallet?.balance ??
          0;

        setBalance(Number(currentBalance));
      } else {
        setBalance(0);
      }
    } catch (error) {
      setIsSignedIn(false);
      console.error("HOME_WALLET_ERROR", error);
      setBalance(0);
    }
  };

  useEffect(() => {
    fetchWallet();

    const interval = setInterval(fetchWallet, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isSignedIn) {
    return (
      <a href="/login" className="rounded-full bg-[#650D26] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#44091A]">
        Sign In
      </a>
    );
  }

  return (
    <a
      href="/wallet"
      className="bg-white/50 backdrop-blur-xl border border-white/70 shadow-lg px-4 py-2 rounded-full min-w-[82px] text-center"
    >
      <p className="text-[10px] text-[#8A5A35] font-bold leading-none">
        Wallet
      </p>

      <p className="text-sm font-extrabold">₹{balance}</p>
    </a>
  );
}
