import {
  database,
  ref,
  set,
  get,
  remove,
  onValue,
} from "../firebaseConfig";
import { resetRoom, getRoomPlayerCount } from "./roomDataServices";

// Function to find the first available player index in the room
const findAvailablePlayerIndex = async (roomPath, capacity, uid) => {
  const playersRef = ref(database, `${roomPath}/players`);
  const playersSnapshot = await get(playersRef);
  const playersData = playersSnapshot.val() || {};

  // Check if the player is already in the room
  const existingPlayerKey = Object.keys(playersData).find(
    (key) => playersData[key].uid === uid
  );

  if (existingPlayerKey) {
    // Return existing index
    return parseInt(existingPlayerKey.split('-')[1]);
  }

  // Find the first available index
  for (let i = 1; i <= capacity; i++) {
    if (!playersData[`player-${i}`]) {
      return i;
    }
  }
  return null;
};

// Function to find the player's key based on UID
const findPlayerKey = async (roomPath, uid) => {
  const playersRef = ref(database, `${roomPath}/players`);
  const playersSnapshot = await get(playersRef);

  if (playersSnapshot.exists()) {
    const playersData = playersSnapshot.val();
    const playerKey = Object.keys(playersData).find(
      (key) => playersData[key].uid === uid
    );
    return playerKey;
  }
  return null;
};

// Manage the process of a player joining or leaving a room
export const playerJoinRoom = async (
  topicID,
  gameID,
  roomID,
  user,
  isJoining,
  userPhoto
) => {
  if (roomID === "room5") return;
  if (!topicID || !gameID || !roomID || !user?.uid) {
    console.error("Missing required parameters in roomsParticipation");
    return;
  }

  const roomPath = `rooms/${topicID}/${gameID}/${roomID}`;

  try {
    const roomRef = ref(database, roomPath);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      console.error("Room does not exist");
      return;
    }

    if (roomSnapshot.val().isSinglePlayer) return;

    if (!isJoining) {
      const playerKey = await findPlayerKey(roomPath, user.uid);
      if (playerKey) {
        await remove(ref(database, `${roomPath}/players/${playerKey}`));
      }
    } else {
      const capacity = roomSnapshot.val().capacity || 4;
      const playerCount = await getRoomPlayerCount(topicID, gameID, roomID);

      if (playerCount >= capacity) {
        throw new Error("Room is full");
      }

      const playerIndex = await findAvailablePlayerIndex(
        roomPath,
        capacity,
        user.uid
      );
      if (!playerIndex) {
        throw new Error("No available player index");
      }

      const playerPath = `${roomPath}/players/player-${playerIndex}`;

      await set(ref(database, playerPath), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: userPhoto,
        joinedAt: Date.now(),
        index: playerIndex,
      });

      // Synchronize currentPlayers count
      await syncCurrentPlayers(topicID, gameID, roomID);
    }
  } catch (error) {
    console.error("Error in roomsParticipation:", error);
    throw error;
  }
};

// Watch for changes in player data in the room in real-time
export const fetchPlayer = (topicID, gameID, roomID, onPlayersUpdate) => {
  if (roomID === "room5") return () => {};

  if (!topicID || !gameID || !roomID || typeof onPlayersUpdate !== "function") {
    console.error("Invalid parameters for fetch data player");
    return () => {};
  }

  const playersRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/players`
  );

  return onValue(playersRef, async (snapshot) => {
    const playersData = snapshot.val() || {};

    await syncCurrentPlayers(topicID, gameID, roomID);

    const sortedPlayers = Object.entries(playersData)
      .map(([key, value]) => ({
        ...value,
        index: parseInt(key.split('-')[1]),
      }))
      .sort((a, b) => a.index - b.index);

    onPlayersUpdate(sortedPlayers);
  });
};

// Get all current players in the room
export const getCurrentPlayers = async (topicID, gameID, roomID) => {
  if (roomID === "room5") return [];

  const playersRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/players`
  );
  const snapshot = await get(playersRef);
  return snapshot.val() ? Object.values(snapshot.val()) : [];
};

// Sync the number of players in the room to the database
export const syncCurrentPlayers = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID || roomID === "room5") return;

  try {
    const currentPlayersRef = ref(
      database,
      `rooms/${topicID}/${gameID}/${roomID}/currentPlayers`
    );
    const playerCount = await getRoomPlayerCount(topicID, gameID, roomID);

    // Directly set the player count without using a transaction
    await set(currentPlayersRef, playerCount);
    return playerCount;
  } catch (error) {
    console.error("Error syncing players:", error);
  }
};

// Manage player leaving the room and update currentPlayers
export const playerLeaveRoom = async (topicID, gameID, roomID, user) => {
  if (!topicID || !gameID || !roomID || !user?.uid || roomID === "room5") return;

  const roomPath = `rooms/${topicID}/${gameID}/${roomID}`;
  const playerPath = `${roomPath}/players`;
  const currentPlayersRef = ref(database, `${roomPath}/currentPlayers`);

  try {
    const playerKey = await findPlayerKey(roomPath, user.uid);
    if (playerKey) {
      // Remove player from room
      await remove(ref(database, `${playerPath}/${playerKey}`));

      // Get all remaining players to update positions
      const playersSnapshot = await get(ref(database, playerPath));
      const playersData = playersSnapshot.val() || {};

      // Sort remaining players by joinedAt time
      const sortedPlayers = Object.entries(playersData)
        .map(([key, value]) => value)
        .sort((a, b) => a.joinedAt - b.joinedAt);

      // Update positions of remaining players
      const updates = {};
      sortedPlayers.forEach((player, index) => {
        const newIndex = index + 1;
        updates[`player-${newIndex}`] = {
          ...player,
          index: newIndex,
        };
      });

      await set(ref(database, playerPath), updates);

      // Calculate the number of remaining players
      const playerCount = sortedPlayers.length;

      // Directly set the currentPlayers count
      await set(currentPlayersRef, playerCount);

      // Reset room if no players are left
      if (playerCount === 0) {
        await resetRoom(topicID, gameID, roomID);
      }
    }
  } catch (error) {
    console.error("Error in playerLeaveRoom:", error);
  }
};
