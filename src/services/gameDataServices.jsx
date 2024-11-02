// gameDataServices.js
import { database, ref, onValue, set, get } from "../firebaseConfig";

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
export const initializeGameState = async (topicID, gameID, roomID, players) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  
  try {
    const snapshot = await get(gameStateRef);
    if (!snapshot.exists()) {
      const initialState = {
        currentPlayerIndex: 0,
        pionPositions: new Array(players.length).fill(0),
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
        playerTimers: new Array(players.length).fill(30), // Initialize player timers
      };
      await set(gameStateRef, initialState);
    }
  } catch (error) {
    console.error("Error initializing game state:", error);
  }
};

// Update game state
export const updateGameState = async (topicID, gameID, roomID, updates) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    const snapshot = await get(gameStateRef);
    const currentState = snapshot.val() || {};
    
    // Deep merge untuk nested objects
    const newState = {
      ...currentState,
      ...updates,
      pionPositions: updates.pionPositions || currentState.pionPositions,
      diceState: {
        ...(currentState.diceState || {}),
        ...(updates.diceState || {})
      }
    };

    // Update player timers if provided
    if (updates.playerTimers) {
      newState.playerTimers = updates.playerTimers;
    }
    
    await set(gameStateRef, newState);
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

// Cleanup game
export const cleanupGame = async (topicID, gameID, roomID, user) => {
  if (!topicID || !gameID || !roomID || !user?.uid) return;

  try {
    // Reset game state
    const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
    await set(gameStateRef, null);
    
    // Reset game status
    await setGameStatus(topicID, gameID, roomID, null);
    await setGameStartStatus(topicID, gameID, roomID, false);
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