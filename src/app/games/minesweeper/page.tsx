"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighbors: number;
};

type Difficulty = "easy" | "medium" | "hard";

const CONFIGS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 25 },
  hard: { rows: 16, cols: 16, mines: 50 },
};

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const [flagCount, setFlagCount] = useState(0);
  const [time, setTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const config = CONFIGS[difficulty];

  const createGrid = useCallback((firstR: number, firstC: number) => {
    const { rows, cols, mines } = CONFIGS[difficulty];
    const g: Cell[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        isMine: false, isRevealed: false, isFlagged: false, neighbors: 0,
      }))
    );

    // Place mines (not on first click)
    let placed = 0;
    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (g[r][c].isMine) continue;
      if (Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1) continue;
      g[r][c].isMine = true;
      placed++;
    }

    // Count neighbors
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (g[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && g[nr][nc].isMine) count++;
          }
        }
        g[r][c].neighbors = count;
      }
    }

    return g;
  }, [difficulty]);

  const startNewGame = () => {
    setGrid([]);
    setGameOver(false);
    setWon(false);
    setStarted(false);
    setFlagCount(0);
    setTime(0);
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
  };

  const reveal = (g: Cell[][], r: number, c: number) => {
    const { rows, cols } = CONFIGS[difficulty];
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (g[r][c].isRevealed || g[r][c].isFlagged) return;

    g[r][c].isRevealed = true;

    if (g[r][c].neighbors === 0 && !g[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          reveal(g, r + dr, c + dc);
        }
      }
    }
  };

  const handleClick = (r: number, c: number) => {
    if (gameOver || won) return;

    let g: Cell[][];
    if (!started) {
      g = createGrid(r, c);
      setStarted(true);
      const interval = setInterval(() => setTime(t => t + 1), 1000);
      setTimerInterval(interval);
    } else {
      g = grid.map(row => row.map(cell => ({ ...cell })));
    }

    if (g[r][c].isFlagged) return;

    if (g[r][c].isMine) {
      // Reveal all mines
      g.forEach(row => row.forEach(cell => { if (cell.isMine) cell.isRevealed = true; }));
      setGrid(g);
      setGameOver(true);
      if (timerInterval) clearInterval(timerInterval);
      return;
    }

    reveal(g, r, c);
    setGrid([...g]);

    // Check win
    const { rows, cols, mines } = CONFIGS[difficulty];
    const revealed = g.flat().filter(c => c.isRevealed).length;
    if (revealed === rows * cols - mines) {
      setWon(true);
      if (timerInterval) clearInterval(timerInterval);
    }
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || won || !started) return;

    const g = grid.map(row => row.map(cell => ({ ...cell })));
    if (g[r][c].isRevealed) return;

    g[r][c].isFlagged = !g[r][c].isFlagged;
    setGrid(g);
    setFlagCount(g.flat().filter(c => c.isFlagged).length);
  };

  const getNumberColor = (n: number) => {
    const colors = ["", "#00f3ff", "#39ff14", "#ff6b35", "#bf5af2", "#ff4444", "#00f3ff", "#fff", "#888"];
    return colors[n] || "#fff";
  };

  const cellSize = difficulty === "hard" ? 28 : 32;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-green">💣 MINESWEEPER</h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Difficulty selector */}
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); startNewGame(); }}
              className={`pixel-font text-[0.45rem] px-3 py-2 border transition-all uppercase ${
                difficulty === d
                  ? "border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10"
                  : "border-[#2a2a4a] text-[#666] hover:border-[#555]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-6 pixel-font text-[0.5rem]">
          <span>💣 <span className="neon-pink">{config.mines - flagCount}</span></span>
          <span>🚩 <span className="neon-yellow">{flagCount}</span></span>
          <span>⏱️ <span className="neon-cyan">{time}s</span></span>
        </div>

        {/* Grid */}
        <div className="game-card p-3" onContextMenu={e => e.preventDefault()}>
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)`, gap: '1px', background: '#1a1a35' }}
          >
            {(started ? grid : Array.from({ length: config.rows }, () => Array.from({ length: config.cols }, () => ({
              isMine: false, isRevealed: false, isFlagged: false, neighbors: 0,
            })))).map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleClick(r, c)}
                  onContextMenu={(e) => handleRightClick(e, r, c)}
                  style={{ width: cellSize, height: cellSize }}
                  className={`flex items-center justify-center text-xs font-bold font-mono transition-colors
                    ${cell.isRevealed
                      ? cell.isMine
                        ? "bg-[#ff4444]/20"
                        : "bg-[#0c0c1d]"
                      : "bg-[#2a2a4a] hover:bg-[#3a3a5a] cursor-pointer"
                    }`}
                >
                  {cell.isRevealed
                    ? cell.isMine
                      ? "💣"
                      : cell.neighbors > 0
                        ? <span style={{ color: getNumberColor(cell.neighbors) }}>{cell.neighbors}</span>
                        : ""
                    : cell.isFlagged
                      ? "🚩"
                      : ""
                  }
                </button>
              ))
            )}
          </div>
        </div>

        {/* Game state */}
        {(gameOver || won) && (
          <div className="game-card p-6 text-center">
            <p className={`pixel-font text-sm mb-3 ${won ? "neon-green" : "neon-pink"}`}>
              {won ? "🎉 CLEARED!" : "💥 BOOM!"}
            </p>
            <p className="font-mono text-xs text-[#666] mb-4">Time: {time}s</p>
            <button onClick={startNewGame} className="btn-primary">NEW GAME</button>
          </div>
        )}

        {!started && (
          <p className="font-mono text-xs text-[#555]">Klik untuk mulai • Klik kanan untuk flag</p>
        )}
      </div>
    </div>
  );
}
