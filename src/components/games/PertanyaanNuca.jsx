import React, { useState, useEffect } from 'react';
import '../../style/components/games/PertanyaanNuca.css';

const westJavaQuestions = [
  {
    category: "Makanan", // Kategori: Makanan
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
      }
    ]
  },
  {
    category: "Kesenian", // Kategori: Kesenian
    questions: [
      {
        question: "Apa nama alat musik khas Sunda yang terbuat dari bambu?",
        options: ["A. Angklung", "B. Gamelan", "C. Kolintang", "D. Calung"],
        correctAnswer: "A"
      },
      {
        question: "Apa nama tarian khas Jawa Barat yang menggambarkan keceriaan dan kebahagiaan?",
        options: ["A. Tari Pendet", "B. Tari Jaipong", "C. Tari Saman", "D. Tari Kecak"],
        correctAnswer: "B"
      }
    ]
  }
];

export const ListPertanyaanNuca = westJavaQuestions;


const getRandomQuestion = () => {
  const randomCategory = westJavaQuestions[Math.floor(Math.random() * westJavaQuestions.length)];
  const randomQuestion = randomCategory.questions[Math.floor(Math.random() * randomCategory.questions.length)];
  return {
    question: randomQuestion.question,
    options: randomQuestion.options,
    correctAnswer: randomQuestion.correctAnswer
  };
};

function PertanyaanNuca({ onAnswerSelect }) {
  const [questionData, setQuestionData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const question = getRandomQuestion();
    setQuestionData(question);
  }, []);

  const handleAnswerSelect = (answer) => {
    const isCorrectAnswer = answer === questionData.correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(isCorrectAnswer);
    onAnswerSelect(isCorrectAnswer);

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
    }, 8000);
  };

  if (!questionData) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{questionData.question}</h2>
        <div className="answer-options">
          {questionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option.charAt(0))}
              className={`answer-button ${
                selectedAnswer === option.charAt(0)
                  ? isCorrect
                    ? 'correct-answer'
                    : 'incorrect-answer shake'
                  : ''
              }`}
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
