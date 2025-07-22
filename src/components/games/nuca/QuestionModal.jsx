// 3. FIXED QuestionModal.jsx
import React, { useMemo, useCallback } from "react";
import { Modal } from "react-bootstrap";
import QuestionForm from "../QuestionForm";
import PlayerProfileNuca from "./PlayerProfileNuca";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import "../../../style/components/games/nuca/QuestionModal.css";

// Constants
const PROFILE_RADIUS = 35;

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
  playerAnswerFeedback,
  players, // ADDED: Array of player data
}) {
  // FIXED: Find the actual player data who is answering
  const answeringPlayerData = useMemo(() => {
    const answeringPlayerIndex = parseInt(playerAnsweringId.replace('player', '')) - 1;
    const playerData = players.find((_, index) => index === answeringPlayerIndex);
    return playerData || { photoURL: DefaultProfileImage };
  }, [playerAnsweringId, players]);

  // Memoized player state calculation - called before early return
  const playerState = useMemo(
    () => ({
      isCurrentlyAnsweringPlayer: currentPlayerId === playerAnsweringId,
    }),
    [currentPlayerId, playerAnsweringId]
  );

  // Memoized answer submission handler
  const handleAnswerChangeFromForm = useCallback(
    (answerResult) => {
      onSubmitAnswer(answerResult);
    },
    [onSubmitAnswer]
  );

  // Memoized modal close handler
  const handleModalClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Memoized modal props
  const modalProps = useMemo(
    () => ({
      id: "modal-question-nuca",
      show,
      onHide: handleModalClose,
      size: "md",
      centered: true,
      backdrop: "static",
    }),
    [show, handleModalClose]
  );

  // FIXED: Memoized timer profile component dengan player photo
  const timerProfile = useMemo(
    () => (
      <div className="modal-timer-container d-flex justify-content-center mt-3">
        <PlayerProfileNuca
          userProfile={{}} // Empty object
          position="center"
          totalCards={-1} 
          isActive={true} // FIXED: Always show timer in modal
          timeLeft={timeLeft}
          maxTime={TIMER_ANSWER_DURATION}
          radius={PROFILE_RADIUS}
          answerFeedback={playerAnswerFeedback[playerAnsweringId]}
          playerData={answeringPlayerData} // ADDED: Pass actual player data
        />
      </div>
    ),
    [
      timeLeft,
      TIMER_ANSWER_DURATION,
      playerAnswerFeedback, 
      playerAnsweringId,
      answeringPlayerData, // ADDED
    ]
  );

  if (!questionData) {
    return null;
  }

  return (
    <Modal {...modalProps}>
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