import React, { useMemo, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import PlayerBackStackCards from "./PlayerBackStackCards";
import PlayerHandCards from "./PlayerHandCards";
import ThrowingCard from "./ThrowingCard";
import PlayerProfileNuca from "./PlayerProfileNuca";
import NotAvailablePlayerImage from "../../../assets/games/nuca/notAvailPlayerNuca.png";
import {
  getPlayerAtRelativePosition,
  getPlayerGlobalIndex,
  getPlayerCards,
  getPlayerStatus,
} from "../../../utils/games/nuca/NucaUtils";

// Constants to prevent recreation
const PLAYER_POSITIONS = ["top", "left", "right", "bottom"];
const MIDDLE_DECK_CARDS = 5;

const GameArea = ({
  currentUserId,
  gameState,
  playerAnswerFeedback,
  TIMER_PLAYER_DURATION,
  throwCard,
  handleCardClicked,
  isCurrentUserTurn,
  currentTurnPhase,
  TIMER_ANSWER_DURATION,
  isPlayerTurn, // FIXED: renamed from isPlayerTurnFromHook
  getPlayerTimeLeft, // FIXED: renamed from getPlayerTimeLeftFromHook
  triggerShuffleAnimation,
  players, // ADDED: Array of player data with photos
}) => {
  // FIXED: Memoized player data calculation dengan photo support
  const playersData = useMemo(() => {
    const data = {};
    PLAYER_POSITIONS.forEach((position) => {
      const playerId =
        position === "bottom"
          ? currentUserId
          : getPlayerAtRelativePosition(currentUserId, position);
      const playerCards = getPlayerCards(playerId, gameState);
      const playerStatus = getPlayerStatus(playerId, gameState);
      const playerGlobalIndex = getPlayerGlobalIndex(playerId);

      // FIXED: Check if functions exist before calling
      const isCurrentPlayerActive = typeof isPlayerTurn === 'function'
        ? isPlayerTurn(playerGlobalIndex)
        : false;
      const currentPlayerTimeLeft = typeof getPlayerTimeLeft === 'function'
        ? getPlayerTimeLeft(playerGlobalIndex)
        : 0;

      const currentMaxTimeForTurn =
        currentTurnPhase === "throwing"
          ? TIMER_PLAYER_DURATION
          : TIMER_ANSWER_DURATION;

      // FIXED: Find actual player data for photos
      const actualPlayerData = players && players.length > playerGlobalIndex
        ? players[playerGlobalIndex]
        : null;

      data[position] = {
        playerId,
        playerCards,
        playerStatus,
        playerGlobalIndex,
        isCurrentPlayerActive,
        currentPlayerTimeLeft,
        currentMaxTimeForTurn,
        profileData: {},
        playerData: actualPlayerData, // ADDED: actual player data
        cardCount: playerCards.length,
        answerFeedback: playerAnswerFeedback[playerId],
        lastUpdated: Date.now(),
      };
    });

    return data;
  }, [
    currentUserId,
    gameState,
    currentTurnPhase,
    TIMER_PLAYER_DURATION,
    TIMER_ANSWER_DURATION,
    isPlayerTurn, // FIXED
    getPlayerTimeLeft, // FIXED
    playerAnswerFeedback,
    players // ADDED
  ]);

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
          currentTurnPhase={currentTurnPhase}
          isCurrentPlayer={true}
          playerData={playerData.playerData} // ADDED
        />
      </>
    );
  }, [
    playersData.bottom,
    handleCardClicked,
    isCurrentUserTurn,
    currentTurnPhase
  ]);

  // FIXED: Memoized other players render dengan photo dan timer fix
  const renderOtherPlayer = useCallback(
    (position) => {
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
              answerFeedback={playerData.answerFeedback}
              currentTurnPhase={currentTurnPhase}
              isCurrentPlayer={false} // FIXED: should be false for other players
              playerData={playerData.playerData} // ADDED
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
    },
    [playersData, currentTurnPhase]
  );

  const renderCenterArea = useMemo(
    () => (
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
    ),
    [throwCard, triggerShuffleAnimation]
  );

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
          <div className="position-relative">{renderOtherPlayer("left")}</div>
        </Col>

        {renderCenterArea}

        <Col md={4}>
          <div className="position-relative">{renderOtherPlayer("right")}</div>
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