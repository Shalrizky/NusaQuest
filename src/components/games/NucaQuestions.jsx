const westJavaQuestions = [
  {
    category: "Makanan",
    questions: [
      {
        question: "Apa nama makanan khas Bandung yang terbuat dari singkong dan berbentuk bulat pipih?",
        options: ["A. Combro", "B. Serabi", "C. Cireng", "D. Batagor"],
        correctAnswer: "A"
      },
      {
        question: "Sebutkan nama sate khas Purwakarta yang terbuat dari daging kambing muda!",
        options: ["A. Sate Lilit", "B. Sate Padang", "C. Sate Maranggi", "D. Sate Madura"],
        correctAnswer: "C"
      },
      {
        question: "Apa nama makanan khas Sumedang yang terbuat dari tahu yang digoreng dua kali?",
        options: ["A. Tahu Bulat", "B. Tahu Gejrot", "C. Tahu Isi", "D. Tahu Sumedang"],
        correctAnswer: "B"
      }
    ]
  },
  {
    category: "Minuman",
    questions: [
      {
        question: "Apa nama minuman khas Bandung yang terbuat dari susu dan sirup cocopandan?",
        options: ["A. Bajigur", "B. Bandrek", "C. Es Lilin", "D. Es Goyobod"],
        correctAnswer: "D"
      },
      {
        question: "Sebutkan nama minuman tradisional Sunda yang terbuat dari air kelapa muda dan gula aren!",
        options: ["A. Cendol", "B. Es Dawet", "C. Es Cingcau", "D. Es Doger"],
        correctAnswer: "D"
      }
    ]
  }
];

export const getRandomQuestion = () => {
  const randomCategory = westJavaQuestions[Math.floor(Math.random() * westJavaQuestions.length)];
  const randomQuestion = randomCategory.questions[Math.floor(Math.random() * randomCategory.questions.length)];
  return {
    category: randomCategory.category,
    question: randomQuestion.question,
    options: randomQuestion.options,
    correctAnswer: randomQuestion.correctAnswer
  };
};
