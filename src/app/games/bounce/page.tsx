"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const W = 480;
const H = 640;
const BALL_R = 12;
const GRAVITY = 0.4;
const JUMP_FORCE = -10;
const MOVE_SPEED = 4;
const PLATFORM_H = 12;
const RING_SIZE = 20;
const SPIKE_SIZE = 16;

type Platform = { x: number; y: number; w: number; type: "normal" | "bounce" | "break" };
type Ring = { x: number; y: number; collected: boolean };
type Spike = { x: number; y: number; w: number };

function generateLevel(levelNum: number): { platforms: Platform[]; rings: Ring[]; spikes: Spike[]; exitY: number } {
  const platforms: Platform[] = [];
  const rings: Ring[] = [];
  const spikes: Spike[] = [];

  // Ground
  platforms.push({ x: 0, y: H - 20, w: W, type: "normal" });

  const numPlatforms = 12 + levelNum * 3;
  const sectionH = (H - 100) / numPlatforms;

  for (let i = 0; i < numPlatforms; i++) {
    const y = H - 60 - (i + 1) * sectionH;
    const w = 60 + Math.random() * 80;
    const x = Math.random() * (W - w);

    let type: Platform["type"] = "normal";
    if (Math.random() < 0.2 && i > 2) type = "bounce";
    if (Math.random() < 0.15 && i > 4) type = "break";

    platforms.push({ x, y, w, type });

    // Rings on some platforms
    if (Math.random() < 0.4) {
      rings.push({ x: x + w / 2, y: y - 25, collected: false });
    }

    // Spikes on some platforms (after level 1)
    if (levelNum > 1 && Math.random() < 0.2 && i > 3) {
      spikes.push({ x: x + 10, y: y - SPIKE_SIZE, w: w - 20 });
    }
  }

  // Exit at top
  const exitY = 40;

  return { platforms, rings, spikes, exitY };
}

export default function BounceGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());

  const stateRef = useRef({
    ballX: W / 2,
    ballY: H - 50,
    velX: 0,
    velY: 0,
    onGround: false,
    platforms: [] as Platform[],
    rings: [] as Ring[],
    spikes: [] as Spike[],
    exitY: 40,
    cameraY: 0,
    score: 0,
    lives: 3,
    level: 1,
    ringsCollected: 0,
    totalRings: 0,
    breakTimers: new Map<number, number>(),
  });

  useEffect(() => {
    const saved = localStorage.getItem("bounce-highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const initLevel = useCallback((lvl: number) => {
    const { platforms, rings, spikes, exitY } = generateLevel(lvl);
    const s = stateRef.current;
    s.ballX = W / 2;
    s.ballY = H - 50;
    s.velX = 0;
    s.velY = 0;
    s.onGround = false;
    s.platforms = platforms;
    s.rings = rings;
    s.spikes = spikes;
    s.exitY = exitY;
    s.cameraY = 0;
    s.ringsCollected = 0;
    s.totalRings = rings.length;
    s.breakTimers = new Map();
    setLevelComplete(false);
  }, []);

  const startGame = () => {
    const s = stateRef.current;
    s.score = 0;
    s.lives = 3;
    s.level = 1;
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setLevelComplete(false);
    initLevel(1);
    setIsPlaying(true);
  };

  const nextLevel = () => {
    const s = stateRef.current;
    s.level++;
    setLevel(s.level);
    initLevel(s.level);
    setLevelComplete(false);
    setIsPlaying(true);
  };

  const die = useCallback(() => {
    const s = stateRef.current;
    s.lives--;
    setLives(s.lives);
    if (s.lives <= 0) {
      setGameOver(true);
      setIsPlaying(false);
      if (s.score > highScore) {
        setHighScore(s.score);
        localStorage.setItem("bounce-highscore", s.score.toString());
      }
    } else {
      // Reset position
      s.ballX = W / 2;
      s.ballY = H - 50;
      s.velX = 0;
      s.velY = 0;
      s.cameraY = 0;
    }
  }, [highScore]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    const keys = keysRef.current;

    // Input
    if (keys.has("ArrowLeft") || keys.has("a")) s.velX = -MOVE_SPEED;
    else if (keys.has("ArrowRight") || keys.has("d")) s.velX = MOVE_SPEED;
    else s.velX *= 0.85;

    if ((keys.has("ArrowUp") || keys.has("w") || keys.has(" ")) && s.onGround) {
      s.velY = JUMP_FORCE;
      s.onGround = false;
    }

    // Physics
    s.velY += GRAVITY;
    s.ballX += s.velX;
    s.ballY += s.velY;

    // Wall bounds
    if (s.ballX < BALL_R) { s.ballX = BALL_R; s.velX = 0; }
    if (s.ballX > W - BALL_R) { s.ballX = W - BALL_R; s.velX = 0; }

    // Fall death
    if (s.ballY > H + 50 - s.cameraY) {
      die();
      animRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Camera follow
    const targetCam = Math.min(0, -(s.ballY - H * 0.6));
    s.cameraY += (targetCam - s.cameraY) * 0.05;

    // Platform collision
    s.onGround = false;
    for (let i = 0; i < s.platforms.length; i++) {
      const p = s.platforms[i];
      if (s.breakTimers.has(i) && Date.now() - s.breakTimers.get(i)! > 300) continue;

      const ballBottom = s.ballY + BALL_R;
      const prevBottom = ballBottom - s.velY;

      if (
        s.velY > 0 &&
        prevBottom <= p.y &&
        ballBottom >= p.y &&
        s.ballX + BALL_R > p.x &&
        s.ballX - BALL_R < p.x + p.w
      ) {
        s.ballY = p.y - BALL_R;
        s.onGround = true;

        if (p.type === "bounce") {
          s.velY = JUMP_FORCE * 1.5;
          s.onGround = false;
        } else if (p.type === "break") {
          s.velY = 0;
          if (!s.breakTimers.has(i)) {
            s.breakTimers.set(i, Date.now());
          }
        } else {
          s.velY = 0;
        }
      }
    }

    // Ring collection
    for (const ring of s.rings) {
      if (ring.collected) continue;
      const dx = s.ballX - ring.x;
      const dy = s.ballY - ring.y;
      if (Math.sqrt(dx * dx + dy * dy) < BALL_R + RING_SIZE / 2) {
        ring.collected = true;
        s.score += 50;
        s.ringsCollected++;
        setScore(s.score);
      }
    }

    // Spike collision
    for (const spike of s.spikes) {
      if (
        s.ballX + BALL_R > spike.x &&
        s.ballX - BALL_R < spike.x + spike.w &&
        s.ballY + BALL_R > spike.y &&
        s.ballY - BALL_R < spike.y + SPIKE_SIZE
      ) {
        die();
        animRef.current = requestAnimationFrame(gameLoop);
        return;
      }
    }

    // Exit check (reach top)
    if (s.ballY - BALL_R <= s.exitY) {
      s.score += 200 + s.level * 100;
      setScore(s.score);
      setLevelComplete(true);
      setIsPlaying(false);
      if (s.score > highScore) {
        setHighScore(s.score);
        localStorage.setItem("bounce-highscore", s.score.toString());
      }
      return;
    }

    // === DRAW ===
    ctx.save();
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, W, H);

    ctx.translate(0, s.cameraY);

    // Platforms
    for (let i = 0; i < s.platforms.length; i++) {
      const p = s.platforms[i];
      if (s.breakTimers.has(i) && Date.now() - s.breakTimers.get(i)! > 300) continue;

      if (p.type === "normal") {
        ctx.fillStyle = "#4a6741";
        ctx.fillRect(p.x, p.y, p.w, PLATFORM_H);
        ctx.fillStyle = "#5a8751";
        ctx.fillRect(p.x, p.y, p.w, 4);
      } else if (p.type === "bounce") {
        ctx.fillStyle = "#c44";
        ctx.fillRect(p.x, p.y, p.w, PLATFORM_H);
        // Spring visual
        ctx.fillStyle = "#ff6";
        ctx.fillRect(p.x + p.w / 2 - 8, p.y - 6, 16, 6);
      } else if (p.type === "break") {
        const elapsed = s.breakTimers.has(i) ? Date.now() - s.breakTimers.get(i)! : 0;
        const alpha = Math.max(0, 1 - elapsed / 300);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#8B6914";
        ctx.fillRect(p.x, p.y, p.w, PLATFORM_H);
        // Crack lines
        ctx.strokeStyle = "#5a4510";
        ctx.beginPath();
        ctx.moveTo(p.x + p.w * 0.3, p.y);
        ctx.lineTo(p.x + p.w * 0.5, p.y + PLATFORM_H);
        ctx.moveTo(p.x + p.w * 0.7, p.y);
        ctx.lineTo(p.x + p.w * 0.6, p.y + PLATFORM_H);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Rings
    for (const ring of s.rings) {
      if (ring.collected) continue;
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, RING_SIZE / 2, 0, Math.PI * 2);
      ctx.stroke();
      // Inner shine
      ctx.strokeStyle = "#FFF8DC";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, RING_SIZE / 2 - 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Spikes
    for (const spike of s.spikes) {
      ctx.fillStyle = "#888";
      const numSpikes = Math.floor(spike.w / 12);
      for (let i = 0; i < numSpikes; i++) {
        const sx = spike.x + i * 12 + 6;
        ctx.beginPath();
        ctx.moveTo(sx - 5, spike.y + SPIKE_SIZE);
        ctx.lineTo(sx, spike.y);
        ctx.lineTo(sx + 5, spike.y + SPIKE_SIZE);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Exit gate
    ctx.strokeStyle = "#39ff14";
    ctx.lineWidth = 3;
    ctx.strokeRect(W / 2 - 30, s.exitY - 10, 60, 20);
    ctx.fillStyle = "#39ff14";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("EXIT", W / 2, s.exitY + 4);

    // Ball (Nokia bounce style - red ball)
    const gradient = ctx.createRadialGradient(
      s.ballX - 3, s.ballY - 3, 2,
      s.ballX, s.ballY, BALL_R
    );
    gradient.addColorStop(0, "#ff6b6b");
    gradient.addColorStop(0.7, "#e63946");
    gradient.addColorStop(1, "#9d0208");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    // Ball highlight
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.arc(s.ballX - 3, s.ballY - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // HUD (fixed position)
    ctx.fillStyle = "rgba(10, 22, 40, 0.8)";
    ctx.fillRect(0, 0, W, 36);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px 'Press Start 2P', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`LV:${s.level}`, 10, 24);
    ctx.textAlign = "center";
    ctx.fillText(`💰${s.ringsCollected}/${s.totalRings}`, W / 2, 24);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText("●".repeat(s.lives), W - 10, 24);

    if (isPlaying) {
      animRef.current = requestAnimationFrame(gameLoop);
    }
  }, [die, isPlaying, highScore]);

  useEffect(() => {
    if (isPlaying) {
      animRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, gameLoop]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === " ") e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // Draw initial screen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isPlaying) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, W, H);

    // Draw a preview ball
    const gradient = ctx.createRadialGradient(W / 2 - 3, H / 2 - 3, 2, W / 2, H / 2, 20);
    gradient.addColorStop(0, "#ff6b6b");
    gradient.addColorStop(0.7, "#e63946");
    gradient.addColorStop(1, "#9d0208");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 - 30, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("BOUNCE", W / 2, H / 2 + 30);
    ctx.font = "10px monospace";
    ctx.fillStyle = "#888";
    ctx.fillText("Press START to play", W / 2, H / 2 + 60);
  }, [isPlaying, gameOver, levelComplete]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm" style={{ color: '#e63946', textShadow: '0 0 10px #e63946' }}>🔴 BOUNCE</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-6 pixel-font text-[0.5rem]">
            <span>SCORE: <span className="neon-yellow">{score}</span></span>
            <span>LEVEL: <span className="neon-cyan">{level}</span></span>
            <span>BEST: <span className="text-[#555]">{highScore}</span></span>
          </div>

          <div className="game-card p-3">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="border border-[#2a2a4a] block max-w-full"
            />
          </div>
        </div>

        <div className="game-card p-5 w-full lg:w-56 space-y-4">
          <h3 className="pixel-font text-[0.5rem] text-[#888]">CONTROLS</h3>
          <div className="font-mono text-[0.65rem] text-[#666] space-y-2">
            <p>← → / A D : Move</p>
            <p>↑ / W / Space : Jump</p>
          </div>

          <hr className="border-[#2a2a4a]" />

          <h3 className="pixel-font text-[0.5rem] text-[#888]">PLATFORMS</h3>
          <div className="font-mono text-[0.6rem] space-y-2">
            <p><span className="inline-block w-4 h-2 bg-[#5a8751] mr-2"></span><span className="text-[#666]">Normal</span></p>
            <p><span className="inline-block w-4 h-2 bg-[#c44] mr-2"></span><span className="text-[#666]">Bounce (spring)</span></p>
            <p><span className="inline-block w-4 h-2 bg-[#8B6914] mr-2"></span><span className="text-[#666]">Breakable</span></p>
          </div>

          <hr className="border-[#2a2a4a]" />

          <div className="font-mono text-[0.6rem] text-[#666] space-y-1">
            <p>🪙 Collect rings</p>
            <p>⚠️ Avoid spikes</p>
            <p>🚪 Reach EXIT to clear</p>
          </div>

          {!isPlaying && !levelComplete && (
            <button onClick={startGame} className="btn-primary w-full">
              {gameOver ? "RETRY" : "▶ START"}
            </button>
          )}
        </div>
      </div>

      {levelComplete && (
        <div className="game-card p-6 text-center mt-6 max-w-sm mx-auto">
          <p className="pixel-font text-sm neon-green mb-2">LEVEL {level} CLEAR!</p>
          <p className="font-mono text-xs text-[#666] mb-4">
            Rings: {stateRef.current.ringsCollected}/{stateRef.current.totalRings} • Score: {score}
          </p>
          <button onClick={nextLevel} className="btn-primary">NEXT LEVEL →</button>
        </div>
      )}

      {gameOver && (
        <div className="game-card p-6 text-center mt-6 max-w-sm mx-auto">
          <p className="pixel-font text-sm neon-pink mb-2">GAME OVER</p>
          <p className="font-mono text-xs text-[#666] mb-4">Score: {score} • Level: {level}</p>
          <button onClick={startGame} className="btn-primary">PLAY AGAIN</button>
        </div>
      )}
    </div>
  );
}
