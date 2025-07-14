import { Modal } from "react-bootstrap";
import QuestionForm from "../QuestionForm"; 
import "../../../style/components/games/nuca/ModalQuestion.css"

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
    }, 1000);
  };

  const handleClose = () => {
    onClose();
  };

  if (!questionData) {
    return null;
  }

  return (
    <Modal
      id="modal-question-nuca"
      show={show}
      onHide={handleClose}
      size="md"
      centered
      backdrop="static"
    >
      <Modal.Body className="modal-content">
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
