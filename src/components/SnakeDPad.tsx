"use client";

import { useEffect, useState } from "react";

function simulateKey(key: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

export function SnakeDPad() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!mounted || !isMobile) return null;

  const handlePress = (e: React.TouchEvent | React.MouseEvent, key: string) => {
    e.preventDefault();
    simulateKey(key);
  };

  return (
    <div className="md:hidden flex justify-center mt-6 mb-4">
      <div className="relative w-48 h-48">
        {/* Center decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#1a1a35] border border-[#2a2a4a] flex items-center justify-center">
          <span className="text-[0.4rem] pixel-font text-[#444]">D-PAD</span>
        </div>

        {/* Up */}
        <button
          onTouchStart={(e) => handlePress(e, "ArrowUp")}
          onMouseDown={(e) => handlePress(e, "ArrowUp")}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl bg-gradient-to-b from-[#2a2a4a] to-[#1a1a35] border-2 border-[#3a3a5a] flex items-center justify-center active:from-[#39ff14]/30 active:to-[#39ff14]/10 active:border-[#39ff14] transition-colors shadow-[0_4px_0_#0a0a18] active:shadow-[0_2px_0_#0a0a18] active:translate-y-[2px]"
        >
          <span className="text-[#aaa] text-2xl">▲</span>
        </button>

        {/* Down */}
        <button
          onTouchStart={(e) => handlePress(e, "ArrowDown")}
          onMouseDown={(e) => handlePress(e, "ArrowDown")}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl bg-gradient-to-b from-[#2a2a4a] to-[#1a1a35] border-2 border-[#3a3a5a] flex items-center justify-center active:from-[#39ff14]/30 active:to-[#39ff14]/10 active:border-[#39ff14] transition-colors shadow-[0_4px_0_#0a0a18] active:shadow-[0_2px_0_#0a0a18] active:translate-y-[2px]"
        >
          <span className="text-[#aaa] text-2xl">▼</span>
        </button>

        {/* Left */}
        <button
          onTouchStart={(e) => handlePress(e, "ArrowLeft")}
          onMouseDown={(e) => handlePress(e, "ArrowLeft")}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-xl bg-gradient-to-b from-[#2a2a4a] to-[#1a1a35] border-2 border-[#3a3a5a] flex items-center justify-center active:from-[#39ff14]/30 active:to-[#39ff14]/10 active:border-[#39ff14] transition-colors shadow-[0_4px_0_#0a0a18] active:shadow-[0_2px_0_#0a0a18] active:translate-y-[2px]"
        >
          <span className="text-[#aaa] text-2xl">◀</span>
        </button>

        {/* Right */}
        <button
          onTouchStart={(e) => handlePress(e, "ArrowRight")}
          onMouseDown={(e) => handlePress(e, "ArrowRight")}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-xl bg-gradient-to-b from-[#2a2a4a] to-[#1a1a35] border-2 border-[#3a3a5a] flex items-center justify-center active:from-[#39ff14]/30 active:to-[#39ff14]/10 active:border-[#39ff14] transition-colors shadow-[0_4px_0_#0a0a18] active:shadow-[0_2px_0_#0a0a18] active:translate-y-[2px]"
        >
          <span className="text-[#aaa] text-2xl">▶</span>
        </button>
      </div>
    </div>
  );
}
