import { database, ref, get } from "../firebaseConfig";

export const getQuestions = async (topicID) => {
  const questionsRef = ref(database, "questions");
  try {
    const snapshot = await get(questionsRef);
    const data = snapshot.val();
    console.log("Fetched data:", data); // Debugging line
    if (data) {
      const formattedQuestions = Object.keys(data)
        .map((key) => ({
          id: key,
          ...data[key],
        }))
        .filter((question) => question.topic === topicID);
      console.log("Filtered questions:", formattedQuestions); // Debugging line

      return formattedQuestions;
    } else {
      console.log("No data found in Firebase");
      return [];
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
};

export const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};
