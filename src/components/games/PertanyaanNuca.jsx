import React, { useState } from 'react';
import '../../style/components/games/PertanyaanNuca.css';

function PertanyaanNuca({ question, options = [], correctAnswer, onAnswerSelect, isExiting }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const isCorrectAnswer = answer === correctAnswer;
    setIsCorrect(isCorrectAnswer);
    onAnswerSelect(isCorrectAnswer); // Panggil fungsi yang diteruskan untuk menangani jawaban
  };

  return (
    <div className="popup-overlay">
      <div className={`popup-content ${isExiting ? 'popup-exit' : ''}`}>
        <h2>{question}</h2> {/* Menampilkan pertanyaan */}
        <div className="answer-options">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option.charAt(0))} // Mengirimkan jawaban
              className={selectedAnswer === option.charAt(0)
                ? isCorrect
                  ? 'correct-answer'
                  : 'incorrect-answer shake' // Tambahkan kelas shake untuk getaran
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
