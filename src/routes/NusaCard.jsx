import { Container, Row, Col, Spinner } from "react-bootstrap";
import HeaderGame from "../components/games/HeaderGame";
import ModalQuestion from "../components/games/nuca/ModalQuestion";
import GameArea from "../components/games/nuca/GameArea";
import useGameLogic from "../hooks/games/nuca/useGameLogic";
import useDebugTools from "../hooks/games/nuca/useDebugTools";
import { getPlayerGlobalIndex} from "../utils/games/nuca/NucaUtils";


import "../style/routes/NusaCard.css";
// import "../style/components/games/nuca/WaitingOverlay.css"; // Hapus import ini jika Anda tidak lagi menggunakan kelas WaitingOverlay


function NusaCard() {
  const {
    gameState,
    currentUserId,
    currentPlayerGlobalIndex, // Pemain yang gilirannya AKTIF (melempar atau menjawab)
    playerTimersData,
    timeLeft,
    isMyTurn, // Cek apakah giliran user untuk melempar
    isMyTurnToAnswer, // Cek apakah giliran user untuk menjawab
    sentCard,
    showQuestionModal, // Menandakan apakah ada pertanyaan yang perlu dijawab (secara global)
    currentQuestionForModal,
    collectedHints,
    showOffcanvas,
    setCurrentUserId,
    handleDebugSwitchTurn,
    setShowOffcanvas,
    handleCloseOffcanvas,
    handleCardClicked,
    handleAnswerSubmittedByPlayer,
    handleCloseQuestionModal,
    currentTurnPhase,
    playerAnsweringGlobalIndex, // Ini akan menjadi sama dengan currentPlayerGlobalIndex di fase answering
    TIMER_THROW_DURATION,
    TIMER_ANSWER_DURATION,
    isPlayerTurn: isPlayerTurnFromHook, // Rename untuk menghindari konflik nama
    getPlayerTimeLeft: getPlayerTimeLeftFromHook, // Rename untuk menghindari konflik nama
  } = useGameLogic();

  const { DebugPanel } = useDebugTools({
    currentUserId,
    currentPlayerGlobalIndex,
    timeLeft,
    isMyTurnValue: isMyTurn(), // Pastikan dipanggil sebagai fungsi di sini
    playerTimersData,
    currentTurnPhase,
    playerAnsweringGlobalIndex: currentPlayerGlobalIndex, // di debug panel kita bisa gunakan currentPlayerGlobalIndex saja
    getPlayerAtRelativePosition: (pos) => {
      const positions = ["player1", "player2", "player3", "player4"];
      const currentIndex = positions.indexOf(currentUserId);
      const offsetMap = { left: 1, top: 2, right: 3 };
      const targetIndex = (currentIndex + offsetMap[pos]) % 4;
      return positions[targetIndex];
    },
    handleDebugSwitchTurn,
    currentTurnPhase, // Tambahkan ini
    handleDebugSwitchUser: setCurrentUserId,
  });

  const shouldShowQuestionModalForMe = showQuestionModal && isMyTurnToAnswer();

  return (
    <div className="nusa-page d-flex flex-column">
      <HeaderGame
        hints={collectedHints}
        showOffcanvas={showOffcanvas}
        setShowOffcanvas={setShowOffcanvas}
        onCloseOffcanvas={handleCloseOffcanvas}
      />

      {process.env.NODE_ENV === "development" && <DebugPanel />}

      <Container
        fluid
        id="nuca-container"
        className="flex-grow-1 d-flex flex-column justify-content-between"
      >
        <GameArea
          currentUserId={currentUserId}
          gameState={gameState}
          currentPlayerGlobalIndex={currentPlayerGlobalIndex}
          timeLeft={timeLeft}
          TIMER_PLAYER_DURATION={TIMER_THROW_DURATION} // Ini akan menjadi TIMER_THROW_DURATION di GameArea
          sentCard={sentCard}
          handleCardClicked={handleCardClicked}
          isCurrentUserTurn={isMyTurn}
          currentTurnPhase={currentTurnPhase} // TERUSKAN PROPS INI
          TIMER_ANSWER_DURATION={TIMER_ANSWER_DURATION} // TERUSKAN PROPS INI
          isPlayerTurn={isPlayerTurnFromHook} // TERUSKAN PROPS INI
          getPlayerTimeLeft={getPlayerTimeLeftFromHook} // TERUSKAN PROPS INI
        />
      </Container>

      <ModalQuestion
        show={shouldShowQuestionModalForMe}
        questionData={currentQuestionForModal}
        onClose={handleCloseQuestionModal}
        onSubmitAnswer={handleAnswerSubmittedByPlayer}
        isMyTurnToAnswer={isMyTurnToAnswer()}
        currentPlayerId={currentUserId}
        playerAnsweringId={`player${currentPlayerGlobalIndex + 1}`}
        timeLeft={timeLeft}
        TIMER_ANSWER_DURATION={TIMER_ANSWER_DURATION}
      />
    </div>
  );
}

export default NusaCard;