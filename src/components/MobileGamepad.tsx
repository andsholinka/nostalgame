"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

type GamepadLayout = "dpad" | "leftright" | "updown";

interface MobileGamepadProps {
  layout?: GamepadLayout;
  onAction?: () => void;
  actionLabel?: string;
  enabled?: boolean;
}

function simulateKey(key: string, type: "keydown" | "keyup") {
  const event = new KeyboardEvent(type, {
    key,
    code: key === "ArrowUp" ? "ArrowUp" : key === "ArrowDown" ? "ArrowDown" : key === "ArrowLeft" ? "ArrowLeft" : key === "ArrowRight" ? "ArrowRight" : key === " " ? "Space" : "",
    bubbles: true,
  });
  window.dispatchEvent(event);
}

export function MobileGamepad({ layout = "dpad", onAction, actionLabel, enabled = true }: MobileGamepadProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeDir, setActiveDir] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const lastKeyRef = useRef<string | null>(null);
  const touchZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleTouch = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch || !touchZoneRef.current) return;

    const rect = touchZoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = touch.clientX;
    const y = touch.clientY;

    const dx = x - centerX;
    const dy = y - centerY;

    let key: string;

    if (layout === "leftright") {
      key = dx > 0 ? "ArrowRight" : "ArrowLeft";
    } else if (layout === "updown") {
      key = dy > 0 ? "ArrowDown" : "ArrowUp";
    } else {
      if (Math.abs(dx) > Math.abs(dy)) {
        key = dx > 0 ? "ArrowRight" : "ArrowLeft";
      } else {
        key = dy > 0 ? "ArrowDown" : "ArrowUp";
      }
    }

    if (lastKeyRef.current && lastKeyRef.current !== key) {
      simulateKey(lastKeyRef.current, "keyup");
    }

    lastKeyRef.current = key;
    simulateKey(key, "keydown");
    setActiveDir(key);
  }, [layout, enabled]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
    if (lastKeyRef.current) {
      simulateKey(lastKeyRef.current, "keyup");
      lastKeyRef.current = null;
    }
    setActiveDir(null);
  }, [enabled]);

  const handleActionTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAction) {
      onAction();
    } else {
      simulateKey(" ", "keydown");
      setTimeout(() => simulateKey(" ", "keyup"), 100);
    }
  }, [onAction]);

  useEffect(() => {
    return () => {
      if (lastKeyRef.current) {
        simulateKey(lastKeyRef.current, "keyup");
      }
    };
  }, []);

  if (!mounted || !isMobile) return null;

  // Don't show touch zone when not enabled (game not started)
  if (!enabled) return null;

  return (
    <>
      {/* Touch zone - covers the game area */}
      <div
        ref={touchZoneRef}
        className="absolute inset-0 z-[10] md:hidden"
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ touchAction: "none" }}
      />

      {/* Direction indicator */}
      {activeDir && (
        <div className="absolute inset-0 z-[11] pointer-events-none md:hidden flex items-center justify-center">
          <div className="text-4xl opacity-20">
            {activeDir === "ArrowUp" && "▲"}
            {activeDir === "ArrowDown" && "▼"}
            {activeDir === "ArrowLeft" && "◀"}
            {activeDir === "ArrowRight" && "▶"}
          </div>
        </div>
      )}

      {/* Action button */}
      {(onAction || actionLabel) && (
        <div className="absolute -bottom-20 right-0 z-[12] md:hidden">
          <button
            onTouchStart={handleActionTouch}
            className="w-14 h-14 rounded-full bg-[#ff6b35]/80 border-2 border-[#ff6b35] flex items-center justify-center active:scale-90 active:bg-[#ff6b35] transition-transform shadow-[0_0_15px_rgba(255,107,53,0.4)]"
          >
            <span className="pixel-font text-[0.4rem] text-white font-bold">{actionLabel || "A"}</span>
          </button>
        </div>
      )}
    </>
  );
}
