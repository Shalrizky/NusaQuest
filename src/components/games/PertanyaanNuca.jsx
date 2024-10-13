import React, { useState } from 'react';
import '../../style/components/games/PertanyaanNuca.css';

function PertanyaanNuca({ onAnswerSelect, isExiting }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const correctAnswer = 'A'; // Misalnya jawaban yang benar adalah 'A'

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer === correctAnswer);
    onAnswerSelect(answer); // Panggil fungsi yang diteruskan untuk menangani jawaban
  };

  return (
    <div className="popup-overlay">
      <div className={`popup-content ${isExiting ? 'popup-exit' : ''}`}>
        <h2>Soto dari mana?</h2>
        <div className="answer-options">
          {['A', 'B', 'C', 'D'].map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              className={
                selectedAnswer === option
                  ? isCorrect
                    ? 'correct-answer'
                    : 'incorrect-answer shake' // Tambahkan kelas shake untuk getaran
                  : ''
              }
            >
              {option}. {option === 'A' ? 'Lamongan' : option === 'B' ? 'Betawi' : option === 'C' ? 'Kudus' : 'Madura'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PertanyaanNuca;
