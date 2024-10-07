
import { database, ref, onValue } from "../firebaseConfig";

export const fetchLobbyData = (gameID, callback) => {
  const lobbyRef = ref(database, `lobbies/${gameID}`);

  onValue(lobbyRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null); 
    }
  });
};
