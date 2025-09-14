import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Factory — Living Apps",
  description: "Spec-driven agent factory UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-grid`}
      >
        <div className="min-h-dvh flex flex-col">
          <header className="sticky top-0 z-20 backdrop-blur bg-background/70 border-b border-black/5 dark:border-white/10">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 shadow-sm" />
                <span className="font-semibold tracking-tight">Factory</span>
                <span className="ml-2 text-sm text-foreground/60">Living Apps</span>
              </div>
              <nav className="hidden sm:flex items-center gap-6 text-sm text-foreground/70">
                <a className="hover:text-foreground transition-colors" href="/">Dashboard</a>
                <a className="hover:text-foreground transition-colors" href="#spec">Spec</a>
                <a className="hover:text-foreground transition-colors" href="#growth">Growth</a>
                <a className="hover:text-foreground transition-colors" href="#lineage">Historian</a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-black/5 dark:border-white/10">
            <div className="max-w-6xl mx-auto px-6 h-14 text-xs text-foreground/60 flex items-center justify-between">
              <span>Spec-first, safe growth.</span>
              <span>© Factory</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
