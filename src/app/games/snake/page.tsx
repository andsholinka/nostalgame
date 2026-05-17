"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { GamePad } from "@/components/GamePad";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [cellSize, setCellSize] = useState(20);
  const directionRef = useRef<Direction>("RIGHT");
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate cell size based on screen width
  useEffect(() => {
    const calculateSize = () => {
      const screenWidth = window.innerWidth;
      // Leave padding: 16px each side + 24px card padding each side = 80px total
      const availableWidth = Math.min(screenWidth - 80, 400);
      const size = Math.floor(availableWidth / GRID_SIZE);
      setCellSize(Math.max(12, Math.min(20, size)));
    };

    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("snake-highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPlaying(true);
  };

  const gameLoop = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };
      const dir = directionRef.current;

      switch (dir) {
        case "UP": head.y -= 1; break;
        case "DOWN": head.y += 1; break;
        case "LEFT": head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
      }

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      if (prevSnake.some((s) => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore((s) => {
          const newScore = s + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("snake-highscore", newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        setSpeed((s) => Math.max(50, s - 2));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood, highScore]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, speed);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [isPlaying, gameOver, gameLoop, speed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (directionRef.current !== "DOWN") {
            directionRef.current = "UP";
            setDirection("UP");
          }
          break;
        case "ArrowDown":
        case "s":
          if (directionRef.current !== "UP") {
            directionRef.current = "DOWN";
            setDirection("DOWN");
          }
          break;
        case "ArrowLeft":
        case "a":
          if (directionRef.current !== "RIGHT") {
            directionRef.current = "LEFT";
            setDirection("LEFT");
          }
          break;
        case "ArrowRight":
        case "d":
          if (directionRef.current !== "LEFT") {
            directionRef.current = "RIGHT";
            setDirection("RIGHT");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const boardSize = GRID_SIZE * cellSize;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-44 md:pb-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-green">🐍 SNAKE</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
        <div className="game-card p-3 md:p-6 w-full max-w-fit mx-auto" ref={containerRef}>
          <div className="flex justify-between mb-3 px-1">
            <span className="pixel-font text-[0.5rem] text-[#aaa]">SCORE: <span className="neon-yellow">{score}</span></span>
            <span className="pixel-font text-[0.45rem] text-[#555]">BEST: {highScore}</span>
          </div>

          <div
            className="relative border-2 border-[#2a2a4a] overflow-hidden mx-auto"
            style={{ width: boardSize, height: boardSize, background: "#0a0a18" }}
          >
            {/* Grid lines */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `linear-gradient(#2a2a4a 1px, transparent 1px), linear-gradient(90deg, #2a2a4a 1px, transparent 1px)`,
                backgroundSize: `${cellSize}px ${cellSize}px`,
              }}
            />

            {/* Food */}
            <div
              className="absolute rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
              style={{
                left: food.x * cellSize + 2,
                top: food.y * cellSize + 2,
                width: cellSize - 4,
                height: cellSize - 4,
              }}
            />

            {/* Snake */}
            {snake.map((segment, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: segment.x * cellSize + 1,
                  top: segment.y * cellSize + 1,
                  width: cellSize - 2,
                  height: cellSize - 2,
                  background: i === 0 ? "#39ff14" : "#22c55e",
                  boxShadow: i === 0 ? "0 0 4px rgba(57,255,20,0.5)" : "none",
                  borderRadius: i === 0 ? "3px" : "1px",
                }}
              />
            ))}

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                <p className="pixel-font text-sm text-red-400 mb-2">GAME OVER</p>
                <p className="font-mono text-xs text-[#888] mb-4">Score: {score}</p>
                <button onClick={resetGame} className="btn-primary">RETRY</button>
              </div>
            )}

            {/* Start Overlay */}
            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                <p className="pixel-font text-[0.6rem] text-[#aaa] mb-4">🐍 SNAKE</p>
                <button onClick={resetGame} className="btn-primary">START</button>
              </div>
            )}
          </div>

          {/* Mobile D-Pad below game */}
          <GamePad layout="dpad" accent="#39ff14" continuous={false} />
        </div>

        {/* Instructions - hidden on mobile */}
        <div className="game-card p-5 w-full lg:w-56 hidden lg:block">
          <h3 className="pixel-font text-[0.5rem] text-[#888] mb-3">CONTROLS</h3>
          <div className="font-mono text-[0.65rem] text-[#666] space-y-1">
            <p>↑ / W : Up</p>
            <p>↓ / S : Down</p>
            <p>← / A : Left</p>
            <p>→ / D : Right</p>
          </div>
          <hr className="border-[#2a2a4a] my-3" />
          <p className="font-mono text-[0.6rem] text-[#555] leading-relaxed">
            Makan makanan merah untuk skor. Jangan tabrak dinding atau tubuhmu!
          </p>
        </div>
      </div>
    </div>
  );
}
