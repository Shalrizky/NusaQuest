// QuestionForm.js
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import "../../../style/components/games/uTangga/questionForm.css";

function QuestionForm({ question, onAnswerChange, isMyTurn }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswerChange = (e) => {
    if (!isMyTurn) return; // Hanya pemain yang sedang giliran bisa menjawab
    
    const answer = e.target.value;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    // Cek apakah jawaban benar atau salah
    const isCorrect = answer === question.correctAnswer;
    onAnswerChange(isCorrect);
  };

  return (
    <Form>
      <Form.Group>
        <Form.Label className="question-text">{question.question}</Form.Label>
        {question.options.map((option, index) => (
          <label
            key={index}
            htmlFor={`option${index}`}
            className={`form-check ${
              isAnswered && selectedAnswer === option
                ? option === question.correctAnswer
                  ? "correct-answer"
                  : "wrong-answer"
                : ""
            } ${!isMyTurn ? 'disabled' : ''}`}
          >
            <input
              type="radio"
              name="questionChoice"
              id={`option${index}`}
              value={option}
              onChange={handleAnswerChange}
              className="d-none"
              disabled={isAnswered || !isMyTurn} // Disable jika sudah dijawab atau bukan giliran
            />
            <span className="question-answer-text">{option}</span>
          </label>
        ))}
        {!isMyTurn && (
          <p className="waiting-text text-muted mt-2">
            Menunggu pemain lain menjawab...
          </p>
        )}
      </Form.Group>
    </Form>
  );
}

export default QuestionForm;