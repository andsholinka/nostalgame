import Link from "next/link";
import { AdminPWAButton } from "@/components/AdminPWAButton";

const games = [
  {
    id: "snake",
    title: "SNAKE",
    emoji: "🐍",
    description: "Kendalikan ular, makan makanan, jangan tabrak dinding!",
    players: "1P",
    accent: "#39ff14",
    difficulty: 1,
    year: 1976,
  },
  {
    id: "tetris",
    title: "TETRIS",
    emoji: "🧩",
    description: "Susun balok jatuh, bersihkan baris, jangan sampai penuh!",
    players: "1P",
    accent: "#00f3ff",
    difficulty: 2,
    year: 1984,
  },
  {
    id: "pong",
    title: "PONG",
    emoji: "🏓",
    description: "Game tenis meja klasik pertama di dunia. Lawan teman atau AI!",
    players: "2P",
    accent: "#39ff14",
    difficulty: 1,
    year: 1972,
  },
  {
    id: "space-invaders",
    title: "SPACE INVADERS",
    emoji: "👾",
    description: "Tembak alien sebelum mereka mencapai bumi!",
    players: "1P",
    accent: "#ff4444",
    difficulty: 2,
    year: 1978,
  },
  {
    id: "breakout",
    title: "BREAKOUT",
    emoji: "🧱",
    description: "Hancurkan semua batu bata dengan bola pantul!",
    players: "1P",
    accent: "#ff6b35",
    difficulty: 2,
    year: 1976,
  },
  {
    id: "minesweeper",
    title: "MINESWEEPER",
    emoji: "💣",
    description: "Buka petak tanpa kena ranjau. Gunakan logika!",
    players: "1P",
    accent: "#ffe600",
    difficulty: 3,
    year: 1990,
  },
  {
    id: "tic-tac-toe",
    title: "TIC TAC TOE",
    emoji: "⚔️",
    description: "Lawan teman atau AI dalam permainan klasik X dan O.",
    players: "2P",
    accent: "#00f3ff",
    difficulty: 1,
    year: 1952,
  },
  {
    id: "memory",
    title: "MEMORY",
    emoji: "🧠",
    description: "Temukan pasangan kartu yang sama. Uji ingatanmu!",
    players: "1P",
    accent: "#ff1493",
    difficulty: 2,
    year: 1966,
  },
  {
    id: "flappy",
    title: "FLAPPY BIRD",
    emoji: "🐦",
    description: "Terbang melewati pipa tanpa menabrak. Berapa skormu?",
    players: "1P",
    accent: "#ffe600",
    difficulty: 3,
    year: 2014,
  },
  {
    id: "typing",
    title: "TYPE ATTACK",
    emoji: "⌨️",
    description: "Uji kecepatan mengetikmu. Berapa WPM yang bisa kamu capai?",
    players: "1P",
    accent: "#ff6b35",
    difficulty: 2,
    year: 1984,
  },
  {
    id: "2048",
    title: "2048",
    emoji: "🔢",
    description: "Geser dan gabungkan angka untuk mencapai 2048!",
    players: "1P",
    accent: "#bf5af2",
    difficulty: 2,
    year: 2014,
  },
  {
    id: "hangman",
    title: "HANGMAN",
    emoji: "💀",
    description: "Tebak kata huruf demi huruf sebelum kehabisan nyawa.",
    players: "1P",
    accent: "#ff4444",
    difficulty: 1,
    year: 1970,
  },
  {
    id: "bounce",
    title: "BOUNCE",
    emoji: "🔴",
    description: "Lompat antar platform, kumpulkan ring, hindari jebakan! Klasik Nokia.",
    players: "1P",
    accent: "#e63946",
    difficulty: 2,
    year: 2000,
  },
];

export default function Home() {
  return (
    <div className="relative">
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex items-center justify-center overflow-hidden min-h-[calc(100vh-7rem)]">
        {/* Ambient background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#bf5af2]/[0.04] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-[#ff6b35]/[0.04] rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 text-center px-6 w-full max-w-3xl mx-auto py-20 lg:py-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#2a2a4a] bg-[#12122a]/80 mb-10">
            <span className="w-1.5 h-1.5 bg-[#39ff14] rounded-full animate-pulse-glow"></span>
            <span className="pixel-font text-[0.5rem] text-[#777] uppercase tracking-[0.2em]">Arcade Online</span>
          </div>

          {/* Main title */}
          <h1 className="pixel-font leading-none mb-8">
            <span
              className="block text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-wide"
              style={{ color: '#bf5af2', textShadow: '0 0 40px rgba(191,90,242,0.35)' }}
            >
              NOSTAL
            </span>
            <span
              className="block text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-wide mt-3"
              style={{ color: '#ff6b35', textShadow: '0 0 40px rgba(255,107,53,0.35)' }}
            >
              GAME
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-mono text-sm md:text-base text-[#888] max-w-md mx-auto mb-12 leading-relaxed">
            Koleksi game klasik legendaris yang bikin kangen.
            <br />
            Mainkan langsung di browser, gratis.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
            <a href="#arcade" className="btn-primary">
              🕹️ MASUK ARCADE
            </a>
            <span className="flex items-center gap-2 text-xs font-mono text-[#555]">
              <span className="w-1.5 h-1.5 bg-[#39ff14] rounded-full"></span>
              {games.length} games tersedia
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-px max-w-sm mx-auto bg-[#2a2a4a] border border-[#2a2a4a]">
            <div className="bg-[#0c0c1d] py-4 px-3 text-center">
              <p className="pixel-font text-xl lg:text-2xl neon-green">{games.length}</p>
              <p className="text-[0.6rem] font-mono text-[#555] mt-2 uppercase tracking-wider">Games</p>
            </div>
            <div className="bg-[#0c0c1d] py-4 px-3 text-center">
              <p className="pixel-font text-xl lg:text-2xl neon-cyan">∞</p>
              <p className="text-[0.6rem] font-mono text-[#555] mt-2 uppercase tracking-wider">Free Plays</p>
            </div>
            <div className="bg-[#0c0c1d] py-4 px-3 text-center">
              <p className="pixel-font text-xl lg:text-2xl neon-pink">PWA</p>
              <p className="text-[0.6rem] font-mono text-[#555] mt-2 uppercase tracking-wider">Offline</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[0.55rem] font-mono text-[#444] uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#555] to-transparent"></div>
        </div>
      </section>

      {/* ===== GAMES SECTION ===== */}
      <section id="arcade" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-8 md:mb-14">
          <div className="w-1 h-8 bg-gradient-to-b from-[#bf5af2] to-transparent"></div>
          <div>
            <h2 className="pixel-font text-xs lg:text-sm neon-purple tracking-wide">SELECT GAME</h2>
            <p className="text-xs font-mono text-[#555] mt-2">Pilih game favoritmu dan mulai bermain</p>
          </div>
          <div className="flex-1 h-px bg-[#1a1a35] ml-4 hidden md:block"></div>
        </div>

        {/* Featured game - hidden on mobile, shown on md+ */}
        <Link href={`/games/${games[1].id}`} className="hidden md:block">
          <div className="game-card mb-6 cursor-pointer group">
            <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${games[1].accent}, transparent 60%)` }}></div>
            <div className="flex flex-row">
              <div
                className="w-72 lg:w-80 flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${games[1].accent}08, transparent)` }}
              >
                <span className="text-6xl lg:text-7xl group-hover:scale-110 transition-transform duration-300">{games[1].emoji}</span>
              </div>
              <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-1">
                  <span className="pixel-font text-[0.45rem] px-2 py-1 border text-[#39ff14] border-[#39ff14]/30 uppercase">Featured</span>
                  <span className="text-[0.6rem] font-mono text-[#555]">{games[1].players} • {games[1].year}</span>
                </div>
                <h3 className="pixel-font text-sm lg:text-base mt-3 mb-3" style={{ color: games[1].accent }}>{games[1].title}</h3>
                <p className="font-mono text-xs lg:text-sm text-[#777] mb-5 leading-relaxed">{games[1].description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.6rem] font-mono text-[#555]">DIFF</span>
                    <div className="flex gap-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-3 h-1.5" style={{ background: i <= games[1].difficulty ? games[1].accent : '#2a2a4a' }}></div>
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto pixel-font text-[0.5rem] text-[#444] group-hover:text-[#888] transition-colors tracking-wider">
                    PRESS START →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Mobile game grid - 2 columns compact cards */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <div className="game-card h-full cursor-pointer group active:scale-[0.97] transition-transform">
                {/* Accent top */}
                <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${game.accent}, transparent)` }}></div>

                <div className="p-3.5">
                  {/* Emoji + badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{ background: `${game.accent}15`, border: `1px solid ${game.accent}30` }}
                    >
                      <span className="text-xl">{game.emoji}</span>
                    </div>
                    <span
                      className="pixel-font text-[0.35rem] px-1.5 py-0.5 rounded-sm"
                      style={{ background: `${game.accent}20`, color: game.accent }}
                    >
                      {game.players}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="pixel-font text-[0.5rem] mb-1 leading-tight" style={{ color: game.accent }}>
                    {game.title}
                  </h3>

                  {/* Year + Difficulty */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[0.5rem] font-mono text-[#555]">{game.year}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ background: i <= game.difficulty ? game.accent : '#1a1a35' }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop game grid - 3 columns */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.filter((_, i) => i !== 1).map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <div className="game-card h-full cursor-pointer group">
                <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${game.accent}, transparent 70%)` }}></div>

                <div className="p-5 lg:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl lg:text-3xl group-hover:scale-110 transition-transform">{game.emoji}</span>
                      <div>
                        <h3 className="pixel-font text-[0.6rem] lg:text-[0.65rem] tracking-wide" style={{ color: game.accent }}>{game.title}</h3>
                        <span className="text-[0.55rem] font-mono text-[#555]">{game.year}</span>
                      </div>
                    </div>
                    <span className="pixel-font text-[0.4rem] px-2 py-1 border border-[#2a2a4a] text-[#666]">
                      {game.players}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="font-mono text-xs text-[#666] mb-5 leading-relaxed">{game.description}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#1a1a35]">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.55rem] font-mono text-[#555]">DIFF</span>
                      <div className="flex gap-0.5">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-3 h-1.5" style={{ background: i <= game.difficulty ? game.accent : '#1a1a35' }}></div>
                        ))}
                      </div>
                    </div>
                    <span className="text-[0.5rem] font-mono text-[#444] group-hover:text-[#888] transition-colors tracking-wider">
                      PLAY →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== REQUEST GAME CTA ===== */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="game-card p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="pixel-font text-[0.65rem] neon-cyan mb-3">GAME FAVORITMU BELUM ADA?</h3>
            <p className="font-mono text-xs text-[#666] leading-relaxed">
              Request game jadul favoritmu dan kami akan coba tambahkan ke NostalGame!
            </p>
          </div>
          <Link href="/request" className="btn-primary shrink-0">
            📝 REQUEST GAME
          </Link>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="arcade-frame p-10 lg:p-14 text-center">
          <p className="pixel-font text-[0.5rem] text-[#555] mb-5 tracking-[0.3em]">READY PLAYER ONE</p>
          <h3 className="pixel-font text-xs lg:text-sm neon-orange mb-5 tracking-wide">INSTALL & PLAY OFFLINE</h3>
          <p className="font-mono text-xs text-[#666] max-w-md mx-auto mb-8 leading-relaxed">
            Install NostalGame sebagai app di HP atau desktop.
            Main kapan saja, bahkan tanpa internet.
          </p>
          <div className="flex justify-center gap-6 font-mono text-[0.6rem] text-[#555]">
            <span>📱 Mobile</span>
            <span className="text-[#333]">|</span>
            <span>💻 Desktop</span>
            <span className="text-[#333]">|</span>
            <span>🌐 Offline</span>
          </div>
        </div>
      </section>

      {/* Admin button - only visible on mobile PWA */}
      <AdminPWAButton />
    </div>
  );
}
