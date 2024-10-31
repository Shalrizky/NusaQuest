import {
  database,
  ref,
  set,
  get,
  remove,
  onValue,
} from "../firebaseConfig";
import { resetRoom, getRoomPlayerCount } from "./roomDataServices";

// Fungsi untuk menemukan key pemain pertama yang tersedia di dalam room
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

// Fungsi untuk menemukan key pemain berdasarkan UID
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

// Mengelola proses pemain yang bergabung atau meninggalkan room
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
    console.error("Parameter yang diperlukan hilang dalam roomsParticipation");
    return;
  }

  const roomPath = `rooms/${topicID}/${gameID}/${roomID}`;

  try {
    const roomRef = ref(database, roomPath);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      console.error("Room tidak ada");
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
        throw new Error("Room penuh");
      }

      const playerKey = await findAvailablePlayerKey(roomPath, capacity);
      if (!playerKey) {
        throw new Error("Tidak ada key pemain yang tersedia");
      }

      await set(ref(database, `${roomPath}/players/${playerKey}`), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: userPhoto,
      });

      // Sinkronisasi jumlah pemain saat ini
      await syncCurrentPlayers(topicID, gameID, roomID);
    }
  } catch (error) {
    console.error("Error dalam roomsParticipation:", error);
    throw error;
  }
};

// Mengawasi perubahan data pemain di dalam room secara real-time
export const fetchPlayer = (topicID, gameID, roomID, onPlayersUpdate) => {
  if (roomID === "room5") return () => {};

  if (!topicID || !gameID || !roomID || typeof onPlayersUpdate !== "function") {
    console.error("Parameter tidak valid untuk fetch data pemain");
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
        const position = parseInt(key.split('-')[1], 10) - 1; // Index dimulai dari nol
        return { ...player, position };
      })
      .sort((a, b) => a.position - b.position);

    onPlayersUpdate(playersWithPositions);
  });
};

// Mendapatkan semua pemain yang ada di dalam room
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
      const position = parseInt(key.split('-')[1], 10) - 1; // Index dimulai dari nol
      return { ...player, position };
    })
    .sort((a, b) => a.position - b.position);

  return playersWithPositions;
};

// Sinkronisasi jumlah pemain dalam room ke database
export const syncCurrentPlayers = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID || roomID === "room5") return;

  try {
    const currentPlayersRef = ref(
      database,
      `rooms/${topicID}/${gameID}/${roomID}/currentPlayers`
    );
    const playerCount = await getRoomPlayerCount(topicID, gameID, roomID);

    // Set jumlah pemain tanpa menggunakan transaksi
    await set(currentPlayersRef, playerCount);
    return playerCount;
  } catch (error) {
    console.error("Error saat sinkronisasi pemain:", error);
  }
};

// Mengelola pemain yang meninggalkan room dan memperbarui currentPlayers
export const playerLeaveRoom = async (topicID, gameID, roomID, user) => {
  if (!topicID || !gameID || !roomID || !user?.uid || roomID === "room5") return;

  const roomPath = `rooms/${topicID}/${gameID}/${roomID}`;
  const playerPath = `${roomPath}/players`;
  const currentPlayersRef = ref(database, `${roomPath}/currentPlayers`);

  try {
    const playerKey = await findPlayerKey(roomPath, user.uid);
    if (playerKey) {
      // Hapus pemain dari room
      await remove(ref(database, `${playerPath}/${playerKey}`));

      // Dapatkan semua pemain yang tersisa untuk memperbarui posisi
      const playersSnapshot = await get(ref(database, playerPath));
      const playersData = playersSnapshot.val() || {};

      // Dapatkan pemain yang tersisa dan atur ulang posisi
      const remainingPlayers = Object.values(playersData);

      // Tetapkan ulang pemain ke key baru
      const updates = {};
      remainingPlayers.forEach((player, index) => {
        const key = `player-${index + 1}`;
        updates[key] = player;
      });

      await set(ref(database, playerPath), updates);

      // Hitung jumlah pemain yang tersisa
      const playerCount = remainingPlayers.length;

      // Set jumlah currentPlayers secara langsung
      await set(currentPlayersRef, playerCount);

      // Reset room jika tidak ada pemain yang tersisa
      if (playerCount === 0) {
        await resetRoom(topicID, gameID, roomID);
      }
    }
  } catch (error) {
    console.error("Error dalam playerLeaveRoom:", error);
  }
};
