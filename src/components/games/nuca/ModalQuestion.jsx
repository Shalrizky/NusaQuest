import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import QuestionForm from "../QuestionForm"; // Pastikan path ini benar

function ModalQuestion({
  show,
  questionData,
  onClose,
  onSubmitAnswer,
  isMyTurn,
}) {
  // Handler yang dipanggil oleh QuestionForm saat jawaban dipilih/berubah
  const handleAnswerChangeFromForm = (answerResult) => {
    onSubmitAnswer(answerResult);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    onClose();
  };

  if (!questionData) {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="md"
      centered
      backdrop="static"
    >
      <Modal.Body>
        <QuestionForm
          question={questionData}
          onAnswerChange={handleAnswerChangeFromForm} 
          isMyTurn={isMyTurn}
        />
      </Modal.Body>
    </Modal>
  );
}

export default ModalQuestion;
