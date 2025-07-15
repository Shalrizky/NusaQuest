import { Row, Col } from "react-bootstrap";
import BackStackCard from "./BackStackCard";
import PlayingStackCard from "./PlayingStackCard";
import SentCard from "./SentCardPlayer";
import PlayerProfileNuca from "./PlayerProfileNuca";
import NotAvailPlayer from "../../../assets/games/nuca/notAvailPlayerNuca.png";
import { getPlayerAtRelativePosition, getPlayerGlobalIndex, getPlayerCards, getPlayerStatus } from "../../../utils/games/nuca/NucaUtils";

const GameArea = ({
  currentUserId,
  gameState,
  currentPlayerGlobalIndex,
  timeLeft, // timeLeft dari pemain yang sedang AKTIF (baik lempar/jawab)
  TIMER_PLAYER_DURATION, // ini adalah TIMER_THROW_DURATION
  sentCard,
  handleCardClicked,
  isCurrentUserTurn, // isMyTurn dari useGameLogic
  currentTurnPhase, // Menambahkan prop ini
  TIMER_ANSWER_DURATION, // Menambahkan prop ini
  isPlayerTurn: isPlayerTurnFromHook, // Menggunakan nama yang jelas dari hook
  getPlayerTimeLeft: getPlayerTimeLeftFromHook, // Menggunakan nama yang jelas dari hook
}) => {

  const renderPlayerByPosition = (position) => {
    let playerId;

    if (position === "bottom") {
      playerId = currentUserId;
    } else {
      playerId = getPlayerAtRelativePosition(currentUserId, position);
    }

    const playerCards = getPlayerCards(playerId, gameState);
    const playerStatus = getPlayerStatus(playerId, gameState);
    const playerGlobalIndex = getPlayerGlobalIndex(playerId);

    const userProfile = {};

    // Gunakan fungsi dari hook yang sudah diteruskan sebagai props
    let currentIsActive = isPlayerTurnFromHook(playerGlobalIndex);
    let currentTimeLeft = getPlayerTimeLeftFromHook(playerGlobalIndex);
    let currentMaxTime = currentTurnPhase === "throwing" ? TIMER_PLAYER_DURATION : TIMER_ANSWER_DURATION;


    if (position === "bottom") {
      return (
        <>
          <PlayingStackCard
            cards={playerCards}
            onCardClick={handleCardClicked}
            isThrowingEnabled={isCurrentUserTurn()} // P1 bisa melempar hanya saat gilirannya melempar
          />
          <PlayerProfileNuca
            userProfile={userProfile}
            position="bottom-right"
            totalCards={playerCards.length}
            isActive={currentIsActive}
            timeLeft={currentTimeLeft}
            maxTime={currentMaxTime} 
          />
        </>
      );
    } else {
      return (
        <>
          {playerStatus === "available" && (
            <PlayerProfileNuca
              userProfile={userProfile}
              position={position === "top" ? "top-left" : position}
              totalCards={playerCards.length}
              isActive={currentIsActive}
              timeLeft={currentTimeLeft}
              maxTime={currentMaxTime} 
            />
          )}
          <BackStackCard
            totalCards={playerCards.length}
            position={position}
            showNotAvail={playerStatus === "not_available"}
            notAvailImage={NotAvailPlayer}
          />
        </>
      );
    }
  };

  return (
    <>
      <Row className="justify-content-center align-items-center">
        <Col xs="auto" className="position-relative">
          {renderPlayerByPosition("top")}
        </Col>
      </Row>

      <Row className="d-flex justify-content-between align-items-center mx-3 mx-lg-4">
        <Col md={4}>
          <div className="position-relative">
            {renderPlayerByPosition("left")}
          </div>
        </Col>

        <Col
          md={4}
          className="d-flex justify-content-center align-items-center position-relative"
        >
          <BackStackCard totalCards={5} position="middle" showShuffle={true} />
          {sentCard && <SentCard cardData={sentCard} />}
        </Col>

        <Col md={4}>
          <div className="position-relative">
            {renderPlayerByPosition("right")}
          </div>
        </Col>
      </Row>

      <Row className="d-flex justify-content-center align-items-center mb-4">
        <Col xs="auto" className="position-relative">
          {renderPlayerByPosition("bottom")}
        </Col>
      </Row>
    </>
  );
};

export default GameArea;