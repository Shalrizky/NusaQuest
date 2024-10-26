import { database, ref, remove, set, get } from "../firebaseConfig";

export const roomsParticipation = async (
  topicID,
  gameID,
  roomID,
  user,
  isJoining,
  userPhoto
) => {
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

  try {
    if (isJoining) {
      await set(playerRef, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: userPhoto || "",
        joinedAt: Date.now(),
      });

      const snapshot = await get(playersRef);
      const playerCount = snapshot.val() ? Object.keys(snapshot.val()).length : 0;
      await set(currentPlayersRef, playerCount);

    } else {
      await remove(playerRef);

      const snapshot = await get(playersRef);
      const playerCount = snapshot.val() ? Object.keys(snapshot.val()).length : 0;
      await set(currentPlayersRef, playerCount);
    }
  } catch (error) {
    console.error("Error in roomsParticipation:", error);
    throw error;
  }
};

export const syncCurrentPlayers = async (topicID, gameID, roomID) => {
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
    const actualPlayerCount = snapshot.val() ? Object.keys(snapshot.val()).length : 0;
    await set(currentPlayersRef, actualPlayerCount);
    return actualPlayerCount;
  } catch (error) {
    console.error("Error syncing currentPlayers:", error);
    throw error;
  }
};