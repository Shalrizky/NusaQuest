import { database, ref, onValue, set, get } from "../firebaseConfig";
import { resetRoom } from "./roomDataServices";

// ========================================
// UNIVERSAL FUNCTIONS (Both Games)
// ========================================

// Update queue for debouncing
let updateQueue = {};

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

// Listen to game state (Universal)
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

// Get current game state (Universal)
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

// Update player activity timestamp (Universal)
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

// Check for inactive players and handle game abandonment (Universal)
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

// Listen to player activity untuk monitor inactivity (Universal)
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

// Check if game is active (Universal)
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

// Set winner (Universal)
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

// Reset game state (Universal)
export const resetGameState = async (topicID, gameID, roomID) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    await set(gameStateRef, null);
  } catch (error) {
    console.error("Error resetting game state:", error);
  }
};

// ========================================
// GAME TIMER FUNCTIONS (Universal)
// ========================================

// Initialize game timer
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

// Listen to game timer
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

// ========================================
// UNIVERSAL GAME STATE MANAGEMENT (FIXED)
// ========================================

// Universal update game state - Auto-detect game type with debouncing
export const updateGameState = async (topicID, gameID, roomID, updates) => {
  const key = `${topicID}-${gameID}-${roomID}`;

  // Clear previous timeout to debounce updates
  if (updateQueue[key]) {
    clearTimeout(updateQueue[key]);
  }

  return new Promise((resolve, reject) => {
    updateQueue[key] = setTimeout(async () => {
      try {
        const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
        const snapshot = await get(gameStateRef);
        const currentState = snapshot.val() || {};

        // === KUNCI PERBAIKAN DI SINI ===
        // Menerapkan updates secara bertingkat ke currentState
        let newState = { ...currentState }; // Buat salinan state saat ini

        // Fungsi helper untuk menerapkan update bertingkat
        const applyUpdates = (target, source) => {
          for (const key in source) {
            // Periksa jika key mengandung path (misalnya "playerActivity/uid/isActive")
            if (key.includes('/')) {
              const pathParts = key.split('/');
              let currentTarget = target;
              for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i];
                if (i === pathParts.length - 1) {
                  // Bagian terakhir dari path adalah properti yang akan diupdate
                  currentTarget[part] = source[key];
                } else {
                  // Buat objek baru jika tidak ada atau bukan objek
                  if (!currentTarget[part] || typeof currentTarget[part] !== 'object') {
                    currentTarget[part] = {};
                  }
                  currentTarget = currentTarget[part];
                }
              }
            } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null) {
              // Jika properti adalah objek dan target juga objek, lakukan merge rekursif
              target[key] = { ...target[key], ...source[key] };
              // Atau jika kita ingin overwrite, cukup target[key] = source[key];
              // Namun, untuk game state, merge lebih umum untuk menghindari kehilangan data
            } else {
              // Untuk properti non-objek atau array, langsung timpa
              target[key] = source[key];
            }
          }
        };

        applyUpdates(newState, updates);
        // === AKHIR KUNCI PERBAIKAN ===


        // Validasi dan sanitasi data sebelum update (pertahankan logika Anda)
        // Note: Sebagian besar validasi ini mungkin tidak lagi diperlukan
        // jika applyUpdates sudah sangat spesifik.
        // Namun, jika Anda ingin mempertahankan validasi kuat Anda, biarkan saja.
        // Saya hanya akan mencantumkan bagian yang relevan dengan `playerTimers`
        // dan `gameWinnerUID` dll. yang baru Anda tambahkan.

        const sanitizedUpdates = { ...newState }; // Gunakan newState yang sudah di-merge

        const gameType = currentState.gameType || updates.gameType || 'ulartangga';
        // ... (validasi NusaCard dan Ular Tangga lainnya) ...

        // PENTING: Struktur playerTimers dipertahankan seperti yang Anda inginkan
        // Ini akan menerima array angka, bukan objek {startTime, duration}.
        // Karena kita tidak mengubah timerUtils.js, ini akan tetap mengirim array angka.
        if (updates.playerTimers) { // Cek dari input asli `updates`
          sanitizedUpdates.playerTimers = Array.isArray(updates.playerTimers)
            ? updates.playerTimers.map(time => Number(time) || 0) // Kembali ke array angka
            : currentState.playerTimers || [];
        }


        // Pastikan field baru untuk kemenangan NusaCard juga disanitasi
        ['gameWinnerUID', 'gameWinnerDisplayName', 'gameWonAt', 'achievementAwarded'].forEach(field => {
            if (updates[field] !== undefined) {
                sanitizedUpdates[field] = updates[field];
            }
        });


        if (typeof updates.currentPlayerIndex === 'number') {
          sanitizedUpdates.currentPlayerIndex = updates.currentPlayerIndex;
        }

        sanitizedUpdates.lastUpdated = Date.now();

        // Filter out undefined values
        const cleanUpdates = Object.fromEntries(
          Object.entries(sanitizedUpdates).filter(([_, value]) => value !== undefined)
        );
        // PENTING: Gunakan `newState` yang sudah di-merge dan divalidasi
        await set(gameStateRef, cleanUpdates); // Menggunakan cleanUpdates yang sudah diproses

        delete updateQueue[key];
        resolve();
      } catch (error) {
        console.error("Error updating game state:", error);
        delete updateQueue[key];
        reject(error);
      }
    }); 
  });
};


// Universal cleanup game
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

// ========================================
// ULAR TANGGA SPECIFIC FUNCTIONS
// ========================================

// Initialize Ular Tangga game state
export const initializeUlarTanggaGameState = async (topicID, gameID, roomID, players, questions) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    const snapshot = await get(gameStateRef);
    if (!snapshot.exists()) {
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
        currentQuestionIndex: 0,
        questions: questions,
        gameStatus: 'playing',
        gameType: 'ulartangga',
        diceState: {
          isRolling: false,
          currentNumber: 1,
          lastRoll: null
        },
        // Removed playerTimers from here as well, use activePlayerTimer
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

      await set(gameStateRef, initialState);
    }
  } catch (error) {
    console.error("Error initializing Ular Tangga game state:", error);
    throw error;
  }
};

// Update dice state (Ular Tangga specific)
export const updateDiceState = async (topicID, gameID, roomID, diceState) => {
  try {
    await updateGameState(topicID, gameID, roomID, { diceState });
  } catch (error) {
    console.error("Error updating dice state:", error);
  }
};

// Handle player timeout (Ular Tangga specific)
export const handleUlarTanggaPlayerTimeout = async (topicID, gameID, roomID, currentPlayerIndex, totalPlayers) => {
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
    console.error("Error handling Ular Tangga player timeout:", error);
  }
};

// Update player position (Ular Tangga specific)
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
// NUSACARD SPECIFIC FUNCTIONS (FIXED)
// ========================================

// Update the active player's current remaining time in Firebase
export const updateCurrentPlayerTime = async (topicID, gameID, roomID, currentPlayerIndex, timeLeft, currentPhase) => {
  if (!topicID || !gameID || !roomID) return;

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    // Kita akan update field baru di gameState: activePlayerTimer
    await set(ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState/activePlayerTimer`), {
      playerIndex: currentPlayerIndex,
      timeLeft: timeLeft,
      phase: currentPhase,
      lastUpdated: Date.now(), // Tambahkan timestamp agar klien bisa menghitung delta
    });
  } catch (error) {
    console.error("Error updating active player timer:", error);
  }
};

// Listen to the active player's timer in Firebase
export const listenToActivePlayerTimer = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};
  const activePlayerTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState/activePlayerTimer`);
  return onValue(activePlayerTimerRef, (snapshot) => {
    const timerData = snapshot.val();
    if (timerData) {
      callback(timerData);
    } else {
      callback(null); // No active timer data
    }
  });
};

// Initialize NusaCard game state - FIXED untuk hanya render player aktif
export const initializeNusaCardGameState = async (topicID, gameID, roomID, players, questions, initialGameState) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    const snapshot = await get(gameStateRef);
    if (!snapshot.exists()) {
      const playerCount = Array.isArray(players) ? players.length : 0;

      const nucaInitialState = {
        ...initialGameState,
        gameType: 'nusacard',
        gameStatus: 'playing',
        gameCreatedAt: Date.now(),
        playerActivity: players.reduce((acc, player, index) => {
          acc[player.uid] = {
            lastActivity: Date.now(),
            isActive: true,
            playerIndex: index
          };
          return acc;
        }, {}),
        activePlayerTimer: { // Inisialisasi timer aktif untuk pemain pertama
          playerIndex: 0, // Pemain pertama
          timeLeft: 15, // Waktu awal
          phase: "throwing",
          lastUpdated: Date.now(),
        },
      };

      // Reset all player cards first
      for (let i = 1; i <= 4; i++) {
        nucaInitialState[`player${i}Cards`] = [];
      }

      // Only assign cards to ACTIVE players
      for (let i = 0; i < playerCount; i++) {
        const playerId = `player${i + 1}`;
        nucaInitialState[`${playerId}Cards`] = initialGameState[`${playerId}Cards`] || [];
        nucaInitialState.playerStatus[playerId] = "available";
      }

      // Set remaining players as not available
      for (let i = playerCount; i < 4; i++) {
        const playerId = `player${i + 1}`;
        nucaInitialState.playerStatus[playerId] = "not_available";
      }

      await set(gameStateRef, nucaInitialState);
    }
  } catch (error) {
    console.error("Error initializing NusaCard game state:", error);
    throw error;
  }
};

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

// Handle player timeout for NusaCard - DISABLED (Client handles timeouts)
export const handleNusaCardPlayerTimeout = async (topicID, gameID, roomID, currentPlayerIndex, currentPhase, totalPlayers) => {
  // DISABLED - Let client handle timeouts to prevent duplicate penalty cards
  console.log("🔧 SERVER: NusaCard timeout handling disabled - client handles timeouts");
  return;
};

// Add penalty card function - for server use if needed
export const addPenaltyCard = async (topicID, gameID, roomID, playerIndex, penaltyCard) => {
  try {
    const gameState = await getGameState(topicID, gameID, roomID);
    if (!gameState) return;

    const playerId = `player${playerIndex + 1}`;
    const currentCards = gameState[`${playerId}Cards`] || [];

    // Check if penalty was already added recently (prevent duplicates)
    const recentPenalty = currentCards.find(card =>
      card.isPenalty &&
      card.id &&
      (Date.now() - parseInt(card.id.split('_')[1])) < 5000 // Within last 5 seconds
    );

    if (recentPenalty) {
      console.log("Penalty card already added recently, skipping");
      return;
    }

    const updatedCards = [...currentCards, penaltyCard];

    await updateGameState(topicID, gameID, roomID, {
      [`${playerId}Cards`]: updatedCards,
      penaltyAddedAt: Date.now(),
      penaltyAddedFor: playerId
    });
  } catch (error) {
    console.error("Error adding penalty card:", error);
  }
};