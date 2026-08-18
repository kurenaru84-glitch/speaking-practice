import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { SITE } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE.appName,
  description: SITE.tagline,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: SITE.appName,
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#b45309",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-stone-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
