"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const WORDS = [
  "javascript", "typescript", "react", "nextjs", "tailwind", "vercel",
  "deploy", "component", "function", "variable", "interface", "module",
  "export", "import", "async", "await", "promise", "callback",
  "array", "object", "string", "number", "boolean", "undefined",
  "console", "browser", "server", "database", "query", "fetch",
  "router", "layout", "style", "class", "method", "return",
  "const", "state", "effect", "context", "reducer", "action",
  "props", "children", "render", "virtual", "document", "element",
];

const SENTENCES = [
  "the quick brown fox jumps over the lazy dog",
  "coding is fun when you build cool projects",
  "react makes building user interfaces easy",
  "next js is a great framework for web apps",
  "practice makes perfect keep typing every day",
  "javascript is the language of the web",
  "tailwind css helps you style components fast",
  "deploy your app to vercel in seconds",
];

type Mode = "words" | "sentences";

export default function TypingGame() {
  const [mode, setMode] = useState<Mode>("words");
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("typing-bestwpm");
    if (saved) setBestWpm(parseInt(saved));
    generateText();
  }, [mode]);

  const generateText = useCallback(() => {
    if (mode === "words") {
      const shuffled = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 15);
      setText(shuffled.join(" "));
    } else {
      const idx = Math.floor(Math.random() * SENTENCES.length);
      setText(SENTENCES[idx]);
    }
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setIsFinished(false);
    setCurrentIndex(0);
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
  }, [mode]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!startTime) {
      setStartTime(Date.now());
    }

    setInput(value);
    setCurrentIndex(value.length);

    // Count errors
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== text[i]) errorCount++;
    }
    setErrors(errorCount);

    // Calculate accuracy
    const acc = value.length > 0 ? Math.round(((value.length - errorCount) / value.length) * 100) : 100;
    setAccuracy(acc);

    // Calculate WPM
    const elapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60;
    if (elapsed > 0) {
      const words = value.length / 5;
      setWpm(Math.round(words / elapsed));
    }

    // Check if finished
    if (value === text) {
      setEndTime(Date.now());
      setIsFinished(true);
      const finalElapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60;
      const finalWpm = Math.round((text.length / 5) / finalElapsed);
      setWpm(finalWpm);
      if (finalWpm > bestWpm) {
        setBestWpm(finalWpm);
        localStorage.setItem("typing-bestwpm", finalWpm.toString());
      }
    }
  };

  const restart = () => {
    generateText();
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-[0.75rem] text-[#ff6b35]" style={{textShadow: '0 0 10px #ff6b35'}}>⌨️ TYPE ATTACK</h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Mode selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("words")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "words" ? "bg-purple-600 text-white" : "bg-[#1a1a2e] text-gray-400 hover:text-white"}`}
          >
            Kata
          </button>
          <button
            onClick={() => setMode("sentences")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "sentences" ? "bg-purple-600 text-white" : "bg-[#1a1a2e] text-gray-400 hover:text-white"}`}
          >
            Kalimat
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-center">
          <div className="game-card px-4 py-2">
            <p className="text-xs text-gray-400">WPM</p>
            <p className="text-2xl font-bold text-green-400">{wpm}</p>
          </div>
          <div className="game-card px-4 py-2">
            <p className="text-xs text-gray-400">Akurasi</p>
            <p className={`text-2xl font-bold ${accuracy >= 90 ? "text-green-400" : accuracy >= 70 ? "text-yellow-400" : "text-red-400"}`}>
              {accuracy}%
            </p>
          </div>
          <div className="game-card px-4 py-2">
            <p className="text-xs text-gray-400">Best WPM</p>
            <p className="text-2xl font-bold text-yellow-400">{bestWpm}</p>
          </div>
        </div>

        {/* Text display */}
        <div className="game-card p-6 w-full max-w-2xl">
          <div className="text-lg font-mono leading-relaxed mb-6 select-none">
            {text.split("").map((char, i) => {
              let color = "text-gray-500";
              if (i < currentIndex) {
                color = input[i] === char ? "text-green-400" : "text-red-400 bg-red-400/20";
              } else if (i === currentIndex) {
                color = "text-white border-b-2 border-purple-500";
              }
              return (
                <span key={i} className={color}>
                  {char}
                </span>
              );
            })}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            disabled={isFinished}
            placeholder="Mulai mengetik di sini..."
            className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-4 py-3 text-lg font-mono focus:outline-none focus:border-purple-500 disabled:opacity-50"
            autoFocus
          />
        </div>

        {/* Result */}
        {isFinished && (
          <div className="game-card p-6 text-center">
            <p className="text-2xl font-bold text-green-400 mb-2">🎉 Selesai!</p>
            <p className="text-gray-400 mb-1">Kecepatan: {wpm} WPM</p>
            <p className="text-gray-400 mb-4">Akurasi: {accuracy}%</p>
            <button onClick={restart} className="btn-primary">Coba Lagi</button>
          </div>
        )}

        {!isFinished && (
          <button onClick={restart} className="btn-secondary text-sm">Reset</button>
        )}
      </div>
    </div>
  );
}
