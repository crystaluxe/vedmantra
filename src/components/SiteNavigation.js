"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/#astrologers", label: "Astrologers", icon: "✺" },
  { href: "/chat", label: "Chats", icon: "☏" },
  { href: "/wallet", label: "Wallet", icon: "₹" },
  { href: "/profile", label: "Account", icon: "◉" },
];

export default function SiteNavigation() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isLiveChat = /^\/chat\/[^/]+/.test(pathname);
  if (pathname === "/" || pathname === "/login" || isAdmin) return null;
  return (
    <>
      {!isLiveChat && <header className="sticky top-0 z-40 hidden border-b border-[#E9D9C4] bg-white/95 backdrop-blur-lg md:block">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-8">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-[#650D26]">✺ Vedmantra</Link>
          <nav aria-label="Main navigation" className="flex items-center gap-8">
            {navigation.map((item) => <Link key={item.label} href={item.href} className={`text-sm font-semibold transition hover:text-[#A17A35] ${pathname === item.href ? "text-[#650D26]" : "text-[#786B64]"}`}>{item.label}</Link>)}
          </nav>
          <Link href="/wallet" className="rounded-full bg-[#650D26] px-6 py-3 text-sm font-bold text-white hover:bg-[#390A1B]">Recharge Wallet</Link>
        </div>
      </header>}
      {!isLiveChat && <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[#E9D9C4] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-5px_25px_rgba(57,10,27,.07)] backdrop-blur-xl md:hidden">
        {navigation.map((item) => <Link key={item.label} href={item.href} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold ${pathname === item.href ? "text-[#650D26]" : "text-[#8A7B73]"}`}><span aria-hidden="true" className="text-xl">{item.icon}</span><span>{item.label}</span></Link>)}
      </nav>}
    </>
  );
}
