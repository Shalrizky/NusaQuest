import React, { useMemo, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import PlayerBackStackCards from "./PlayerBackStackCards";
import PlayerHandCards from "./PlayerHandCards";
import ThrowingCard from "./ThrowingCard";
import PlayerProfileNuca from "./PlayerProfileNuca";
import NotAvailablePlayerImage from "../../../assets/games/nuca/notAvailPlayerNuca.png";
import { getPlayerAtRelativePosition, getPlayerGlobalIndex, getPlayerCards, getPlayerStatus } from "../../../utils/games/nuca/NucaUtils";

// Constants to prevent recreation
const PLAYER_POSITIONS = ["top", "left", "right", "bottom"];
const MIDDLE_DECK_CARDS = 5;

const GameArea = ({
  currentUserId,
  gameState,
  TIMER_PLAYER_DURATION,
  throwCard,
  handleCardClicked,
  isCurrentUserTurn,
  currentTurnPhase,
  TIMER_ANSWER_DURATION,
  isPlayerTurn: isPlayerTurnFromHook,
  getPlayerTimeLeft: getPlayerTimeLeftFromHook,
  triggerShuffleAnimation,
}) => {
  // Memoized player data calculation to prevent recalculation on every render
  const playersData = useMemo(() => {
    const data = {};
    
    PLAYER_POSITIONS.forEach(position => {
      const playerId = position === "bottom" 
        ? currentUserId 
        : getPlayerAtRelativePosition(currentUserId, position);
      
      const playerCards = getPlayerCards(playerId, gameState);
      const playerStatus = getPlayerStatus(playerId, gameState);
      const playerGlobalIndex = getPlayerGlobalIndex(playerId);
      const isCurrentPlayerActive = isPlayerTurnFromHook(playerGlobalIndex);
      const currentPlayerTimeLeft = getPlayerTimeLeftFromHook(playerGlobalIndex);
      const currentMaxTimeForTurn = currentTurnPhase === "throwing" 
        ? TIMER_PLAYER_DURATION 
        : TIMER_ANSWER_DURATION;

      data[position] = {
        playerId,
        playerCards,
        playerStatus,
        playerGlobalIndex,
        isCurrentPlayerActive,
        currentPlayerTimeLeft,
        currentMaxTimeForTurn,
        profileData: {}, // Empty object for consistency
      };
    });
    
    return data;
  }, [
    currentUserId,
    gameState,
    currentTurnPhase,
    TIMER_PLAYER_DURATION,
    TIMER_ANSWER_DURATION,
    isPlayerTurnFromHook,
    getPlayerTimeLeftFromHook
  ]);

  // Memoized bottom player render (current user)
  const renderBottomPlayer = useCallback(() => {
    const playerData = playersData.bottom;
    
    return (
      <>
        <PlayerHandCards
          cards={playerData.playerCards}
          onCardClick={handleCardClicked}
          isThrowingEnabled={isCurrentUserTurn()}
        />
        <PlayerProfileNuca
          userProfile={playerData.profileData}
          position="bottom-right"
          totalCards={playerData.playerCards.length}
          isActive={playerData.isCurrentPlayerActive}
          timeLeft={playerData.currentPlayerTimeLeft}
          maxTime={playerData.currentMaxTimeForTurn}
        />
      </>
    );
  }, [playersData.bottom, handleCardClicked, isCurrentUserTurn]);

  // Memoized other players render (top, left, right)
  const renderOtherPlayer = useCallback((position) => {
    const playerData = playersData[position];
    const profilePosition = position === "top" ? "top-left" : position;
    
    return (
      <>
        {playerData.playerStatus === "available" && (
          <PlayerProfileNuca
            userProfile={playerData.profileData}
            position={profilePosition}
            totalCards={playerData.playerCards.length}
            isActive={playerData.isCurrentPlayerActive}
            timeLeft={playerData.currentPlayerTimeLeft}
            maxTime={playerData.currentMaxTimeForTurn}
          />
        )}
        <PlayerBackStackCards
          totalCards={playerData.playerCards.length}
          position={position}
          showNotAvail={playerData.playerStatus === "not_available"}
          notAvailImage={NotAvailablePlayerImage}
        />
      </>
    );
  }, [playersData]);

  // Memoized center area with deck and thrown card
  const renderCenterArea = useMemo(() => (
    <Col
      md={4}
      className="d-flex justify-content-center align-items-center position-relative"
    >
      <PlayerBackStackCards
        totalCards={MIDDLE_DECK_CARDS}
        position="middle"
        showShuffle={true}
        triggerShuffleAnimation={triggerShuffleAnimation}
      />
      {throwCard && <ThrowingCard cardData={throwCard} />}
    </Col>
  ), [throwCard, triggerShuffleAnimation]);

  return (
    <>
      {/* Top Player */}
      <Row className="justify-content-center align-items-center">
        <Col xs="auto" className="position-relative">
          {renderOtherPlayer("top")}
        </Col>
      </Row>

      {/* Middle Row: Left Player + Center Deck + Right Player */}
      <Row className="d-flex justify-content-between align-items-center mx-3 mx-lg-4">
        <Col md={4}>
          <div className="position-relative">
            {renderOtherPlayer("left")}
          </div>
        </Col>

        {renderCenterArea}

        <Col md={4}>
          <div className="position-relative">
            {renderOtherPlayer("right")}
          </div>
        </Col>
      </Row>

      {/* Bottom Player (Current User) */}
      <Row className="d-flex justify-content-center align-items-center mb-4">
        <Col xs="auto" className="position-relative">
          {renderBottomPlayer()}
        </Col>
      </Row>
    </>
  );
};

export default React.memo(GameArea);