"use client";

import { useEffect, useState } from "react";

export default function AdminGuard({ children }) {
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const adminAccess = localStorage.getItem("vedmantra-admin-access");

    if (adminAccess === "true") {
      setAllowed(true);
    }
  }, []);

  const loginAdmin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem("vedmantra-admin-access", "true");
      setAllowed(true);
    } else {
      alert("Invalid admin password");
    }
  };

  if (!allowed) {
    return (
      <main className="min-h-screen bg-[#f7efe4] flex items-center justify-center px-5">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-[#ead8c2]">
          <h1 className="text-2xl font-bold text-[#2b1208]">
            Admin Login
          </h1>

          <p className="text-sm text-[#7a5a3a] mt-2">
            Enter admin password to continue.
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full mt-5 px-4 py-3 rounded-2xl border border-[#ead8c2] outline-none"
          />

          <button
            onClick={loginAdmin}
            className="w-full mt-4 py-3 rounded-2xl bg-[#2b1208] text-white font-bold"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return children;
}