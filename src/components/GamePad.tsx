"use client";

import { useEffect, useState, useRef } from "react";

function dispatchKey(key: string, type: "keydown" | "keyup", code?: string) {
  window.dispatchEvent(new KeyboardEvent(type, { key, code: code || key, bubbles: true }));
}

const buttonBase = "bg-gradient-to-b from-[#2a2a4a] to-[#1a1a35] border-2 border-[#3a3a5a] flex items-center justify-center transition-colors shadow-[0_4px_0_#0a0a18] active:shadow-[0_2px_0_#0a0a18] active:translate-y-[2px]";

interface GamePadProps {
  layout: "dpad" | "leftright" | "updown" | "action-only";
  accent?: string;
  /** If true, key is held down while button is pressed (for continuous movement). Default true. */
  continuous?: boolean;
  centerButton?: {
    label: string;
    key: string;
    code?: string;
    color?: string;
  };
  actionButton?: {
    label: string;
    key?: string;
    code?: string;
    onAction?: () => void;
    color?: string;
  };
}

function useMobile() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return { mounted, isMobile };
}

/** Hook for press-and-hold button behavior */
function useDirectionButton(continuous: boolean) {
  const activeKeyRef = useRef<string | null>(null);

  const handleStart = (key: string, code?: string) => {
    if (activeKeyRef.current === key) return;
    if (activeKeyRef.current) {
      dispatchKey(activeKeyRef.current, "keyup");
    }
    activeKeyRef.current = key;
    dispatchKey(key, "keydown", code);

    if (!continuous) {
      // For grid-based games (Snake, 2048, Tetris move), release immediately
      setTimeout(() => {
        if (activeKeyRef.current === key) {
          dispatchKey(key, "keyup");
          activeKeyRef.current = null;
        }
      }, 50);
    }
  };

  const handleEnd = () => {
    if (activeKeyRef.current) {
      dispatchKey(activeKeyRef.current, "keyup");
      activeKeyRef.current = null;
    }
  };

  useEffect(() => {
    return () => handleEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { handleStart, handleEnd };
}

export function GamePad({ layout, accent = "#39ff14", continuous = true, centerButton, actionButton }: GamePadProps) {
  const { mounted, isMobile } = useMobile();
  const { handleStart, handleEnd } = useDirectionButton(continuous);

  if (!mounted || !isMobile) return null;

  const dirProps = (key: string) => ({
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); handleStart(key); },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); handleEnd(); },
    onTouchCancel: handleEnd,
    onMouseDown: (e: React.MouseEvent) => { e.preventDefault(); handleStart(key); },
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
  });

  const tapProps = (key: string, code?: string) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      dispatchKey(key, "keydown", code);
      setTimeout(() => dispatchKey(key, "keyup", code), 50);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      dispatchKey(key, "keydown", code);
      setTimeout(() => dispatchKey(key, "keyup", code), 50);
    },
  });

  const handleAction = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (actionButton?.onAction) {
      actionButton.onAction();
    } else if (actionButton?.key) {
      dispatchKey(actionButton.key, "keydown", actionButton.code);
      setTimeout(() => dispatchKey(actionButton.key!, "keyup", actionButton.code), 50);
    }
  };

  // Compute active class via CSS variable approach
  const activeStyle: React.CSSProperties = {
    "--accent": accent,
  } as React.CSSProperties;

  if (layout === "action-only" && actionButton) {
    return (
      <div className="md:hidden flex justify-center mt-6 mb-4">
        <button
          onTouchStart={handleAction}
          onMouseDown={handleAction}
          className="w-32 h-16 rounded-xl flex flex-col items-center justify-center active:translate-y-[2px] shadow-[0_4px_0_#0a0a18] active:shadow-[0_2px_0_#0a0a18] border-2"
          style={{
            background: `linear-gradient(180deg, ${actionButton.color || "#ff6b35"}, ${actionButton.color || "#cc4400"}dd)`,
            borderColor: actionButton.color || "#ff6b35",
          }}
        >
          <span className="pixel-font text-[0.55rem] text-white font-bold">{actionButton.label}</span>
        </button>
      </div>
    );
  }

  if (layout === "leftright") {
    return (
      <div className="md:hidden flex justify-center items-center gap-4 mt-6 mb-4">
        <button {...dirProps("ArrowLeft")} className={`w-20 h-16 rounded-xl ${buttonBase}`} style={activeStyle}>
          <span className="text-[#aaa] text-2xl">◀</span>
        </button>

        {actionButton && (
          <button
            onTouchStart={handleAction}
            onMouseDown={handleAction}
            className="w-16 h-16 rounded-full flex items-center justify-center active:translate-y-[2px] shadow-[0_4px_0_#0a0a18] active:shadow-[0_2px_0_#0a0a18] border-2"
            style={{
              background: `linear-gradient(180deg, ${actionButton.color || "#ff6b35"}, ${actionButton.color || "#cc4400"}dd)`,
              borderColor: actionButton.color || "#ff6b35",
            }}
          >
            <span className="pixel-font text-[0.5rem] text-white font-bold">{actionButton.label}</span>
          </button>
        )}

        <button {...dirProps("ArrowRight")} className={`w-20 h-16 rounded-xl ${buttonBase}`} style={activeStyle}>
          <span className="text-[#aaa] text-2xl">▶</span>
        </button>
      </div>
    );
  }

  if (layout === "updown") {
    return (
      <div className="md:hidden flex justify-center mt-6 mb-4">
        <div className="flex flex-col gap-3">
          <button {...dirProps("ArrowUp")} className={`w-20 h-14 rounded-xl ${buttonBase}`} style={activeStyle}>
            <span className="text-[#aaa] text-2xl">▲</span>
          </button>
          <button {...dirProps("ArrowDown")} className={`w-20 h-14 rounded-xl ${buttonBase}`} style={activeStyle}>
            <span className="text-[#aaa] text-2xl">▼</span>
          </button>
        </div>
      </div>
    );
  }

  // Default: dpad
  return (
    <div className="md:hidden flex justify-center mt-6 mb-4">
      <div className="relative w-52 h-52">
        <button {...dirProps("ArrowUp")} className={`absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl ${buttonBase}`} style={activeStyle}>
          <span className="text-[#aaa] text-2xl">▲</span>
        </button>
        <button {...dirProps("ArrowDown")} className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl ${buttonBase}`} style={activeStyle}>
          <span className="text-[#aaa] text-2xl">▼</span>
        </button>
        <button {...dirProps("ArrowLeft")} className={`absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-xl ${buttonBase}`} style={activeStyle}>
          <span className="text-[#aaa] text-2xl">◀</span>
        </button>
        <button {...dirProps("ArrowRight")} className={`absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-xl ${buttonBase}`} style={activeStyle}>
          <span className="text-[#aaa] text-2xl">▶</span>
        </button>

        {centerButton ? (
          <button
            {...tapProps(centerButton.key, centerButton.code)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center active:translate-y-[2px] shadow-[0_3px_0_#0a0a18] active:shadow-[0_1px_0_#0a0a18] border-2"
            style={{
              background: `linear-gradient(180deg, ${centerButton.color || "#ff6b35"}, ${centerButton.color || "#cc4400"}dd)`,
              borderColor: centerButton.color || "#ff6b35",
            }}
          >
            <span className="pixel-font text-[0.4rem] text-white font-bold">{centerButton.label}</span>
          </button>
        ) : (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1a1a35] border border-[#2a2a4a] flex items-center justify-center pointer-events-none">
            <span className="pixel-font text-[0.35rem] text-[#444]">D-PAD</span>
          </div>
        )}
      </div>
    </div>
  );
}
