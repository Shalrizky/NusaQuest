import React from "react";

const Question = ({ currentQuestion, selectedAnswer, handleAnswerChange, submitted, isCorrect }) => {
  if (!currentQuestion || !currentQuestion.options) {
    return null;
  }

  return (
    <div className="question-container">
      <h3>{currentQuestion.question}</h3>
      <div className="options-list">
        {currentQuestion.options.map((option, index) => (
          <div key={index} className="option-item">
            <input
              type="radio"
              id={`option-${index}`}
              name="answer"
              value={option}
              checked={selectedAnswer === option}
              onChange={handleAnswerChange}
              disabled={submitted}
            />
            <label htmlFor={`option-${index}`}>{option}</label>
          </div>
        ))}
      </div>
      {submitted && (
        <div className={`answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <p>{isCorrect ? 'Jawaban benar!' : 'Jawaban salah.'}</p>
        </div>
      )}
    </div>
  );
};

export default Question;