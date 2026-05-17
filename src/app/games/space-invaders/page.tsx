"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const W = 480;
const H = 560;
const PLAYER_W = 40;
const PLAYER_H = 20;
const BULLET_W = 3;
const BULLET_H = 12;
const ENEMY_W = 30;
const ENEMY_H = 20;
const ENEMY_COLS = 8;
const ENEMY_ROWS = 4;

type Bullet = { x: number; y: number; active: boolean };
type Enemy = { x: number; y: number; alive: boolean; row: number };

export default function SpaceInvadersGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());

  const stateRef = useRef({
    playerX: W / 2 - PLAYER_W / 2,
    bullets: [] as Bullet[],
    enemyBullets: [] as Bullet[],
    enemies: [] as Enemy[],
    enemyDir: 1,
    enemySpeed: 0.5,
    lastShot: 0,
    lastEnemyShot: 0,
    score: 0,
    lives: 3,
    wave: 1,
  });

  useEffect(() => {
    const saved = localStorage.getItem("invaders-highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const initEnemies = (waveNum: number): Enemy[] => {
    const enemies: Enemy[] = [];
    for (let r = 0; r < ENEMY_ROWS; r++) {
      for (let c = 0; c < ENEMY_COLS; c++) {
        enemies.push({
          x: c * (ENEMY_W + 12) + 40,
          y: r * (ENEMY_H + 15) + 50,
          alive: true,
          row: r,
        });
      }
    }
    return enemies;
  };

  const startGame = () => {
    const s = stateRef.current;
    s.playerX = W / 2 - PLAYER_W / 2;
    s.bullets = [];
    s.enemyBullets = [];
    s.enemies = initEnemies(1);
    s.enemyDir = 1;
    s.enemySpeed = 0.5;
    s.score = 0;
    s.lives = 3;
    s.wave = 1;
    setScore(0);
    setLives(3);
    setWave(1);
    setGameOver(false);
    setIsPlaying(true);
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    const keys = keysRef.current;
    const now = Date.now();

    // Player movement
    if (keys.has("ArrowLeft") || keys.has("a")) s.playerX = Math.max(0, s.playerX - 5);
    if (keys.has("ArrowRight") || keys.has("d")) s.playerX = Math.min(W - PLAYER_W, s.playerX + 5);

    // Shooting
    if ((keys.has(" ") || keys.has("ArrowUp")) && now - s.lastShot > 300) {
      s.bullets.push({ x: s.playerX + PLAYER_W / 2 - BULLET_W / 2, y: H - 50, active: true });
      s.lastShot = now;
    }

    // Enemy shooting
    if (now - s.lastEnemyShot > 1200 - s.wave * 100) {
      const aliveEnemies = s.enemies.filter(e => e.alive);
      if (aliveEnemies.length > 0) {
        const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        s.enemyBullets.push({ x: shooter.x + ENEMY_W / 2, y: shooter.y + ENEMY_H, active: true });
        s.lastEnemyShot = now;
      }
    }

    // Move bullets
    s.bullets.forEach(b => { b.y -= 7; if (b.y < 0) b.active = false; });
    s.enemyBullets.forEach(b => { b.y += 4; if (b.y > H) b.active = false; });

    // Move enemies
    let hitEdge = false;
    s.enemies.forEach(e => {
      if (!e.alive) return;
      e.x += s.enemySpeed * s.enemyDir;
      if (e.x <= 5 || e.x >= W - ENEMY_W - 5) hitEdge = true;
    });
    if (hitEdge) {
      s.enemyDir *= -1;
      s.enemies.forEach(e => { e.y += 10; });
    }

    // Bullet-enemy collision
    for (const bullet of s.bullets) {
      if (!bullet.active) continue;
      for (const enemy of s.enemies) {
        if (!enemy.alive) continue;
        if (bullet.x < enemy.x + ENEMY_W && bullet.x + BULLET_W > enemy.x &&
            bullet.y < enemy.y + ENEMY_H && bullet.y + BULLET_H > enemy.y) {
          enemy.alive = false;
          bullet.active = false;
          s.score += (ENEMY_ROWS - enemy.row) * 10;
          setScore(s.score);
        }
      }
    }

    // Enemy bullet-player collision
    for (const bullet of s.enemyBullets) {
      if (!bullet.active) continue;
      if (bullet.x < s.playerX + PLAYER_W && bullet.x + BULLET_W > s.playerX &&
          bullet.y < H - 30 && bullet.y + BULLET_H > H - 30 - PLAYER_H) {
        bullet.active = false;
        s.lives--;
        setLives(s.lives);
        if (s.lives <= 0) {
          setGameOver(true);
          setIsPlaying(false);
          if (s.score > highScore) {
            setHighScore(s.score);
            localStorage.setItem("invaders-highscore", s.score.toString());
          }
          return;
        }
      }
    }

    // Enemy reaches bottom
    if (s.enemies.some(e => e.alive && e.y + ENEMY_H >= H - 60)) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    // Wave clear
    if (s.enemies.every(e => !e.alive)) {
      s.wave++;
      s.enemies = initEnemies(s.wave);
      s.enemySpeed = 0.5 + s.wave * 0.3;
      s.enemyDir = 1;
      s.bullets = [];
      s.enemyBullets = [];
      setWave(s.wave);
    }

    // Clean up
    s.bullets = s.bullets.filter(b => b.active);
    s.enemyBullets = s.enemyBullets.filter(b => b.active);

    // === DRAW ===
    ctx.fillStyle = "#0c0c1d";
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = "#2a2a4a";
    for (let i = 0; i < 30; i++) {
      const sx = (i * 137 + 50) % W;
      const sy = (i * 97 + 30) % H;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Enemies
    const enemyColors = ["#ff4444", "#ff6b35", "#ffe600", "#39ff14"];
    for (const enemy of s.enemies) {
      if (!enemy.alive) continue;
      ctx.fillStyle = enemyColors[enemy.row];
      // Pixel art enemy
      ctx.fillRect(enemy.x + 4, enemy.y, ENEMY_W - 8, ENEMY_H);
      ctx.fillRect(enemy.x, enemy.y + 4, ENEMY_W, ENEMY_H - 8);
      // Eyes
      ctx.fillStyle = "#0c0c1d";
      ctx.fillRect(enemy.x + 8, enemy.y + 6, 4, 4);
      ctx.fillRect(enemy.x + ENEMY_W - 12, enemy.y + 6, 4, 4);
    }

    // Player
    ctx.fillStyle = "#00f3ff";
    ctx.fillRect(s.playerX + PLAYER_W / 2 - 3, H - 30 - PLAYER_H - 5, 6, 5);
    ctx.fillRect(s.playerX, H - 30 - PLAYER_H, PLAYER_W, PLAYER_H);

    // Player bullets
    ctx.fillStyle = "#39ff14";
    for (const b of s.bullets) {
      ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H);
    }

    // Enemy bullets
    ctx.fillStyle = "#ff4444";
    for (const b of s.enemyBullets) {
      ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H);
    }

    // HUD
    ctx.fillStyle = "#fff";
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${s.score}`, 10, 25);
    ctx.textAlign = "right";
    ctx.fillText(`WAVE: ${s.wave}`, W - 10, 25);

    animRef.current = requestAnimationFrame(gameLoop);
  }, [highScore]);

  useEffect(() => {
    if (isPlaying) {
      animRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, gameLoop]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keysRef.current.add(e.key); if (e.key === " ") e.preventDefault(); };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-green">👾 SPACE INVADERS</h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-6 pixel-font text-[0.5rem]">
          <span>LIVES: <span className="neon-cyan">{"▲".repeat(lives)}</span></span>
          <span>WAVE: <span className="neon-yellow">{wave}</span></span>
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

        {!isPlaying && !gameOver && (
          <div className="game-card p-6 text-center">
            <p className="font-mono text-xs text-[#666] mb-4">← → Move • Space/↑ Shoot</p>
            <button onClick={startGame} className="btn-primary">▶ START MISSION</button>
          </div>
        )}

        {gameOver && (
          <div className="game-card p-6 text-center">
            <p className="pixel-font text-sm neon-pink mb-3">MISSION FAILED</p>
            <p className="font-mono text-xs text-[#666] mb-4">Score: {score} • Wave: {wave}</p>
            <button onClick={startGame} className="btn-primary">RETRY</button>
          </div>
        )}
      </div>
    </div>
  );
}
