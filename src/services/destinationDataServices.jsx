import { database, ref, onValue } from "../firebaseConfig";

export const fetchDestinations = (setDestinations) => {
  const destinationsRef = ref(database, "destination");
  onValue(destinationsRef, (snapshot) => {
    const data = snapshot.val();
    setDestinations(data || {});
  });
};

export const fetchDestinationById = (id, callback) => {
  const destinationRef = ref(database, `destination/${id}`);
  onValue(destinationRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const fetchTopics = (setTopics) => {
  const topicsRef = ref(database, "topic");
  onValue(topicsRef, (snapshot) => {
    const data = snapshot.val();
    setTopics(data || {});
  });
};
