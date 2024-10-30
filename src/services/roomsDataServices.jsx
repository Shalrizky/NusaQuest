// src/services/roomsDataServices.js

import { database, ref, onValue, push, onChildAdded, remove, get } from "../firebaseConfig";

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

export const sendMessageToChat = async (topicID, gameID, roomID, messageData) => {
  if (!topicID || !gameID || !roomID || !messageData) {
    console.error("Missing required parameters for sendMessageToChat");
    return;
  }

  if (roomID === "room5") return;

  const chatRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/chatMessages`);

  try {
    await push(chatRef, messageData);
  } catch (error) {
    console.error("Error sending message to chat:", error);
    throw error;
  }
};

export const clearChatMessages = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID || roomID === "room5") {
    return;
  }

  const chatRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/chatMessages`);
  try {
    await remove(chatRef);
    console.log("Chat messages cleared successfully");
  } catch (error) {
    console.error("Error clearing chat messages:", error);
  }
};

export const listenToChatMessages = (topicID, gameID, roomID, callback) => {
  if (!topicID || !gameID || !roomID || !callback) {
    console.error("Missing required parameters for listenToChatMessages");
    return () => {};
  }

  if (roomID === "room5") return () => {};

  const chatRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/chatMessages`);
  let isInitialLoad = true;

  // Listen for chat messages
  const chatUnsubscribe = onChildAdded(chatRef, (data) => {
    const messageData = data.val();
    callback(messageData);
  });

  // Listen for player count changes
  const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
  const playerUnsubscribe = onValue(playersRef, async (snapshot) => {
    // Skip the first load to prevent clearing messages when joining
    if (isInitialLoad) {
      isInitialLoad = false;
      return;
    }

    const playerCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    if (playerCount === 0) {
      await clearChatMessages(topicID, gameID, roomID);
    }
  });

  // Return cleanup function
  return () => {
    chatUnsubscribe();
    playerUnsubscribe();
  };
};

// Tambahkan fungsi helper untuk cek player count
export const getPlayerCount = async (topicID, gameID, roomID) => {
  if (!topicID || !gameID || !roomID || roomID === "room5") return 0;
  
  try {
    const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
    const snapshot = await get(playersRef);
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  } catch (error) {
    console.error("Error getting player count:", error);
    return 0;
  }
};