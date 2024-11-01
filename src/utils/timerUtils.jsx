import { useEffect, useState } from "react";

export const usePlayerTimer = (initialTime, onTimeEnd) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      onTimeEnd(); // Memanggil callback saat waktu habis
    }
  }, [timeLeft, onTimeEnd]);

  const resetTimer = () => setTimeLeft(initialTime);

  return [timeLeft, resetTimer];
};

export const useGameTimer = (initialTime, onGameEnd) => {
  const [gameTimeLeft, setGameTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (gameTimeLeft > 0) {
      const gameTimer = setInterval(() => {
        setGameTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(gameTimer);
    } else {
      onGameEnd(); // Memanggil callback saat waktu habis
    }
  }, [gameTimeLeft, onGameEnd]);

  return gameTimeLeft;
};
