"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { GamePad } from "@/components/GamePad";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_SPEED = 3;

type Pipe = { x: number; topHeight: number };

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const gameStateRef = useRef({
    birdY: CANVAS_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [] as Pipe[],
    score: 0,
    frameCount: 0,
  });

  const animationRef = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("flappy-highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const jump = useCallback(() => {
    if (!isPlaying) {
      startGame();
      return;
    }
    if (gameOver) return;
    gameStateRef.current.birdVelocity = JUMP_FORCE;
  }, [isPlaying, gameOver]);

  const startGame = () => {
    gameStateRef.current = {
      birdY: CANVAS_HEIGHT / 2,
      birdVelocity: 0,
      pipes: [],
      score: 0,
      frameCount: 0,
    };
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;

    // Update bird
    state.birdVelocity += GRAVITY;
    state.birdY += state.birdVelocity;
    state.frameCount++;

    // Generate pipes
    if (state.frameCount % 90 === 0) {
      const topHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
      state.pipes.push({ x: CANVAS_WIDTH, topHeight });
    }

    // Update pipes
    state.pipes = state.pipes.filter((p) => p.x > -PIPE_WIDTH);
    state.pipes.forEach((p) => {
      p.x -= PIPE_SPEED;
    });

    // Check scoring
    state.pipes.forEach((p) => {
      if (p.x + PIPE_WIDTH === Math.floor(50 + BIRD_SIZE / 2)) {
        state.score++;
        setScore(state.score);
      }
    });

    // Check collisions
    const birdLeft = 50;
    const birdRight = 50 + BIRD_SIZE;
    const birdTop = state.birdY;
    const birdBottom = state.birdY + BIRD_SIZE;

    // Floor/ceiling
    if (birdTop < 0 || birdBottom > CANVAS_HEIGHT) {
      endGame();
      return;
    }

    // Pipes
    for (const pipe of state.pipes) {
      if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
        if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
          endGame();
          return;
        }
      }
    }

    // Draw
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw pipes
    ctx.fillStyle = "#22c55e";
    state.pipes.forEach((p) => {
      // Top pipe
      ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(p.x - 3, p.topHeight - 20, PIPE_WIDTH + 6, 20);
      ctx.fillStyle = "#22c55e";
      // Bottom pipe
      ctx.fillRect(p.x, p.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(p.x - 3, p.topHeight + PIPE_GAP, PIPE_WIDTH + 6, 20);
      ctx.fillStyle = "#22c55e";
    });

    // Draw bird
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(50 + BIRD_SIZE / 2, state.birdY + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(50 + BIRD_SIZE / 2 + 5, state.birdY + BIRD_SIZE / 2 - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(50 + BIRD_SIZE / 2 + 6, state.birdY + BIRD_SIZE / 2 - 4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(state.score.toString(), CANVAS_WIDTH / 2, 50);

    animationRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const endGame = () => {
    setGameOver(true);
    setIsPlaying(false);
    cancelAnimationFrame(animationRef.current);
    const finalScore = gameStateRef.current.score;
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("flappy-highscore", finalScore.toString());
    }
  };

  useEffect(() => {
    if (isPlaying && !gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, gameOver, gameLoop]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [jump]);

  // Draw initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Klik atau tekan Space", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.fillText("untuk mulai", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-text-yellow">🐦 FLAPPY BIRD</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="game-card p-3 md:p-6">
          <div className="flex justify-between mb-4">
            <span className="text-lg font-bold">Skor: {score}</span>
            <span className="text-sm text-gray-400">High Score: {highScore}</span>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={jump}
              className="rounded-lg cursor-pointer border-2 border-[#2d2d44] w-full max-w-full h-auto"
            />

            {gameOver && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg">
                <p className="text-2xl font-bold text-red-400 mb-2">Game Over!</p>
                <p className="text-gray-400 mb-4">Skor: {score}</p>
                <button onClick={startGame} className="btn-primary">Main Lagi</button>
              </div>
            )}
          </div>
        </div>

        <div className="game-card p-6 w-full lg:w-64">
          <h3 className="font-bold mb-4">Cara Main</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>🖱️ Klik untuk terbang</li>
            <li>⌨️ Space / Arrow Up</li>
            <li>🎯 Hindari pipa hijau</li>
          </ul>
          <hr className="border-[#2d2d44] my-4" />
          <p className="text-sm text-gray-400">
            Terbang melewati celah antar pipa. Setiap pipa yang berhasil dilewati = 1 poin!
          </p>
        </div>
      </div>

      {/* Mobile jump button */}
      <GamePad
        layout="action-only"
        actionButton={{ label: "🐦 FLY", onAction: jump, color: "#ffe600" }}
      />
    </div>
  );
}
