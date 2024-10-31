import {
  database,
  ref,
  onValue,
  push,
  onChildAdded,
  remove,
  get,
  update,
} from "../firebaseConfig";

/**
 * Mengambil data semua room yang terkait dengan topik dan game tertentu.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {function} callback - Callback untuk memproses data room.
 */
export const fetchRooms = (topicID, gameID, callback) => {
  const roomsRef = ref(database, `rooms/${topicID}/${gameID}`);
  onValue(roomsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
};

/**
 * Mengecek tipe room untuk mengetahui apakah room tersebut adalah single-player atau multi-player.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 * @returns {object} - Informasi apakah room ada dan tipe room.
 */
export const checkRoomType = async (topicID, gameID, roomID) => {
  const roomRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}`);
  const snapshot = await get(roomRef);
  return {
    exists: snapshot.exists(),
    isSinglePlayer: snapshot.val()?.isSinglePlayer || false,
  };
};

/**
 * Mendapatkan jumlah pemain dalam room tertentu.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 * @returns {number} - Jumlah pemain dalam room.
 */
export const getRoomPlayerCount = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID || roomID === "room5") return 0;

  try {
    const playersRef = ref(
      database,
      `rooms/${topicID}/${gameID}/${roomID}/players`
    );
    const snapshot = await get(playersRef);
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  } catch (error) {
    console.error("Error getting player count:", error);
    return 0;
  }
};

/**
 * Mengirim pesan ke chat dalam room tertentu.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 * @param {object} messageData - Data pesan yang akan dikirim.
 */
export const sendMessageToChat = async (
  topicID,
  gameID,
  roomID,
  messageData
) => {
  if (!topicID || !gameID || !roomID || !messageData) {
    console.error("Missing required parameters for sendMessageToChat");
    return;
  }

  if (roomID === "room5") return;

  const chatRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/chatMessages`
  );
  try {
    await push(chatRef, messageData);
  } catch (error) {
    console.error("Error sending message to chat:", error);
    throw error;
  }
};

/**
 * Mendengarkan perubahan pesan chat dalam room secara real-time.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 * @param {function} callback - Callback untuk mengirim data pesan.
 */
export const listenToChatMessages = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID || !callback) {
    console.error("Missing required parameters for listenToChatMessages");
    return () => {};
  }

  if (roomID === "room5") return () => {};

  const chatRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/chatMessages`
  );
  let isInitialLoad = true;

  const chatUnsubscribe = onChildAdded(chatRef, (data) => {
    const messageData = data.val();
    callback(messageData);
  });

  const playerUnsubscribe = onValue(
    ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`),
    async () => {
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }

      const playerCount = await getRoomPlayerCount(topicID, gameID, roomID);
      if (playerCount === 0) {
        await clearChatMessages(topicID, gameID, roomID);
      }
    }
  );

  return () => {
    chatUnsubscribe();
    playerUnsubscribe();
  };
};

/**
 * Menghapus semua pesan chat dalam room.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 */
export const clearChatMessages = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID || roomID === "room5") {
    return;
  }

  const chatRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/chatMessages`
  );
  try {
    await remove(chatRef);
    console.log("Chat messages cleared successfully");
  } catch (error) {
    console.error("Error clearing chat messages:", error);
  }
};

/**
 * Mereset status room jika semua pemain keluar, termasuk menghapus pesan dan status game.
 * @param {string} topicID - ID topik.
 * @param {string} gameID - ID game.
 * @param {string} roomID - ID room.
 */
export const resetRoom = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID || roomID === "room5") return;

  try {
    const playerCount = await getRoomPlayerCount(topicID, gameID, roomID);

    if (playerCount === 0) {
      const updates = {
        [`rooms/${topicID}/${gameID}/${roomID}/gameStatus`]: null,
        [`rooms/${topicID}/${gameID}/${roomID}/currentPlayers`]: 0,
        [`rooms/${topicID}/${gameID}/${roomID}/chatMessages`]: null,
      };
      await update(ref(database), updates);
      console.log(
        "Room reset: game status, chat messages, and current players cleared"
      );
    }
  } catch (error) {
    console.error("Error resetting game status:", error);
  }
};
