"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { MobileGamepad } from "@/components/MobileGamepad";

const COLS = 10;
const ROWS = 20;
const CELL = 28;

const SHAPES = [
  { shape: [[1,1,1,1]], color: "#00f3ff" },           // I
  { shape: [[1,1],[1,1]], color: "#ffe600" },          // O
  { shape: [[0,1,0],[1,1,1]], color: "#bf5af2" },      // T
  { shape: [[1,0,0],[1,1,1]], color: "#ff6b35" },      // L
  { shape: [[0,0,1],[1,1,1]], color: "#3b82f6" },      // J
  { shape: [[0,1,1],[1,1,0]], color: "#39ff14" },      // S
  { shape: [[1,1,0],[0,1,1]], color: "#ff4444" },      // Z
];

type Grid = (string | null)[][];

export default function TetrisGame() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const pieceRef = useRef<{ shape: number[][]; color: string; x: number; y: number } | null>(null);
  const gridRef = useRef<Grid>(createEmptyGrid());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);

  function createEmptyGrid(): Grid {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  useEffect(() => {
    const saved = localStorage.getItem("tetris-highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const randomPiece = () => {
    const p = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return { shape: p.shape.map(r => [...r]), color: p.color, x: Math.floor(COLS / 2) - 1, y: 0 };
  };

  const isValid = (shape: number[][], x: number, y: number, g: Grid) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nx = x + c;
        const ny = y + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
        if (ny >= 0 && g[ny][nx]) return false;
      }
    }
    return true;
  };

  const placePiece = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece) return;
    const g = gridRef.current.map(r => [...r]);

    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const ny = piece.y + r;
          const nx = piece.x + c;
          if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
            g[ny][nx] = piece.color;
          }
        }
      }
    }

    // Clear lines
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (g[r].every(cell => cell !== null)) {
        g.splice(r, 1);
        g.unshift(Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }

    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800][cleared] * levelRef.current;
      scoreRef.current += points;
      linesRef.current += cleared;
      levelRef.current = Math.floor(linesRef.current / 10) + 1;
      setScore(scoreRef.current);
      setLines(linesRef.current);
      setLevel(levelRef.current);
    }

    gridRef.current = g;
    setGrid([...g]);

    // New piece
    const newPiece = randomPiece();
    if (!isValid(newPiece.shape, newPiece.x, newPiece.y, g)) {
      setGameOver(true);
      setIsPlaying(false);
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        localStorage.setItem("tetris-highscore", scoreRef.current.toString());
      }
      pieceRef.current = null;
      return;
    }
    pieceRef.current = newPiece;
  }, [highScore]);

  const drop = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece) return;
    if (isValid(piece.shape, piece.x, piece.y + 1, gridRef.current)) {
      piece.y++;
    } else {
      placePiece();
    }
    setGrid([...gridRef.current]);
  }, [placePiece]);

  const startGame = () => {
    gridRef.current = createEmptyGrid();
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    setGrid(createEmptyGrid());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    pieceRef.current = randomPiece();
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      const speed = Math.max(100, 500 - (levelRef.current - 1) * 40);
      intervalRef.current = setInterval(drop, speed);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [isPlaying, level, drop]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying || !pieceRef.current) return;
      const piece = pieceRef.current;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
          if (isValid(piece.shape, piece.x - 1, piece.y, gridRef.current)) piece.x--;
          break;
        case "ArrowRight":
        case "d":
          if (isValid(piece.shape, piece.x + 1, piece.y, gridRef.current)) piece.x++;
          break;
        case "ArrowDown":
        case "s":
          if (isValid(piece.shape, piece.x, piece.y + 1, gridRef.current)) {
            piece.y++;
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
          break;
        case "ArrowUp":
        case "w": {
          const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
          if (isValid(rotated, piece.x, piece.y, gridRef.current)) piece.shape = rotated;
          break;
        }
        case " ":
          e.preventDefault();
          while (isValid(piece.shape, piece.x, piece.y + 1, gridRef.current)) {
            piece.y++;
            scoreRef.current += 2;
          }
          setScore(scoreRef.current);
          placePiece();
          break;
      }
      setGrid([...gridRef.current]);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying, placePiece]);

  const renderGrid = () => {
    const display = grid.map(r => [...r]);
    const piece = pieceRef.current;
    if (piece) {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            const ny = piece.y + r;
            const nx = piece.x + c;
            if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
              display[ny][nx] = piece.color;
            }
          }
        }
      }
    }
    return display;
  };

  const displayGrid = renderGrid();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-cyan">🧩 TETRIS</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Game board */}
        <div className="game-card p-3">
          <div
            className="grid border border-[#2a2a4a]"
            style={{ gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gap: '1px', background: '#1a1a35' }}
          >
            {displayGrid.flat().map((cell, i) => (
              <div
                key={i}
                style={{
                  width: CELL,
                  height: CELL,
                  background: cell || '#0c0c1d',
                  border: cell ? '1px solid rgba(255,255,255,0.2)' : '1px solid #12122a',
                }}
              />
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="game-card p-5 w-full lg:w-48 space-y-4">
          <div>
            <p className="pixel-font text-[0.4rem] text-[#555] mb-1">SCORE</p>
            <p className="pixel-font text-sm neon-yellow">{score}</p>
          </div>
          <div>
            <p className="pixel-font text-[0.4rem] text-[#555] mb-1">LINES</p>
            <p className="pixel-font text-sm neon-green">{lines}</p>
          </div>
          <div>
            <p className="pixel-font text-[0.4rem] text-[#555] mb-1">LEVEL</p>
            <p className="pixel-font text-sm neon-cyan">{level}</p>
          </div>
          <div>
            <p className="pixel-font text-[0.4rem] text-[#555] mb-1">BEST</p>
            <p className="pixel-font text-[0.6rem] text-[#666]">{highScore}</p>
          </div>

          <hr className="border-[#2a2a4a]" />

          <div className="font-mono text-[0.6rem] text-[#555] space-y-1">
            <p>← → : Move</p>
            <p>↑ : Rotate</p>
            <p>↓ : Soft drop</p>
            <p>Space : Hard drop</p>
          </div>

          {!isPlaying && (
            <button onClick={startGame} className="btn-primary w-full text-center">
              {gameOver ? "RETRY" : "START"}
            </button>
          )}
        </div>
      </div>

      {gameOver && (
        <div className="game-card p-6 text-center mt-6 max-w-sm mx-auto">
          <p className="pixel-font text-sm neon-pink mb-3">GAME OVER</p>
          <p className="font-mono text-xs text-[#666]">Score: {score} • Lines: {lines}</p>
        </div>
      )}

      <MobileGamepad layout="dpad" onAction={() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true })); }} actionLabel="DROP" />
    </div>
  );
}
