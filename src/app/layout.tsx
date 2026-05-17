import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Hub - Kumpulan Game Seru",
  description: "Mainkan berbagai game seru langsung di browser. Single player & multiplayer!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen">
        <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#0a0a0f]/80 border-b border-[#2d2d44]">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-bold gradient-text">
              🎮 Game Hub
            </a>
            <div className="flex gap-4">
              <a href="/#games" className="text-sm text-gray-400 hover:text-white transition-colors">
                Games
              </a>
            </div>
          </div>
        </nav>
        <main className="pt-20">
          {children}
        </main>
        <footer className="border-t border-[#2d2d44] mt-20 py-8 text-center text-gray-500 text-sm">
          <p>🎮 Game Hub — Dibuat dengan Next.js & ❤️</p>
        </footer>
      </body>
    </html>
  );
}
