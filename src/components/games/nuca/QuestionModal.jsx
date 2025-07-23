import React, { useMemo, useCallback } from "react";
import { Modal, Image } from "react-bootstrap";
import QuestionForm from "../QuestionForm";
import PlayerProfileNuca from "./PlayerProfileNuca";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import CheckIcon from "../../../assets/games/nuca/checklist.png";
import PotionImage from "../../../assets/games/potion.png";
import "../../../style/components/games/nuca/QuestionModal.css";

// Constants
const PROFILE_RADIUS = 35;

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
  // Find the actual player data who is answering
  const answeringPlayerData = useMemo(() => {
    const answeringPlayerIndex =
      parseInt(playerAnsweringId.replace("player", "")) - 1;
    const playerData = players.find(
      (_, index) => index === answeringPlayerIndex
    );
    return playerData || { photoURL: DefaultProfileImage };
  }, [playerAnsweringId, players]);

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

  const handleModalClose = useCallback(() => {
    // Jangan close modal jika potion sedang digunakan
    if (isPotionUsed) {
      return;
    }
    onClose();
  }, [onClose, isPotionUsed]);

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

  // Timer profile component dengan player photo
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

  // Potion success overlay
  const potionOverlay = useMemo(() => {
    if (!isPotionUsed) return null;

    return (
      <div
        className="potion-overlay position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "rgba(35, 145, 81, 0.9)",
          zIndex: 999,
           top: 0,
          left: 0,
          borderradius: "20px"
        }}
      >
        <div className="text-center text-white">
          <div className="mb-2" style={{ fontSize: "3rem" }}>
             <Image width={50} src={CheckIcon}/> 
             <Image width={50} src={PotionImage}/> 
          </div>
          <h4 className="mb-1">Potion Used!</h4>
          <p className="mb-0">Auto-correct answer activated</p>
        </div>
      </div>
    );
  }, [isPotionUsed]);

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
        {timerProfile}
      </Modal.Body>
    </Modal>
  );
}

export default React.memo(QuestionModal);
