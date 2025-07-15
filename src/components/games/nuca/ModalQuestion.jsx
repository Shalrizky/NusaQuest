import { Modal } from "react-bootstrap";
import QuestionForm from "../QuestionForm";
import PlayerProfileNuca from "./PlayerProfileNuca";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import "../../../style/components/games/nuca/ModalQuestion.css";

function ModalQuestion({
  show,
  questionData,
  onClose,
  onSubmitAnswer,
  isMyTurnToAnswer,
  currentPlayerId,
  playerAnsweringId,
  timeLeft,
  TIMER_ANSWER_DURATION,
}) {
  // Handler yang dipanggil oleh QuestionForm saat jawaban dipilih/berubah
  const handleAnswerChangeFromForm = (answerResult) => {
    onSubmitAnswer(answerResult);
    // Timeout untuk memberi waktu animasi atau feedback sebelum menutup modal
    setTimeout(() => {
      onClose(); // Cukup tutup modal
    }, 1000);
  };

  const handleClose = () => {
    // *** PERUBAHAN: Hapus baris di bawah ini. Logic penalti sudah ditangani di useGameLogic.js ***
    // onSubmitAnswer({ isCorrect: false }); 
    onClose(); // Cukup tutup modal
  };

  if (!questionData) {
    return null;
  }

  // Cek apakah pemain yang sedang melihat modal adalah pemain yang seharusnya menjawab
  const isCurrentlyAnsweringPlayer = currentPlayerId === playerAnsweringId;

  // Dummy userProfile untuk PlayerProfileNuca di modal
  const userProfileForModal = {
    image: DefaultProfileImage,
  };

  return (
    <Modal
      id="modal-question-nuca"
      show={show}
      onHide={handleClose}
      size="md"
      centered
      backdrop="static" // Mencegah modal ditutup dengan klik di luar
    >
      <Modal.Header className="justify-content-center border-0">
        <Modal.Title>
          {isCurrentlyAnsweringPlayer ? "Waktunya Menjawab!" : "Pemain Lain Sedang Menjawab"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-content">
        <QuestionForm
          question={questionData}
          onAnswerChange={handleAnswerChangeFromForm}
          isMyTurn={isMyTurnToAnswer} // Mengontrol apakah form bisa berinteraksi
        />
        {/* Tampilkan PlayerProfileNuca (sebagai timer) di modal */}
        <div className="modal-timer-container d-flex justify-content-center mt-3">
          <PlayerProfileNuca
            userProfile={userProfileForModal}
            position="center" // Bisa disesuaikan dengan styling modal Anda
            totalCards={-1} // Tidak relevan di sini, bisa diabaikan atau 0
            isActive={isCurrentlyAnsweringPlayer} // Aktifkan timer hanya jika ini giliran pemain yang sedang melihat modal untuk menjawab
            timeLeft={timeLeft}
            maxTime={TIMER_ANSWER_DURATION}
            radius={35} // Sesuaikan ukuran timer di modal jika perlu
          />
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ModalQuestion;