"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("astro-user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setNameInput(parsedUser?.name || "");

    if (parsedUser?.id) {
      fetchWallet(parsedUser.id);
      fetchChats(parsedUser.id);
    }
  }, [router]);

  async function fetchWallet(userId) {
    try {
      const res = await fetch(`/api/wallet/get?userId=${userId}`);
      const data = await res.json();

      if (data?.success && data?.wallet) {
        setWalletBalance(data.wallet.balance || 0);
      }
    } catch (error) {
      console.error("Wallet fetch failed:", error);
    }
  }

  async function fetchChats(userId) {
    try {
      const res = await fetch(`/api/chat?userId=${userId}`);
      const data = await res.json();

      if (data?.success && Array.isArray(data.chats)) {
        setChatCount(data.chats.length);
      }
    } catch (error) {
      console.error("Chat fetch failed:", error);
    }
  }

  function saveProfile() {
    if (!nameInput.trim()) {
      alert("Please enter your name");
      return;
    }

    const updatedUser = {
      ...user,
      name: nameInput.trim(),
    };

    setUser(updatedUser);
    localStorage.setItem("astro-user", JSON.stringify(updatedUser));
    setEditMode(false);

    alert("Profile updated successfully");
  }

  function handleLogout() {
    localStorage.removeItem("astro-user");
    router.push("/login");
  }

  const name = user?.name || "Vedmantra User";
  const phone = user?.phone || "+91 XXXXX XXXXX";
  const firstLetter = name?.charAt(0)?.toUpperCase() || "V";

  return (
    <main
      className="min-h-screen bg-[#F7EFE4] text-[#1F130D]"
      style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
    >
      <div className="max-w-md mx-auto min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FFF8EF] via-[#F5E4CF] to-[#E7C8A6] px-4 pt-5 pb-8">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C58A45]/20 rounded-full blur-3xl" />
        <div className="absolute top-52 -left-24 w-56 h-56 bg-[#8B4513]/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="w-11 h-11 rounded-full bg-white/55 backdrop-blur-xl border border-white/70 flex items-center justify-center shadow-lg text-xl"
          >
            ←
          </button>

          <h1 className="text-2xl font-extrabold tracking-[-0.04em]">
            My Profile
          </h1>

          <button
            onClick={() => router.push("/wallet")}
            className="w-11 h-11 rounded-full bg-[#24110A] text-white flex items-center justify-center shadow-lg"
          >
            ₹
          </button>
        </div>

        <div className="relative z-10 bg-[#24110A] text-white rounded-[38px] p-5 shadow-2xl overflow-hidden">
          <div className="absolute -right-12 -top-12 w-36 h-36 bg-[#D9A45D]/25 rounded-full blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#F7D9A4] to-[#B97835] text-[#24110A] flex items-center justify-center text-3xl font-black shadow-xl">
              {firstLetter}
            </div>

            {editMode ? (
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.22em] text-[#E6C99A] font-bold">
                  Edit Profile
                </p>

                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full mt-2 h-11 rounded-2xl bg-white/15 border border-white/20 px-4 text-white placeholder:text-white/50 outline-none font-bold"
                />

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={saveProfile}
                    className="px-4 py-2 rounded-xl bg-[#F7D9A4] text-[#24110A] text-xs font-black"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => {
                      setNameInput(user?.name || "");
                      setEditMode(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-black"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.22em] text-[#E6C99A] font-bold">
                  Vedmantra Member
                </p>

                <h2 className="text-2xl font-black tracking-[-0.04em] mt-1">
                  {name}
                </h2>

                <p className="text-sm text-white/70 font-semibold mt-1">
                  {phone}
                </p>

                <button
                  onClick={() => {
                    setNameInput(user?.name || "");
                    setEditMode(true);
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-black text-[#F7D9A4]"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          <div className="relative grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/10 border border-white/15 rounded-3xl p-4">
              <p className="text-xs text-white/55 font-bold uppercase tracking-[0.16em]">
                Wallet
              </p>
              <p className="text-3xl font-black mt-1">₹{walletBalance}</p>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-3xl p-4">
              <p className="text-xs text-white/55 font-bold uppercase tracking-[0.16em]">
                Consults
              </p>
              <p className="text-3xl font-black mt-1">{chatCount}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => router.push("/wallet")}
            className="rounded-[28px] p-4 bg-white/55 backdrop-blur-xl border border-white/70 shadow-lg text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0D8] flex items-center justify-center text-xl mb-3">
              💰
            </div>
            <p className="font-black tracking-[-0.02em]">Recharge</p>
            <p className="text-xs text-[#7A5A45] font-semibold mt-1">
              Add wallet balance
            </p>
          </button>

          <button
            onClick={() => router.push("/chat")}
            className="rounded-[28px] p-4 bg-white/55 backdrop-blur-xl border border-white/70 shadow-lg text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0D8] flex items-center justify-center text-xl mb-3">
              🔮
            </div>
            <p className="font-black tracking-[-0.02em]">My Chats</p>
            <p className="text-xs text-[#7A5A45] font-semibold mt-1">
              View consultations
            </p>
          </button>
        </div>

        <div className="relative z-10 mt-5 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/70 shadow-xl overflow-hidden">
          <button
            onClick={() => router.push("/chat")}
            className="w-full flex items-center justify-between p-4 border-b border-[#E8D5BF]"
          >
            <div>
              <p className="font-black">Talk to Astrologer</p>
              <p className="text-xs text-[#7A5A45] font-semibold mt-1">
                Start a new live consultation
              </p>
            </div>
            <span className="text-xl">›</span>
          </button>

          <button
            onClick={() => router.push("/wallet")}
            className="w-full flex items-center justify-between p-4 border-b border-[#E8D5BF]"
          >
            <div>
              <p className="font-black">Wallet & Recharge</p>
              <p className="text-xs text-[#7A5A45] font-semibold mt-1">
                Manage your wallet balance
              </p>
            </div>
            <span className="text-xl">›</span>
          </button>

          <button
            onClick={() =>
              window.open(
                "https://wa.me/919999999999?text=Hi%20Vedmantra%20Support",
                "_blank"
              )
            }
            className="w-full flex items-center justify-between p-4 border-b border-[#E8D5BF]"
          >
            <div>
              <p className="font-black">Help & Support</p>
              <p className="text-xs text-[#7A5A45] font-semibold mt-1">
                Contact us on WhatsApp
              </p>
            </div>
            <span className="text-xl">›</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 text-red-500"
          >
            <div>
              <p className="font-black">Logout</p>
              <p className="text-xs text-red-400 font-semibold mt-1">
                Sign out from this device
              </p>
            </div>
            <span className="text-xl">›</span>
          </button>
        </div>

        <div className="relative z-10 mt-6 rounded-[30px] bg-[#FFF8EF]/60 border border-white/70 p-4 shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8A5A35] font-black">
            Account Status
          </p>

          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="font-black">Active User</p>
              <p className="text-xs text-[#7A5A45] font-semibold mt-1">
                Your account is ready for live astrology consultations.
              </p>
            </div>

            <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-black">
              Active
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}