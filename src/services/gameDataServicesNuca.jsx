import { database, ref, onValue, set, get } from "../firebaseConfig";

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

export const initializeNusaCardGameState = async (topicID, gameID, roomID, players) => {
  const gameStateRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameState`);
  
  try {
    const initialState = {
      players: players,
      currentPlayerIndex: 0,
      gameStatus: 'playing'
    };

    await set(gameStateRef, initialState);
  } catch (error) {
    console.error("Error initializing Nuca game state:", error);
  }
};