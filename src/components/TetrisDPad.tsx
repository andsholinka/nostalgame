"use client";

import { useEffect, useState } from "react";

function dispatchKey(key: string, code?: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, code: code || key, bubbles: true }));
}

export function TetrisDPad() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!mounted || !isMobile) return null;

  const handlePress = (e: React.TouchEvent | React.MouseEvent, key: string, code?: string) => {
    e.preventDefault();
    dispatchKey(key, code);
  };

  const buttonClass = "bg-gradient-to-b from-[#2a2a4a] to-[#1a1a35] border-2 border-[#3a3a5a] flex items-center justify-center active:from-[#00f3ff]/30 active:to-[#00f3ff]/10 active:border-[#00f3ff] transition-colors shadow-[0_4px_0_#0a0a18] active:shadow-[0_2px_0_#0a0a18] active:translate-y-[2px]";

  return (
    <div className="md:hidden flex justify-center mt-6 mb-4">
      <div className="relative w-52 h-52">
        {/* Rotate (up) */}
        <button
          onTouchStart={(e) => handlePress(e, "ArrowUp")}
          onMouseDown={(e) => handlePress(e, "ArrowUp")}
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl ${buttonClass}`}
        >
          <span className="text-[#aaa] text-2xl">↻</span>
        </button>

        {/* Hard drop (down) - long press for hard drop, tap for soft */}
        <button
          onTouchStart={(e) => handlePress(e, "ArrowDown")}
          onMouseDown={(e) => handlePress(e, "ArrowDown")}
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl ${buttonClass}`}
        >
          <span className="text-[#aaa] text-2xl">▼</span>
        </button>

        {/* Left */}
        <button
          onTouchStart={(e) => handlePress(e, "ArrowLeft")}
          onMouseDown={(e) => handlePress(e, "ArrowLeft")}
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-xl ${buttonClass}`}
        >
          <span className="text-[#aaa] text-2xl">◀</span>
        </button>

        {/* Right */}
        <button
          onTouchStart={(e) => handlePress(e, "ArrowRight")}
          onMouseDown={(e) => handlePress(e, "ArrowRight")}
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-xl ${buttonClass}`}
        >
          <span className="text-[#aaa] text-2xl">▶</span>
        </button>

        {/* Center - hard drop button */}
        <button
          onTouchStart={(e) => handlePress(e, " ", "Space")}
          onMouseDown={(e) => handlePress(e, " ", "Space")}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-b from-[#ff6b35] to-[#cc4400] border-2 border-[#ff6b35] flex items-center justify-center active:translate-y-[2px] shadow-[0_3px_0_#0a0a18] active:shadow-[0_1px_0_#0a0a18]"
        >
          <span className="pixel-font text-[0.4rem] text-white font-bold">DROP</span>
        </button>
      </div>
    </div>
  );
}
