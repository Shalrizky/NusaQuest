import { useEffect, useState, useRef, useCallback } from "react";
import { updateGameState, listenToGameTimer, stopGameTimer } from "../services/gameDataServices";

// Timer untuk player
export const usePlayerTimer = (initialTime, onTimeEnd, gameData) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerIdRef = useRef(null);

  // Referensi untuk playerTimers dan players.length untuk menghindari perubahan berulang pada dependensi
  const playerTimersRef = useRef(gameData.playerTimers);
  const playersLengthRef = useRef(gameData.players?.length);

  // Simpan playerTimers dan players.length terbaru di ref setiap kali mereka berubah
  useEffect(() => {
    playerTimersRef.current = gameData.playerTimers;
    playersLengthRef.current = gameData.players?.length;
  }, [gameData.playerTimers, gameData.players?.length]);

  // Stabilkan callback onTimeEnd untuk menghindari perubahan referensi yang tidak diinginkan
  const stableOnTimeEnd = useCallback(onTimeEnd, [onTimeEnd]);

  useEffect(() => {
    // Reset timer setiap kali giliran pemain aktif berganti
    if (gameData?.isMyTurn) {
      setTimeLeft(initialTime);

      if (gameData?.topicID && gameData?.gameID && gameData?.roomID) {
        const newTimers = Array.isArray(playerTimersRef.current)
          ? [...playerTimersRef.current]
          : new Array(playersLengthRef.current || 1).fill(initialTime);

        newTimers[gameData.currentPlayerIndex] = initialTime;

        updateGameState(gameData.topicID, gameData.gameID, gameData.roomID, {
          playerTimers: newTimers,
        }).catch(console.error);
      }
    }
  }, [
    gameData?.currentPlayerIndex,
    gameData?.isMyTurn,
    initialTime,
    gameData?.topicID,
    gameData?.gameID,
    gameData?.roomID,
  ]);

  useEffect(() => {
    // Aktifkan countdown hanya ketika giliran player aktif
    if (gameData?.isMyTurn) {
      timerIdRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);

          if (gameData?.topicID && gameData?.gameID && gameData?.roomID && newTime > 0) {
            const newTimers = Array.isArray(playerTimersRef.current)
              ? [...playerTimersRef.current]
              : new Array(playersLengthRef.current || 1).fill(initialTime);

            newTimers[gameData.currentPlayerIndex] = newTime;

            updateGameState(gameData.topicID, gameData.gameID, gameData.roomID, {
              playerTimers: newTimers,
            }).catch(console.error);
          }

          if (newTime <= 0) {
            clearInterval(timerIdRef.current);
            timerIdRef.current = null;
            stableOnTimeEnd?.();
          }

          return newTime;
        });
      }, 1000);

      // Bersihkan interval ketika komponen dilepas atau ketika `isMyTurn` berubah
      return () => {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      };
    } else {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, [
    gameData?.isMyTurn,
    initialTime,
    gameData?.currentPlayerIndex,
    gameData?.topicID,
    gameData?.gameID,
    gameData?.roomID,
    stableOnTimeEnd,
  ]);

  const resetTimer = useCallback(() => {
    setTimeLeft(initialTime);

    if (gameData?.topicID && gameData?.gameID && gameData?.roomID) {
      const newTimers = Array.isArray(playerTimersRef.current)
        ? [...playerTimersRef.current]
        : new Array(playersLengthRef.current || 1).fill(initialTime);

      newTimers[gameData.currentPlayerIndex] = initialTime;

      updateGameState(gameData.topicID, gameData.gameID, gameData.roomID, {
        playerTimers: newTimers,
      }).catch(console.error);
    }
  }, [initialTime, gameData?.topicID, gameData?.gameID, gameData?.roomID, gameData?.currentPlayerIndex]);

  return [timeLeft, resetTimer];
};


export const useGameTimer = (initialTime, onGameEnd, { topicID, gameID, roomID }) => {
  const [gameTimeLeft, setGameTimeLeft] = useState(initialTime);

  useEffect(() => {
    let interval;
    const unsubscribe = listenToGameTimer(
      topicID,
      gameID,
      roomID,
      (remainingTime) => {
        setGameTimeLeft(Math.max(0, remainingTime));

        if (remainingTime <= 0) {
          stopGameTimer(topicID, gameID, roomID);
          onGameEnd?.();
        } else {
          clearInterval(interval); // Clear any existing interval
          // Start local interval countdown
          interval = setInterval(() => {
            setGameTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                onGameEnd?.();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    );

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [topicID, gameID, roomID, onGameEnd]);

  return gameTimeLeft;
};
