"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <span className="flex items-center gap-1.5 text-[0.55rem] font-mono text-[#39ff14]">
        <span className="w-1.5 h-1.5 bg-[#39ff14] rounded-full"></span>
        INSTALLED
      </span>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="pixel-font text-[0.45rem] px-3 py-2 bg-gradient-to-r from-[#bf5af2] to-[#ff6b35] text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
    >
      📲 INSTALL
    </button>
  );
}
