import { useEffect, useState, useRef } from "react";
import { updateGameState } from "../services/gameDataServices";

export const usePlayerTimer = (initialTime, onTimeEnd, gameData) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerIdRef = useRef(null);

  useEffect(() => {
    if (!gameData?.isMyTurn || gameData.waitingForAnswer) return;

    // Bersihkan timer sebelumnya jika ada
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
    }

    timerIdRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        // Update hanya timer pemain yang sedang giliran
        if (gameData.topicID && gameData.gameID && gameData.roomID) {
          const newTimers = [...(gameData.playerTimers || [])];
          newTimers[gameData.currentPlayerIndex] = newTime;

          updateGameState(
            gameData.topicID,
            gameData.gameID,
            gameData.roomID,
            {
              playerTimers: newTimers,
            }
          );
        }

        if (newTime <= 0) {
          onTimeEnd?.();
          clearInterval(timerIdRef.current);
          timerIdRef.current = null;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [
    gameData.isMyTurn,
    gameData.waitingForAnswer,
    gameData.topicID,
    gameData.gameID,
    gameData.roomID,
    gameData.currentPlayerIndex,
    gameData.playerTimers,
    onTimeEnd,
  ]);

  // Efek untuk menghentikan timer ketika waitingForAnswer berubah
  useEffect(() => {
    if (gameData.waitingForAnswer && timerIdRef.current) {
      // Hentikan timer
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    } else if (!gameData.waitingForAnswer && gameData.isMyTurn) {
      // Lanjutkan timer
      setTimeLeft((prevTime) => {
        // Jika timer sudah habis, reset
        return prevTime > 0 ? prevTime : initialTime;
      });
    }
  }, [gameData.waitingForAnswer, gameData.isMyTurn, initialTime]);

  const resetTimer = () => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }

    setTimeLeft(initialTime);

    // Reset hanya timer pemain yang sedang giliran
    if (gameData?.topicID && gameData?.gameID && gameData?.roomID) {
      const newTimers = [...(gameData.playerTimers || [])];
      newTimers[gameData.currentPlayerIndex] = initialTime;

      updateGameState(gameData.topicID, gameData.gameID, gameData.roomID, {
        playerTimers: newTimers,
      });
    }
  };

  return [timeLeft, resetTimer];
};



// Game timer tidak perlu diubah
export const useGameTimer = (initialTime, onGameEnd) => {
  const [gameTimeLeft, setGameTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (gameTimeLeft > 0) {
      const gameTimer = setInterval(() => {
        setGameTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(gameTimer);
    } else {
      onGameEnd?.();
    }
  }, [gameTimeLeft, onGameEnd]);

  return gameTimeLeft;
};