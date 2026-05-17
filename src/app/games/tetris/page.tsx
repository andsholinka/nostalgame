"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { GamePad } from "@/components/GamePad";

const COLS = 10;
const ROWS = 20;

const SHAPES = [
  { shape: [[1,1,1,1]], color: "#00f3ff" },
  { shape: [[1,1],[1,1]], color: "#ffe600" },
  { shape: [[0,1,0],[1,1,1]], color: "#bf5af2" },
  { shape: [[1,0,0],[1,1,1]], color: "#ff6b35" },
  { shape: [[0,0,1],[1,1,1]], color: "#3b82f6" },
  { shape: [[0,1,1],[1,1,0]], color: "#39ff14" },
  { shape: [[1,1,0],[0,1,1]], color: "#ff4444" },
];

type Grid = (string | null)[][];

function createEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export default function TetrisGame() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [cellSize, setCellSize] = useState(28);

  const pieceRef = useRef<{ shape: number[][]; color: string; x: number; y: number } | null>(null);
  const gridRef = useRef<Grid>(createEmptyGrid());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);

  // Calculate cell size based on screen width
  useEffect(() => {
    const calculateSize = () => {
      const screenWidth = window.innerWidth;
      // Mobile: leave 32px total padding
      const availableWidth = Math.min(screenWidth - 48, 350);
      const size = Math.floor(availableWidth / COLS);
      setCellSize(Math.max(18, Math.min(28, size)));
    };

    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, []);

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
          // Rotate clockwise: transpose then reverse each row
          const rotated = piece.shape[0].map((_, colIndex) =>
            piece.shape.map(row => row[colIndex]).reverse()
          );

          // Try standard position first
          if (isValid(rotated, piece.x, piece.y, gridRef.current)) {
            piece.shape = rotated;
          } else {
            // Wall kicks - try to shift the piece so rotation fits
            const kicks = [-1, 1, -2, 2];
            for (const offset of kicks) {
              if (isValid(rotated, piece.x + offset, piece.y, gridRef.current)) {
                piece.x += offset;
                piece.shape = rotated;
                break;
              }
            }
          }
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
    <div className="max-w-4xl mx-auto px-4 py-6 pb-8 md:pb-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-cyan">🧩 TETRIS</h1>
      </div>

      {/* Mobile stats bar - compact, above board */}
      <div className="md:hidden grid grid-cols-4 gap-2 mb-4">
        <div className="game-card px-2 py-2 text-center">
          <p className="pixel-font text-[0.35rem] text-[#555]">SCORE</p>
          <p className="pixel-font text-[0.55rem] neon-yellow mt-1">{score}</p>
        </div>
        <div className="game-card px-2 py-2 text-center">
          <p className="pixel-font text-[0.35rem] text-[#555]">LINES</p>
          <p className="pixel-font text-[0.55rem] neon-green mt-1">{lines}</p>
        </div>
        <div className="game-card px-2 py-2 text-center">
          <p className="pixel-font text-[0.35rem] text-[#555]">LEVEL</p>
          <p className="pixel-font text-[0.55rem] neon-cyan mt-1">{level}</p>
        </div>
        <div className="game-card px-2 py-2 text-center">
          <p className="pixel-font text-[0.35rem] text-[#555]">BEST</p>
          <p className="pixel-font text-[0.55rem] text-[#666] mt-1">{highScore}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
        {/* Game board */}
        <div className="game-card p-2 md:p-3 relative">
          <div
            className="grid border border-[#2a2a4a] mx-auto"
            style={{ gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`, gap: '1px', background: '#1a1a35' }}
          >
            {displayGrid.flat().map((cell, i) => (
              <div
                key={i}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: cell || '#0c0c1d',
                  border: cell ? '1px solid rgba(255,255,255,0.2)' : '1px solid #12122a',
                }}
              />
            ))}
          </div>

          {/* Mobile START/RETRY overlay */}
          {!isPlaying && (
            <div className="md:hidden absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <p className="pixel-font text-sm text-[#aaa] mb-1">🧩 TETRIS</p>
              {gameOver && (
                <p className="font-mono text-xs text-[#888] mb-3">Score: {score}</p>
              )}
              <button onClick={startGame} className="btn-primary mt-3">
                {gameOver ? "RETRY" : "START"}
              </button>
            </div>
          )}
        </div>

        {/* Side panel - desktop only */}
        <div className="hidden lg:block game-card p-5 w-48 space-y-4">
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

      {/* Mobile D-Pad below game */}
      <GamePad
        layout="dpad"
        accent="#00f3ff"
        continuous={false}
        centerButton={{ label: "DROP", key: " ", code: "Space", color: "#ff6b35" }}
      />

      {gameOver && (
        <div className="hidden md:block game-card p-6 text-center mt-6 max-w-sm mx-auto">
          <p className="pixel-font text-sm neon-pink mb-3">GAME OVER</p>
          <p className="font-mono text-xs text-[#666]">Score: {score} • Lines: {lines}</p>
        </div>
      )}
    </div>
  );
}
