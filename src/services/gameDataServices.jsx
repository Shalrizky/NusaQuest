// gameDataServices.js
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

// Initialize game state
// Initialize game state dengan validasi data
export const initializeGameState = async (topicID, gameID, roomID, players) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  
  try {
    const snapshot = await get(gameStateRef);
    if (!snapshot.exists()) {
      // Pastikan players adalah array valid
      const playerCount = Array.isArray(players) ? players.length : 0;
      
      const initialState = {
        currentPlayerIndex: 0,
        pionPositions: new Array(playerCount).fill(0),
        isMoving: false,
        showQuestion: false,
        waitingForAnswer: false,
        isCorrect: null,
        allowExtraRoll: false,
        potionUsable: false,
        currentQuestion: null,
        currentQuestionIndex: 0,
        gameStatus: 'playing',
        diceState: {
          isRolling: false,
          currentNumber: 1,
          lastRoll: null
        },
        playerTimers: new Array(playerCount).fill(10)
      };
      
      await set(gameStateRef, initialState);
    }
  } catch (error) {
    console.error("Error initializing game state:", error);
    throw error;
  }
};

// Update game state dengan validasi data
export const updateGameState = async (topicID, gameID, roomID, updates) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  
  try {
    // Ambil current state dulu
    const snapshot = await get(gameStateRef);
    const currentState = snapshot.val() || {};
    
    // Validasi dan sanitasi data sebelum update
    const sanitizedUpdates = {
      ...updates,
      // Pastikan pionPositions selalu array valid
      pionPositions: Array.isArray(updates.pionPositions) 
        ? updates.pionPositions 
        : currentState.pionPositions || [],
        
      // Pastikan diceState selalu object valid
      diceState: updates.diceState 
        ? {
            isRolling: Boolean(updates.diceState.isRolling),
            currentNumber: Number(updates.diceState.currentNumber) || 1,
            lastRoll: Number(updates.diceState.lastRoll) || null
          }
        : currentState.diceState || {
            isRolling: false,
            currentNumber: 1,
            lastRoll: null
          },
          
      // Pastikan playerTimers selalu array valid
      playerTimers: Array.isArray(updates.playerTimers)
        ? updates.playerTimers.map(time => Number(time) || 0)
        : currentState.playerTimers || [],
        
      // Validasi properti lainnya
      currentPlayerIndex: typeof updates.currentPlayerIndex === 'number' 
        ? updates.currentPlayerIndex 
        : currentState.currentPlayerIndex || 0,
      
      isMoving: typeof updates.isMoving === 'boolean' 
        ? updates.isMoving 
        : currentState.isMoving || false,
      
      showQuestion: typeof updates.showQuestion === 'boolean'
        ? updates.showQuestion
        : currentState.showQuestion || false,
        
      waitingForAnswer: typeof updates.waitingForAnswer === 'boolean'
        ? updates.waitingForAnswer 
        : currentState.waitingForAnswer || false,
        
      isCorrect: updates.isCorrect !== undefined 
        ? updates.isCorrect 
        : currentState.isCorrect,
        
      allowExtraRoll: typeof updates.allowExtraRoll === 'boolean'
        ? updates.allowExtraRoll 
        : currentState.allowExtraRoll || false,
        
      potionUsable: typeof updates.potionUsable === 'boolean'
        ? updates.potionUsable 
        : currentState.potionUsable || false
    };

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(sanitizedUpdates).filter(([_, value]) => value !== undefined)
    );

    // Update ke Firebase dengan data yang sudah divalidasi
    await set(gameStateRef, {
      ...currentState,
      ...cleanUpdates
    });
    
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

// Update dice state
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


// Update cleanup game to include timer cleanup
export const cleanupGame = async (topicID, gameID, roomID, user) => {
  if (!topicID || !gameID || !roomID || !user?.uid) return;

  try {

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
    return snapshot.val() === 'playing';
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


// Handle player timeout
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

// Update player position
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