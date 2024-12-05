import { database, ref, onValue, set, get, update, remove } from "../firebaseConfig";
import { resetRoom } from "./roomDataServices"; 

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

export const setNusaCardGameStatus = async (topicID, gameID, roomID, status) => {
  if (!topicID || !gameID || !roomID) return;

  const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
  try {
    await set(gameStatusRef, status);
  } catch (error) {
    console.error("Error setting NusaCard game status:", error);
  }
};

export const listenToNusaCardGameStatus = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) return () => {};

  const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
  return onValue(gameStatusRef, (snapshot) => {
    callback(snapshot.val());
  });
};

export const initializeNusaCardGameState = async (topicID, gameID, roomID, players) => {
  if (!topicID || !gameID || !roomID || !players) {
    console.error("Missing parameters for initializeNusaCardGameState");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);

  try {
    const playerCount = players.length;
    let deckCounts = { bottom: 4 };
    let DECK_ORDER = ['bottom'];

    if (playerCount === 2) {
      deckCounts.top = 4;
      DECK_ORDER = ['bottom', 'top'];
    } else if (playerCount === 3) {
      deckCounts.left = 4;
      deckCounts.right = 4;
      DECK_ORDER = ['bottom', 'left', 'right'];
    } else if (playerCount === 4) {
      deckCounts.left = 4;
      deckCounts.top = 4;
      deckCounts.right = 4;
      DECK_ORDER = ['bottom', 'left', 'top', 'right'];
    }

    const initialState = {
      players: players,
      currentPlayerIndex: 0,
      gameStatus: 'playing',
      deckCounts: deckCounts,
      DECK_ORDER: DECK_ORDER,
      cards: Array.from({ length: 4 }, () => getRandomQuestion()),
      hints: [],
      lastActiveDeck: null,
      isShuffling: false,
      victory: false,
      winner: "",
      deckDepleted: null,
    };

    await set(gameStateRef, initialState);
    console.log("Game state berhasil diinisialisasi.");
  } catch (error) {
    console.error("Error initializing NusaCard game state:", error);
  }
};

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

    const sanitizedUpdates = {
      ...updates,
      deckCounts: updates.deckCounts
        ? { ...currentState.deckCounts, ...updates.deckCounts }
        : currentState.deckCounts,
      cards: updates.cards || currentState.cards,
      hints: updates.hints || currentState.hints,
    };

    await update(gameStateRef, sanitizedUpdates);
  } catch (error) {
    console.error("Error updating NusaCard game state:", error);
  }
};

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

export const resetNusaCardGameState = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing parameters for resetNusaCardGameState");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    await remove(gameStateRef);
    console.log("Game state direset menjadi bersih.");
  } catch (error) {
    console.error("Error resetting NusaCard game state:", error);
  }
};

// Fungsi dapat disesuaikan untuk timer, winner, dll.
// Misalnya setNusaCardGameWinner, cleanupNusaCardGame, dsb.

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
  ];

  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
};
