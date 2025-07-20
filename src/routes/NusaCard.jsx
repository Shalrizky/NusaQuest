import { useMemo, useCallback } from "react";
import { Container } from "react-bootstrap";
import HeaderGame from "../components/games/HeaderGame";
import QuestionModal from "../components/games/nuca/QuestionModal";
import GameArea from "../components/games/nuca/GameArea";
import useNucaLogic from "../hooks/games/nuca/useNucaLogic";
import useDebugTools from "../hooks/games/nuca/useDebugTools";
import "../style/routes/NusaCard.css";

function NusaCard() {
  const {
    // Core Game Data
    currentGameState,
    activeLocalPlayerId,
    activeGlobalPlayerIndex,
    allPlayerTimers,
    currentTurnTimeLeft,
    cardCounts,
    playerAnswerFeedback,

    // Game Status
    isMyPlayerTurnToThrow,
    isMyPlayerTurnToAnswer,
    currentActiveTurnPhase,

    // Game Objects
    thrownCardData,
    shouldShowQuestionModal,
    questionForModalDisplay,
    collectedGameHints,
    showGameOffcanvas,
    triggerShuffleAnimation,

    // Actions
    setActiveLocalPlayerId,
    setShowGameOffcanvas,
    handleCloseGameOffcanvas,
    handleCardPlayAttempt,
    handlePlayerAnswerSubmission,
    handleCloseQuestionPromptModal,

    // Utility Functions
    isPlayerTurnStatus,
    getPlayerRemainingTime,

    // Constants
    THROW_CARD_DURATION_SECONDS,
    ANSWER_QUESTION_DURATION_SECONDS,

    //! DEBUG FUNCTIONS - Only used in development for debug tools
    debugSwitchPlayerTurn,
    handleTurnTimeExpiration,
    setCurrentGameState,
    getRandomCardFromAvailablePool,
    simulateAnswer,
  } = useNucaLogic();

  // Computed values
  const displayQuestionModalForMe =
    shouldShowQuestionModal && isMyPlayerTurnToAnswer();

  //! DEBUG HELPER FUNCTIONS - Only for debug tools in development
  const debugHelpers = useMemo(
    () => ({
      debugTriggerEndTurnTimer: () => {
        handleTurnTimeExpiration();
      },
      debugSimulateAnswer: (isCorrect) => {
        if (shouldShowQuestionModal && questionForModalDisplay) {
          simulateAnswer(isCorrect);
        }
      },

      debugAddPenaltyCard: () => {
        const newRandomCard = getRandomCardFromAvailablePool();
        setCurrentGameState((prevState) => {
          const playerTargetId = `player${activeGlobalPlayerIndex + 1}`;
          return {
            ...prevState,
            [`${playerTargetId}Cards`]: [
              ...prevState[`${playerTargetId}Cards`],
              newRandomCard,
            ],
          };
        });
        console.log(
          `Debug: Menambahkan 1 kartu penalti ke P${
            activeGlobalPlayerIndex + 1
          }`
        );
      },
    }),
    [
      handleTurnTimeExpiration,
      shouldShowQuestionModal,
      questionForModalDisplay,
      simulateAnswer,
      getRandomCardFromAvailablePool,
      setCurrentGameState,
      activeGlobalPlayerIndex,
    ]
  );

  //! DEBUG: Player position calculator for debug tools
  const getPlayerAtRelativePosition = useCallback(
    (position) => {
      const positions = ["player1", "player2", "player3", "player4"];
      const currentIndex = positions.indexOf(activeLocalPlayerId);
      const offsetMap = { left: 1, top: 2, right: 3 };
      const targetIndex = (currentIndex + offsetMap[position]) % 4;
      return positions[targetIndex];
    },
    [activeLocalPlayerId]
  );

  //! DEBUG TOOLS INTEGRATION - Only rendered in development
  const { DebugPanel } = useDebugTools({
    // Core debug data
    currentUserId: activeLocalPlayerId,
    currentPlayerGlobalIndex: activeGlobalPlayerIndex,
    timeLeft: currentTurnTimeLeft,
    isMyTurnValue: isMyPlayerTurnToThrow(),
    playerTimersData: allPlayerTimers,
    currentTurnPhase: currentActiveTurnPhase,
    playerAnsweringGlobalIndex: activeGlobalPlayerIndex,
    currentGameState,

    // Position helper for debug display
    getPlayerAtRelativePosition,

    // Debug control functions
    handleDebugSwitchTurn: debugSwitchPlayerTurn,
    handleDebugSwitchUser: setActiveLocalPlayerId,
    triggerAutoEndTimer: debugHelpers.debugTriggerEndTurnTimer,
    simulateAnswer: debugHelpers.debugSimulateAnswer,
    addPenaltyCard: debugHelpers.debugAddPenaltyCard,

    // Debug display data
    currentQuestion: questionForModalDisplay,
    isQuestionModalActive: shouldShowQuestionModal,
  });

  return (
    <div className="nusa-page d-flex flex-column">
      <HeaderGame
        hints={collectedGameHints}
        showOffcanvas={showGameOffcanvas}
        setShowOffcanvas={setShowGameOffcanvas}
        onCloseOffcanvas={handleCloseGameOffcanvas}
      />

      {/* DEBUG PANEL - Only shown in development environment */}
      {process.env.NODE_ENV === "development" && <DebugPanel />}

      <Container
        fluid
        id="nuca-container"
        className="flex-grow-1 d-flex flex-column justify-content-between"
      >
        <GameArea
          currentUserId={activeLocalPlayerId}
          gameState={currentGameState}
          playerAnswerFeedback={playerAnswerFeedback}
          currentPlayerGlobalIndex={activeGlobalPlayerIndex}
          cardCounts={cardCounts}
          timeLeft={currentTurnTimeLeft}
          TIMER_PLAYER_DURATION={THROW_CARD_DURATION_SECONDS}
          throwCard={thrownCardData}
          handleCardClicked={handleCardPlayAttempt}
          isCurrentUserTurn={isMyPlayerTurnToThrow}
          currentTurnPhase={currentActiveTurnPhase}
          TIMER_ANSWER_DURATION={ANSWER_QUESTION_DURATION_SECONDS}
          isPlayerTurn={isPlayerTurnStatus}
          getPlayerTimeLeft={getPlayerRemainingTime}
          triggerShuffleAnimation={triggerShuffleAnimation}
        />
      </Container>

      <QuestionModal
        show={displayQuestionModalForMe}
        questionData={questionForModalDisplay}
        onClose={handleCloseQuestionPromptModal}
        onSubmitAnswer={handlePlayerAnswerSubmission}
        isMyTurnToAnswer={isMyPlayerTurnToAnswer()}
        currentPlayerId={activeLocalPlayerId}
        playerAnsweringId={`player${activeGlobalPlayerIndex + 1}`}
        timeLeft={currentTurnTimeLeft}
        TIMER_ANSWER_DURATION={ANSWER_QUESTION_DURATION_SECONDS}
      />
    </div>
  );
}

export default NusaCard;