import { database, ref, onValue } from "../firebaseConfig";

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