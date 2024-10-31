import {
  database,
  ref,
  set,
  get,
  remove,
  onValue,
  runTransaction,
} from "../firebaseConfig";
import { resetRoom, getRoomPlayerCount } from "./roomDataServices";

/**
 * Mengelola proses pemain bergabung atau keluar dari room.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 * @param {object} user - Objek user yang berisi UID dan detail lainnya.
 * @param {boolean} isJoining - Menentukan apakah pemain bergabung (true) atau keluar (false).
 * @param {string} userPhoto - URL foto profil user.
 */
export const playerJoinRoom = async (
  topicID,
  gameID,
  roomID,
  user,
  isJoining,
  userPhoto
) => {
  if (roomID === "room5") return; // Room AI tidak memerlukan join/leave manual

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
      // Menghapus pemain jika keluar
      await remove(ref(database, playerPath));
    } else {
      // Gunakan getRoomPlayerCount  untuk memvalidasi kapasitas room sebelum menambahkan pemain
      const capacity = roomSnapshot.val().capacity || 4;
      const playerCount = await getRoomPlayerCount(topicID, gameID, roomID);

      if (playerCount >= capacity) {
        throw new Error("Room is full");
      }

      // Menambahkan data pemain ke room
      await set(ref(database, playerPath), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: userPhoto || "",
        joinedAt: Date.now(),
      });

      await set(ref(database, `${roomPath}/currentPlayers`), playerCount + 1);
    }
  } catch (error) {
    console.error("Error in roomsParticipation:", error);
    throw error;
  }
};

/**
 * Mengawasi perubahan data pemain dalam room secara real-time.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 * @param {function} onPlayersUpdate - Callback untuk mengirim data pemain.
 */
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
  return onValue(playersRef, (snapshot) => {
    const playersData = snapshot.val() || {};
    onPlayersUpdate(Object.values(playersData));
  });
};

/**
 * Mengambil data semua pemain yang ada dalam room.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 * @returns {Array} - Daftar pemain dalam room.
 */
export const getCurrentPlayers = async (topicID, gameID, roomID) => {
  if (roomID === "room5") return [];

  const playersRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/players`
  );
  const snapshot = await get(playersRef);
  return snapshot.val() ? Object.values(snapshot.val()) : [];
};

/**
 * Sinkronisasi jumlah pemain dalam room ke database.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 * @returns {number} - Jumlah pemain dalam room.
 */
export const syncCurrentPlayers = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID || roomID === "room5") return;

  try {
    // Menggunakan getRoomPlayerCount  untuk mendapatkan jumlah pemain
    const playerCount = await getRoomPlayerCount(topicID, gameID, roomID);

    await set(
      ref(database, `rooms/${topicID}/${gameID}/${roomID}/currentPlayers`),
      playerCount
    );
    return playerCount;
  } catch (error) {
    console.error("Error syncing players:", error);
  }
};

/**
 * Mengelola keluarnya pemain dari room dan memperbarui currentPlayers dengan transaksi.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 * @param {object} user - Objek user yang berisi UID dan detail lainnya.
 */
export const playerLeaveRoom = async (topicID, gameID, roomID, user) => {
  if (!topicID || !gameID || !roomID || !user?.uid || roomID === "room5")
    return;

  const playerPath = `rooms/${topicID}/${gameID}/${roomID}/players/${user.uid}`;
  const currentPlayersRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/currentPlayers`
  );

  try {
    // Hapus pemain dari daftar pemain
    await remove(ref(database, playerPath));

    // Perbarui currentPlayers menggunakan transaksi
    await runTransaction(currentPlayersRef, (currentCount) => {
      if (currentCount) {
        return currentCount - 1;
      } else {
        return 0;
      }
    });

    // Dapatkan jumlah pemain yang tersisa
    const playerCount = await getRoomPlayerCount(topicID, gameID, roomID);
    if (playerCount === 0) {
      // Reset room jika pemain terakhir keluar
      await resetRoom(topicID, gameID, roomID);
    }
  } catch (error) {
    console.error("Error in playerLeaveRoom:", error);
  }
};
