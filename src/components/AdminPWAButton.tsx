"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function AdminPWAButton() {
  const [showButton, setShowButton] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;
    const isMobile = window.innerWidth < 768;
    setShowButton(isPWA && isMobile);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted || !showButton) return null;

  return (
    <div className="flex justify-center py-6">
      <Link
        href="/admin"
        className="flex items-center gap-2 px-4 py-2.5 border border-[#2a2a4a] hover:border-[#bf5af2] transition-colors"
      >
        <span className="text-sm">🔐</span>
        <span className="pixel-font text-[0.4rem] text-[#666]">ADMIN PANEL</span>
      </Link>
    </div>
  );
}
