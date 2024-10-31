// PlayerDataServices.js

import {
  database,
  ref,
  set,
  get,
  remove,
  onValue,
} from "../firebaseConfig";
import { resetRoom, getRoomPlayerCount } from "./roomDataServices";

// Function to find the first available player key in the room
const findAvailablePlayerKey = async (roomPath, capacity) => {
  const playersRef = ref(database, `${roomPath}/players`);
  const playersSnapshot = await get(playersRef);
  const playersData = playersSnapshot.val() || {};

  for (let i = 1; i <= capacity; i++) {
    const key = `player-${i}`;
    if (!playersData[key]) {
      return key;
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

      const playerKey = await findAvailablePlayerKey(roomPath, capacity);
      if (!playerKey) {
        throw new Error("No available player key");
      }

      await set(ref(database, `${roomPath}/players/${playerKey}`), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: userPhoto,
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

    const playersWithPositions = Object.entries(playersData)
      .map(([key, player]) => {
        const position = parseInt(key.split('-')[1], 10) - 1; // Zero-based index
        return { ...player, position };
      })
      .sort((a, b) => a.position - b.position);

    onPlayersUpdate(playersWithPositions);
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
  if (!snapshot.exists()) return [];

  const playersData = snapshot.val();
  const playersWithPositions = Object.entries(playersData)
    .map(([key, player]) => {
      const position = parseInt(key.split('-')[1], 10) - 1; // Zero-based index
      return { ...player, position };
    })
    .sort((a, b) => a.position - b.position);

  return playersWithPositions;
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

      // Get remaining players and reassign positions
      const remainingPlayers = Object.values(playersData);

      // Reassign players to keys
      const updates = {};
      remainingPlayers.forEach((player, index) => {
        const key = `player-${index + 1}`;
        updates[key] = player;
      });

      await set(ref(database, playerPath), updates);

      // Calculate the number of remaining players
      const playerCount = remainingPlayers.length;

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
