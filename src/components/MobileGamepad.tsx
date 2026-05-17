"use client";

import { useEffect, useRef, useCallback } from "react";

type GamepadLayout = "dpad" | "leftright" | "updown";

interface MobileGamepadProps {
  layout?: GamepadLayout;
  onAction?: () => void;
  actionLabel?: string;
}

// Simulate keyboard events
function simulateKey(key: string, type: "keydown" | "keyup") {
  const event = new KeyboardEvent(type, {
    key,
    code: key === "ArrowUp" ? "ArrowUp" : key === "ArrowDown" ? "ArrowDown" : key === "ArrowLeft" ? "ArrowLeft" : key === "ArrowRight" ? "ArrowRight" : key === " " ? "Space" : "",
    bubbles: true,
  });
  window.dispatchEvent(event);
}

export function MobileGamepad({ layout = "dpad", onAction, actionLabel = "A" }: MobileGamepadProps) {
  const activeKeysRef = useRef<Set<string>>(new Set());

  const pressKey = useCallback((key: string) => {
    if (!activeKeysRef.current.has(key)) {
      activeKeysRef.current.add(key);
      simulateKey(key, "keydown");
    }
  }, []);

  const releaseKey = useCallback((key: string) => {
    if (activeKeysRef.current.has(key)) {
      activeKeysRef.current.delete(key);
      simulateKey(key, "keyup");
    }
  }, []);

  const releaseAll = useCallback(() => {
    activeKeysRef.current.forEach((key) => {
      simulateKey(key, "keyup");
    });
    activeKeysRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => releaseAll();
  }, [releaseAll]);

  // Only show on touch devices
  const [isMobile, setIsMobile] = React.useState(false);
  useEffect(() => {
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] pb-4 pt-2 pointer-events-none md:hidden">
      <div className="flex items-end justify-between px-4 max-w-lg mx-auto">
        {/* D-Pad / Directional controls */}
        <div className="pointer-events-auto">
          {layout === "dpad" && <DPad pressKey={pressKey} releaseKey={releaseKey} />}
          {layout === "leftright" && <LeftRight pressKey={pressKey} releaseKey={releaseKey} />}
          {layout === "updown" && <UpDown pressKey={pressKey} releaseKey={releaseKey} />}
        </div>

        {/* Action button */}
        {onAction && (
          <div className="pointer-events-auto">
            <button
              onTouchStart={(e) => { e.preventDefault(); onAction(); }}
              className="w-16 h-16 rounded-full bg-[#ff6b35]/90 border-2 border-[#ff6b35] flex items-center justify-center active:scale-90 active:bg-[#ff6b35] transition-transform shadow-[0_0_15px_rgba(255,107,53,0.4)]"
            >
              <span className="pixel-font text-[0.6rem] text-white font-bold">{actionLabel}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Full D-Pad (up/down/left/right)
function DPad({ pressKey, releaseKey }: { pressKey: (k: string) => void; releaseKey: (k: string) => void }) {
  return (
    <div className="relative w-36 h-36">
      {/* Center circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1a1a35] border border-[#2a2a4a]"></div>

      {/* Up */}
      <button
        onTouchStart={(e) => { e.preventDefault(); pressKey("ArrowUp"); }}
        onTouchEnd={(e) => { e.preventDefault(); releaseKey("ArrowUp"); }}
        onTouchCancel={() => releaseKey("ArrowUp")}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-lg bg-[#2a2a4a]/80 border border-[#3a3a5a] flex items-center justify-center active:bg-[#39ff14]/20 active:border-[#39ff14] transition-colors"
      >
        <span className="text-[#aaa] text-lg">▲</span>
      </button>

      {/* Down */}
      <button
        onTouchStart={(e) => { e.preventDefault(); pressKey("ArrowDown"); }}
        onTouchEnd={(e) => { e.preventDefault(); releaseKey("ArrowDown"); }}
        onTouchCancel={() => releaseKey("ArrowDown")}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-lg bg-[#2a2a4a]/80 border border-[#3a3a5a] flex items-center justify-center active:bg-[#39ff14]/20 active:border-[#39ff14] transition-colors"
      >
        <span className="text-[#aaa] text-lg">▼</span>
      </button>

      {/* Left */}
      <button
        onTouchStart={(e) => { e.preventDefault(); pressKey("ArrowLeft"); }}
        onTouchEnd={(e) => { e.preventDefault(); releaseKey("ArrowLeft"); }}
        onTouchCancel={() => releaseKey("ArrowLeft")}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-[#2a2a4a]/80 border border-[#3a3a5a] flex items-center justify-center active:bg-[#39ff14]/20 active:border-[#39ff14] transition-colors"
      >
        <span className="text-[#aaa] text-lg">◀</span>
      </button>

      {/* Right */}
      <button
        onTouchStart={(e) => { e.preventDefault(); pressKey("ArrowRight"); }}
        onTouchEnd={(e) => { e.preventDefault(); releaseKey("ArrowRight"); }}
        onTouchCancel={() => releaseKey("ArrowRight")}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-[#2a2a4a]/80 border border-[#3a3a5a] flex items-center justify-center active:bg-[#39ff14]/20 active:border-[#39ff14] transition-colors"
      >
        <span className="text-[#aaa] text-lg">▶</span>
      </button>
    </div>
  );
}

// Left/Right only (for Pong, Breakout)
function LeftRight({ pressKey, releaseKey }: { pressKey: (k: string) => void; releaseKey: (k: string) => void }) {
  return (
    <div className="flex gap-3">
      <button
        onTouchStart={(e) => { e.preventDefault(); pressKey("ArrowLeft"); }}
        onTouchEnd={(e) => { e.preventDefault(); releaseKey("ArrowLeft"); }}
        onTouchCancel={() => releaseKey("ArrowLeft")}
        className="w-14 h-14 rounded-lg bg-[#2a2a4a]/80 border border-[#3a3a5a] flex items-center justify-center active:bg-[#39ff14]/20 active:border-[#39ff14] transition-colors"
      >
        <span className="text-[#aaa] text-xl">◀</span>
      </button>
      <button
        onTouchStart={(e) => { e.preventDefault(); pressKey("ArrowRight"); }}
        onTouchEnd={(e) => { e.preventDefault(); releaseKey("ArrowRight"); }}
        onTouchCancel={() => releaseKey("ArrowRight")}
        className="w-14 h-14 rounded-lg bg-[#2a2a4a]/80 border border-[#3a3a5a] flex items-center justify-center active:bg-[#39ff14]/20 active:border-[#39ff14] transition-colors"
      >
        <span className="text-[#aaa] text-xl">▶</span>
      </button>
    </div>
  );
}

// Up/Down only (for Pong P1)
function UpDown({ pressKey, releaseKey }: { pressKey: (k: string) => void; releaseKey: (k: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onTouchStart={(e) => { e.preventDefault(); pressKey("ArrowUp"); }}
        onTouchEnd={(e) => { e.preventDefault(); releaseKey("ArrowUp"); }}
        onTouchCancel={() => releaseKey("ArrowUp")}
        className="w-14 h-14 rounded-lg bg-[#2a2a4a]/80 border border-[#3a3a5a] flex items-center justify-center active:bg-[#39ff14]/20 active:border-[#39ff14] transition-colors"
      >
        <span className="text-[#aaa] text-xl">▲</span>
      </button>
      <button
        onTouchStart={(e) => { e.preventDefault(); pressKey("ArrowDown"); }}
        onTouchEnd={(e) => { e.preventDefault(); releaseKey("ArrowDown"); }}
        onTouchCancel={() => releaseKey("ArrowDown")}
        className="w-14 h-14 rounded-lg bg-[#2a2a4a]/80 border border-[#3a3a5a] flex items-center justify-center active:bg-[#39ff14]/20 active:border-[#39ff14] transition-colors"
      >
        <span className="text-[#aaa] text-xl">▼</span>
      </button>
    </div>
  );
}

// Need React import for useState
import React from "react";
