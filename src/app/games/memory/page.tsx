"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const EMOJIS = ["🎮", "🎲", "🎯", "🏆", "⭐", "🔥", "💎", "🚀"];

type Card = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("memory-besttime");
    if (saved) setBestTime(parseInt(saved));
    initGame();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !gameWon) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameWon]);

  const initGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({
        id: i,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
    setTimer(0);
    setIsPlaying(false);
    setIsChecking(false);
  };

  const handleCardClick = (id: number) => {
    if (isChecking) return;
    if (flippedCards.length >= 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    if (!isPlaying) setIsPlaying(true);

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsChecking(true);

      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards([...newCards]);
        setFlippedCards([]);
        setIsChecking(false);
        const newMatches = matches + 1;
        setMatches(newMatches);

        if (newMatches === EMOJIS.length) {
          setGameWon(true);
          setIsPlaying(false);
          if (!bestTime || timer < bestTime) {
            setBestTime(timer);
            localStorage.setItem("memory-besttime", timer.toString());
          }
        }
      } else {
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
          setIsChecking(false);
        }, 800);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-text-pink">🧠 MEMORY</h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Stats */}
        <div className="flex gap-6 text-center">
          <div className="game-card px-4 py-2">
            <p className="text-xs text-gray-400">Waktu</p>
            <p className="text-lg font-bold">{formatTime(timer)}</p>
          </div>
          <div className="game-card px-4 py-2">
            <p className="text-xs text-gray-400">Langkah</p>
            <p className="text-lg font-bold">{moves}</p>
          </div>
          <div className="game-card px-4 py-2">
            <p className="text-xs text-gray-400">Cocok</p>
            <p className="text-lg font-bold">{matches}/{EMOJIS.length}</p>
          </div>
          {bestTime && (
            <div className="game-card px-4 py-2">
              <p className="text-xs text-gray-400">Best</p>
              <p className="text-lg font-bold text-yellow-400">{formatTime(bestTime)}</p>
            </div>
          )}
        </div>

        {/* Board */}
        <div className="grid grid-cols-4 gap-3 max-w-sm">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`w-20 h-20 rounded-xl text-3xl flex items-center justify-center transition-all duration-300 transform
                ${card.isFlipped || card.isMatched
                  ? "bg-[#2d2d44] rotate-0 scale-100"
                  : "bg-gradient-to-br from-purple-600 to-violet-800 hover:scale-105 cursor-pointer"
                }
                ${card.isMatched ? "opacity-60 border-2 border-green-500" : ""}
              `}
            >
              {card.isFlipped || card.isMatched ? card.emoji : "?"}
            </button>
          ))}
        </div>

        {/* Win */}
        {gameWon && (
          <div className="game-card p-6 text-center">
            <p className="text-2xl font-bold text-green-400 mb-2">🎉 Selamat!</p>
            <p className="text-gray-400 mb-4">
              Selesai dalam {moves} langkah dan {formatTime(timer)}
            </p>
            <button onClick={initGame} className="btn-primary">Main Lagi</button>
          </div>
        )}

        {!gameWon && (
          <button onClick={initGame} className="btn-secondary text-sm">Reset</button>
        )}
      </div>
    </div>
  );
}
