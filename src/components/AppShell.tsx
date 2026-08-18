"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { SplashScreen } from "@/components/SplashScreen";

const NO_BOTTOM_NAV = ["/privacy", "/terms"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBottomNav = !NO_BOTTOM_NAV.some((path) => pathname.startsWith(path));

  return (
    <>
      <SplashScreen />
      <div className={showBottomNav ? "pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0" : ""}>
        {children}
      </div>
      {showBottomNav && <BottomNav />}
    </>
  );
}
