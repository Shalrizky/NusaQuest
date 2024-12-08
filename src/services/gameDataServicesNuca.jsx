// gameDataServicesNuca.js

import { database, ref, onValue, set, get, update, remove } from "../firebaseConfig";

/** Constants **/
const INITIAL_DECK_COUNT = 4;
const TURN_TIMER_DURATION = 10; // seconds
const QUESTION_TIMER_DURATION = 15; // seconds
const FEEDBACK_DURATION = 3000; // milliseconds
const POPUP_TRANSITION_DURATION = 2000; // milliseconds

/** Utility Function to Get a Random Question **/
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
    // Tambahkan lebih banyak pertanyaan sesuai kebutuhan
  ];

  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
};

/** Fetch NusaCard Players **/
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

/** Set NusaCard Game Status **/
export const setNusaCardGameStatus = async (topicID, gameID, roomID, status) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for setNusaCardGameStatus");
    return;
  }

  const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
  try {
    await set(gameStatusRef, status);
    console.log(`Game status set to "${status}" successfully.`);
  } catch (error) {
    console.error("Error setting NusaCard game status:", error);
  }
};

/** Initialize NusaCard Game State **/
export const initializeNusaCardGameState = async (topicID, gameID, roomID, players) => {
  if (!topicID || !gameID || !roomID || !players) {
    console.error("Missing parameters for initializeNusaCardGameState");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);

  const playerCount = players.length;
  let deckCounts = { bottom: INITIAL_DECK_COUNT };
  let DECK_ORDER = ["bottom"];

  if (playerCount === 2) {
    deckCounts.top = INITIAL_DECK_COUNT;
    DECK_ORDER = ["bottom", "top"];
  } else if (playerCount === 3) {
    deckCounts.left = INITIAL_DECK_COUNT;
    deckCounts.right = INITIAL_DECK_COUNT;
    DECK_ORDER = ["bottom", "left", "right"];
  } else if (playerCount === 4) {
    deckCounts.left = INITIAL_DECK_COUNT;
    deckCounts.top = INITIAL_DECK_COUNT;
    deckCounts.right = INITIAL_DECK_COUNT;
    DECK_ORDER = ["bottom", "left", "top", "right"];
  }

  const initialState = {
    players: players,
    currentPlayerIndex: 0,
    gameStatus: "playing",
    deckCounts: deckCounts,
    DECK_ORDER: DECK_ORDER,
    cards: Array.from({ length: INITIAL_DECK_COUNT }, () => getRandomQuestion()),
    hints: [],
    lastActiveDeck: null,
    isShuffling: false,
    victory: false,
    winner: "",
    deckDepleted: null,
    showPopup: false,
    activeCard: null,
    playerWhoPlayed: null, // Menambahkan field untuk pelaku kartu
    hasAnswered: false,
    isActionInProgress: false,
    answeringPlayer: null,
    isCorrectAnswer: null,
    feedbackIcon: { show: false, isCorrect: null, position: null },
  };

  try {
    await set(gameStateRef, initialState);
    console.log("NusaCard game state initialized successfully.");
  } catch (error) {
    console.error("Error initializing NusaCard game state:", error);
  }
};

/** Get NusaCard Game State **/
export const getNusaCardGameState = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for getNusaCardGameState");
    return null;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    const snapshot = await get(gameStateRef);
    const state = snapshot.val();
    console.log("Fetched NusaCard game state:", state);
    return state;
  } catch (error) {
    console.error("Error getting NusaCard game state:", error);
    return null;
  }
};

/** Update NusaCard Game State with Validation **/
export const updateNusaCardGameState = async (topicID, gameID, roomID, updates) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for updateNusaCardGameState");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);

  try {
    // Fetch current state
    const snapshot = await get(gameStateRef);
    const currentState = snapshot.val();

    if (!currentState) {
      console.error("Current NusaCard game state does not exist.");
      return;
    }

    // Sanitize and validate updates
    const sanitizedUpdates = {
      ...updates,
      // Ensure deckCounts is properly merged
      deckCounts: updates.deckCounts
        ? { ...currentState.deckCounts, ...updates.deckCounts }
        : currentState.deckCounts,

      // Ensure DECK_ORDER remains consistent
      DECK_ORDER: updates.DECK_ORDER || currentState.DECK_ORDER,

      // Ensure cards array is maintained
      cards: updates.cards ? updates.cards : currentState.cards,

      // Ensure other properties are correctly updated
      lastActiveDeck:
        updates.lastActiveDeck !== undefined
          ? updates.lastActiveDeck
          : currentState.lastActiveDeck,

      isShuffling:
        updates.isShuffling !== undefined
          ? updates.isShuffling
          : currentState.isShuffling,

      victory:
        updates.victory !== undefined ? updates.victory : currentState.victory,

      winner:
        updates.winner !== undefined ? updates.winner : currentState.winner,

      deckDepleted:
        updates.deckDepleted !== undefined
          ? updates.deckDepleted
          : currentState.deckDepleted,

      showPopup:
        updates.showPopup !== undefined ? updates.showPopup : currentState.showPopup,

      activeCard:
        updates.activeCard !== undefined ? updates.activeCard : currentState.activeCard,

      playerWhoPlayed:
        updates.playerWhoPlayed !== undefined
          ? updates.playerWhoPlayed
          : currentState.playerWhoPlayed,

      hasAnswered:
        updates.hasAnswered !== undefined ? updates.hasAnswered : currentState.hasAnswered,

      isActionInProgress:
        updates.isActionInProgress !== undefined
          ? updates.isActionInProgress
          : currentState.isActionInProgress,

      answeringPlayer:
        updates.answeringPlayer !== undefined
          ? updates.answeringPlayer
          : currentState.answeringPlayer,

      isCorrectAnswer:
        updates.isCorrectAnswer !== undefined
          ? updates.isCorrectAnswer
          : currentState.isCorrectAnswer,

      feedbackIcon: updates.feedbackIcon
        ? { ...currentState.feedbackIcon, ...updates.feedbackIcon }
        : currentState.feedbackIcon,
    };

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(sanitizedUpdates).filter(([_, value]) => value !== undefined)
    );

    // Update state in Firebase
    await update(gameStateRef, cleanUpdates);
    console.log("NusaCard game state updated successfully:", cleanUpdates);
  } catch (error) {
    console.error("Error updating NusaCard game state:", error);
  }
};

/** Listen to NusaCard Game State **/
export const listenToNusaCardGameState = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for listenToNusaCardGameState");
    return () => {};
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  return onValue(gameStateRef, (snapshot) => {
    const state = snapshot.val();
    if (state) {
      console.log("Real-time game state update received:", state);
      callback(state);
    }
  });
};

/** Reset NusaCard Game State **/
export const resetNusaCardGameState = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for resetNusaCardGameState");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  try {
    await remove(gameStateRef);
    console.log("NusaCard game state has been reset.");
  } catch (error) {
    console.error("Error resetting NusaCard game state:", error);
  }
};

/** Check Victory Condition **/
export const checkVictoryCondition = (state) => {
  const { deckCounts, cards, deckDepleted, victory } = state;
  if (victory) return { victory, winner: state.winner, deckDepleted };

  for (const [deck, count] of Object.entries(deckCounts)) {
    if (count === 0 && !deckDepleted) {
      return { deckDepleted: deck, victory: true, winner: deck };
    }
  }

  if (cards.length === 0 && !deckDepleted) {
    return { deckDepleted: "bottom", victory: true, winner: "bottom" };
  }

  return { deckDepleted: null, victory: false, winner: null };
};

/** Cleanup NusaCard Game **/
export const cleanupNusaCardGame = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for cleanupNusaCardGame");
    return;
  }

  try {
    // Reset game state
    await resetNusaCardGameState(topicID, gameID, roomID);

    // Reset game status to null or default
    await setNusaCardGameStatus(topicID, gameID, roomID, null);

    // Optionally, remove other game-related data if necessary
    // Example: Remove chat messages, hints, etc.
    const chatRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/chatMessages`);
    await remove(chatRef);

    // Reset players if needed
    const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
    await remove(playersRef);

    console.log("NusaCard game cleaned up successfully.");
  } catch (error) {
    console.error("Error cleaning up NusaCard game:", error);
  }
};

/** Submit Player Answer **/
export const submitPlayerAnswer = async (topicID, gameID, roomID, playerID, isCorrect) => {
  if (!topicID || !gameID || !roomID || !playerID) {
    console.error("Missing required parameters for submitPlayerAnswer");
    return;
  }

  const answersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/answers/${playerID}`);
  try {
    await set(answersRef, {
      isCorrect,
      timestamp: Date.now(),
    });
    console.log(`Player ${playerID} submitted an answer: ${isCorrect}`);
  } catch (error) {
    console.error("Error submitting player answer:", error);
  }
};

/** Listen to Player Answers **/
export const listenToPlayerAnswers = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for listenToPlayerAnswers");
    return () => {};
  }

  const answersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/answers`);
  return onValue(answersRef, (snapshot) => {
    const answersData = snapshot.val() || {};
    callback(answersData);
  });
};
