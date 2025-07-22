import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import QuestionModal from "../components/games/nuca/QuestionModal";
import GameArea from "../components/games/nuca/GameArea";
import VictoryOverlay from "../components/games/VictoryOverlay";
import LoseOverlay from "../components/games/LoseOverlay";
import {
  fetchGamePlayers,
  initializeGameState,
  updateGameState,
  listenToGameState,
  setGameStatus,
  setGameStartStatus,
  initializeGameTimer,
  cleanupGame,
  stopGameTimer,
  listenToGameTimer,
  getGameState,
  checkNusaCardWinner,
} from "../services/gameDataServices";
import {
  getPotionData,
  saveNewPotionData,
} from "../services/itemsDataServices";
import { updateWinningAchievement } from "../services/achievementDataServices";
import { usePlayerTimer, useGameTimer } from "../utils/timerUtils";
import { getQuestions, shuffle } from "../services/questionDataServices";
import "../style/routes/NusaCard.css";

// Game constants
const GAME_CONSTANTS = {
  FIRST_PLAYER_INDEX: 0,
  TURN_FLOW_DIRECTION: "clockwise",
  THROW_TIMER_SECONDS: 15,
  ANSWER_TIMER_SECONDS: 30,
};

// Create initial cards for player
const createInitialCardsForPlayer = (questions, startIndex, count) => {
  const shuffledQuestions = shuffle([...questions]);
  return shuffledQuestions.slice(startIndex, startIndex + count).map((q, index) => ({
    ...q,
    id: startIndex + index + 1,
  }));
};

function NusaCard() {
  const { gameID, topicID, roomID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const gameIDRef = useRef(gameID);
  const topicIDRef = useRef(topicID);
  const roomIDRef = useRef(roomID);
  const hasCleanedUpRef = useRef(false);

  // Core Game State
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isGameReady, setIsGameReady] = useState(false);
  const [currentActiveTurnPhase, setCurrentActiveTurnPhase] = useState("throwing");
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);

  // Game Data State
  const [gameState, setGameState] = useState({
    player1Cards: [],
    player2Cards: [],
    player3Cards: [],
    player4Cards: [],
    playerStatus: {
      player1: "not_available",
      player2: "not_available", 
      player3: "not_available",
      player4: "not_available",
    },
    questions: [],
    currentQuestionIndex: 0,
  });

  // Game Flow State
  const [thrownCardData, setThrownCardData] = useState(null);
  const [shouldShowQuestionModal, setShouldShowQuestionModal] = useState(false);
  const [questionForModalDisplay, setQuestionForModalDisplay] = useState(null);
  const [lastCardThrowerIndex, setLastCardThrowerIndex] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  
  // UI State
  const [collectedGameHints, setCollectedGameHints] = useState([]);
  const [showGameOffcanvas, setShowGameOffcanvas] = useState(false);
  const [playerAnswerFeedback, setPlayerAnswerFeedback] = useState({
    player1: null,
    player2: null,
    player3: null,
    player4: null,
  });
  const [triggerShuffleAnimation, setTriggerShuffleAnimation] = useState(false);

  // Timer state
  const [playerTimers, setPlayerTimers] = useState([]);
  const prevPlayerIndexRef = useRef(currentPlayerIndex);

  // Helper functions
  const getPlayerGlobalIndex = useCallback((playerId) => {
    return parseInt(playerId.replace('player', '')) - 1;
  }, []);

  const getLocalPlayerGlobalIndex = useCallback(() => {
    if (!user?.uid || !players.length) return 0;
    const myPlayerIndex = players.findIndex(p => p.uid === user.uid);
    return myPlayerIndex !== -1 ? myPlayerIndex : 0;
  }, [players, user?.uid]);

  const getNextPlayerIndex = useCallback((currentIndex, totalPlayers) => {
    return (currentIndex + 1) % totalPlayers;
  }, []);

  const isMyPlayerTurnToThrow = useCallback(() => {
    const myIndex = getLocalPlayerGlobalIndex();
    return currentPlayerIndex === myIndex && currentActiveTurnPhase === "throwing";
  }, [currentPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]);

  const isMyPlayerTurnToAnswer = useCallback(() => {
    const myIndex = getLocalPlayerGlobalIndex();
    return currentPlayerIndex === myIndex && currentActiveTurnPhase === "answering";
  }, [currentPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]);

  // Get random card from available pool for penalty
  const getRandomCardFromAvailablePool = useCallback(() => {
    const availableQuestions = gameState.questions || [];
    if (availableQuestions.length === 0) {
      console.warn("Tidak ada pertanyaan tersedia untuk kartu penalti!");
      return {
        id: Date.now(),
        question_text: "Kartu Penalti Default",
        multiple_choices: [{ answer_text: "Default", is_correct: false }],
        hint: "Tidak ada hint tersedia",
      };
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const chosenQuestion = { ...availableQuestions[randomIndex] };
    return {
      ...chosenQuestion,
      id: Date.now(),
      isPenalty: true,
    };
  }, [gameState.questions]);

  // Game over handler
  const handleGameOver = useCallback(async () => {
    try {
      setGameOver(true);
      await cleanupGame(topicID, gameID, roomID, user);
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Error handling game over:", error);
      navigate("/");
    }
  }, [topicID, gameID, roomID, user, navigate]);

  // Time out handler
  const handleTimeOut = useCallback(async () => {
    if (!isMyTurn) return;
    
    if (currentActiveTurnPhase === "throwing") {
      console.log(`⏰ Throwing timeout for player ${currentPlayerIndex + 1}`);
      // Switch to next player if throwing time expires
      const nextIndex = getNextPlayerIndex(currentPlayerIndex, players.length);
      await updateGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current, {
        currentPlayerIndex: nextIndex,
        currentActiveTurnPhase: "throwing",
        thrownCard: null,
        questionForModal: null,
        shouldShowQuestionModal: false,
      });
    } else if (currentActiveTurnPhase === "answering") {
      console.log(`⏰ Answering timeout for player ${currentPlayerIndex + 1} - Adding penalty card`);
      // Add penalty card if answer time expires
      const myPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
      const currentCards = gameState[`${myPlayerId}Cards`] || [];
      
      const penaltyCard = getRandomCardFromAvailablePool();
      const updatedCards = [...currentCards, penaltyCard];
      
      // Set incorrect feedback
      const newFeedback = {
        player1: playerAnswerFeedback.player1 || null,
        player2: playerAnswerFeedback.player2 || null,
        player3: playerAnswerFeedback.player3 || null,
        player4: playerAnswerFeedback.player4 || null,
      };
      newFeedback[myPlayerId] = "incorrect";
      
      await updateGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current, {
        [`${myPlayerId}Cards`]: updatedCards,
        playerAnswerFeedback: newFeedback
      });

      // Add hint if available
      if (questionForModalDisplay?.hint) {
        setCollectedGameHints(prev => [...prev, questionForModalDisplay.hint]);
        setShowGameOffcanvas(true);
      }

      // Reset feedback and move to next turn after delay
      setTimeout(async () => {
        const resetFeedback = {
          player1: newFeedback.player1,
          player2: newFeedback.player2,
          player3: newFeedback.player3,
          player4: newFeedback.player4,
        };
        resetFeedback[myPlayerId] = null;
        
        await updateGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current, {
          playerAnswerFeedback: resetFeedback
        });

        const nextThrowerIndex = getNextPlayerIndex(lastCardThrowerIndex || currentPlayerIndex, players.length);
        await updateGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current, {
          currentPlayerIndex: nextThrowerIndex,
          currentActiveTurnPhase: "throwing",
          thrownCard: null,
          questionForModal: null,
          shouldShowQuestionModal: false,
          lastCardThrowerIndex: null,
        });
      }, 2000);
    }
  }, [
    isMyTurn,
    currentActiveTurnPhase,
    currentPlayerIndex,
    players.length,
    gameState,
    lastCardThrowerIndex,
    playerAnswerFeedback,
    getLocalPlayerGlobalIndex,
    getNextPlayerIndex,
    getRandomCardFromAvailablePool,
    questionForModalDisplay?.hint,
  ]);

  // Timer hook
  const [timeLeft, resetPlayerTimer] = usePlayerTimer(
    currentActiveTurnPhase === "throwing" 
      ? GAME_CONSTANTS.THROW_TIMER_SECONDS 
      : GAME_CONSTANTS.ANSWER_TIMER_SECONDS,
    handleTimeOut,
    {
      topicID: topicIDRef.current,
      gameID: gameIDRef.current,
      roomID: roomIDRef.current,
      isMyTurn,
      currentPlayerIndex,
      playerTimers,
      waitingForAnswer: shouldShowQuestionModal,
      players,
    }
  );

  // Game timer
  const { updateActivity } = useGameTimer(1800, handleGameOver, {
    topicID: topicIDRef.current,
    gameID: gameIDRef.current,
    roomID: roomIDRef.current,
    user,
  });

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      if (players.length === 0) return;

      try {
        await setGameStatus(topicID, gameID, roomID, "playing");
        const existingGameState = await getGameState(topicID, gameID, roomID);
        
        if (!existingGameState || !existingGameState.questions) {
          const fetchedQuestions = await getQuestions(topicID);
          const shuffledQuestions = shuffle(fetchedQuestions);

          // Create initial game state for NusaCard
          const initialGameState = {
            player1Cards: createInitialCardsForPlayer(shuffledQuestions, 0, 5),
            player2Cards: createInitialCardsForPlayer(shuffledQuestions, 5, 5),
            player3Cards: createInitialCardsForPlayer(shuffledQuestions, 10, 5),
            player4Cards: createInitialCardsForPlayer(shuffledQuestions, 15, 5),
            playerStatus: {},
            questions: shuffledQuestions,
            currentQuestionIndex: 0,
            currentPlayerIndex: 0,
            currentActiveTurnPhase: "throwing",
            thrownCard: null,
            questionForModal: null,
            shouldShowQuestionModal: false,
            lastCardThrowerIndex: null,
            playerAnswerFeedback: {
              player1: null,
              player2: null,
              player3: null,
              player4: null,
            },
            gameType: 'nusacard',
            gameStatus: 'playing',
          };

          // Set player status based on actual players
          players.forEach((player, index) => {
            const playerId = `player${index + 1}`;
            initialGameState.playerStatus[playerId] = "available";
          });

          // Fill remaining slots as not available
          for (let i = players.length; i < 4; i++) {
            const playerId = `player${i + 1}`;
            initialGameState.playerStatus[playerId] = "not_available";
          }

          await initializeGameState(topicID, gameID, roomID, players, shuffledQuestions, initialGameState);
          await initializeGameTimer(topicID, gameID, roomID, 1800);
          
          setGameState(initialGameState);
        } else {
          setGameState(existingGameState);
        }
        
        setIsGameReady(true);
      } catch (error) {
        console.error("Error initializing game:", error);
        setIsGameReady(true); // Set ready even on error to prevent infinite loading
      }
    };

    initGame();
  }, [topicID, gameID, roomID, players]);

  // Fetch players
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;

    const unsubscribe = fetchGamePlayers(topicID, gameID, roomID, (playersData) => {
      setPlayers(playersData);
      setPlayerTimers(new Array(playersData.length).fill(GAME_CONSTANTS.THROW_TIMER_SECONDS));
      if (playersData.length === 0 && !hasCleanedUpRef.current) {
        cleanupGame(topicID, gameID, roomID, user);
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [topicID, gameID, roomID, user, navigate, victory]);

  // Listen to game state changes
  useEffect(() => {
    if (!isGameReady) return;

    const unsubscribe = listenToGameState(topicID, gameID, roomID, (newGameState) => {
      if (newGameState) {
        setGameState(newGameState);
        setCurrentPlayerIndex(newGameState.currentPlayerIndex || 0);
        setCurrentActiveTurnPhase(newGameState.currentActiveTurnPhase || "throwing");
        setThrownCardData(newGameState.thrownCard);
        setShouldShowQuestionModal(newGameState.shouldShowQuestionModal || false);
        setQuestionForModalDisplay(newGameState.questionForModal);
        setLastCardThrowerIndex(newGameState.lastCardThrowerIndex);
        setPlayerAnswerFeedback(newGameState.playerAnswerFeedback || {
          player1: null, player2: null, player3: null, player4: null
        });

        if (newGameState.playerTimers) {
          setPlayerTimers(newGameState.playerTimers);
        }

        const myIndex = players.findIndex(p => p.uid === user?.uid);
        const isCurrentPlayerTurn = newGameState.currentPlayerIndex === myIndex;
        setIsMyTurn(isCurrentPlayerTurn);

        // Check for winner - player with 0 cards
        const playerCards = [
          newGameState.player1Cards?.length || 0,
          newGameState.player2Cards?.length || 0, 
          newGameState.player3Cards?.length || 0,
          newGameState.player4Cards?.length || 0
        ];

        const winnerIndex = playerCards.findIndex(count => count === 0);
        if (winnerIndex !== -1 && players.length > winnerIndex) {
          setVictory(true);
          setIsWinner(winnerIndex === myIndex);
          setWinner(players[winnerIndex]?.displayName || "Player");
          
          if (winnerIndex !== myIndex) {
            setHasLost(true);
          }

          // Award achievement if I'm the winner
          if (winnerIndex === myIndex) {
            awardVictoryPotions();
          }
        }
      }
    });

    return () => unsubscribe();
  }, [isGameReady, players, topicID, gameID, roomID, user?.uid]);

  // Listen to game timer
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;

    const unsubscribe = listenToGameTimer(topicID, gameID, roomID, (remainingTime) => {
      if (remainingTime <= 0) {
        stopGameTimer(topicID, gameID, roomID);
        handleGameOver();
      }
    });

    return () => unsubscribe();
  }, [topicID, gameID, roomID, handleGameOver]);

  // Reset timer when player changes
  useEffect(() => {
    if (prevPlayerIndexRef.current !== currentPlayerIndex) {
      resetPlayerTimer();
    }
    prevPlayerIndexRef.current = currentPlayerIndex;
  }, [currentPlayerIndex, resetPlayerTimer]);

  // Victory overlay
  useEffect(() => {
    if (victory) {
      setShowVictoryOverlay(true);
    }
  }, [victory]);

  // Cleanup on victory/game over
  useEffect(() => {
    if (victory || gameOver) {
      stopGameTimer(topicID, gameID, roomID);
      setGameStartStatus(topicID, gameID, roomID, false);
      cleanupGame(topicID, gameID, roomID, user);
      hasCleanedUpRef.current = true;
    }
  }, [victory, gameOver, topicID, gameID, roomID, user]);

  // Award victory potions
  const awardVictoryPotions = async () => {
    try {
      const isAchievementUpdated = await updateWinningAchievement(
        user.uid,
        gameID,
        topicID
      );

      if (isAchievementUpdated) {
        const currentPotionData = await getPotionData(user.uid);
        if (currentPotionData) {
          await saveNewPotionData(user.uid, {
            item_name: currentPotionData.item_name,
            item_count: currentPotionData.item_count + 1,
            item_img: currentPotionData.item_img,
          });
        }
      }
    } catch (error) {
      console.error("Error awarding victory potions:", error);
    }
  };

  // Game actions
  const handleCardPlayAttempt = async (cardData) => {
    updateActivity();
    if (!isMyPlayerTurnToThrow()) {
      console.log("Not your turn to throw cards!");
      return;
    }

    const myIndex = getLocalPlayerGlobalIndex();
    const myPlayerId = `player${myIndex + 1}`;
    const myCards = gameState[`${myPlayerId}Cards`] || [];
    const updatedCards = myCards.filter(card => card.id !== cardData.id);

    setTriggerShuffleAnimation(true);
    setTimeout(() => setTriggerShuffleAnimation(false), 500);

    const nextPlayerIndex = getNextPlayerIndex(currentPlayerIndex, players.length);

    await updateGameState(topicID, gameID, roomID, {
      [`${myPlayerId}Cards`]: updatedCards,
      thrownCard: cardData,
      questionForModal: cardData,
      shouldShowQuestionModal: true,
      currentPlayerIndex: nextPlayerIndex,
      currentActiveTurnPhase: "answering",
      lastCardThrowerIndex: currentPlayerIndex,
    });
  };

  const handlePlayerAnswerSubmission = async (result) => {
    updateActivity();
    if (!isMyPlayerTurnToAnswer()) {
      console.log("Not your turn to answer!");
      return;
    }

    const { isCorrect, hint } = result;
    const myIndex = getLocalPlayerGlobalIndex();
    const myPlayerId = `player${myIndex + 1}`;

    // Set feedback
    const newFeedback = {
      player1: playerAnswerFeedback.player1 || null,
      player2: playerAnswerFeedback.player2 || null,
      player3: playerAnswerFeedback.player3 || null,
      player4: playerAnswerFeedback.player4 || null,
    };
    newFeedback[myPlayerId] = isCorrect ? "correct" : "incorrect";
    
    await updateGameState(topicID, gameID, roomID, {
      playerAnswerFeedback: newFeedback
    });

    if (!isCorrect) {
      // Add penalty card
      const penaltyCard = getRandomCardFromAvailablePool();
      const currentCards = gameState[`${myPlayerId}Cards`] || [];
      const updatedCards = [...currentCards, penaltyCard];

      await updateGameState(topicID, gameID, roomID, {
        [`${myPlayerId}Cards`]: updatedCards,
      });

      // Add hint
      if (hint) {
        setCollectedGameHints(prev => [...prev, hint]);
        setShowGameOffcanvas(true);
      }

      console.log(`🃏 Penalty! Player ${myPlayerId} gets a card.`);
    } else {
      console.log(`✅ Correct answer from Player ${myPlayerId}.`);
    }

    // Reset feedback and move to next turn after delay
    setTimeout(async () => {
      const resetFeedback = {
        player1: newFeedback.player1,
        player2: newFeedback.player2,
        player3: newFeedback.player3,
        player4: newFeedback.player4,
      };
      resetFeedback[myPlayerId] = null;
      
      await updateGameState(topicID, gameID, roomID, {
        playerAnswerFeedback: resetFeedback
      });

      const nextThrowerIndex = getNextPlayerIndex(lastCardThrowerIndex, players.length);
      await updateGameState(topicID, gameID, roomID, {
        currentPlayerIndex: nextThrowerIndex,
        currentActiveTurnPhase: "throwing",
        thrownCard: null,
        questionForModal: null,
        shouldShowQuestionModal: false,
        lastCardThrowerIndex: null,
      });
    }, 2000);
  };

  const handleCloseQuestionPromptModal = useCallback(() => {
    setShouldShowQuestionModal(false);
    setQuestionForModalDisplay(null);
    setThrownCardData(null);
  }, []);

  const handleVictoryClose = useCallback(() => {
    setVictory(false);
    setHasLost(false);
    cleanupGame(topicID, gameID, roomID, user);
    navigate("/");
  }, [topicID, gameID, roomID, user, navigate]);

  const handleCloseGameOffcanvas = useCallback(() => {
    setShowGameOffcanvas(false);
  }, []);

  // Computed values
  const activeLocalPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
  const cardCounts = {
    player1: gameState.player1Cards?.length || 0,
    player2: gameState.player2Cards?.length || 0,
    player3: gameState.player3Cards?.length || 0,
    player4: gameState.player4Cards?.length || 0,
  };

  const displayQuestionModalForMe = shouldShowQuestionModal && isMyPlayerTurnToAnswer();

  // Utility functions for GameArea
  const getPlayerCards = useCallback((playerId) => {
    return gameState[`${playerId}Cards`] || [];
  }, [gameState]);

  const getPlayerStatus = useCallback((playerId) => {
    return gameState.playerStatus?.[playerId] || "not_available";
  }, [gameState.playerStatus]);

  const isPlayerTurnStatus = useCallback(
    (playerGlobalIndex) => currentPlayerIndex === playerGlobalIndex,
    [currentPlayerIndex]
  );

  const getPlayerRemainingTime = useCallback(
    (playerGlobalIndex) => {
      if (isPlayerTurnStatus(playerGlobalIndex)) {
        return timeLeft;
      }
      return currentActiveTurnPhase === "throwing"
        ? GAME_CONSTANTS.THROW_TIMER_SECONDS
        : GAME_CONSTANTS.ANSWER_TIMER_SECONDS;
    },
    [timeLeft, isPlayerTurnStatus, currentActiveTurnPhase]
  );

  // Game over effect - MOVED BEFORE CONDITIONAL RETURN
  useEffect(() => {
    if (gameOver) {
      navigate("/");
    }
  }, [gameOver, navigate]);

  // Render loading state - AFTER ALL HOOKS
  if (!isGameReady) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="nusa-page d-flex flex-column">
      <HeaderGame
        hints={collectedGameHints}
        showOffcanvas={showGameOffcanvas}
        setShowOffcanvas={setShowGameOffcanvas}
        onCloseOffcanvas={handleCloseGameOffcanvas}
      />

      <Container
        fluid
        id="nuca-container"
        className="flex-grow-1 d-flex flex-column justify-content-between"
      >
        <GameArea
          currentUserId={activeLocalPlayerId}
          gameState={gameState}
          playerAnswerFeedback={playerAnswerFeedback}
          currentPlayerGlobalIndex={currentPlayerIndex}
          cardCounts={cardCounts}
          timeLeft={timeLeft}
          TIMER_PLAYER_DURATION={GAME_CONSTANTS.THROW_TIMER_SECONDS}
          throwCard={thrownCardData}
          handleCardClicked={handleCardPlayAttempt}
          isCurrentUserTurn={isMyPlayerTurnToThrow}
          currentTurnPhase={currentActiveTurnPhase}
          TIMER_ANSWER_DURATION={GAME_CONSTANTS.ANSWER_TIMER_SECONDS}
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
        playerAnswerFeedback={playerAnswerFeedback}
        currentPlayerId={activeLocalPlayerId}
        playerAnsweringId={`player${currentPlayerIndex + 1}`}
        timeLeft={timeLeft}
        TIMER_ANSWER_DURATION={GAME_CONSTANTS.ANSWER_TIMER_SECONDS}
      />

      {victory &&
        showVictoryOverlay &&
        (isWinner ? (
          <VictoryOverlay winner={winner} onClose={handleVictoryClose} />
        ) : hasLost ? (
          <LoseOverlay loser={user.displayName} onClose={handleVictoryClose} />
        ) : null)}
    </div>
  );
}

export default NusaCard;