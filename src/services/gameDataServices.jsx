import { database, ref, onValue, set, get } from "../firebaseConfig";
import { resetRoom } from "./roomDataServices";

// Fetch games data
export const fetchGames = (callback) => {
  const gamesRef = ref(database, "games");
  onValue(gamesRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  });
};

// Fetch game players
export const fetchGamePlayers = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for fetchGamePlayers");
    return () => {};
  }
  const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
  return onValue(playersRef, (snapshot) => {
    const playersData = snapshot.val() || {};
    const playersArray = Object.values(playersData);
    callback(playersArray);
  });
};

// Set game status
export const setGameStatus = async (topicID, gameID, roomID, status) => {
  if (!topicID || !gameID || !roomID) return;
  const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
  try {
    await set(gameStatusRef, status);
  } catch (error) {
    console.error("Error setting game status:", error);
  }
};

// Set game start status
export const setGameStartStatus = async (topicID, gameID, roomID, isStarting) => {
  if (!topicID || !gameID || !roomID) return;
  const gameStartRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStarted`);
  try {
    await set(gameStartRef, isStarting);
  } catch (error) {
    console.error("Error setting game start status:", error);
  }
};

// Listen to game start status
export const listenToGameStart = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};
  const gameStartRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStarted`);
  return onValue(gameStartRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// Enhanced initialize game state - Support both Ular Tangga and NusaCard
export const initializeGameState = async (topicID, gameID, roomID, players, questions, customInitialState = null) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    const snapshot = await get(gameStateRef);
    if (!snapshot.exists()) {
      const playerCount = Array.isArray(players) ? players.length : 0;
      
      let initialState;
      
      // Jika ada custom initial state (untuk NusaCard), gunakan itu
      if (customInitialState) {
        initialState = {
          ...customInitialState,
          gameCreatedAt: Date.now(),
          playerActivity: players.reduce((acc, player, index) => {
            acc[player.uid] = {
              lastActivity: Date.now(),
              isActive: true,
              playerIndex: index
            };
            return acc;
          }, {})
        };
      } else {
        // Default untuk Ular Tangga
        initialState = {
          currentPlayerIndex: 0,
          pionPositions: new Array(playerCount).fill(0),
          isMoving: false,
          showQuestion: false,
          waitingForAnswer: false,
          isCorrect: null,
          allowExtraRoll: false,
          potionUsable: false,
          currentQuestionIndex: 0,
          questions: questions,
          gameStatus: 'playing',
          gameType: 'ulartangga',
          diceState: {
            isRolling: false,
            currentNumber: 1,
            lastRoll: null
          },
          playerTimers: new Array(playerCount).fill(30),
          playerActivity: players.reduce((acc, player, index) => {
            acc[player.uid] = {
              lastActivity: Date.now(),
              isActive: true,
              playerIndex: index
            };
            return acc;
          }, {}),
          gameCreatedAt: Date.now()
        };
      }

      await set(gameStateRef, initialState);
    }
  } catch (error) {
    console.error("Error initializing game state:", error);
    throw error;
  }
};

// Update player activity timestamp
export const updatePlayerActivity = async (topicID, gameID, roomID, userUID) => {
  if (!topicID || !gameID || !roomID || !userUID) return;
 
  const activityRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState/playerActivity/${userUID}`);
  try {
    const snapshot = await get(activityRef);
    if (snapshot.exists()) {
      await set(activityRef, {
        ...snapshot.val(),
        lastActivity: Date.now(),
        isActive: true
      });
    }
  } catch (error) {
    console.error("Error updating player activity:", error);
  }
};

// Check for inactive players and handle game abandonment
export const checkInactivePlayers = async (topicID, gameID, roomID, inactivityTimeout = 600000) => {
  if (!topicID || !gameID || !roomID) return;
 
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    const snapshot = await get(gameStateRef);
    const gameState = snapshot.val();
   
    if (!gameState || !gameState.playerActivity) return;
   
    const now = Date.now();
    const playerActivity = gameState.playerActivity;
   
    // Check setiap player apakah sudah tidak aktif lebih dari timeout
    for (const [userUID, activity] of Object.entries(playerActivity)) {
      const timeSinceLastActivity = now - activity.lastActivity;
     
      if (timeSinceLastActivity >= inactivityTimeout && activity.isActive) {
        console.log(`Player ${userUID} tidak aktif selama ${timeSinceLastActivity}ms, mengakhiri game...`);
       
        // Mark game as abandoned
        await updateGameState(topicID, gameID, roomID, {
          gameStatus: 'abandoned',
          abandonedBy: userUID,
          abandonedAt: now,
          reason: 'player_inactive',
          [`playerActivity/${userUID}/isActive`]: false
        });
       
        // Stop game timer
        await stopGameTimer(topicID, gameID, roomID);
       
        return true; // Game ended due to inactivity
      }
    }
   
    return false; // Game masih aktif
  } catch (error) {
    console.error("Error checking inactive players:", error);
    return false;
  }
};

// Listen to player activity untuk monitor inactivity
export const listenToPlayerActivity = (topicID, gameID, roomID, callback, inactivityTimeout = 600000) => {
  if (!topicID || !gameID || !roomID) return () => {};
 
  const activityRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState/playerActivity`);
 
  return onValue(activityRef, (snapshot) => {
    const playerActivity = snapshot.val();
    if (!playerActivity) return;
   
    const now = Date.now();
    const inactivePlayers = [];
   
    Object.entries(playerActivity).forEach(([userUID, activity]) => {
      const timeSinceLastActivity = now - activity.lastActivity;
      if (timeSinceLastActivity >= inactivityTimeout && activity.isActive) {
        inactivePlayers.push({
          userUID,
          timeSinceLastActivity,
          playerIndex: activity.playerIndex
        });
      }
    });
   
    if (inactivePlayers.length > 0) {
      callback(inactivePlayers);
    }
  });
};

// Enhanced update game state - Support both game types
export const updateGameState = async (topicID, gameID, roomID, updates) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    const snapshot = await get(gameStateRef);
    const currentState = snapshot.val() || {};

    // Validasi dan sanitasi data sebelum update
    const sanitizedUpdates = { ...updates };
    
    // Detect game type
    const gameType = currentState.gameType || updates.gameType || 'ulartangga';
    
    if (gameType === 'nusacard') {
      // NusaCard specific validations
      ['player1Cards', 'player2Cards', 'player3Cards', 'player4Cards'].forEach(cardField => {
        if (updates[cardField]) {
          sanitizedUpdates[cardField] = Array.isArray(updates[cardField])
            ? updates[cardField]
            : currentState[cardField] || [];
        }
      });
      
      if (updates.playerStatus) {
        sanitizedUpdates.playerStatus = {
          player1: updates.playerStatus.player1 || currentState.playerStatus?.player1 || "not_available",
          player2: updates.playerStatus.player2 || currentState.playerStatus?.player2 || "not_available",
          player3: updates.playerStatus.player3 || currentState.playerStatus?.player3 || "not_available",
          player4: updates.playerStatus.player4 || currentState.playerStatus?.player4 || "not_available",
        };
      }
      
      if (updates.playerAnswerFeedback) {
        sanitizedUpdates.playerAnswerFeedback = {
          player1: updates.playerAnswerFeedback.player1 !== undefined ? updates.playerAnswerFeedback.player1 : null,
          player2: updates.playerAnswerFeedback.player2 !== undefined ? updates.playerAnswerFeedback.player2 : null,
          player3: updates.playerAnswerFeedback.player3 !== undefined ? updates.playerAnswerFeedback.player3 : null,
          player4: updates.playerAnswerFeedback.player4 !== undefined ? updates.playerAnswerFeedback.player4 : null,
        };
      }
      
      if (updates.currentActiveTurnPhase) {
        const validPhases = ["throwing", "answering"];
        sanitizedUpdates.currentActiveTurnPhase = validPhases.includes(updates.currentActiveTurnPhase)
          ? updates.currentActiveTurnPhase
          : currentState.currentActiveTurnPhase || "throwing";
      }
      
      // NusaCard specific fields
      if (updates.thrownCard !== undefined) {
        sanitizedUpdates.thrownCard = updates.thrownCard;
      }
      
      if (updates.questionForModal !== undefined) {
        sanitizedUpdates.questionForModal = updates.questionForModal;
      }
      
      if (typeof updates.shouldShowQuestionModal === 'boolean') {
        sanitizedUpdates.shouldShowQuestionModal = updates.shouldShowQuestionModal;
      }
      
      if (typeof updates.lastCardThrowerIndex === 'number' || updates.lastCardThrowerIndex === null) {
        sanitizedUpdates.lastCardThrowerIndex = updates.lastCardThrowerIndex;
      }
      
    } else {
      // Ular Tangga specific validations
      if (updates.pionPositions) {
        sanitizedUpdates.pionPositions = Array.isArray(updates.pionPositions)
          ? updates.pionPositions
          : currentState.pionPositions || [];
      }
     
      if (updates.diceState) {
        sanitizedUpdates.diceState = {
          isRolling: Boolean(updates.diceState.isRolling),
          currentNumber: Number(updates.diceState.currentNumber) || 1,
          lastRoll: Number(updates.diceState.lastRoll) || null
        };
      }
    }
   
    // Common validations for both games
    if (updates.playerTimers) {
      sanitizedUpdates.playerTimers = Array.isArray(updates.playerTimers)
        ? updates.playerTimers.map(time => Number(time) || 0)
        : currentState.playerTimers || [];
    }

    if (typeof updates.currentPlayerIndex === 'number') {
      sanitizedUpdates.currentPlayerIndex = updates.currentPlayerIndex;
    }
    
    // Common boolean fields
    ['isMoving', 'showQuestion', 'waitingForAnswer', 'allowExtraRoll', 'potionUsable'].forEach(field => {
      if (typeof updates[field] === 'boolean') {
        sanitizedUpdates[field] = updates[field];
      }
    });
    
    if (updates.isCorrect !== undefined) {
      sanitizedUpdates.isCorrect = updates.isCorrect;
    }

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(sanitizedUpdates).filter(([_, value]) => value !== undefined)
    );

    // Update ke Firebase dengan data yang sudah divalidasi
    await set(gameStateRef, { ...currentState, ...cleanUpdates });
  } catch (error) {
    console.error("Error updating game state:", error);
    throw error;
  }
};

// Listen to game state
export const listenToGameState = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  return onValue(gameStateRef, (snapshot) => {
    const state = snapshot.val();
    if (state) {
      callback(state);
    }
  });
};

// Update dice state (Ular Tangga specific)
export const updateDiceState = async (topicID, gameID, roomID, diceState) => {
  try {
    await updateGameState(topicID, gameID, roomID, { diceState });
  } catch (error) {
    console.error("Error updating dice state:", error);
  }
};

// Get current game state
export const getGameState = async (topicID, gameID, roomID) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    const snapshot = await get(gameStateRef);
    return snapshot.val();
  } catch (error) {
    console.error("Error getting game state:", error);
    return null;
  }
};

// Check if game was abandoned
export const checkGameAbandoned = async (topicID, gameID, roomID) => {
  try {
    const gameState = await getGameState(topicID, gameID, roomID);
    return gameState?.gameStatus === 'abandoned';
  } catch (error) {
    console.error("Error checking if game abandoned:", error);
    return false;
  }
};

// Inisialisasi timer game dengan durasi
export const initializeGameTimer = async (topicID, gameID, roomID, duration) => {
  const gameTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameTimer`);
  try {
    const snapshot = await get(gameTimerRef);
    if (!snapshot.exists()) {
      await set(gameTimerRef, {
        startTime: Date.now(),
        duration: duration,
        isActive: true
      });
    }
  } catch (error) {
    console.error("Error initializing game timer:", error);
  }
};

// Update game timer
export const updateGameTimer = async (topicID, gameID, roomID, timeLeft) => {
  const gameTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameTimer`);
  try {
    await set(gameTimerRef, {
      startTime: Date.now(),
      duration: timeLeft,
      isActive: true
    });
  } catch (error) {
    console.error("Error updating game timer:", error);
  }
};

// Stop game timer
export const stopGameTimer = async (topicID, gameID, roomID) => {
  const gameTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameTimer`);
  try {
    await set(gameTimerRef, {
      isActive: false
    });
  } catch (error) {
    console.error("Error stopping game timer:", error);
  }
};

export const listenToGameTimer = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};
  const gameTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameTimer`);
  return onValue(gameTimerRef, (snapshot) => {
    const timerData = snapshot.val();
    if (timerData && timerData.isActive) {
      const elapsedTime = Math.floor((Date.now() - timerData.startTime) / 1000);
      const remainingTime = Math.max(0, timerData.duration - elapsedTime);
      callback(remainingTime);
    }
  });
};

// Enhanced cleanup game dengan abandoned game handling
export const cleanupGame = async (topicID, gameID, roomID, user, reason = 'normal') => {
  if (!topicID || !gameID || !roomID || !user?.uid) return;
 
  try {
    // Jika cleanup karena player inactivity, mark as abandoned dulu
    if (reason === 'inactivity') {
      await updateGameState(topicID, gameID, roomID, {
        gameStatus: 'abandoned',
        abandonedBy: user.uid,
        abandonedAt: Date.now(),
        reason: 'player_inactive'
      });
    }

    // Reset gameState
    const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
    await set(gameStateRef, null);

    // Reset gameTimer
    const gameTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameTimer`);
    await set(gameTimerRef, null);

    // Reset game status and start status
    await setGameStatus(topicID, gameID, roomID, null);
    await setGameStartStatus(topicID, gameID, roomID, false);

    // Hapus semua pesan chat dalam room
    const chatRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/chatMessages`);
    await set(chatRef, null);

    // Reset player data dalam room
    const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
    await set(playersRef, null);

    // Reset keseluruhan room data
    await resetRoom(topicID, gameID, roomID);
  } catch (error) {
    console.error("Error cleaning up game:", error);
  }
};

// Reset game state
export const resetGameState = async (topicID, gameID, roomID) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    await set(gameStateRef, null);
  } catch (error) {
    console.error("Error resetting game state:", error);
  }
};

// Check if game is active
export const checkGameActive = async (topicID, gameID, roomID) => {
  const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
  try {
    const snapshot = await get(gameStatusRef);
    const status = snapshot.val();
    return status === 'playing' && status !== 'abandoned';
  } catch (error) {
    console.error("Error checking game status:", error);
    return false;
  }
};

// Set winner
export const setGameWinner = async (topicID, gameID, roomID, winnerUID) => {
  try {
    await updateGameState(topicID, gameID, roomID, {
      gameStatus: 'finished',
      winner: winnerUID
    });
  } catch (error) {
    console.error("Error setting game winner:", error);
  }
};

// Handle player timeout (Ular Tangga)
export const handlePlayerTimeout = async (topicID, gameID, roomID, currentPlayerIndex, totalPlayers) => {
  try {
    await updateGameState(topicID, gameID, roomID, {
      currentPlayerIndex: (currentPlayerIndex + 1) % totalPlayers,
      waitingForAnswer: false,
      showQuestion: false,
      isCorrect: null,
      potionUsable: false,
      diceState: {
        isRolling: false,
        currentNumber: 1,
        lastRoll: null
      }
    });
  } catch (error) {
    console.error("Error handling player timeout:", error);
  }
};

// Update player position (Ular Tangga)
export const updatePlayerPosition = async (topicID, gameID, roomID, playerIndex, newPosition) => {
  try {
    const state = await getGameState(topicID, gameID, roomID);
    if (state) {
      const newPositions = [...state.pionPositions];
      newPositions[playerIndex] = newPosition;
      await updateGameState(topicID, gameID, roomID, {
        pionPositions: newPositions
      });
    }
  } catch (error) {
    console.error("Error updating player position:", error);
  }
};

// ========================================
// NUSACARD SPECIFIC FUNCTIONS
// ========================================

// Check if any player has won in NusaCard (when they have 0 cards)
export const checkNusaCardWinner = async (topicID, gameID, roomID) => {
  try {
    const gameState = await getGameState(topicID, gameID, roomID);
    if (!gameState || gameState.gameType !== 'nusacard') return null;

    const cardCounts = [
      gameState.player1Cards?.length || 0,
      gameState.player2Cards?.length || 0,
      gameState.player3Cards?.length || 0,
      gameState.player4Cards?.length || 0
    ];

    const winnerIndex = cardCounts.findIndex(count => count === 0);
    return winnerIndex !== -1 ? winnerIndex : null;
  } catch (error) {
    console.error("Error checking NusaCard winner:", error);
    return null;
  }
};

// Handle player timeout for NusaCard
export const handleNusaCardPlayerTimeout = async (topicID, gameID, roomID, currentPlayerIndex, currentPhase, totalPlayers) => {
  try {
    if (currentPhase === "throwing") {
      // Move to next player if throwing timeout
      await updateGameState(topicID, gameID, roomID, {
        currentPlayerIndex: (currentPlayerIndex + 1) % totalPlayers,
        currentActiveTurnPhase: "throwing",
        thrownCard: null,
        questionForModal: null,
        shouldShowQuestionModal: false,
        lastCardThrowerIndex: null,
      });
    } else if (currentPhase === "answering") {
      // Add penalty card and move to next turn if answering timeout
      const gameState = await getGameState(topicID, gameID, roomID);
      const playerAnsweringId = `player${currentPlayerIndex + 1}`;
      const currentCards = gameState[`${playerAnsweringId}Cards`] || [];
      
      // Create penalty card from available questions
      const availableQuestions = gameState.questions || [];
      if (availableQuestions.length > 0) {
        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        const penaltyCard = {
          ...randomQuestion,
          id: Date.now(),
          isPenalty: true,
        };

        const updatedCards = [...currentCards, penaltyCard];
        const nextThrowerIndex = gameState.lastCardThrowerIndex !== null 
          ? (gameState.lastCardThrowerIndex + 1) % totalPlayers
          : (currentPlayerIndex + 1) % totalPlayers;

        await updateGameState(topicID, gameID, roomID, {
          [`${playerAnsweringId}Cards`]: updatedCards,
          currentPlayerIndex: nextThrowerIndex,
          currentActiveTurnPhase: "throwing",
          thrownCard: null,
          questionForModal: null,
          shouldShowQuestionModal: false,
          lastCardThrowerIndex: null,
          playerAnswerFeedback: {
            ...gameState.playerAnswerFeedback,
            [playerAnsweringId]: "incorrect"
          }
        });

        // Reset feedback after delay
        setTimeout(async () => {
          await updateGameState(topicID, gameID, roomID, {
            playerAnswerFeedback: {
              ...gameState.playerAnswerFeedback,
              [playerAnsweringId]: null
            }
          });
        }, 2000);
      }
    }
  } catch (error) {
    console.error("Error handling NusaCard player timeout:", error);
  }
};