import { database, ref, remove, set, get } from "../firebaseConfig";


export const roomsParticipation = async (
  topicID,
  gameID,
  roomID,
  user,
  isJoining,
  userPhoto
) => {
  if (roomID === "room5") {
    return;
  }

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
    if (isJoining) {
      // Cek jika pengguna sudah ada di room
      const existingPlayerSnapshot = await get(playerRef);
      if (existingPlayerSnapshot.exists()) {
        // Jika sudah ada, perbarui jika diperlukan, tidak memeriksa kapasitas lagi
        await set(playerRef, {
          ...existingPlayerSnapshot.val(),
          photoURL: userPhoto || existingPlayerSnapshot.val().photoURL,
          joinedAt: Date.now(),
        });
        console.log("User already in room, updating info only.");
        return;
      }

      // Jika pengguna belum terdaftar, cek kapasitas room
      const roomSnapshot = await get(roomRef);
      const roomData = roomSnapshot.val();
      const capacity = roomData.capacity || 4;

      const playersSnapshot = await get(playersRef);
      let playerCount = playersSnapshot.val()
        ? Object.keys(playersSnapshot.val()).length
        : 0;

      if (playerCount >= capacity) {
        throw new Error("Room is full");
      }

      // Tambahkan pemain jika kapasitas memungkinkan
      await set(playerRef, {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: userPhoto || "",
        joinedAt: Date.now(),
      });

      // Sinkronisasi jumlah pemain yang valid di Firebase
      playerCount += 1;
      await set(currentPlayersRef, playerCount);
    } else {
      // Menghapus pemain saat keluar dari room
      await remove(playerRef);

      const snapshot = await get(playersRef);
      const playerCount = snapshot.val()
        ? Object.keys(snapshot.val()).length
        : 0;
      await set(currentPlayersRef, playerCount);
    }
  } catch (error) {
    console.error("Error in roomsParticipation:", error);
    throw error;
  }
};


export const syncCurrentPlayers = async (topicID, gameID, roomID) => {
  // Jika room5 (VS AI), tidak perlu sync players
  if (roomID === "room5") {
    return 1; // Return 1 untuk single player
  }

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
    const actualPlayerCount = snapshot.val()
      ? Object.keys(snapshot.val()).length
      : 0;
    await set(currentPlayersRef, actualPlayerCount);
    return actualPlayerCount;
  } catch (error) {
    console.error("Error syncing currentPlayers:", error);
    throw error;
  }
};
