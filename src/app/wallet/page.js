"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FirstChatOfferBanner from "@/components/FirstChatOfferBanner";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const rechargePlans = [
    { amount: 99, bonus: 0 },
    { amount: 199, bonus: 20 },
    { amount: 499, bonus: 75 },
    { amount: 999, bonus: 200 },
  ];

  const getLoggedInUser = () => {
    const userData = localStorage.getItem("astro-user");
    return userData ? JSON.parse(userData) : null;
  };

  const fetchWallet = async () => {
    try {
      setLoading(true);

      const user = getLoggedInUser();

      if (!user?.id && !user?.phone) {
        setBalance(0);
        setTransactions([]);
        return;
      }

      const query = user?.id
        ? `userId=${user.id}`
        : `phone=${encodeURIComponent(user.phone)}`;

      const res = await fetch(`/api/wallet?${query}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setBalance(Number(data.wallet?.balance || 0));
        setTransactions(data.wallet?.transactions || []);
      } else {
        setBalance(0);
        setTransactions([]);
      }
    } catch (error) {
      console.error("FETCH_WALLET_ERROR", error);
      setBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRecharge = async (amount) => {
    try {
      const user = getLoggedInUser();

      if (!user?.id) {
        alert("Please login again before recharging wallet.");
        return;
      }

      const loaded = await loadRazorpay();

      if (!loaded) {
        alert("Razorpay failed to load. Check internet connection.");
        return;
      }

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Unable to create payment order");
        return;
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "Vedmantra",
        description: `Wallet Recharge ₹${amount}`,
        order_id: data.order.id,

        handler: async function (response) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              amount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("Wallet recharged successfully!");
            fetchWallet();
          } else {
            alert(verifyData.error || "Payment verification failed.");
          }
        },

        prefill: {
          name: user?.name || "Vedmantra User",
          email: user?.email || "support@vedmantra.com",
          contact: user?.phone || "",
        },
        theme: {
          color: "#7c3f12",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("RECHARGE_ERROR", error);
      alert("Something went wrong while starting recharge.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f8efe3] px-5 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-sm text-[#5b3215]">
            ← Back
          </Link>

          <h1 className="text-xl font-semibold text-[#2b1608]">Wallet</h1>

          <div className="w-10" />
        </div>

        <FirstChatOfferBanner />

        <div className="rounded-3xl bg-gradient-to-br from-[#4b250c] to-[#9b5a20] text-white p-6 shadow-xl mb-6">
          <p className="text-sm opacity-80">Available Balance</p>

          <h2 className="text-4xl font-bold mt-2">
            {loading ? "..." : `₹${balance}`}
          </h2>

          <p className="text-sm mt-3 opacity-90">
            Use wallet balance to chat with astrologers.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-[#2b1608] mb-3">
          Recharge Wallet
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {rechargePlans.map((plan) => (
            <button
              key={plan.amount}
              onClick={() => handleRecharge(plan.amount)}
              className="rounded-2xl bg-white p-5 text-left shadow-md border border-[#ead8c2] active:scale-95 transition"
            >
              <p className="text-2xl font-bold text-[#2b1608]">
                ₹{plan.amount}
              </p>

              <p className="text-sm text-[#7a5a3a] mt-1">
                {plan.bonus > 0 ? `₹${plan.bonus} bonus` : "Starter recharge"}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 border border-[#ead8c2]">
          <h3 className="font-semibold text-[#2b1608]">Transactions</h3>

          {transactions.length === 0 ? (
            <p className="text-sm text-[#7a5a3a] mt-2">
              No transactions yet. Your recharge history will appear here.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-xl bg-[#fff8ef] border border-[#f0dec7] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#2b1608]">
                      {txn.type === "DEBIT"
                        ? "Chat Deduction"
                        : "Wallet Recharge"}
                    </p>

                    <p className="text-xs text-[#8a6a4a]">
                      {new Date(txn.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        txn.type === "DEBIT"
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      {txn.type === "DEBIT" ? "-" : "+"}₹{txn.amount}
                    </p>

                    <p className="text-xs text-[#8a6a4a]">
                      {txn.status || "SUCCESS"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}