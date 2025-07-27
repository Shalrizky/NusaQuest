import { useEffect, useState, useRef, useCallback } from "react";
import { 
  updateGameState, 
  listenToGameTimer, 
  stopGameTimer, 
  updatePlayerActivity,
  checkInactivePlayers,
  cleanupGame 
} from "../services/gameDataServices";

// Timer untuk player
export const usePlayerTimer = (initialTime, onTimeEnd, gameData) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerIdRef = useRef(null);
  const playerTimersRef = useRef(gameData.playerTimers);
  const playersLengthRef = useRef(gameData.players?.length);

  useEffect(() => {
    playerTimersRef.current = gameData.playerTimers;
    playersLengthRef.current = gameData.players?.length;
  }, [gameData.playerTimers, gameData.players?.length]);

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

// Hook untuk mendeteksi aktivitas player
export const usePlayerActivity = (onInactivity, inactivityTimeout = 60000, gameData) => {
  const lastActivityRef = useRef(Date.now());
  const checkIntervalRef = useRef(null);
  const isActiveRef = useRef(true);
  const inactivityTimeoutRef = useRef(null);
  const lastFirebaseActivityUpdate = useRef(0);

  // Update aktivitas terakhir
  const updateActivity = useCallback(async () => {
    lastActivityRef.current = Date.now();
    if (!isActiveRef.current) {
      isActiveRef.current = true;
    }

     // Update Firebase activity hanya setiap 30 detik (bukan setiap klik)
    const now = Date.now();
    const shouldUpdateFirebase = (now - lastFirebaseActivityUpdate.current) > 30000; 

    if (gameData?.topicID && gameData?.gameID && gameData?.roomID && gameData?.user?.uid && shouldUpdateFirebase) {
      lastFirebaseActivityUpdate.current = now;
      try {
        await updatePlayerActivity(
          gameData.topicID, 
          gameData.gameID, 
          gameData.roomID, 
          gameData.user.uid
        );
      } catch (error) {
        console.error("Error updating player activity:", error);
      }
    }

    // Clear existing timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      if (isActiveRef.current) {
        isActiveRef.current = false;
        onInactivity?.();
      }
    }, inactivityTimeout);

  }, [onInactivity, inactivityTimeout, gameData?.topicID, gameData?.gameID, gameData?.roomID, gameData?.user?.uid]);

  // Setup event listeners untuk mendeteksi aktivitas
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [updateActivity]);

  // Deteksi jika tab tidak aktif (visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab menjadi tidak aktif');
      } else {
        console.log('Tab menjadi aktif kembali');
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateActivity]);

  // Cleanup timeout saat component unmount
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      if (checkIntervalRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // Initial activity update
  useEffect(() => {
    updateActivity();
  }, [updateActivity]);

  return { updateActivity, isActive: isActiveRef.current };
};

// Timer untuk jalannya game dengan player activity detection
export const useGameTimer = (initialTime, onGameEnd, { topicID, gameID, roomID, user }) => {
  const [gameTimeLeft, setGameTimeLeft] = useState(initialTime);
  const gameEndedRef = useRef(false);
  const inactivityCheckIntervalRef = useRef(null);

  // Handle player inactivity
  const handlePlayerInactivity = useCallback(async () => {
    if (gameEndedRef.current) return;
    
    console.log('Player tidak aktif selama 1 menit, mengakhiri game...');
    
    try {
      // Cleanup game dengan reason inactivity
      await cleanupGame(topicID, gameID, roomID, user, 'inactivity');
      
      // Stop timer dan end game
      stopGameTimer(topicID, gameID, roomID);
      gameEndedRef.current = true;
      onGameEnd?.();
    } catch (error) {
      console.error('Error ending game due to inactivity:', error);
      onGameEnd?.();
    }
  }, [topicID, gameID, roomID, user, onGameEnd]);

  // Setup player activity detection
  const { updateActivity } = usePlayerActivity(handlePlayerInactivity, 60000, {
    topicID,
    gameID,
    roomID,
    user
  });

  // Check untuk inactive players secara berkala
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;

    inactivityCheckIntervalRef.current = setInterval(async () => {
      if (gameEndedRef.current) return;
      
      try {
        const gameAbandoned = await checkInactivePlayers(topicID, gameID, roomID, 60000);
        if (gameAbandoned && !gameEndedRef.current) {
          console.log('Game ditinggalkan karena player tidak aktif');
          gameEndedRef.current = true;
          onGameEnd?.();
        }
      } catch (error) {
        console.error('Error checking inactive players:', error);
      }
    }, 30000); // Check setiap 30 detik

    return () => {
      if (inactivityCheckIntervalRef.current) {
        clearInterval(inactivityCheckIntervalRef.current);
      }
    };
  }, [topicID, gameID, roomID, onGameEnd]);

  useEffect(() => {
    let interval;
    const unsubscribe = listenToGameTimer(
      topicID,
      gameID,
      roomID,
      (remainingTime) => {
        if (gameEndedRef.current) return;
        
        setGameTimeLeft(Math.max(0, remainingTime));
        if (remainingTime <= 0) {
          stopGameTimer(topicID, gameID, roomID);
          gameEndedRef.current = true;
          onGameEnd?.();
        } else {
          clearInterval(interval);
          interval = setInterval(() => {
            setGameTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                if (!gameEndedRef.current) {
                  gameEndedRef.current = true;
                  onGameEnd?.();
                }
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

  return { gameTimeLeft, updateActivity };
};