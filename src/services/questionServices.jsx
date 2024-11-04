// questionService.js
import { database, ref, get } from "../firebaseConfig";

export const fetchQuestions = async () => {
    try {
      const questionsRef = ref(database, "questions");
      const snapshot = await get(questionsRef);
  
      if (snapshot.exists()) {
        const questionsList = [];
        snapshot.forEach((childSnapshot) => {
          questionsList.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        return questionsList;
      } else {
        console.log("No questions found in the database.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching questions: ", error);
      return [];
    }
  };