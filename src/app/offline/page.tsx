import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="arcade-frame p-12 max-w-md mx-auto">
        <div className="text-6xl mb-6 animate-float">📡</div>
        <h1 className="pixel-font text-sm neon-pink mb-4">NO SIGNAL</h1>
        <div className="font-mono text-[0.7rem] text-[#666] mb-8 space-y-2">
          <p>Koneksi internet tidak ditemukan.</p>
          <p className="text-[#888]">Game yang sudah di-cache masih bisa dimainkan.</p>
        </div>
        <Link href="/" className="btn-primary">
          🔄 RETRY CONNECTION
        </Link>
      </div>
    </div>
  );
}
