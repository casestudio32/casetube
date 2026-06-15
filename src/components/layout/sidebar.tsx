"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard", icon: "⊞", label: "Dashboard" },
  { href: "/blueprint", icon: "🗺️", label: "My Blueprint" },
  { href: "/seo", icon: "🔍", label: "SEO Center" },
  { href: "/studio", icon: "✍️", label: "Content Studio" },
  { href: "/projects", icon: "📋", label: "Projects" },
  { href: "/trends", icon: "🔥", label: "Trend Finder" },
  { href: "/analytics", icon: "📊", label: "Analytics" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-zinc-800">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Case<span className="text-red-500">Tube</span>
        </Link>
        <p className="text-zinc-600 text-xs mt-0.5">Creator OS</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-red-600/15 text-red-400 border border-red-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-zinc-800 space-y-1">
        <Link
          href="/onboarding"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <span>⚙️</span> Redo Onboarding
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <span>→</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
