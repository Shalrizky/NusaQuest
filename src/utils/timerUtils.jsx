import { useEffect, useState, useRef } from "react";
import { updateGameState, listenToGameTimer, stopGameTimer } from "../services/gameDataServices";

// Timer untuk player
export const usePlayerTimer = (initialTime, onTimeEnd, gameData) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerIdRef = useRef(null);

  useEffect(() => {
    // Reset timer saat berganti player
    if (gameData?.isMyTurn) {
      setTimeLeft(initialTime);

      // Update timer di Firebase dengan validasi
      if (gameData?.topicID && gameData?.gameID && gameData?.roomID) {
        const newTimers = Array.isArray(gameData.playerTimers) 
          ? [...gameData.playerTimers]
          : new Array(gameData.players?.length || 1).fill(initialTime);
        
        newTimers[gameData.currentPlayerIndex] = initialTime;
        
        updateGameState(
          gameData.topicID,
          gameData.gameID,
          gameData.roomID,
          {
            playerTimers: newTimers
          }
        ).catch(console.error);
      }
    }
  }, [gameData?.currentPlayerIndex, gameData?.isMyTurn, initialTime]);

  useEffect(() => {
    // Hanya jalankan timer jika sedang giliran player
    if (gameData?.isMyTurn && !gameData?.waitingForAnswer) {
      timerIdRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);

          // Update timer di Firebase dengan validasi
          if (gameData?.topicID && gameData?.gameID && gameData?.roomID) {
            const newTimers = Array.isArray(gameData.playerTimers)
              ? [...gameData.playerTimers]
              : new Array(gameData.players?.length || 1).fill(initialTime);
            
            newTimers[gameData.currentPlayerIndex] = newTime;
            
            updateGameState(
              gameData.topicID,
              gameData.gameID,
              gameData.roomID,
              {
                playerTimers: newTimers
              }
            ).catch(console.error);
          }

          if (newTime <= 0) {
            clearInterval(timerIdRef.current);
            onTimeEnd?.();
            return 0;
          }

          return newTime;
        });
      }, 1000);

      return () => {
        if (timerIdRef.current) {
          clearInterval(timerIdRef.current);
        }
      };
    }
  }, [gameData?.isMyTurn, gameData?.waitingForAnswer]);

  const resetTimer = () => {
    setTimeLeft(initialTime);
    
    if (gameData?.topicID && gameData?.gameID && gameData?.roomID) {
      const newTimers = Array.isArray(gameData.playerTimers)
        ? [...gameData.playerTimers]
        : new Array(gameData.players?.length || 1).fill(initialTime);
      
      newTimers[gameData.currentPlayerIndex] = initialTime;
      
      updateGameState(
        gameData.topicID,
        gameData.gameID,
        gameData.roomID,
        {
          playerTimers: newTimers
        }
      ).catch(console.error);
    }
  };

  return [timeLeft, resetTimer];
};

// Timer untuk game
export const useGameTimer = (initialTime, onGameEnd, { topicID, gameID, roomID }) => {
  const [gameTimeLeft, setGameTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;

    const unsubscribe = listenToGameTimer(
      topicID, 
      gameID, 
      roomID, 
      (remainingTime) => {
        setGameTimeLeft(Math.max(0, remainingTime));
        
        if (remainingTime <= 0) {
          stopGameTimer(topicID, gameID, roomID);
          onGameEnd?.();
        }
      }
    );

    return () => unsubscribe();
  }, [topicID, gameID, roomID, onGameEnd]);

  return gameTimeLeft;
};