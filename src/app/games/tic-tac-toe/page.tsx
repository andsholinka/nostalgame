"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type Player = "X" | "O" | null;
type Board = Player[];
type Mode = "pvp" | "ai";

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = useCallback((b: Board): Player | "draw" | null => {
    for (const combo of WINNING_COMBOS) {
      const [a, bIdx, c] = combo;
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        setWinningLine(combo);
        return b[a];
      }
    }
    if (b.every((cell) => cell !== null)) return "draw";
    return null;
  }, []);

  const minimax = useCallback((b: Board, isMaximizing: boolean): number => {
    const result = checkWinnerSimple(b);
    if (result === "O") return 10;
    if (result === "X") return -10;
    if (b.every((cell) => cell !== null)) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) {
          b[i] = "O";
          best = Math.max(best, minimax(b, false));
          b[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!b[i]) {
          b[i] = "X";
          best = Math.min(best, minimax(b, true));
          b[i] = null;
        }
      }
      return best;
    }
  }, []);

  const checkWinnerSimple = (b: Board): Player | null => {
    for (const [a, bIdx, c] of WINNING_COMBOS) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) return b[a];
    }
    return null;
  };

  const aiMove = useCallback((b: Board) => {
    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        b[i] = "O";
        const score = minimax(b, false);
        b[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }, [minimax]);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      if (result === "draw") setScores((s) => ({ ...s, draw: s.draw + 1 }));
      else setScores((s) => ({ ...s, [result]: s[result] + 1 }));
      return;
    }

    if (mode === "ai" && currentPlayer === "X") {
      setCurrentPlayer("O");
      setTimeout(() => {
        const aiIdx = aiMove(newBoard);
        if (aiIdx !== -1) {
          newBoard[aiIdx] = "O";
          setBoard([...newBoard]);
          const aiResult = checkWinner(newBoard);
          if (aiResult) {
            setWinner(aiResult);
            if (aiResult === "draw") setScores((s) => ({ ...s, draw: s.draw + 1 }));
            else setScores((s) => ({ ...s, [aiResult]: s[aiResult] + 1 }));
          } else {
            setCurrentPlayer("X");
          }
        }
      }, 300);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
  };

  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="btn-secondary">← BACK</Link>
          <h1 className="pixel-font text-sm neon-text-blue">❌ TIC TAC TOE</h1>
        </div>
        <div className="game-card p-8 max-w-md mx-auto text-center">
          <h2 className="pixel-font text-[0.7rem] text-[#ffaa00] mb-6">SELECT MODE</h2>
          <div className="space-y-4">
            <button onClick={() => setMode("pvp")} className="btn-primary w-full text-lg">
              👥 Player vs Player
            </button>
            <button onClick={() => setMode("ai")} className="btn-secondary w-full text-lg">
              🤖 Player vs AI
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-text-blue">❌ TIC TAC TOE</h1>
        <span className="pixel-font text-[0.5rem] text-gray-400 ml-auto">
          {mode === "pvp" ? "👥 PvP" : "🤖 vs AI"}
        </span>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Scoreboard */}
        <div className="flex gap-8 text-center">
          <div className={`px-4 py-2 rounded-lg ${currentPlayer === "X" && !winner ? "bg-blue-500/20 border border-blue-500" : "bg-[#1a1a2e]"}`}>
            <p className="text-2xl font-bold text-blue-400">X</p>
            <p className="text-sm text-gray-400">{scores.X} wins</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-[#1a1a2e]">
            <p className="text-2xl font-bold text-gray-400">=</p>
            <p className="text-sm text-gray-400">{scores.draw} draws</p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${currentPlayer === "O" && !winner ? "bg-red-500/20 border border-red-500" : "bg-[#1a1a2e]"}`}>
            <p className="text-2xl font-bold text-red-400">O</p>
            <p className="text-sm text-gray-400">{scores.O} wins</p>
          </div>
        </div>

        {/* Board */}
        <div className="game-card p-6">
          <div className="grid grid-cols-3 gap-2 w-72 h-72">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`rounded-lg text-4xl font-bold flex items-center justify-center transition-all
                  ${cell ? "cursor-default" : "cursor-pointer hover:bg-[#2d2d44]"}
                  ${winningLine?.includes(i) ? "bg-green-500/20 border-2 border-green-500" : "bg-[#0f0f1a] border border-[#2d2d44]"}
                  ${cell === "X" ? "text-blue-400" : "text-red-400"}`}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        {winner && (
          <div className="text-center">
            <p className="text-xl font-bold mb-4">
              {winner === "draw" ? "🤝 Seri!" : `🎉 ${winner} Menang!`}
            </p>
            <button onClick={resetGame} className="btn-primary">Main Lagi</button>
          </div>
        )}

        <button onClick={() => { resetGame(); setMode(null); }} className="btn-secondary text-sm">
          Ganti Mode
        </button>
      </div>
    </div>
  );
}
