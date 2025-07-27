import React, { useMemo, useCallback } from "react";
import { Modal, Image } from "react-bootstrap";
import QuestionForm from "../QuestionForm";
import PlayerProfileNuca from "./PlayerProfileNuca";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import CheckIcon from "../../../assets/games/nuca/checklist.png";
import PotionImage from "../../../assets/games/potion.png";
import "../../../style/components/games/nuca/QuestionModal.css";

// Konstanta
const PROFILE_RADIUS = 35;

/**
 * @function QuestionModal
 * @description Komponen modal yang menampilkan pertanyaan permainan kepada pemain.
 * Modal ini juga mengelola interaksi jawaban, menampilkan profil pemain yang menjawab,
 * timer, dan overlay ketika ramuan digunakan.
 * @param {Object} props - Properti yang diteruskan ke komponen.
 * @param {boolean} props.show - Mengontrol visibilitas modal.
 * @param {Object} props.questionData - Objek yang berisi data pertanyaan yang akan ditampilkan.
 * @param {function(): void} props.onClose - Fungsi callback yang dipanggil saat modal ditutup.
 * @param {function(Object): void} props.onSubmitAnswer - Fungsi callback yang dipanggil saat pemain mengirimkan jawaban.
 * Parameter adalah objek hasil jawaban (misalnya {isCorrect: boolean, hint: string}).
 * @param {boolean} props.isMyTurnToAnswer - Menunjukkan apakah giliran pemain lokal untuk menjawab.
 * @param {string} props.playerAnsweringId - ID string pemain yang sedang menjawab (misalnya "player1").
 * @param {number} props.timeLeft - Sisa waktu dalam detik untuk menjawab pertanyaan.
 * @param {number} props.TIMER_ANSWER_DURATION - Durasi maksimum timer jawaban dalam detik.
 * @param {Object} props.playerAnswerFeedback - Objek yang berisi umpan balik jawaban untuk setiap pemain (misalnya {player1: 'correct' | 'incorrect'}).
 * @param {Array<Object>} props.players - Array objek data pemain yang berpartisipasi dalam game.
 * @param {boolean} [props.isPotionUsed=false] - Status boolean yang menunjukkan apakah ramuan sedang digunakan untuk melewati pertanyaan.
 * @returns {JSX.Element|null} Komponen Modal pertanyaan atau `null` jika tidak ada `questionData`.
 */
function QuestionModal({
  show,
  questionData,
  onClose,
  onSubmitAnswer,
  isMyTurnToAnswer,
  playerAnsweringId,
  timeLeft,
  TIMER_ANSWER_DURATION,
  playerAnswerFeedback,
  players,
  isPotionUsed = false,
}) {
  /**
   * @constant answeringPlayerData
   * @description Menggunakan `useMemo` untuk mencari data profil pemain yang sedang menjawab
   * dari array `players` berdasarkan `playerAnsweringId`.
   * @returns {Object} Objek data pemain yang menjawab, atau objek default jika tidak ditemukan.
   */
  const answeringPlayerData = useMemo(() => {
    const answeringPlayerIndex =
      parseInt(playerAnsweringId.replace("player", "")) - 1;
    const playerData = players.find(
      (_, index) => index === answeringPlayerIndex
    );
    return playerData || { photoURL: DefaultProfileImage };
  }, [playerAnsweringId, players]);

  /**
   * @function handleAnswerChangeFromForm
   * @description Callback yang dipicu ketika `QuestionForm` mengirimkan hasil jawaban.
   * Mencegah pengiriman jawaban jika ramuan (`isPotionUsed`) sedang aktif.
   * @param {Object} answerResult - Objek hasil jawaban dari `QuestionForm`.
   * @returns {void}
   */
  const handleAnswerChangeFromForm = useCallback(
    (answerResult) => {
      // Jangan submit jika potion sedang digunakan
      if (isPotionUsed) {
        return;
      }
      onSubmitAnswer(answerResult);
    },
    [onSubmitAnswer, isPotionUsed]
  );

  /**
   * @function handleModalClose
   * @description Callback yang dipicu ketika modal diminta untuk ditutup.
   * Mencegah penutupan modal jika ramuan (`isPotionUsed`) sedang aktif.
   * @returns {void}
   */
  const handleModalClose = useCallback(() => {
    // Jangan close modal jika potion sedang digunakan
    if (isPotionUsed) {
      return;
    }
    onClose();
  }, [onClose, isPotionUsed]);

  /**
   * @constant modalProps
   * @description Menggunakan `useMemo` untuk membuat properti `Modal` secara efisien.
   * Mengatur `backdrop` menjadi "static" jika `isPotionUsed` aktif, agar modal tidak bisa ditutup secara otomatis.
   * @returns {Object} Objek properti untuk komponen `Modal`.
   */
  const modalProps = useMemo(
    () => ({
      id: "modal-question-nuca",
      show,
      onHide: handleModalClose,
      size: "md",
      centered: true,
      backdrop: isPotionUsed ? "static" : "static", 
    }),
    [show, handleModalClose, isPotionUsed]
  );

  /**
   * @constant timerProfile
   * @description Menggunakan `useMemo` untuk merender komponen `PlayerProfileNuca`
   * yang menampilkan profil pemain yang sedang menjawab beserta timernya.
   * @returns {JSX.Element} Elemen JSX `PlayerProfileNuca`.
   */
  const timerProfile = useMemo(
    () => (
      <div className="modal-timer-container d-flex justify-content-center mt-3">
        <PlayerProfileNuca
          userProfile={{}} 
          position="center"
          totalCards={-1} 
          isActive={true} 
          timeLeft={timeLeft}
          maxTime={TIMER_ANSWER_DURATION}
          radius={PROFILE_RADIUS}
          answerFeedback={playerAnswerFeedback[playerAnsweringId]}
          playerData={answeringPlayerData}
          hideStatusText={true}
        />
      </div>
    ),
    [
      timeLeft,
      TIMER_ANSWER_DURATION,
      playerAnswerFeedback,
      playerAnsweringId,
      answeringPlayerData,
    ]
  );

  /**
   * @constant potionOverlay
   * @description Menggunakan `useMemo` untuk merender overlay visual ketika ramuan digunakan.
   * Overlay ini muncul di atas konten modal untuk memberikan umpan balik kepada pengguna.
   * @returns {JSX.Element|null} Elemen JSX overlay ramuan atau `null` jika ramuan tidak digunakan.
   */
  const potionOverlay = useMemo(() => {
    if (!isPotionUsed) return null; 

    return (
      <div
        className="potion-overlay position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "#162b4df0", 
          zIndex: 999, 
          top: 0,
          left: 0,
          borderRadius: "20px" 
        }}
      >
        <div className="text-center text-white">
          <div className="mb-2" style={{ fontSize: "3rem" }}>
            <Image width={50} src={CheckIcon}/> 
            <Image width={50} src={PotionImage}/> 
          </div>
          <h4 className="mb-1">POTION DIGUNAKAN!</h4>
          <p className="mb-0">Melewati Pertanyaan Aktif</p>
        </div>
      </div>
    );
  }, [isPotionUsed]); 

  // Jangan render modal jika tidak ada data pertanyaan
  if (!questionData) {
    return null;
  }

  return (
    <Modal {...modalProps}>
      <Modal.Body className="modal-content position-relative">
        {potionOverlay} 
        <QuestionForm
          question={questionData}
          onAnswerChange={handleAnswerChangeFromForm}
          isMyTurn={isMyTurnToAnswer}
          disabled={isPotionUsed}
        />
        {timerProfile} {/* Tampilkan profil timer */}
      </Modal.Body>
    </Modal>
  );
}

/**
 * @exports QuestionModal
 * @description Komponen `QuestionModal` diekspor sebagai memoized component
 * untuk mengoptimalkan kinerja dengan mencegah re-render yang tidak perlu
 * jika propertinya tidak berubah secara dangkal (shallowly).
 */
export default React.memo(QuestionModal);