"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestGamePage() {
  const [gameName, setGameName] = useState("");
  const [reason, setReason] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!gameName.trim()) {
      setError("Nama game wajib diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName, reason, userName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengirim request");
      }

      setSubmitted(true);
      setGameName("");
      setReason("");
      setUserName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="game-card p-8 text-center">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#39ff14] to-transparent mb-8"></div>
          <span className="text-5xl block mb-4">✅</span>
          <h2 className="pixel-font text-sm neon-green mb-4">REQUEST TERKIRIM!</h2>
          <p className="font-mono text-xs text-[#777] mb-6 leading-relaxed">
            Terima kasih! Request game kamu sudah kami terima.
            <br />Admin akan review dan menambahkan game jika memungkinkan.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setSubmitted(false)} className="btn-secondary">
              REQUEST LAGI
            </button>
            <Link href="/" className="btn-primary">
              🕹️ MAIN GAME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-cyan">📝 REQUEST GAME</h1>
      </div>

      <div className="game-card p-6 lg:p-8">
        <div className="h-[2px] w-full bg-gradient-to-r from-[#00f3ff] to-transparent mb-6"></div>

        <p className="font-mono text-xs text-[#777] mb-6 leading-relaxed">
          Ada game jadul favorit yang belum ada di NostalGame?
          Request di sini dan kami akan coba tambahkan!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Game Name */}
          <div>
            <label className="pixel-font text-[0.45rem] text-[#888] block mb-2">
              NAMA GAME <span className="text-[#ff4444]">*</span>
            </label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Contoh: Pac-Man, Galaga, Donkey Kong..."
              maxLength={100}
              className="w-full bg-[#0c0c1d] border-2 border-[#2a2a4a] px-4 py-3 font-mono text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00f3ff] transition-colors"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="pixel-font text-[0.45rem] text-[#888] block mb-2">
              ALASAN / DESKRIPSI
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Kenapa kamu ingin game ini ditambahkan? (opsional)"
              rows={3}
              maxLength={500}
              className="w-full bg-[#0c0c1d] border-2 border-[#2a2a4a] px-4 py-3 font-mono text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00f3ff] transition-colors resize-none"
            />
          </div>

          {/* User Name */}
          <div>
            <label className="pixel-font text-[0.45rem] text-[#888] block mb-2">
              NAMA KAMU
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Siapa namamu? (opsional)"
              maxLength={50}
              className="w-full bg-[#0c0c1d] border-2 border-[#2a2a4a] px-4 py-3 font-mono text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00f3ff] transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="pixel-font text-[0.5rem] text-[#ff4444]">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "MENGIRIM..." : "📨 KIRIM REQUEST"}
          </button>
        </form>
      </div>
    </div>
  );
}
