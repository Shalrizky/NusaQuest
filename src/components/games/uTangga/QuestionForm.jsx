// QuestionForm.js
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import "../../../style/components/games/uTangga/questionForm.css";

function QuestionForm({ question, onAnswerChange, isMyTurn }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  if (!question) {
    return <p>No question available.</p>;
  }

  const options = Array.isArray(question.multiple_choices)
    ? question.multiple_choices
    : Object.values(question.multiple_choices);

  const handleAnswerChange = (e) => {
    if (!isMyTurn || isAnswered) return; // Nonaktifkan jawaban jika bukan giliran pemain

    const answer = e.target.value;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const selectedOption = options.find(opt => opt.answer_text === answer);
    const isCorrect = selectedOption && selectedOption.is_correct;
    onAnswerChange(isCorrect);
  };

  return (
    <Form>
      <Form.Group>
        <Form.Label className="question-text">{question.question_text}</Form.Label>
        {options.map((option, index) => (
          <label
            key={index}
            htmlFor={`option${index}`}
            className={`form-check ${
              isAnswered && selectedAnswer === option.answer_text
                ? option.is_correct
                  ? "correct-answer"
                  : "wrong-answer"
                : ""
            } ${!isMyTurn ? "disabled" : ""}`}
          >
            <input
              type="radio"
              name="questionChoice"
              id={`option${index}`}
              value={option.answer_text}
              onChange={handleAnswerChange}
              className="d-none"
              disabled={!isMyTurn || isAnswered} // Disable jika bukan giliran pemain atau sudah dijawab
            />
            <span className="question-answer-text">{option.answer_text}</span>
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
