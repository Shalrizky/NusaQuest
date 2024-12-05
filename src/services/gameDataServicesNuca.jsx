// Import fungsi-fungsi dari firebaseConfig untuk interaksi dengan Realtime Database
import { database, ref, onValue, set, get, update, remove } from "../firebaseConfig";
import { resetRoom } from "./roomDataServices";

/**
 * Fungsi untuk mengambil data pemain yang berada di dalam suatu room
 * Berdasarkan topicID, gameID, dan roomID, kemudian mengembalikan array pemain.
 */
export const fetchNusaCardPlayers = (topicID, gameID, roomID, callback) => {
  // Pastikan parameter lengkap
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for fetchNusaCardPlayers");
    return () => {};
  }

  // Referensi lokasi pemain dalam struktur data: rooms/topicID/gameID/roomID/players
  const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);

  // Mendaftarkan listener 'onValue' untuk menangkap setiap perubahan pada data players
  return onValue(playersRef, (snapshot) => {
    const playersData = snapshot.val() || {};
    const playersArray = Object.values(playersData); // Konversi objek menjadi array
    callback(playersArray); // Jalankan callback dengan data pemain
  });
};

/**
 * Set status permainan (misalnya: "waiting", "playing", "finished").
 */
export const setNusaCardGameStatus = async (topicID, gameID, roomID, status) => {
  if (!topicID || !gameID || !roomID) return;

  const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
  try {
    await set(gameStatusRef, status);
  } catch (error) {
    console.error("Error setting NusaCard game status:", error);
  }
};

/**
 * Mendengarkan perubahan status permainan secara real-time.
 */
export const listenToNusaCardGameStatus = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};

  const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
  return onValue(gameStatusRef, (snapshot) => {
    callback(snapshot.val());
  });
};

/**
 * Inisialisasi state permainan NusaCard untuk pertama kali.
 * Menentukan jumlah deck sesuai dengan jumlah pemain, serta mengatur DECK_ORDER.
 * Pastikan hanya deck yang sesuai jumlah pemain yang dibuat, agar tidak muncul deck 0.
 */
export const initializeNusaCardGameState = async (topicID, gameID, roomID, players) => {
  if (!topicID || !gameID || !roomID || !players) {
    console.error("Missing parameters for initializeNusaCardGameState");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);

  try {
    // Buat deckCounts dinamis: minimal ada 'bottom'
    const deckCounts = { bottom: 4 };
    if (players.length > 1) deckCounts.top = 4;
    if (players.length > 2) deckCounts.left = 4;
    if (players.length > 3) deckCounts.right = 4;

    // Buat DECK_ORDER dinamis berdasarkan jumlah pemain
    let DECK_ORDER = ['bottom'];
    if (players.length === 2) {
      DECK_ORDER = ['bottom', 'top'];
    } else if (players.length === 3) {
      DECK_ORDER = ['bottom', 'left', 'right'];
    } else if (players.length === 4) {
      DECK_ORDER = ['bottom', 'left', 'top', 'right'];
    }

    const initialState = {
      players: players,
      currentPlayerIndex: 0,
      gameStatus: 'playing', // Status saat game dimulai
      deckCounts: deckCounts,
      DECK_ORDER: DECK_ORDER,
      cards: Array.from({ length: 4 }, () => getRandomQuestion()),
      hints: [],
      lastActiveDeck: null,
      isShuffling: false,
      victory: false, // Mulai dari false
      winner: "",
      deckDepleted: null,
    };

    await set(gameStateRef, initialState);
    console.log("Game state berhasil diinisialisasi.");
  } catch (error) {
    console.error("Error initializing NusaCard game state:", error);
  }
};

/**
 * Mendengarkan perubahan pada state permainan secara real-time.
 * Setiap ada perubahan, callback akan dipanggil dengan state terbaru.
 */
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

/**
 * Memperbarui state permainan dengan validasi agar tidak menimpa state yang tidak perlu.
 */
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

    // Sanitasi updates agar tidak merusak struktur data
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
    };

    await update(gameStateRef, sanitizedUpdates);
  } catch (error) {
    console.error("Error updating NusaCard game state:", error);
  }
};

/**
 * Mendapatkan state permainan saat ini.
 */
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

/**
 * Reset state game NusaCard, biasanya saat permainan selesai atau akan dimulai ulang.
 */
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

/**
 * Inisialisasi timer permainan jika diperlukan.
 */
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

/**
 * Update timer permainan jika waktu berubah.
 */
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

/**
 * Hentikan timer permainan.
 */
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

/**
 * Mendengarkan perubahan timer secara real-time.
 */
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

/**
 * Set pemenang game saat permainan berakhir.
 */
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

/**
 * Membersihkan data game saat selesai atau tidak digunakan lagi.
 */
export const cleanupNusaCardGame = async (topicID, gameID, roomID, user) => {
  if (!topicID || !gameID || !roomID || !user?.uid) {
    console.error("Missing parameters for cleanupNusaCardGame");
    return;
  }

  try {
    const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
    await remove(gameStateRef);

    const gameTimerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameTimer`);
    await remove(gameTimerRef);

    await setNusaCardGameStatus(topicID, gameID, roomID, null);

    const chatRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/chatMessages`);
    await remove(chatRef);

    const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
    await remove(playersRef);

    // Reset total room jika diperlukan
    await resetRoom(topicID, gameID, roomID);
  } catch (error) {
    console.error("Error cleaning up NusaCard game:", error);
  }
};

/**
 * Fungsi utilitas untuk mendapatkan pertanyaan acak.
 * Ganti dengan logika pertanyaan yang sebenarnya jika diperlukan.
 */
export const getRandomQuestion = () => {
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
    // Tambahkan pertanyaan lain sesuai kebutuhan
  ];

  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
};
