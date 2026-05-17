"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const WORDS = [
  // Hewan
  { word: "GAJAH", hint: "Hewan darat terbesar dengan belalai panjang" },
  { word: "JERAPAH", hint: "Hewan dengan leher paling panjang" },
  { word: "HARIMAU", hint: "Kucing besar bergaris loreng" },
  { word: "PINGUIN", hint: "Burung yang tidak bisa terbang dan hidup di kutub" },
  { word: "KUPUKUPU", hint: "Serangga dengan sayap berwarna-warni" },
  { word: "BUAYA", hint: "Reptil besar yang hidup di air" },

  // Negara & Kota
  { word: "INDONESIA", hint: "Negara kepulauan terbesar di dunia" },
  { word: "JEPANG", hint: "Negara matahari terbit, terkenal dengan sushi" },
  { word: "JAKARTA", hint: "Ibu kota Indonesia" },
  { word: "PARIS", hint: "Kota cinta dengan menara Eiffel" },
  { word: "MESIR", hint: "Negara dengan piramida dan sphinx" },
  { word: "BRASIL", hint: "Negara terbesar di Amerika Selatan" },

  // Buah & Makanan
  { word: "MANGGA", hint: "Buah tropis berwarna kuning oranye" },
  { word: "SEMANGKA", hint: "Buah besar berair, hijau di luar merah di dalam" },
  { word: "RENDANG", hint: "Makanan khas Padang yang mendunia" },
  { word: "NASIGORENG", hint: "Makanan Indonesia dari nasi yang digoreng" },
  { word: "PIZZA", hint: "Makanan Italia dengan keju dan topping" },
  { word: "BAKSO", hint: "Bola daging dalam kuah, jajanan kaki lima Indonesia" },

  // Olahraga
  { word: "SEPAKBOLA", hint: "Olahraga paling populer di dunia, 22 pemain" },
  { word: "BULUTANGKIS", hint: "Olahraga dengan raket dan kok" },
  { word: "RENANG", hint: "Olahraga di air" },
  { word: "BASKET", hint: "Olahraga memasukkan bola ke ring" },
  { word: "VOLI", hint: "Olahraga net dengan 6 pemain per tim" },

  // Alam
  { word: "GUNUNG", hint: "Bagian permukaan bumi yang menjulang tinggi" },
  { word: "SAMUDRA", hint: "Hamparan air asin yang sangat luas" },
  { word: "MATAHARI", hint: "Bintang pusat tata surya" },
  { word: "BULAN", hint: "Satelit alami Bumi" },
  { word: "PELANGI", hint: "Lengkungan tujuh warna setelah hujan" },

  // Profesi
  { word: "DOKTER", hint: "Profesi yang menyembuhkan orang sakit" },
  { word: "GURU", hint: "Profesi yang mengajar di sekolah" },
  { word: "PILOT", hint: "Profesi yang menerbangkan pesawat" },
  { word: "POLISI", hint: "Penjaga keamanan dan ketertiban" },
  { word: "PETANI", hint: "Profesi yang bercocok tanam" },

  // Sejarah & Budaya
  { word: "SOEKARNO", hint: "Presiden pertama Indonesia" },
  { word: "BATIK", hint: "Kain tradisional Indonesia warisan UNESCO" },
  { word: "BOROBUDUR", hint: "Candi Buddha terbesar di Indonesia" },
  { word: "WAYANG", hint: "Seni pertunjukan boneka tradisional Jawa" },
  { word: "ANGKLUNG", hint: "Alat musik bambu khas Sunda" },

  // Sains
  { word: "OKSIGEN", hint: "Gas yang dihirup makhluk hidup untuk bernafas" },
  { word: "GRAVITASI", hint: "Gaya tarik bumi yang membuat benda jatuh" },
  { word: "MAGNET", hint: "Benda yang menarik logam besi" },
  { word: "EVOLUSI", hint: "Teori perubahan makhluk hidup oleh Darwin" },
];

const MAX_WRONG = 6;

export default function HangmanGame() {
  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  const startNewGame = useCallback(() => {
    const { word: w, hint: h } = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(w);
    setHint(h);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const guessLetter = (letter: string) => {
    if (gameOver || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= MAX_WRONG) {
        setGameOver(true);
        setWon(false);
        setLosses((l) => l + 1);
      }
    } else {
      // Check win
      const allGuessed = word.split("").every((l) => newGuessed.has(l));
      if (allGuessed) {
        setGameOver(true);
        setWon(true);
        setWins((w) => w + 1);
      }
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const letter = e.key.toUpperCase();
      if (letter.length === 1 && letter >= "A" && letter <= "Z") {
        guessLetter(letter);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const hangmanParts = [
    // Head
    <circle key="head" cx="200" cy="80" r="20" stroke="white" strokeWidth="3" fill="none" />,
    // Body
    <line key="body" x1="200" y1="100" x2="200" y2="160" stroke="white" strokeWidth="3" />,
    // Left arm
    <line key="larm" x1="200" y1="120" x2="170" y2="145" stroke="white" strokeWidth="3" />,
    // Right arm
    <line key="rarm" x1="200" y1="120" x2="230" y2="145" stroke="white" strokeWidth="3" />,
    // Left leg
    <line key="lleg" x1="200" y1="160" x2="175" y2="195" stroke="white" strokeWidth="3" />,
    // Right leg
    <line key="rleg" x1="200" y1="160" x2="225" y2="195" stroke="white" strokeWidth="3" />,
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="btn-secondary">← BACK</Link>
        <h1 className="pixel-font text-sm" style={{color: '#ff4444', textShadow: '0 0 10px #ff4444'}}>💀 HANGMAN</h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Stats */}
        <div className="flex gap-6">
          <div className="game-card px-4 py-2 text-center">
            <p className="text-xs text-gray-400">Menang</p>
            <p className="text-lg font-bold text-green-400">{wins}</p>
          </div>
          <div className="game-card px-4 py-2 text-center">
            <p className="text-xs text-gray-400">Kalah</p>
            <p className="text-lg font-bold text-red-400">{losses}</p>
          </div>
          <div className="game-card px-4 py-2 text-center">
            <p className="text-xs text-gray-400">Nyawa</p>
            <p className="text-lg font-bold">{"❤️".repeat(MAX_WRONG - wrongGuesses)}{"🖤".repeat(wrongGuesses)}</p>
          </div>
        </div>

        {/* Hangman drawing */}
        <div className="game-card p-4">
          <svg width="300" height="220" className="mx-auto">
            {/* Gallows */}
            <line x1="50" y1="210" x2="250" y2="210" stroke="#4a4a6a" strokeWidth="3" />
            <line x1="100" y1="210" x2="100" y2="20" stroke="#4a4a6a" strokeWidth="3" />
            <line x1="100" y1="20" x2="200" y2="20" stroke="#4a4a6a" strokeWidth="3" />
            <line x1="200" y1="20" x2="200" y2="60" stroke="#4a4a6a" strokeWidth="3" />
            {/* Body parts */}
            {hangmanParts.slice(0, wrongGuesses)}
          </svg>
        </div>

        {/* Hint */}
        <p className="text-sm text-gray-400">💡 Hint: {hint}</p>

        {/* Word */}
        <div className="flex gap-2 flex-wrap justify-center">
          {word.split("").map((letter, i) => (
            <div
              key={i}
              className={`w-10 h-12 flex items-center justify-center border-b-2 text-2xl font-bold
                ${gameOver && !guessedLetters.has(letter) ? "text-red-400 border-red-400" : "border-gray-500"}
              `}
            >
              {guessedLetters.has(letter) || gameOver ? letter : ""}
            </div>
          ))}
        </div>

        {/* Keyboard */}
        <div className="flex flex-wrap gap-2 max-w-md justify-center">
          {alphabet.map((letter) => {
            const isGuessed = guessedLetters.has(letter);
            const isCorrect = word.includes(letter) && isGuessed;
            const isWrong = !word.includes(letter) && isGuessed;

            return (
              <button
                key={letter}
                onClick={() => guessLetter(letter)}
                disabled={isGuessed || gameOver}
                className={`w-9 h-9 rounded-lg font-bold text-sm transition-all
                  ${isCorrect ? "bg-green-600 text-white" : ""}
                  ${isWrong ? "bg-red-600/30 text-red-400" : ""}
                  ${!isGuessed ? "bg-[#2d2d44] hover:bg-purple-600 text-white cursor-pointer" : ""}
                  ${isGuessed ? "cursor-default opacity-70" : ""}
                `}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Game Over */}
        {gameOver && (
          <div className="game-card p-6 text-center">
            <p className={`text-2xl font-bold mb-2 ${won ? "text-green-400" : "text-red-400"}`}>
              {won ? "🎉 Benar!" : `💀 Kata: ${word}`}
            </p>
            <button onClick={startNewGame} className="btn-primary mt-4">Main Lagi</button>
          </div>
        )}
      </div>
    </div>
  );
}
