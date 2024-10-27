// src/services/roomsParticipation.js

import { database, ref, set, get, update } from "../firebaseConfig";

/**
 * Mengelola partisipasi pengguna dalam room.
 * @param {string} topicID - ID topik
 * @param {string} gameID - ID permainan
 * @param {string} roomID - ID room
 * @param {object} user - Objek pengguna
 * @param {boolean} isJoining - True jika pengguna bergabung
 * @param {string} userPhoto - URL foto pengguna
 */
export const roomsParticipation = async (
  topicID,
  gameID,
  roomID,
  user,
  isJoining,
  userPhoto
) => {
  if (!topicID || !gameID || !roomID || !user?.uid) {
    console.error("Missing required parameters");
    return;
  }

  if (roomID === "room5") return;

  const playerRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/players/${user.uid}`
  );
  const playersRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/players`
  );
  const currentPlayersRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/currentPlayers`
  );
  const roomRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}`);

  try {
    const roomSnapshot = await get(roomRef);
    if (!roomSnapshot.exists()) {
      console.error("Room does not exist");
      return;
    }

    if (isJoining) {
      const existingPlayerSnapshot = await get(playerRef);
      if (existingPlayerSnapshot.exists()) {
        await set(playerRef, {
          ...existingPlayerSnapshot.val(),
          photoURL: userPhoto || existingPlayerSnapshot.val().photoURL,
          joinedAt: Date.now(),
        });
        console.log("Updated existing player data");
        return;
      }

      const roomData = roomSnapshot.val();
      const capacity = roomData.capacity || 4;

      const playersSnapshot = await get(playersRef);
      const playerCount = Object.keys(playersSnapshot.val() || {}).length;

      if (playerCount >= capacity) {
        throw new Error("Room is full");
      }

      await set(playerRef, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: userPhoto || "",
        joinedAt: Date.now(),
      });

      await set(currentPlayersRef, playerCount + 1);
    } else {
      const playersSnapshot = await get(playersRef);
      const playerCount = Object.keys(playersSnapshot.val() || {}).length;

      const newPlayerCount = Math.max(0, playerCount - 1);

      const updates = {
        [`rooms/${topicID}/${gameID}/${roomID}/players/${user.uid}`]: null,
        [`rooms/${topicID}/${gameID}/${roomID}/currentPlayers`]: newPlayerCount,
      };

      await update(ref(database), updates);

      // Setelah memperbarui, cek jika jumlah pemain adalah 0
      if (newPlayerCount === 0) {
        const chatMessagesRef = ref(
          database,
          `rooms/${topicID}/${gameID}/${roomID}/chatMessages`
        );
        await set(chatMessagesRef, null);
        console.log("All players left. Chat messages have been deleted.");
      }
    }
  } catch (error) {
    if (error.code === "PERMISSION_DENIED") {
      console.log("Permission denied - session might be expired");
      return;
    }
    console.error("Error in roomsParticipation:", error);
    throw error;
  }
};

/**
 * Mensinkronkan jumlah pemain saat ini dalam room.
 * @param {string} topicID - ID topik
 * @param {string} gameID - ID permainan
 * @param {string} roomID - ID room
 */
export const syncCurrentPlayers = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID) {
    console.error("Missing required parameters for syncCurrentPlayers");
    return;
  }

  if (roomID === "room5") return 1;

  const playersRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/players`
  );
  const currentPlayersRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/currentPlayers`
  );

  try {
    const snapshot = await get(playersRef);
    const playerCount = snapshot.exists()
      ? Object.keys(snapshot.val()).length
      : 0;

    await set(currentPlayersRef, playerCount);
    return playerCount;
  } catch (error) {
    if (error.code === "PERMISSION_DENIED") {
      console.log("Permission denied during sync - session might be expired");
      return;
    }
    console.error("Error syncing currentPlayers:", error);
    throw error;
  }
};


