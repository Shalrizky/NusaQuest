import { database, ref, onValue, push, onChildAdded } from "../firebaseConfig";

export const fetchRooms = (topicID, gameID, callback) => {
  const roomsRef = ref(database, `rooms/${topicID}/${gameID}`);
  onValue(roomsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null); // Jika data tidak ditemukan
    }
  });
};

/**
 * Mengirim pesan ke chat room.
 * @param {string} topicID - ID topik
 * @param {string} gameID - ID permainan
 * @param {string} roomID - ID room
 * @param {object} messageData - Data pesan yang akan dikirim
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
 * Mendengarkan pesan chat di room.
 * @param {string} topicID - ID topik
 * @param {string} gameID - ID permainan
 * @param {string} roomID - ID room
 * @param {function} callback - Fungsi callback yang dipanggil ketika ada pesan baru
 * @returns {function} - Fungsi untuk berhenti mendengarkan pesan
 */
export const listenToChatMessages = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID || !callback) {
    console.error("Missing required parameters for listenToChatMessages");
    return;
  }

  const chatRef = ref(
    database,
    `rooms/${topicID}/${gameID}/${roomID}/chatMessages`
  );

  const unsubscribe = onChildAdded(chatRef, (data) => {
    const messageData = data.val();
    callback(messageData);
  });

  return unsubscribe;
};
