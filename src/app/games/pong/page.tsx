"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { MobileGamepad } from "@/components/MobileGamepad";

const CANVAS_W = 600;
const CANVAS_H = 400;
const PADDLE_W = 12;
const PADDLE_H = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const BALL_SPEED_INIT = 4;

type Mode = "pvp" | "ai" | null;

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    p1Y: CANVAS_H / 2 - PADDLE_H / 2,
    p2Y: CANVAS_H / 2 - PADDLE_H / 2,
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H / 2,
    ballVX: BALL_SPEED_INIT,
    ballVY: BALL_SPEED_INIT,
  });

  const resetBall = () => {
    stateRef.current.ballX = CANVAS_W / 2;
    stateRef.current.ballY = CANVAS_H / 2;
    const dir = Math.random() > 0.5 ? 1 : -1;
    const angle = (Math.random() - 0.5) * 1.5;
    stateRef.current.ballVX = BALL_SPEED_INIT * dir;
    stateRef.current.ballVY = BALL_SPEED_INIT * angle;
  };

  const startGame = (m: Mode) => {
    setMode(m);
    setScores({ p1: 0, p2: 0 });
    setWinner(null);
    setIsPlaying(true);
    stateRef.current.p1Y = CANVAS_H / 2 - PADDLE_H / 2;
    stateRef.current.p2Y = CANVAS_H / 2 - PADDLE_H / 2;
    resetBall();
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    const keys = keysRef.current;

    // Move paddles
    if (keys.has("w") || keys.has("W")) s.p1Y = Math.max(0, s.p1Y - PADDLE_SPEED);
    if (keys.has("s") || keys.has("S")) s.p1Y = Math.min(CANVAS_H - PADDLE_H, s.p1Y + PADDLE_SPEED);

    if (mode === "pvp") {
      if (keys.has("ArrowUp")) s.p2Y = Math.max(0, s.p2Y - PADDLE_SPEED);
      if (keys.has("ArrowDown")) s.p2Y = Math.min(CANVAS_H - PADDLE_H, s.p2Y + PADDLE_SPEED);
    } else {
      // AI
      const center = s.p2Y + PADDLE_H / 2;
      if (center < s.ballY - 15) s.p2Y = Math.min(CANVAS_H - PADDLE_H, s.p2Y + PADDLE_SPEED * 0.7);
      else if (center > s.ballY + 15) s.p2Y = Math.max(0, s.p2Y - PADDLE_SPEED * 0.7);
    }

    // Move ball
    s.ballX += s.ballVX;
    s.ballY += s.ballVY;

    // Top/bottom bounce
    if (s.ballY <= 0 || s.ballY >= CANVAS_H - BALL_SIZE) {
      s.ballVY *= -1;
      s.ballY = Math.max(0, Math.min(CANVAS_H - BALL_SIZE, s.ballY));
    }

    // Paddle collision
    // Left paddle
    if (s.ballX <= PADDLE_W + 20 && s.ballY + BALL_SIZE >= s.p1Y && s.ballY <= s.p1Y + PADDLE_H && s.ballVX < 0) {
      s.ballVX = Math.abs(s.ballVX) * 1.05;
      const hitPos = (s.ballY - s.p1Y) / PADDLE_H - 0.5;
      s.ballVY = hitPos * 8;
    }
    // Right paddle
    if (s.ballX >= CANVAS_W - PADDLE_W - 20 - BALL_SIZE && s.ballY + BALL_SIZE >= s.p2Y && s.ballY <= s.p2Y + PADDLE_H && s.ballVX > 0) {
      s.ballVX = -Math.abs(s.ballVX) * 1.05;
      const hitPos = (s.ballY - s.p2Y) / PADDLE_H - 0.5;
      s.ballVY = hitPos * 8;
    }

    // Score
    if (s.ballX < 0) {
      setScores(prev => {
        const newScores = { ...prev, p2: prev.p2 + 1 };
        if (newScores.p2 >= 5) { setWinner(mode === "ai" ? "AI" : "Player 2"); setIsPlaying(false); }
        return newScores;
      });
      resetBall();
    }
    if (s.ballX > CANVAS_W) {
      setScores(prev => {
        const newScores = { ...prev, p1: prev.p1 + 1 };
        if (newScores.p1 >= 5) { setWinner("Player 1"); setIsPlaying(false); }
        return newScores;
      });
      resetBall();
    }

    // Draw
    ctx.fillStyle = "#0c0c1d";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Center line
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = "#2a2a4a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles
    ctx.fillStyle = "#39ff14";
    ctx.fillRect(20, s.p1Y, PADDLE_W, PADDLE_H);
    ctx.fillStyle = "#00f3ff";
    ctx.fillRect(CANVAS_W - 20 - PADDLE_W, s.p2Y, PADDLE_W, PADDLE_H);

    // Ball
    ctx.fillStyle = "#fff";
    ctx.fillRect(s.ballX, s.ballY, BALL_SIZE, BALL_SIZE);

    // Scores
    ctx.font = "bold 32px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#39ff14";
    ctx.fillText(scores.p1.toString(), CANVAS_W / 4, 50);
    ctx.fillStyle = "#00f3ff";
    ctx.fillText(scores.p2.toString(), (CANVAS_W / 4) * 3, 50);

    if (isPlaying) {
      animRef.current = requestAnimationFrame(gameLoop);
    }
  }, [mode, isPlaying, scores]);

  useEffect(() => {
    if (isPlaying) {
      animRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, gameLoop]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="btn-secondary">← BACK</Link>
          <h1 className="pixel-font text-sm neon-green">🏓 PONG</h1>
        </div>
        <div className="game-card p-8 max-w-md mx-auto text-center">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#39ff14] to-transparent mb-6"></div>
          <h2 className="pixel-font text-[0.7rem] text-[#ffaa00] mb-6">SELECT MODE</h2>
          <div className="space-y-4">
            <button onClick={() => startGame("pvp")} className="btn-primary w-full">👥 PLAYER VS PLAYER</button>
            <button onClick={() => startGame("ai")} className="btn-secondary w-full">🤖 PLAYER VS AI</button>
          </div>
          <div className="mt-6 text-[0.6rem] font-mono text-[#555] space-y-1">
            <p>P1: W / S keys</p>
            <p>P2: Arrow Up / Down</p>
            <p>First to 5 wins!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-green">🏓 PONG</h1>
        <span className="pixel-font text-[0.45rem] text-[#555] ml-auto">{mode === "pvp" ? "PVP" : "VS AI"}</span>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="game-card p-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="border border-[#2a2a4a] block max-w-full"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {winner && (
          <div className="game-card p-6 text-center">
            <p className="pixel-font text-sm neon-yellow mb-4">🏆 {winner} WINS!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => startGame(mode)} className="btn-primary">REMATCH</button>
              <button onClick={() => setMode(null)} className="btn-secondary">MENU</button>
            </div>
          </div>
        )}

        <div className="font-mono text-[0.65rem] text-[#555] text-center space-y-1">
          <p><span className="neon-green">P1</span>: W / S &nbsp;&nbsp; <span className="neon-cyan">{mode === "ai" ? "AI" : "P2"}</span>: ↑ / ↓</p>
        </div>
      </div>

      <MobileGamepad layout="updown" />
    </div>
  );
}
