import { database, ref, onValue } from "../firebaseConfig";

export const fetchGames = (callback) => {
  const gamesRef = ref(database, "games");
  onValue(gamesRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  });
};

