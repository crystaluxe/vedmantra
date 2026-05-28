"use client";

import { useEffect, useState } from "react";

export default function HomeWalletBalance() {
  const [balance, setBalance] = useState(0);

  const fetchWallet = async () => {
    try {
      const userData = localStorage.getItem("astro-user");

      if (!userData) return;

      const user = JSON.parse(userData);

      const res = await fetch(`/api/wallet?userId=${user.id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success && data.wallet) {
        setBalance(data.wallet.balance);
      }
    } catch (error) {
      console.error("HOME_WALLET_ERROR", error);
    }
  };

  useEffect(() => {
    fetchWallet();

    const interval = setInterval(fetchWallet, 5000);

    return () => clearInterval(interval);
  }, []);

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