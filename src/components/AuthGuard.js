"use client";

import { useEffect, useState } from "react";

export default function AuthGuard({ children }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("astro-user");

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setAllowed(true);
  }, []);

  if (!allowed) {
    return (
      <main className="min-h-screen bg-[#f7efe4] flex items-center justify-center">
        <p className="text-[#24110A] font-bold">
          Checking login...
        </p>
      </main>
    );
  }

  return children;
}