// gameDataServices.js
import { database, ref, onValue, set } from "../firebaseConfig";

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

// Cleanup game data
export const cleanupGame = async (topicID, gameID, roomID, user) => {
  if (!topicID || !gameID || !roomID || !user?.uid) return;

  try {
    await setGameStatus(topicID, gameID, roomID, null);
  } catch (error) {
    console.error("Error cleaning up game:", error);
  }
};