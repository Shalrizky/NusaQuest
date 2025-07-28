import { database, ref, onValue, set, get } from "../firebaseConfig";
import { resetRoom } from "./roomDataServices"; 

// Menyimpan referensi timer setTimeout agar pembaruan ke Firebase tidak terlalu sering terjadi.
let updateQueue = {};

// ? ========================================
// ? FUNGSI UNIVERSAL (Untuk Kedua Jenis Permainan)
// ? ========================================

/**
 * @function fetchGames
 * @description Mendengarkan dan mengambil semua data permainan dari Firebase secara real-time.
 * Data ini biasanya mewakili daftar game yang tersedia atau sedang berjalan.
 * @param {function(Object): void} callback - Fungsi callback yang akan dipanggil setiap kali data permainan berubah.
 * Parameter callback akan menerima objek yang berisi data semua game.
 * @returns {function(): void} Fungsi untuk berhenti mendengarkan perubahan (unsubscribe) saat tidak lagi diperlukan.
 */
export const fetchGames = (callback) => {
  const gamesRef = ref(database, "games");
  onValue(gamesRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  });
};

/**
 * @function fetchGamePlayers
 * @description Mendengarkan dan mengambil data pemain dalam suatu ruangan permainan tertentu secara real-time.
 * Data ini mencakup daftar pemain yang saat ini berada dalam ruangan game tersebut.
 * @param {string} topicID - ID unik topik permainan (misalnya "MateriSejarah").
 * @param {string} gameID - ID unik jenis permainan (misalnya "NusaCard", "UlarTangga").
 * @param {string} roomID - ID unik ruangan permainan spesifik.
 * @param {function(Array): void} callback - Fungsi callback yang akan dipanggil setiap kali data pemain berubah.
 * Parameter callback akan menerima array objek pemain.
 * @returns {function(): void} Fungsi untuk berhenti mendengarkan perubahan (unsubscribe).
 * Mengembalikan fungsi kosong jika parameter yang diperlukan tidak ada.
 */
export const fetchGamePlayers = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for fetchGamePlayers");
    return () => {};
  }
  const playersRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/players`
  );
  return onValue(playersRef, (snapshot) => {
    const playersData = snapshot.val() || {};
    const playersArray = Object.values(playersData); 
    callback(playersArray);
  });
};

/**
 * @function setGameStatus
 * @description Mengatur status keseluruhan dari sebuah ruangan permainan.
 * Contoh status: "playing", "finished", "abandoned", atau `null` untuk menghapus status.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {string|null} status - Status permainan yang akan diatur.
 * @returns {Promise<void>} Sebuah Promise yang akan selesai ketika operasi `set` berhasil atau gagal.
 */
export const setGameStatus = async (topicID, gameID, roomID, status) => {
  if (!topicID || !gameID || !roomID) return;
  const gameStatusRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameStatus`
  );
  try {
    await set(gameStatusRef, status);
  } catch (error) {
    console.error("Error setting game status:", error);
  }
};

/**
 * @function setGameStartStatus
 * @description Mengatur status apakah permainan telah dimulai atau belum.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {boolean} isStarting - `true` jika permainan telah dimulai, `false` jika belum.
 * @returns {Promise<void>} Sebuah Promise yang akan selesai ketika operasi `set` berhasil atau gagal.
 */
export const setGameStartStatus = async (
  topicID,
  gameID,
  roomID,
  isStarting
) => {
  if (!topicID || !gameID || !roomID) return;
  const gameStartRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameStarted`
  );
  try {
    await set(gameStartRef, isStarting);
  } catch (error) {
    console.error("Error setting game start status:", error);
  }
};

/**
 * @function listenToGameStart
 * @description Mendengarkan perubahan status `gameStarted` untuk ruangan permainan tertentu secara real-time.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {function(boolean): void} callback - Fungsi callback yang akan dipanggil dengan status `gameStarted` (boolean).
 * @returns {function(): void} Fungsi untuk berhenti mendengarkan perubahan (unsubscribe).
 * Mengembalikan fungsi kosong jika parameter yang diperlukan tidak ada.
 */
export const listenToGameStart = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};
  const gameStartRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameStarted`
  );
  return onValue(gameStartRef, (snapshot) => {
    callback(snapshot.val());
  });
};

/**
 * @function listenToGameState
 * @description Mendengarkan perubahan status permainan (gameState) universal secara real-time.
 * `gameState` biasanya menyimpan semua data dinamis tentang jalannya permainan (misalnya, posisi pion, kartu, giliran).
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {function(Object): void} callback - Fungsi callback yang akan dipanggil dengan objek `gameState` yang diperbarui.
 * @returns {function(): void} Fungsi untuk berhenti mendengarkan perubahan (unsubscribe).
 * Mengembalikan fungsi kosong jika parameter yang diperlukan tidak ada.
 */
export const listenToGameState = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};
  const gameStateRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameState`
  );
  return onValue(gameStateRef, (snapshot) => {
    const state = snapshot.val();
    if (state) {
      callback(state);
    }
  });
};

/**
 * @function getGameState
 * @description Mengambil status permainan (gameState) saat ini satu kali dari Firebase.
 * Tidak mendengarkan perubahan real-time.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @returns {Promise<Object|null>} Sebuah Promise yang akan selesai dengan objek `gameState` atau `null` jika tidak ada data.
 * Mengembalikan `null` jika terjadi error.
 */
export const getGameState = async (topicID, gameID, roomID) => {
  const gameStateRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameState`
  );
  try {
    const snapshot = await get(gameStateRef);
    return snapshot.val();
  } catch (error) {
    console.error("Error getting game state:", error);
    return null;
  }
};

/**
 * @function updatePlayerActivity
 * @description Memperbarui timestamp aktivitas terakhir pemain tertentu di Firebase.
 * Ini penting untuk mekanisme deteksi pemain tidak aktif atau AFK.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {string} userUID - UID (User ID) dari pemain yang aktivitasnya akan diperbarui.
 * @returns {Promise<void>} Sebuah Promise yang akan selesai ketika aktivitas pemain berhasil diperbarui.
 */
export const updatePlayerActivity = async (
  topicID,
  gameID,
  roomID,
  userUID
) => {
  if (!topicID || !gameID || !roomID || !userUID) return;

  const activityRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameState/playerActivity/${userUID}`
  );
  try {
    const snapshot = await get(activityRef);
    if (snapshot.exists()) {
      await set(activityRef, {
        ...snapshot.val(),
        lastActivity: Date.now(),
        isActive: true,
      });
    }
  } catch (error) {
    console.error("Error updating player activity:", error);
  }
};

/**
 * @function checkInactivePlayers
 * @description Memeriksa semua pemain dalam ruangan untuk mendeteksi siapa yang tidak aktif.
 * Jika ada pemain yang tidak aktif melebihi `inactivityTimeout`, permainan akan ditandai sebagai `abandoned`.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {number} [inactivityTimeout=300000] - Batas waktu tidak aktif dalam milidetik (default: 5 menit atau 300.000 ms).
 * @returns {Promise<boolean>} Sebuah Promise yang selesai dengan `true` jika permainan diakhiri karena ketidakaktifan, `false` jika permainan masih aktif.
 */
export const checkInactivePlayers = async (
  topicID,
  gameID,
  roomID,
  inactivityTimeout = 300000
) => {
  if (!topicID || !gameID || !roomID) return;

  const gameStateRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameState`
  );
  try {
    const snapshot = await get(gameStateRef);
    const gameState = snapshot.val();

    if (!gameState || !gameState.playerActivity) return;

    const now = Date.now();
    const playerActivity = gameState.playerActivity;

    for (const [userUID, activity] of Object.entries(playerActivity)) {
      const timeSinceLastActivity = now - activity.lastActivity;

      if (timeSinceLastActivity >= inactivityTimeout && activity.isActive) {
        console.log(
          `Player ${userUID} tidak aktif selama ${timeSinceLastActivity}ms, mengakhiri game...`
        );

        await updateGameState(topicID, gameID, roomID, {
          gameStatus: "abandoned",
          abandonedBy: userUID,
          abandonedAt: now,
          reason: "player_inactive",
          [`playerActivity/${userUID}/isActive`]: false, 
        });
        await stopGameTimer(topicID, gameID, roomID);
        return true;
      }
    }

    return false; 
  } catch (error) {
    console.error("Error checking inactive players:", error);
    return false;
  }
};

/**
 * @function initializeGameTimer
 * @description Menginisialisasi timer global untuk permainan.
 * Jika timer sudah ada di Firebase, fungsi ini tidak akan melakukan apa-apa.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {number} duration - Durasi total permainan yang diinginkan dalam detik.
 * @returns {Promise<void>} Sebuah Promise yang akan selesai ketika timer berhasil diinisialisasi atau jika sudah ada.
 */
export const initializeGameTimer = async (
  topicID,
  gameID,
  roomID,
  duration
) => {
  const gameTimerRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameTimer`
  );
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
    console.error("Error initializing game timer:", error);
  }
};

/**
 * @function stopGameTimer
 * @description Menghentikan timer global permainan dengan mengatur properti `isActive` menjadi `false` di Firebase.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @returns {Promise<void>} Sebuah Promise yang akan selesai ketika timer berhasil dihentikan.
 */
export const stopGameTimer = async (topicID, gameID, roomID) => {
  const gameTimerRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameTimer`
  );
  try {
    await set(gameTimerRef, {
      isActive: false, 
    });
  } catch (error) {
    console.error("Error stopping game timer:", error);
  }
};

/**
 * @function listenToGameTimer
 * @description Mendengarkan perubahan timer global permainan secara real-time.
 * Fungsi ini menghitung sisa waktu berdasarkan `startTime` dan `duration` yang disimpan di Firebase.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {function(number): void} callback - Fungsi callback yang akan dipanggil dengan sisa waktu dalam detik.
 * @returns {function(): void} Fungsi untuk berhenti mendengarkan perubahan (unsubscribe).
 * Mengembalikan fungsi kosong jika parameter yang diperlukan tidak ada.
 */
export const listenToGameTimer = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};
  const gameTimerRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameTimer`
  );
  return onValue(gameTimerRef, (snapshot) => {
    const timerData = snapshot.val();
    if (timerData && timerData.isActive) {
      const elapsedTime = Math.floor((Date.now() - timerData.startTime) / 1000);
      const remainingTime = Math.max(0, timerData.duration - elapsedTime);
      callback(remainingTime);
    }
  });
};

/**
 * @function updateGameState
 * @description Memperbarui status permainan secara universal dengan menerapkan debouncing.
 * Fungsi ini dirancang untuk menangani pembaruan data yang bertingkat (nested) menggunakan notasi path
 * (misalnya `playerActivity/uid/isActive`) dan melakukan merge data yang bijaksana.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {Object} updates - Objek yang berisi pembaruan status permainan. Kunci dapat berupa path bertingkat.
 * @returns {Promise<void>} Sebuah Promise yang akan selesai setelah pembaruan diterapkan ke Firebase.
 * Promise akan ditolak jika terjadi error.
 */
export const updateGameState = async (topicID, gameID, roomID, updates) => {
  const key = `${topicID}-${gameID}-${roomID}`;

  // Clear previous timeout to debounce updates
  if (updateQueue[key]) {
    clearTimeout(updateQueue[key]);
  }

  return new Promise((resolve, reject) => {
    updateQueue[key] = setTimeout(async () => {
      try {
        const gameStateRef = ref(
          database,
          `rooms/${topicID}/${gameID}/${roomID}/gameState`
        );
        const snapshot = await get(gameStateRef);
        const currentState = snapshot.val() || {};

        let newState = { ...currentState }; 

        const applyUpdates = (target, source) => {
          for (const key in source) {
            if (key.includes("/")) {
              const pathParts = key.split("/");
              let currentTarget = target;
              for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i];
                if (i === pathParts.length - 1) {
                  currentTarget[part] = source[key];
                } else {
                  if (
                    !currentTarget[part] ||
                    typeof currentTarget[part] !== "object"
                  ) {
                    currentTarget[part] = {};
                  }
                  currentTarget = currentTarget[part];
                }
              }
            } else if (
              typeof source[key] === "object" &&
              source[key] !== null &&
              !Array.isArray(source[key]) &&
              typeof target[key] === "object" &&
              target[key] !== null
            ) {
              target[key] = { ...target[key], ...source[key] };
            } else {
              target[key] = source[key];
            }
          }
        };

        applyUpdates(newState, updates);

        const sanitizedUpdates = { ...newState };
        if (updates.playerTimers) {
          sanitizedUpdates.playerTimers = Array.isArray(updates.playerTimers)
            ? updates.playerTimers.map((time) => Number(time) || 0) 
            : currentState.playerTimers || [];
        }
        [
          "gameWinnerUID",
          "gameWinnerDisplayName",
          "gameWonAt",
          "achievementAwarded",
        ].forEach((field) => {
          if (updates[field] !== undefined) {
            sanitizedUpdates[field] = updates[field];
          }
        });

        if (typeof updates.currentPlayerIndex === "number") {
          sanitizedUpdates.currentPlayerIndex = updates.currentPlayerIndex;
        }

        sanitizedUpdates.lastUpdated = Date.now();

        const cleanUpdates = Object.fromEntries(
          Object.entries(sanitizedUpdates).filter(
            ([_, value]) => value !== undefined
          )
        );
        await set(gameStateRef, cleanUpdates); 

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

/**
 * @function cleanupGame
 * @description Melakukan pembersihan menyeluruh untuk data permainan di Firebase.
 * Ini termasuk mereset `gameState`, `gameTimer`, `gameStatus`, `gameStarted`,
 * menghapus pesan chat, data pemain, dan mereset data ruangan secara keseluruhan.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {Object} user - Objek pengguna yang memicu cleanup (harus memiliki `uid`).
 * @param {string} [reason="normal"] - Alasan pembersihan (misalnya "inactivity" jika disebabkan oleh pemain tidak aktif).
 * @returns {Promise<void>} Sebuah Promise yang akan selesai setelah pembersihan selesai.
 */
export const cleanupGame = async (
  topicID,
  gameID,
  roomID,
  user,
  reason = "normal"
) => {
  if (!topicID || !gameID || !roomID || !user?.uid) return;

  try {
    if (reason === "inactivity") {
      await updateGameState(topicID, gameID, roomID, {
        gameStatus: "abandoned",
        abandonedBy: user.uid,
        abandonedAt: Date.now(),
        reason: "player_inactive",
      });
    }

    const gameStateRef = ref(
      database,
      `rooms/${topicID}/${gameID}/${roomID}/gameState`
    );
    await set(gameStateRef, null);

    const gameTimerRef = ref(
      database,
      `rooms/${topicID}/${gameID}/${roomID}/gameTimer`
    );
    await set(gameTimerRef, null);

    await setGameStatus(topicID, gameID, roomID, null);
    await setGameStartStatus(topicID, gameID, roomID, false);

    const chatRef = ref(
      database,
      `rooms/${topicID}/${gameID}/${roomID}/chatMessages`
    );
    await set(chatRef, null);

    const playersRef = ref(
      database,
      `rooms/${topicID}/${gameID}/${roomID}/players`
    );
    await set(playersRef, null);

    await resetRoom(topicID, gameID, roomID);
  } catch (error) {
    console.error("Error cleaning up game:", error);
  }
};

// ? ========================================
// ? FUNGSI KHUSUS ULAR TANGGA
// ? ========================================

/**
 * @function initializeUlarTanggaGameState
 * @description Menginisialisasi status permainan awal untuk game Ular Tangga.
 * Ini membuat struktur data dasar yang diperlukan untuk game Ular Tangga di Firebase.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {Array<Object>} players - Array objek pemain yang berpartisipasi dalam game.
 * @param {Array<Object>} questions - Array objek pertanyaan yang akan digunakan dalam game.
 * @returns {Promise<void>} Sebuah Promise yang akan selesai setelah status permainan berhasil diinisialisasi.
 * Jika status sudah ada, fungsi ini tidak akan melakukan apa-apa.
 */
export const initializeUlarTanggaGameState = async (
  topicID,
  gameID,
  roomID,
  players,
  questions
) => {
  const gameStateRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameState`
  );
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
        gameStatus: "playing",
        gameType: "ulartangga",
        diceState: {
          isRolling: false,
          currentNumber: 1,
          lastRoll: null,
        },
        playerActivity: players.reduce((acc, player, index) => {
          acc[player.uid] = {
            lastActivity: Date.now(),
            isActive: true,
            playerIndex: index,
          };
          return acc;
        }, {}),
        gameCreatedAt: Date.now(),
      };

      await set(gameStateRef, initialState);
    }
  } catch (error) {
    console.error("Error initializing Ular Tangga game state:", error);
    throw error;
  }
};

// ? ========================================
// ? FUNGSI KHUSUS NUSACARD 
// ? ========================================

/**
 * @function initializeNusaCardGameState
 * @description Menginisialisasi status permainan awal untuk game NusaCard.
 * Fungsi ini memastikan bahwa hanya pemain yang benar-benar aktif dalam game (berdasarkan array `players`)
 * yang mendapatkan kartu awal dan status yang relevan.
 * @param {string} topicID - ID unik topik permainan.
 * @param {string} gameID - ID unik jenis permainan.
 * @param {string} roomID - ID unik ruangan permainan.
 * @param {Array<Object>} players - Array objek pemain yang berpartisipasi dalam game.
 * @param {Array<Object>} questions - Array objek pertanyaan yang digunakan dalam game.
 * (Catatan: Parameter ini mungkin tidak sepenuhnya digunakan di sini karena `initialGameState` sudah berisi data kartu per pemain).
 * @param {Object} initialGameState - Objek status permainan awal yang dihasilkan di sisi klien (dari `NusaCard.jsx`),
 * yang berisi data kartu per pemain.
 * @returns {Promise<void>} Sebuah Promise yang akan selesai setelah status permainan berhasil diinisialisasi.
 * Jika status sudah ada, fungsi ini tidak akan melakukan inisialisasi ulang.
 */
export const initializeNusaCardGameState = async (
  topicID,
  gameID,
  roomID,
  players,
  questions,
  initialGameState
) => {
  const gameStateRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/gameState`
  );
  try {
    const snapshot = await get(gameStateRef);
    if (!snapshot.exists()) { 
      const playerCount = Array.isArray(players) ? players.length : 0;

      const nucaInitialState = {
        ...initialGameState,
        gameType: "nusacard",
        gameStatus: "playing",
        gameCreatedAt: Date.now(),
        playerActivity: players.reduce((acc, player, index) => {
          acc[player.uid] = {
            lastActivity: Date.now(),
            isActive: true,
            playerIndex: index,
          };
          return acc;
        }, {}), 
        activePlayerTimer: {
          playerIndex: 0, 
          timeLeft: 15, 
          phase: "throwing",
          lastUpdated: Date.now(),
        },
      };

      for (let i = 1; i <= 4; i++) {
        nucaInitialState[`player${i}Cards`] = [];
      }

      for (let i = 0; i < playerCount; i++) {
        const playerId = `player${i + 1}`;
        nucaInitialState[`${playerId}Cards`] =
          initialGameState[`${playerId}Cards`] || []; 
        nucaInitialState.playerStatus[playerId] = "available"; 
      }

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
