"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
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
  const directionRef = useRef<Direction>("RIGHT");
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

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

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some((s) => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm neon-text">🐍 SNAKE</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="game-card p-6">
          <div className="flex justify-between mb-4">
            <span className="text-lg font-bold">Skor: {score}</span>
            <span className="text-sm text-gray-400">High Score: {highScore}</span>
          </div>

          <div
            className="relative border-2 border-[#2d2d44] rounded-lg overflow-hidden"
            style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE, background: "#0f0f1a" }}
          >
            {/* Food */}
            <div
              className="absolute rounded-full bg-red-500"
              style={{
                left: food.x * CELL_SIZE + 2,
                top: food.y * CELL_SIZE + 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
              }}
            />
            {/* Snake */}
            {snake.map((segment, i) => (
              <div
                key={i}
                className={`absolute rounded-sm ${i === 0 ? "bg-green-400" : "bg-green-600"}`}
                style={{
                  left: segment.x * CELL_SIZE + 1,
                  top: segment.y * CELL_SIZE + 1,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                }}
              />
            ))}

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-red-400 mb-2">Game Over!</p>
                <p className="text-gray-400 mb-4">Skor: {score}</p>
                <button onClick={resetGame} className="btn-primary">Main Lagi</button>
              </div>
            )}

            {/* Start Overlay */}
            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                <p className="text-xl font-bold mb-4">🐍 Snake Game</p>
                <button onClick={resetGame} className="btn-primary">Mulai</button>
              </div>
            )}
          </div>
        </div>

        <div className="game-card p-6 w-full lg:w-64">
          <h3 className="font-bold mb-4">Cara Main</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>⬆️ Arrow Up / W</li>
            <li>⬇️ Arrow Down / S</li>
            <li>⬅️ Arrow Left / A</li>
            <li>➡️ Arrow Right / D</li>
          </ul>
          <hr className="border-[#2d2d44] my-4" />
          <p className="text-sm text-gray-400">
            Makan makanan merah untuk menambah skor. Jangan tabrak dinding atau tubuhmu sendiri!
          </p>
        </div>
      </div>
    </div>
  );
}
