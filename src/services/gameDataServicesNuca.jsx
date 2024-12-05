// gameDataServicesNuca.js

import { database, ref, onValue, set, get, update, remove } from "../firebaseConfig";
import { resetRoom } from "./roomDataServices"; 

// Fetch players for NusaCard game
export const fetchNusaCardPlayers = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for fetchNusaCardPlayers");
    return () => {};
  }

  const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);

  return onValue(playersRef, (snapshot) => {
    const playersData = snapshot.val() || {};
    const playersArray = Object.values(playersData);
    callback(playersArray);
  });
};

// Set NusaCard game status
export const setNusaCardGameStatus = async (topicID, gameID, roomID, status) => {
  if (!topicID || !gameID || !roomID) return;

  const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
  try {
    await set(gameStatusRef, status);
  } catch (error) {
    console.error("Error setting NusaCard game status:", error);
  }
};

// Listen to NusaCard game status
export const listenToNusaCardGameStatus = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};

  const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
  return onValue(gameStatusRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// Initialize NusaCard game state
export const initializeNusaCardGameState = async (topicID, gameID, roomID, players) => {
  if (!topicID || !gameID || !roomID || !players) {
    console.error("Missing parameters for initializeNusaCardGameState");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);

  try {
    const initialState = {
      players: players,
      currentPlayerIndex: 0,
      gameStatus: 'playing',
      deckCounts: {
        bottom: 4,
        top: players.length > 1 ? 4 : 0,
        left: players.length > 2 ? 4 : 0,
        right: players.length > 3 ? 4 : 0,
      },
      DECK_ORDER: players.length === 1 
        ? ['bottom']
        : players.length === 2 
          ? ['bottom', 'top']
          : players.length === 3 
            ? ['bottom', 'left', 'right']
            : ['bottom', 'left', 'top', 'right'],
      cards: Array.from({ length: 4 }, () => getRandomQuestion()),
      hints: [],
      lastActiveDeck: null,
      isShuffling: false,
      victory: false,
      winner: "",
      deckDepleted: null,
      // Tambahkan state lainnya sesuai kebutuhan
    };

    await set(gameStateRef, initialState);
    console.log("Game state berhasil diinisialisasi.");
  } catch (error) {
    console.error("Error initializing NusaCard game state:", error);
  }
};

// Listen to NusaCard game state
export const listenToNusaCardGameState = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  return onValue(gameStateRef, (snapshot) => {
    const state = snapshot.val();
    if (state) {
      callback(state);
    }
  });
};

// Update NusaCard game state with validation
export const updateNusaCardGameState = async (topicID, gameID, roomID, updates) => {
  if (!topicID || !gameID || !roomID || !updates) {
    console.error("Missing parameters for updateNusaCardGameState");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);

  try {
    const snapshot = await get(gameStateRef);
    const currentState = snapshot.val();

    if (!currentState) {
      console.error("Current game state does not exist.");
      return;
    }

    // Validasi dan sanitasi updates
    const sanitizedUpdates = {
      ...updates,
      deckCounts: updates.deckCounts
        ? {
            ...currentState.deckCounts,
            ...updates.deckCounts,
          }
        : currentState.deckCounts,
      cards: updates.cards ? updates.cards : currentState.cards,
      hints: updates.hints ? updates.hints : currentState.hints,
      // Tambahkan validasi untuk properti lainnya sesuai kebutuhan
    };

    // Update state di Firebase
    await update(gameStateRef, sanitizedUpdates);
  } catch (error) {
    console.error("Error updating NusaCard game state:", error);
  }
};

// Get current NusaCard game state
export const getNusaCardGameState = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing parameters for getNusaCardGameState");
    return null;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    const snapshot = await get(gameStateRef);
    return snapshot.val();
  } catch (error) {
    console.error("Error getting NusaCard game state:", error);
    return null;
  }
};

// Reset NusaCard game state
export const resetNusaCardGameState = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing parameters for resetNusaCardGameState");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    await remove(gameStateRef);
  } catch (error) {
    console.error("Error resetting NusaCard game state:", error);
  }
};

// Initialize NusaCard game timer
export const initializeNusaCardGameTimer = async (topicID, gameID, roomID, duration) => {
  if (!topicID || !gameID || !roomID || !duration) {
    console.error("Missing parameters for initializeNusaCardGameTimer");
    return;
  }

  const gameTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameTimer`);
  try {
    const snapshot = await get(gameTimerRef);
    if (!snapshot.exists()) {
      await set(gameTimerRef, {
        startTime: Date.now(),
        duration: duration,
        isActive: true,
      });
    }
  } catch (error) {
    console.error("Error initializing NusaCard game timer:", error);
  }
};

// Update NusaCard game timer
export const updateNusaCardGameTimer = async (topicID, gameID, roomID, timeLeft) => {
  if (!topicID || !gameID || !roomID || timeLeft === undefined) {
    console.error("Missing parameters for updateNusaCardGameTimer");
    return;
  }

  const gameTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameTimer`);
  try {
    await set(gameTimerRef, {
      startTime: Date.now(),
      duration: timeLeft,
      isActive: true,
    });
  } catch (error) {
    console.error("Error updating NusaCard game timer:", error);
  }
};

// Stop NusaCard game timer
export const stopNusaCardGameTimer = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing parameters for stopNusaCardGameTimer");
    return;
  }

  const gameTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameTimer`);
  try {
    await set(gameTimerRef, {
      isActive: false,
    });
  } catch (error) {
    console.error("Error stopping NusaCard game timer:", error);
  }
};

// Listen to NusaCard game timer
export const listenToNusaCardGameTimer = (topicID, gameID, roomID, callback) => {
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

// Set NusaCard game winner
export const setNusaCardGameWinner = async (topicID, gameID, roomID, winnerUID) => {
  if (!topicID || !gameID || !roomID || !winnerUID) {
    console.error("Missing parameters for setNusaCardGameWinner");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    await update(gameStateRef, {
      gameStatus: 'finished',
      winner: winnerUID,
    });
  } catch (error) {
    console.error("Error setting NusaCard game winner:", error);
  }
};

// Cleanup NusaCard game data
export const cleanupNusaCardGame = async (topicID, gameID, roomID, user) => {
  if (!topicID || !gameID || !roomID || !user?.uid) {
    console.error("Missing parameters for cleanupNusaCardGame");
    return;
  }

  try {
    // Reset gameState
    const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
    await remove(gameStateRef);

    // Reset gameTimer
    const gameTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameTimer`);
    await remove(gameTimerRef);

    // Reset game status
    await setNusaCardGameStatus(topicID, gameID, roomID, null);

    // Reset other game-specific states if any
    // ...

    // Hapus semua pesan chat dalam room jika ada
    const chatRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/chatMessages`);
    await remove(chatRef);

    // Reset player data dalam room jika diperlukan
    // Jika Anda ingin menghapus semua pemain, gunakan remove, jika tidak, sesuaikan sesuai kebutuhan
    const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
    await remove(playersRef);

    // Reset keseluruhan room data jika diperlukan
    await resetRoom(topicID, gameID, roomID);
  } catch (error) {
    console.error("Error cleaning up NusaCard game:", error);
  }
};

// Utility function to get a random question (pastikan fungsi ini ada atau import dari tempat lain)
export const getRandomQuestion = () => {
  // Implementasi pengambilan pertanyaan acak sesuai kebutuhan
  // Contoh sederhana:
  const questions = [
    {
      question: "Apa ibu kota Indonesia?",
      options: ["Jakarta", "Bandung", "Surabaya", "Medan"],
      correctAnswer: "Jakarta",
    },
    {
      question: "Siapa presiden pertama Indonesia?",
      options: ["Soekarno", "Soeharto", "Habibie", "Megawati"],
      correctAnswer: "Soekarno",
    },
    // Tambahkan lebih banyak pertanyaan sesuai kebutuhan
  ];

  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
};
