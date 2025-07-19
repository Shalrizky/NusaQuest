import React, { useMemo, useCallback } from "react";
import { Modal } from "react-bootstrap";
import QuestionForm from "../QuestionForm";
import PlayerProfileNuca from "./PlayerProfileNuca";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import "../../../style/components/games/nuca/QuestionModal.css";

// Constants
const MODAL_CLOSE_DELAY = 1000;
const PROFILE_RADIUS = 35;
const MODAL_PLAYER_PROFILE = {
  image: DefaultProfileImage,
};

function QuestionModal({
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
  // Memoized player state calculation - called before early return
  const playerState = useMemo(() => ({
    isCurrentlyAnsweringPlayer: currentPlayerId === playerAnsweringId,
    modalTitle: currentPlayerId === playerAnsweringId 
      ? "Waktunya Menjawab!" 
      : "Pemain Lain Sedang Menjawab"
  }), [currentPlayerId, playerAnsweringId]);

  // Memoized answer submission handler
  const handleAnswerChangeFromForm = useCallback((answerResult) => {
    onSubmitAnswer(answerResult);
    setTimeout(() => {
      onClose();
    }, MODAL_CLOSE_DELAY);
  }, [onSubmitAnswer, onClose]);

  // Memoized modal close handler
  const handleModalClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Memoized modal props
  const modalProps = useMemo(() => ({
    id: "modal-question-nuca",
    show,
    onHide: handleModalClose,
    size: "md",
    centered: true,
    backdrop: "static"
  }), [show, handleModalClose]);

  // Memoized timer profile component
  const timerProfile = useMemo(() => (
    <div className="modal-timer-container d-flex justify-content-center mt-3">
      <PlayerProfileNuca
        userProfile={MODAL_PLAYER_PROFILE}
        position="center"
        totalCards={-1}
        isActive={playerState.isCurrentlyAnsweringPlayer}
        timeLeft={timeLeft}
        maxTime={TIMER_ANSWER_DURATION}
        radius={PROFILE_RADIUS}
      />
    </div>
  ), [playerState.isCurrentlyAnsweringPlayer, timeLeft, TIMER_ANSWER_DURATION]);

  // Early return AFTER all hooks - this fixes the React Hooks rules
  if (!questionData) {
    return null;
  }

  return (
    <Modal {...modalProps}>
      <Modal.Header className="justify-content-center border-0">
        <Modal.Title>
          {playerState.modalTitle}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-content">
        <QuestionForm
          question={questionData}
          onAnswerChange={handleAnswerChangeFromForm}
          isMyTurn={isMyTurnToAnswer}
        />
        {timerProfile}
      </Modal.Body>
    </Modal>
  );
}

export default React.memo(QuestionModal);