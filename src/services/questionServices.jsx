import { database, ref, onValue } from "../firebaseConfig";

export const fetchQuestions = (setQuestions) => {
    const questionsRef = ref(database, "questions");
    onValue(questionsRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Raw Firebase Data:", data);  // Debugging untuk lihat data mentah
        if (data) {
            // Format dan filter berdasarkan topik
            const formattedQuestions = Object.keys(data)
              .map(key => ({
                  id: key,
                  ...data[key],
              }))
              .filter(question => question.topic === "pariwisata_darat");  // Filter berdasarkan topik

            console.log("Formatted and Filtered Questions (pariwisata_darat):", formattedQuestions);  // Debug setelah pemrosesan
            setQuestions(formattedQuestions);  // Set state dengan pertanyaan yang sudah difilter
        } else {
            console.log("No data found in Firebase");
            setQuestions([]);  // Tetap set state agar tidak terjadi error
        }
    });
};



