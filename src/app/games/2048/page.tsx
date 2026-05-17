"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Grid = number[][];

const GRID_SIZE = 4;

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("2048-bestscore");
    if (saved) setBestScore(parseInt(saved));
    initGame();
  }, []);

  const initGame = () => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setHasWon(false);
  };

  const addRandomTile = (g: Grid) => {
    const empty: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    g[r][c] = Math.random() < 0.9 ? 2 : 4;
  };

  const slide = (row: number[]): { newRow: number[]; points: number } => {
    let points = 0;
    const filtered = row.filter((n) => n !== 0);
    const newRow: number[] = [];

    for (let i = 0; i < filtered.length; i++) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const merged = filtered[i] * 2;
        newRow.push(merged);
        points += merged;
        i++;
      } else {
        newRow.push(filtered[i]);
      }
    }

    while (newRow.length < GRID_SIZE) newRow.push(0);
    return { newRow, points };
  };

  const move = useCallback((direction: "up" | "down" | "left" | "right") => {
    if (gameOver) return;

    const newGrid = grid.map((row) => [...row]);
    let totalPoints = 0;
    let moved = false;

    if (direction === "left") {
      for (let r = 0; r < GRID_SIZE; r++) {
        const { newRow, points } = slide(newGrid[r]);
        if (newRow.join(",") !== newGrid[r].join(",")) moved = true;
        newGrid[r] = newRow;
        totalPoints += points;
      }
    } else if (direction === "right") {
      for (let r = 0; r < GRID_SIZE; r++) {
        const { newRow, points } = slide([...newGrid[r]].reverse());
        const reversed = newRow.reverse();
        if (reversed.join(",") !== newGrid[r].join(",")) moved = true;
        newGrid[r] = reversed;
        totalPoints += points;
      }
    } else if (direction === "up") {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = newGrid.map((row) => row[c]);
        const { newRow, points } = slide(col);
        if (newRow.join(",") !== col.join(",")) moved = true;
        for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = newRow[r];
        totalPoints += points;
      }
    } else if (direction === "down") {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = newGrid.map((row) => row[c]).reverse();
        const { newRow, points } = slide(col);
        const reversed = newRow.reverse();
        if (reversed.join(",") !== newGrid.map((row) => row[c]).join(",")) moved = true;
        for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = reversed[r];
        totalPoints += points;
      }
    }

    if (!moved) return;

    addRandomTile(newGrid);
    const newScore = score + totalPoints;
    setScore(newScore);
    setGrid(newGrid);

    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem("2048-bestscore", newScore.toString());
    }

    // Check win
    if (!hasWon) {
      for (const row of newGrid) {
        if (row.includes(2048)) {
          setWon(true);
          setHasWon(true);
          return;
        }
      }
    }

    // Check game over
    if (isGameOver(newGrid)) {
      setGameOver(true);
    }
  }, [grid, score, bestScore, gameOver, hasWon]);

  const isGameOver = (g: Grid): boolean => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) return false;
        if (c + 1 < GRID_SIZE && g[r][c] === g[r][c + 1]) return false;
        if (r + 1 < GRID_SIZE && g[r][c] === g[r + 1][c]) return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp": case "w": e.preventDefault(); move("up"); break;
        case "ArrowDown": case "s": e.preventDefault(); move("down"); break;
        case "ArrowLeft": case "a": e.preventDefault(); move("left"); break;
        case "ArrowRight": case "d": e.preventDefault(); move("right"); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [move]);

  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      0: "bg-[#1a1a2e]",
      2: "bg-gray-700 text-white",
      4: "bg-gray-600 text-white",
      8: "bg-orange-600 text-white",
      16: "bg-orange-500 text-white",
      32: "bg-red-500 text-white",
      64: "bg-red-600 text-white",
      128: "bg-yellow-500 text-white",
      256: "bg-yellow-400 text-gray-900",
      512: "bg-yellow-300 text-gray-900",
      1024: "bg-purple-500 text-white",
      2048: "bg-purple-400 text-white",
    };
    return colors[value] || "bg-purple-900 text-white";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm" style={{color: '#ffaa00', textShadow: '0 0 10px #ffaa00'}}>🔢 2048</h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Scores */}
        <div className="flex gap-6">
          <div className="game-card px-6 py-3 text-center">
            <p className="text-xs text-gray-400">Skor</p>
            <p className="text-2xl font-bold">{score}</p>
          </div>
          <div className="game-card px-6 py-3 text-center">
            <p className="text-xs text-gray-400">Best</p>
            <p className="text-2xl font-bold text-yellow-400">{bestScore}</p>
          </div>
        </div>

        {/* Grid */}
        <div className="game-card p-4">
          <div className="grid grid-cols-4 gap-2 w-80 h-80">
            {grid.flat().map((value, i) => (
              <div
                key={i}
                className={`flex items-center justify-center rounded-lg font-bold text-lg transition-all ${getTileColor(value)}`}
              >
                {value > 0 ? value : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Game Over / Win */}
        {(gameOver || won) && (
          <div className="game-card p-6 text-center">
            <p className={`text-2xl font-bold mb-2 ${won ? "text-green-400" : "text-red-400"}`}>
              {won ? "🎉 Kamu Menang!" : "💀 Game Over!"}
            </p>
            <p className="text-gray-400 mb-4">Skor Akhir: {score}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={initGame} className="btn-primary">Main Lagi</button>
              {won && (
                <button onClick={() => setWon(false)} className="btn-secondary">Lanjut Main</button>
              )}
            </div>
          </div>
        )}

        <button onClick={initGame} className="btn-secondary text-sm">New Game</button>

        <p className="text-sm text-gray-500">Gunakan Arrow Keys atau WASD untuk menggeser</p>
      </div>
    </div>
  );
}
