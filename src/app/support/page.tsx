"use client";

import { useEffect } from "react";

export default function SupportPage() {
  useEffect(() => {
    window.location.href = "https://clicky.id/nostalgame/support/gamejadul";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="game-card p-8 text-center max-w-sm">
        <span className="text-4xl block mb-4">☕</span>
        <p className="pixel-font text-[0.6rem] neon-orange mb-3">REDIRECTING...</p>
        <p className="font-mono text-xs text-[#666]">
          Mengarahkan ke halaman support...
        </p>
        <a
          href="https://clicky.id/nostalgame/support/gamejadul"
          className="btn-primary mt-6 inline-block"
        >
          BUKA MANUAL →
        </a>
      </div>
    </div>
  );
}
