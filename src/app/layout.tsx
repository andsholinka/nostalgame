import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "./sw-register";
import { InstallButton } from "./install-button";

export const metadata: Metadata = {
  title: "NostalGame - Game Nostalgia Jaman Dahulu",
  description: "Mainkan game-game klasik nostalgia jaman dahulu langsung di browser. Rasakan sensasi arcade era 80-90an!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NostalGame",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c1d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/logo/NostalGame.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo/NostalGame.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen grid-bg">
        {/* Ticker Bar */}
        <div className="fixed top-0 w-full z-[60] bg-[#0a0a18] border-b border-[#2a2a4a] h-8 flex items-center overflow-hidden">
          <div className="ticker-scroll flex whitespace-nowrap">
            <span className="pixel-font text-[0.45rem] text-[#555] mx-8">
              ● PLAYER 1 READY ● HIGH SCORE: 999,999 ● INSERT COIN ● NOSTALGAME ARCADE ● SELECT YOUR GAME ● PRESS START ● 
            </span>
            <span className="pixel-font text-[0.45rem] text-[#555] mx-8">
              ● PLAYER 1 READY ● HIGH SCORE: 999,999 ● INSERT COIN ● NOSTALGAME ARCADE ● SELECT YOUR GAME ● PRESS START ● 
            </span>
          </div>
        </div>

        {/* Navbar */}
        <nav className="fixed top-8 w-full z-50 bg-[#0c0c1d]/90 backdrop-blur-sm border-b border-[#2a2a4a]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <img src="/logo/NostalGame.png" alt="NostalGame" className="w-8 h-8 rounded-sm group-hover:scale-110 transition-transform" />
              <div>
                <span className="pixel-font text-[0.65rem] neon-purple block">NostalGame</span>
                <span className="text-[0.55rem] text-[#555] font-mono">ARCADE • EST. 2026</span>
              </div>
            </a>
            <div className="flex gap-5 items-center">
              <a href="/#arcade" className="text-[0.65rem] font-mono text-[#666] hover:text-[#00f3ff] transition-colors uppercase tracking-wider hidden md:inline">
                Arcade
              </a>
              <a href="/request" className="text-[0.65rem] font-mono text-[#666] hover:text-[#ffe600] transition-colors uppercase tracking-wider hidden md:inline">
                Request
              </a>
              <a
                href="/support"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#ff6b35] to-[#ffaa00] text-black pixel-font text-[0.4rem] font-bold hover:opacity-90 transition-opacity rounded-sm"
              >
                ☕ SUPPORT
              </a>
              <InstallButton />
            </div>
          </div>
        </nav>

        <main className="pt-28">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-24 border-t border-[#1a1a35]">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <img src="/logo/NostalGame.png" alt="NostalGame" className="w-6 h-6 rounded-sm" />
                <div>
                  <p className="pixel-font text-[0.5rem] neon-purple">NostalGame</p>
                  <p className="text-[0.6rem] text-[#444] font-mono mt-1">Game klasik, rasa modern</p>
                </div>
              </div>
              <a
                href="/support"
                className="flex items-center gap-2 px-4 py-2 border border-[#ff6b35]/30 hover:border-[#ff6b35] transition-colors group"
              >
                <span className="text-base">☕</span>
                <span className="pixel-font text-[0.4rem] text-[#ff6b35] group-hover:text-[#ffaa00] transition-colors">SUPPORT DEVELOPER</span>
              </a>
              <div className="pixel-font text-[0.4rem] text-[#333] text-center md:text-right space-y-1">
                {/* <p>BUILT WITH NEXT.JS • DEPLOYED ON VERCEL</p> */}
                <p>© 2026 NOSTALGAME • ALL RIGHTS RESERVED</p>
              </div>
            </div>
          </div>
        </footer>

        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
