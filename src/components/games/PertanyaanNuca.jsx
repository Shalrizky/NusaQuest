import React, { useState, useEffect } from 'react';
import '../../style/components/games/PertanyaanNuca.css';

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

export const ListPertanyaanNuca = westJavaQuestions; // Ekspor daftar pertanyaan

const getRandomQuestion = () => {
  const randomCategory = westJavaQuestions[Math.floor(Math.random() * westJavaQuestions.length)];
  const randomQuestion = randomCategory.questions[Math.floor(Math.random() * randomCategory.questions.length)];
  return {
    question: randomQuestion.question,
    options: randomQuestion.options,
    correctAnswer: randomQuestion.correctAnswer
  };
};

function PertanyaanNuca({ onAnswerSelect, isExiting }) {
  const [questionData, setQuestionData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const question = getRandomQuestion();
    setQuestionData(question);
  }, []);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const isCorrectAnswer = answer === questionData.correctAnswer;
    setIsCorrect(isCorrectAnswer);
    onAnswerSelect(isCorrectAnswer);
  };

  if (!questionData) return null;

  return (
    <div className="popup-overlay">
      <div className={`popup-content ${isExiting ? 'popup-exit' : ''}`}>
        <h2>{questionData.question}</h2>
        <div className="answer-options">
          {questionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option.charAt(0))}
              className={selectedAnswer === option.charAt(0)
                ? isCorrect ? 'correct-answer' : 'incorrect-answer shake'
                : ''
              }
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PertanyaanNuca;
