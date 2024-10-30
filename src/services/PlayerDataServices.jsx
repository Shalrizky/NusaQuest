// src/services/PlayerDataServices.js

import { database, ref, set, get, remove, onValue, update } from "../firebaseConfig";

export const checkRoomType = async (topicID, gameID, roomID) => {
  const roomRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}`);
  const snapshot = await get(roomRef);
  return {
    exists: snapshot.exists(),
    isSinglePlayer: snapshot.val()?.isSinglePlayer || false
  };
};

export const getCurrentPlayers = async (topicID, gameID, roomID) => {
  if (roomID === "room5") return [];
  
  const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
  const snapshot = await get(playersRef);
  return snapshot.val() ? Object.values(snapshot.val()) : [];
};

export const roomsParticipation = async (topicID, gameID, roomID, user, isJoining, userPhoto) => {
  if (roomID === "room5") return;

  if (!topicID || !gameID || !roomID || !user?.uid) {
    console.error("Missing required parameters in roomsParticipation");
    return;
  }

  const roomPath = `rooms/${topicID}/${gameID}/${roomID}`;
  const playerPath = `${roomPath}/players/${user.uid}`;

  try {
    const roomRef = ref(database, roomPath);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      console.error("Room does not exist");
      return;
    }

    if (roomSnapshot.val().isSinglePlayer) return;

    if (!isJoining) {
      await remove(ref(database, playerPath));  // Hapus pemain dari room
    } else {
      const capacity = roomSnapshot.val().capacity || 4;
      const playersSnapshot = await get(ref(database, `${roomPath}/players`));
      const playerCount = playersSnapshot.exists() ? Object.keys(playersSnapshot.val()).length : 0;

      if (playerCount >= capacity) {
        throw new Error("Room is full");
      }

      await set(ref(database, playerPath), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: userPhoto || "",
        joinedAt: Date.now()
      });

      await set(ref(database, `${roomPath}/currentPlayers`), playerCount + 1);
    }
  } catch (error) {
    console.error("Error in roomsParticipation:", error);
    throw error;
  }
};

export const subscribeToPlayers = (topicID, gameID, roomID, onPlayersUpdate) => {
  if (roomID === "room5") return () => {};

  if (!topicID || !gameID || !roomID || typeof onPlayersUpdate !== 'function') {
    console.error("Invalid parameters for subscribeToPlayers");
    return () => {};
  }

  const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
  return onValue(playersRef, (snapshot) => {
    const playersData = snapshot.val() || {};
    onPlayersUpdate(Object.values(playersData));
  });
};

export const syncCurrentPlayers = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID || roomID === "room5") return;

  try {
    const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
    const snapshot = await get(playersRef);
    const playerCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    
    await set(ref(database, `rooms/${topicID}/${gameID}/${roomID}/currentPlayers`), playerCount);
    return playerCount;
  } catch (error) {
    console.error("Error syncing players:", error);
  }
};

export const resetRoom = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID || roomID === "room5") return;

  try {
    const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
    const snapshot = await get(playersRef);
    const playerCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;

    if (playerCount === 0) {
      const updates = {
        [`rooms/${topicID}/${gameID}/${roomID}/gameStatus`]: null,
        [`rooms/${topicID}/${gameID}/${roomID}/currentPlayers`]: 0,
        [`rooms/${topicID}/${gameID}/${roomID}/chatMessages`]: null  // Tambahkan ini
      };
      await update(ref(database), updates);
      console.log("Room reset: game status, chat messages, and current players cleared");
    }
  } catch (error) {
    console.error("Error resetting game status:", error);
  }
};


export const playerLeaveRoom = async (topicID, gameID, roomID, user) => {
  if (!topicID || !gameID || !roomID || !user?.uid || roomID === "room5") return;

  try {
    // Hapus pemain dari room
    await roomsParticipation(topicID, gameID, roomID, user, false);
    
    // Periksa apakah perlu reset room setelah pemain terakhir keluar
    await resetRoom(topicID, gameID, roomID);
  } catch (error) {
    console.error("Error in playerLeaveRoom:", error);
  }
};
