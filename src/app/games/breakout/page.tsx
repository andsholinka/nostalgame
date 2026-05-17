"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const W = 480;
const H = 560;
const PADDLE_W = 80;
const PADDLE_H = 12;
const BALL_R = 6;
const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_W = W / BRICK_COLS - 4;
const BRICK_H = 20;
const BRICK_PAD = 4;

const COLORS = ["#ff4444", "#ff6b35", "#ffe600", "#39ff14", "#00f3ff", "#bf5af2"];

type Brick = { x: number; y: number; alive: boolean; color: string };

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    paddleX: W / 2 - PADDLE_W / 2,
    ballX: W / 2,
    ballY: H - 60,
    ballVX: 3,
    ballVY: -3,
    bricks: [] as Brick[],
    score: 0,
    lives: 3,
  });
  const mouseXRef = useRef(W / 2);

  useEffect(() => {
    const saved = localStorage.getItem("breakout-highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const initBricks = (): Brick[] => {
    const bricks: Brick[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: c * (BRICK_W + BRICK_PAD) + BRICK_PAD / 2 + 2,
          y: r * (BRICK_H + BRICK_PAD) + 60,
          alive: true,
          color: COLORS[r],
        });
      }
    }
    return bricks;
  };

  const startGame = () => {
    const s = stateRef.current;
    s.bricks = initBricks();
    s.paddleX = W / 2 - PADDLE_W / 2;
    s.ballX = W / 2;
    s.ballY = H - 60;
    s.ballVX = 3 * (Math.random() > 0.5 ? 1 : -1);
    s.ballVY = -3;
    s.score = 0;
    s.lives = 3;
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setIsPlaying(true);
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    // Move paddle to mouse
    s.paddleX = Math.max(0, Math.min(W - PADDLE_W, mouseXRef.current - PADDLE_W / 2));

    // Move ball
    s.ballX += s.ballVX;
    s.ballY += s.ballVY;

    // Wall bounce
    if (s.ballX <= BALL_R || s.ballX >= W - BALL_R) s.ballVX *= -1;
    if (s.ballY <= BALL_R) s.ballVY *= -1;

    // Paddle bounce
    if (
      s.ballY + BALL_R >= H - 30 - PADDLE_H &&
      s.ballY + BALL_R <= H - 30 &&
      s.ballX >= s.paddleX &&
      s.ballX <= s.paddleX + PADDLE_W &&
      s.ballVY > 0
    ) {
      s.ballVY *= -1;
      const hitPos = (s.ballX - s.paddleX) / PADDLE_W - 0.5;
      s.ballVX = hitPos * 7;
    }

    // Ball out
    if (s.ballY > H) {
      s.lives--;
      setLives(s.lives);
      if (s.lives <= 0) {
        setGameOver(true);
        setIsPlaying(false);
        if (s.score > highScore) {
          setHighScore(s.score);
          localStorage.setItem("breakout-highscore", s.score.toString());
        }
        return;
      }
      s.ballX = W / 2;
      s.ballY = H - 60;
      s.ballVX = 3 * (Math.random() > 0.5 ? 1 : -1);
      s.ballVY = -3;
    }

    // Brick collision
    for (const brick of s.bricks) {
      if (!brick.alive) continue;
      if (
        s.ballX + BALL_R > brick.x &&
        s.ballX - BALL_R < brick.x + BRICK_W &&
        s.ballY + BALL_R > brick.y &&
        s.ballY - BALL_R < brick.y + BRICK_H
      ) {
        brick.alive = false;
        s.ballVY *= -1;
        s.score += 10;
        setScore(s.score);
        break;
      }
    }

    // Check win
    if (s.bricks.every(b => !b.alive)) {
      setWon(true);
      setIsPlaying(false);
      if (s.score > highScore) {
        setHighScore(s.score);
        localStorage.setItem("breakout-highscore", s.score.toString());
      }
      return;
    }

    // Draw
    ctx.fillStyle = "#0c0c1d";
    ctx.fillRect(0, 0, W, H);

    // Bricks
    for (const brick of s.bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H);
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.strokeRect(brick.x, brick.y, BRICK_W, BRICK_H);
    }

    // Paddle
    ctx.fillStyle = "#fff";
    ctx.fillRect(s.paddleX, H - 30 - PADDLE_H, PADDLE_W, PADDLE_H);

    // Ball
    ctx.fillStyle = "#ffe600";
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    animRef.current = requestAnimationFrame(gameLoop);
  }, [highScore]);

  useEffect(() => {
    if (isPlaying) {
      animRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, gameLoop]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseXRef.current = ((e.clientX - rect.left) / rect.width) * W;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm" style={{ color: '#ff6b35', textShadow: '0 0 10px #ff6b35' }}>🧱 BREAKOUT</h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-6 pixel-font text-[0.5rem]">
          <span>SCORE: <span className="neon-yellow">{score}</span></span>
          <span>LIVES: <span className="neon-pink">{"❤️".repeat(lives)}</span></span>
          <span>BEST: <span className="text-[#555]">{highScore}</span></span>
        </div>

        <div className="game-card p-3">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onMouseMove={handleMouseMove}
            onClick={() => { if (!isPlaying) startGame(); }}
            className="border border-[#2a2a4a] cursor-none block max-w-full"
          />
        </div>

        {!isPlaying && !gameOver && !won && (
          <div className="game-card p-6 text-center">
            <p className="pixel-font text-[0.6rem] text-[#888] mb-4">Gerakkan mouse untuk mengontrol paddle</p>
            <button onClick={startGame} className="btn-primary">▶ START</button>
          </div>
        )}

        {(gameOver || won) && (
          <div className="game-card p-6 text-center">
            <p className={`pixel-font text-sm mb-3 ${won ? "neon-green" : "neon-pink"}`}>
              {won ? "🎉 YOU WIN!" : "💀 GAME OVER"}
            </p>
            <p className="font-mono text-xs text-[#666] mb-4">Score: {score}</p>
            <button onClick={startGame} className="btn-primary">PLAY AGAIN</button>
          </div>
        )}
      </div>
    </div>
  );
}
