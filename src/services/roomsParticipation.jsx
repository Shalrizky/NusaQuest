// roomsParticipation.js
import { database, ref, runTransaction, remove, set } from "../firebaseConfig";

export const roomsParticipation = async (topicID, gameID, roomID, user, isJoining, userPhoto) => {
  const playerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players/${user.uid}`);
  const currentPlayersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/currentPlayers`);

  if (isJoining) {
    // Tambahkan user ke daftar players dan perbarui jumlah currentPlayers
    await set(playerRef, {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: userPhoto || "", // Pastikan ada nilai yang diset, bisa berupa URL default atau kosong
    }).catch((error) => console.error("Error adding player:", error));

    // Menambahkan transaksi untuk menaikkan currentPlayers
    await runTransaction(currentPlayersRef, (currentPlayers) => {
      return (currentPlayers || 0) + 1;
    }).catch((error) => {
      console.error("Error updating currentPlayers on join:", error);
    });

  } else {
    // Hapus user dari daftar players dan perbarui jumlah currentPlayers
    await remove(playerRef).catch((error) => console.error("Error removing player:", error));

    // Menambahkan transaksi untuk mengurangi currentPlayers
    await runTransaction(currentPlayersRef, (currentPlayers) => {
      const newCount = (currentPlayers || 0) - 1;
      return newCount < 0 ? 0 : newCount; // Pastikan currentPlayers tidak kurang dari 0
    }).catch((error) => {
      console.error("Error updating currentPlayers on leave:", error);
    });
  }
};
