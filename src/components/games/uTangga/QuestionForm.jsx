import React, { useState } from "react";
import { Form } from "react-bootstrap";
import "../../../style/components/games/uTangga/questionForm.css";

function QuestionForm({ question, onAnswerChange }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswerChange = (e) => {
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
            }`}
          >
            <input
              type="radio"
              name="questionChoice"
              id={`option${index}`}
              value={option}
              onChange={handleAnswerChange}
              className="d-none"
              disabled={isAnswered} // Setelah menjawab, pilihan dikunci
            />
            <span className="question-answer-text">{option}</span>
          </label>
        ))}
      </Form.Group>
    </Form>
  );
}

export default QuestionForm;
