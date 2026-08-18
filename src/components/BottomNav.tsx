"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconBook, IconList, IconLock, IconSettings, IconStar } from "@/components/icons";
import { canUseWordList, getPlan } from "@/lib/plan";

type Tab = {
  href: string;
  label: string;
  icon: typeof IconBook;
  locked?: boolean;
  match: (pathname: string) => boolean;
};

export function BottomNav() {
  const pathname = usePathname();
  const [wordListEnabled] = useState(() => canUseWordList(getPlan()));

  const tabs: Tab[] = [
    {
      href: "/",
      label: "学ぶ",
      icon: IconBook,
      match: (p) => p === "/",
    },
    {
      href: "/bookmarks",
      label: "お気に入り",
      icon: IconStar,
      match: (p) => p === "/bookmarks",
    },
    {
      href: "/word-list",
      label: "単語",
      icon: IconList,
      locked: !wordListEnabled,
      match: (p) => p === "/word-list",
    },
    {
      href: "/settings",
      label: "設定",
      icon: IconSettings,
      match: (p) => p === "/settings",
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="メインメニュー"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-sky-600" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <span className="relative">
                <Icon className={`h-6 w-6 ${active ? "text-sky-500" : ""}`} />
                {tab.locked && (
                  <IconLock className="absolute -right-1 -top-0.5 h-3 w-3 text-stone-400" />
                )}
              </span>
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
