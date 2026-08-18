"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

const SPLASH_KEY = "pikuspi-splash-seen";
const SPLASH_MS = 1000;

export function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "fading">("hidden");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SPLASH_KEY)) {
        return;
      }
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      // ignore storage errors
    }

    setPhase("visible");
    const fadeTimer = window.setTimeout(() => setPhase("fading"), SPLASH_MS);
    const hideTimer = window.setTimeout(() => setPhase("hidden"), SPLASH_MS + 280);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white transition-opacity duration-300 ${
        phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={phase === "fading"}
    >
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={96}
        height={96}
        className="rounded-[22px] shadow-lg ring-1 ring-sky-100"
        priority
      />
      <p className="mt-5 text-2xl font-bold tracking-tight text-stone-900">{SITE.appName}</p>
      <p className="mt-1 max-w-xs px-6 text-center text-sm text-stone-500">{SITE.tagline}</p>
    </div>
  );
}
