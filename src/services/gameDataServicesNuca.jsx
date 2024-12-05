import { database, ref, onValue, set, get, update, remove } from "../firebaseConfig";

/** Konstanta **/
const INITIAL_DECK_COUNT = 4;
const TURN_TIMER_DURATION = 10;
const QUESTION_TIMER_DURATION = 15;
const FEEDBACK_DURATION = 3000;
const POPUP_TRANSITION_DURATION = 2000;

/** Fungsi utilitas pertanyaan **/
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

/** Fungsi mengambil state game dari DB */
async function getGameState(topicID, gameID, roomID) {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  const snapshot = await get(gameStateRef);
  return snapshot.val();
}

/** Fungsi update state game di DB */
async function updateGameState(topicID, gameID, roomID, updates) {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  const snapshot = await get(gameStateRef);
  const currentState = snapshot.val();
  if (!currentState) {
    console.error("Current game state does not exist.");
    return;
  }

  // Merge deckCounts, cards, hints jika perlu
  const sanitizedUpdates = {
    ...updates,
    deckCounts: updates.deckCounts
      ? { ...currentState.deckCounts, ...updates.deckCounts }
      : currentState.deckCounts,
    cards: updates.cards ? updates.cards : currentState.cards,
    hints: updates.hints ? updates.hints : currentState.hints,
  };

  await update(gameStateRef, sanitizedUpdates);
}

/** Cek victory condition */
function checkVictoryCondition(state) {
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
}

/** Eksport fungsi-fungsi yang diperlukan frontend: */

/** Mendengarkan data pemain */
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

/** Mendapatkan state game */
export const getNusaCardGameState = async (topicID, gameID, roomID) => {
  return await getGameState(topicID, gameID, roomID);
};

/** Inisialisasi state game pertama kali */
export const initializeNusaCardGameState = async (topicID, gameID, roomID, players) => {
  if (!topicID || !gameID || !roomID || !players) {
    console.error("Missing parameters for initializeNusaCardGameState");
    return;
  }

  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);

  const playerCount = players.length;
  let deckCounts = { bottom: INITIAL_DECK_COUNT };
  let DECK_ORDER = ['bottom'];

  if (playerCount === 2) {
    deckCounts.top = INITIAL_DECK_COUNT;
    DECK_ORDER = ['bottom', 'top'];
  } else if (playerCount === 3) {
    deckCounts.left = INITIAL_DECK_COUNT;
    deckCounts.right = INITIAL_DECK_COUNT;
    DECK_ORDER = ['bottom', 'left', 'right'];
  } else if (playerCount === 4) {
    deckCounts.left = INITIAL_DECK_COUNT;
    deckCounts.top = INITIAL_DECK_COUNT;
    deckCounts.right = INITIAL_DECK_COUNT;
    DECK_ORDER = ['bottom', 'left', 'top', 'right'];
  }

  const initialState = {
    players: players,
    currentPlayerIndex: 0,
    gameStatus: 'playing',
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
    hasAnswered: false,
    isActionInProgress: false,
    answeringPlayer: null,
    isCorrectAnswer: null,
    turnTimerStart: null,
    turnTimerDuration: TURN_TIMER_DURATION,
    questionTimerStart: null,
    questionTimerDuration: QUESTION_TIMER_DURATION,
    feedbackIcon: { show: false, isCorrect: null, position: null },
  };

  await set(gameStateRef, initialState);
  console.log("Game state berhasil diinisialisasi.");
};

/** Reset state game */
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

/** Set status permainan */
export const setNusaCardGameStatus = async (topicID, gameID, roomID, status) => {
  if (!topicID || !gameID || !roomID) return;

  const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
  try {
    await set(gameStatusRef, status);
  } catch (error) {
    console.error("Error setting NusaCard game status:", error);
  }
};

/** Dengarkan perubahan gameState */
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
 * Aksi Gameplay
 * onDeckCardClick, onBottomCardClick, onAnswerSelect
 * Mengupdate state di DB berdasarkan aksi
 */

function getNextPlayer(currentDeck, DECK_ORDER) {
  const currentIndex = DECK_ORDER.indexOf(currentDeck);
  const nextIndex = (currentIndex + 1) % DECK_ORDER.length;
  return DECK_ORDER[nextIndex];
}

function getNextTurn(lastActiveDeck, DECK_ORDER) {
  const currentIndex = DECK_ORDER.indexOf(lastActiveDeck);
  const nextIndex = (currentIndex + 1) % DECK_ORDER.length;
  return DECK_ORDER[nextIndex];
}

export const onDeckCardClick = async (topicID, gameID, roomID, deck) => {
  const state = await getGameState(topicID, gameID, roomID);
  if (!state) return;

  if (state.currentTurn !== deck || state.showPopup || state.isActionInProgress || state.isShuffling) return;

  const deckCount = state.deckCounts[deck] || 0;
  if (deckCount <= 0) return;

  const newDeckCounts = { [deck]: deckCount - 1 };
  const newCard = getRandomQuestion();
  const answeringPlayer = getNextPlayer(deck, state.DECK_ORDER);

  const updates = {
    deckCounts: newDeckCounts,
    lastActiveDeck: deck,
    activeCard: newCard,
    answeringPlayer: answeringPlayer,
    showPopup: true,
    hasAnswered: false,
    isActionInProgress: true,
    turnTimerStart: null,
    questionTimerStart: Date.now(),
    questionTimerDuration: QUESTION_TIMER_DURATION
  };

  await updateGameState(topicID, gameID, roomID, updates);
};

export const onBottomCardClick = async (topicID, gameID, roomID, cardIndex) => {
  const state = await getGameState(topicID, gameID, roomID);
  if (!state) return;

  if (state.currentTurn !== "bottom" || state.showPopup || state.isActionInProgress || state.isShuffling) return;

  if (!state.cards || state.cards.length <= cardIndex) return;
  
  const chosenCard = state.cards[cardIndex];
  const newCards = state.cards.filter((_, i) => i !== cardIndex);
  const answeringPlayer = getNextPlayer("bottom", state.DECK_ORDER);

  const updates = {
    cards: newCards,
    activeCard: chosenCard,
    lastActiveDeck: "bottom",
    answeringPlayer: answeringPlayer,
    showPopup: true,
    hasAnswered: false,
    isActionInProgress: true,
    turnTimerStart: null,
    questionTimerStart: Date.now(),
    questionTimerDuration: QUESTION_TIMER_DURATION
  };

  await updateGameState(topicID, gameID, roomID, updates);
};

export const onAnswerSelect = async (topicID, gameID, roomID, isCorrect, wasTimeout = false) => {
  let state = await getGameState(topicID, gameID, roomID);
  if (!state) return;
  if (state.hasAnswered) return;

  let updates = {
    isCorrectAnswer: isCorrect,
    hasAnswered: true,
    questionTimerStart: null
  };

  // Jika salah dan bukan timeout, increment deck answeringPlayer
  if (!isCorrect && !wasTimeout && state.answeringPlayer) {
    const deck = state.answeringPlayer;
    const deckCount = (state.deckCounts[deck] || 0) + 1;
    updates.deckCounts = { [deck]: deckCount };
  }

  // Jika benar dan lastActiveDeck !== bottom && answeringPlayer !== bottom, add new card to bottom
  if (isCorrect && state.lastActiveDeck !== "bottom" && state.answeringPlayer !== "bottom") {
    const newCard = getRandomQuestion();
    const newCards = [...state.cards, { ...newCard, isNew: true }];
    updates.cards = newCards;
  }

  await updateGameState(topicID, gameID, roomID, updates);

  // Setelah FEEDBACK_DURATION, ganti turn
  setTimeout(async () => {
    let postState = await getGameState(topicID, gameID, roomID);
    if (!postState) return;

    const nextTurn = getNextTurn(postState.lastActiveDeck, postState.DECK_ORDER);
    const nextAnsweringPlayer = getNextPlayer(nextTurn, postState.DECK_ORDER);

    // Setelah 3 detik feedback, kita masuk fase answer timeout
    let postUpdates = {
      isCorrectAnswer: null,
      activeCard: null,
      isExitingPopup: true
    };
    await updateGameState(topicID, gameID, roomID, postUpdates);

    // Setelah POPUP_TRANSITION_DURATION tutup popup dan cek victory
    setTimeout(async () => {
      const finalState = await getGameState(topicID, gameID, roomID);
      if (!finalState) return;

      const { deckDepleted, victory, winner } = checkVictoryCondition(finalState);

      let finalUpdates = {
        showPopup: false,
        isExitingPopup: false,
        answeringPlayer: null,
        feedbackIcon: { show: false, isCorrect: null, position: null },
        isActionInProgress: false,
        currentTurn: nextTurn,
        answeringPlayer: nextAnsweringPlayer,
        isShuffling: true,
        victory: victory,
        winner: winner || finalState.winner,
        deckDepleted: deckDepleted || finalState.deckDepleted,
      };

      await updateGameState(topicID, gameID, roomID, finalUpdates);
      // Frontend melihat isShuffling = true, setelah 0.5 detik frontend bisa memanggil fungsi utk set isShuffling=false dan start turn timer
      // atau jika mau otomatis, gunakan mekanisme serupa di backend melalui Cloud Functions.
    }, POPUP_TRANSITION_DURATION);
  }, FEEDBACK_DURATION);
};
