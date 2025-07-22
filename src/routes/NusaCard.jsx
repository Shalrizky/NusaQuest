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
  initializeNusaCardGameState,
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
  INITIAL_CARDS_PER_PLAYER: 5,
};

// Create initial cards for player
const createInitialCardsForPlayer = (questions, startIndex, count) => {
  const shuffledQuestions = shuffle([...questions]);
  return shuffledQuestions.slice(startIndex, startIndex + count).map((q, index) => ({
    ...q,
    id: `card_${startIndex}_${index}_${Date.now()}`,
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

  // Penalty prevention refs
  const hasAddedPenalty = useRef(false);
  const lastTimeoutHandled = useRef(0);

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

  // Timer state - FIXED: Add shared timer state
  const [playerTimers, setPlayerTimers] = useState([]);
  const [sharedTimeLeft, setSharedTimeLeft] = useState(0); // ADDED: shared timer
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
        id: `penalty_${Date.now()}_${Math.random()}`,
        question_text: "Kartu Penalti Default",
        multiple_choices: [{ answer_text: "Default", is_correct: false }],
        hint: "Tidak ada hint tersedia",
      };
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const chosenQuestion = { ...availableQuestions[randomIndex] };
    return {
      ...chosenQuestion,
      id: `penalty_${Date.now()}_${Math.random()}`,
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

  // FIXED: Time out handler - CLIENT SIDE ONLY with penalty prevention
  const handleTimeOut = useCallback(async () => {
    if (!isMyTurn) return;
    
    const now = Date.now();
    
    // Prevent multiple timeout handling within 2 seconds
    if (now - lastTimeoutHandled.current < 2000) {
      console.log("⏰ Timeout already handled recently, skipping");
      return;
    }
    
    lastTimeoutHandled.current = now;
    
    if (currentActiveTurnPhase === "throwing") {
      console.log(`⏰ CLIENT: Throwing timeout for player ${currentPlayerIndex + 1}`);
      // Switch to next player if throwing time expires
      const nextIndex = getNextPlayerIndex(currentPlayerIndex, players.length);
      await updateGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current, {
        currentPlayerIndex: nextIndex,
        currentActiveTurnPhase: "throwing",
        thrownCard: null,
        questionForModal: null,
        shouldShowQuestionModal: false,
        lastCardThrowerIndex: null,
      });
    } else if (currentActiveTurnPhase === "answering") {
      // Prevent multiple penalty additions
      if (hasAddedPenalty.current) {
        console.log("⏰ Penalty already added, skipping");
        return;
      }
      
      hasAddedPenalty.current = true;
      console.log(`⏰ CLIENT: Answering timeout for player ${currentPlayerIndex + 1} - Adding penalty card`);
      
      const myPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
      
      // Get current state from server to check for recent penalties
      const currentServerState = await getGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current);
      const currentCards = currentServerState[`${myPlayerId}Cards`] || [];
      
      // Check if penalty was already added recently
      const recentPenalty = currentCards.find(card => 
        card.isPenalty && 
        card.id && 
        (now - parseInt(card.id.split('_')[1])) < 5000 // Within last 5 seconds
      );
      
      if (recentPenalty) {
        console.log("⏰ Recent penalty detected, skipping penalty addition");
        hasAddedPenalty.current = false;
        return;
      }
      
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
        playerAnswerFeedback: newFeedback,
        penaltyAddedAt: now,
        penaltyAddedBy: 'timeout'
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
        
        // Reset penalty flag after successful turn change
        setTimeout(() => {
          hasAddedPenalty.current = false;
        }, 1000);
      }, 1500);
    }
  }, [
    isMyTurn,
    currentActiveTurnPhase,
    currentPlayerIndex,
    players.length,
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

  // FIXED: Update shared timer state
  useEffect(() => {
    setSharedTimeLeft(timeLeft);
  }, [timeLeft]);

  // Game timer
  const { updateActivity } = useGameTimer(1800, handleGameOver, {
    topicID: topicIDRef.current,
    gameID: gameIDRef.current,
    roomID: roomIDRef.current,
    user,
  });

  // FIXED: Initialize game - ensure only active players get cards
  useEffect(() => {
    const initGame = async () => {
      if (players.length === 0) return;

      try {
        await setGameStatus(topicID, gameID, roomID, "playing");
        const existingGameState = await getGameState(topicID, gameID, roomID);
        
        if (!existingGameState || !existingGameState.questions) {
          const fetchedQuestions = await getQuestions(topicID);
          const shuffledQuestions = shuffle(fetchedQuestions);

          // Create initial game state for NusaCard - FIXED for active players only
          const initialGameState = {
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
            questions: shuffledQuestions,
            currentQuestionIndex: 0,
            playerStatus: {},
          };

          // Initialize all player cards as empty first
          for (let i = 1; i <= 4; i++) {
            initialGameState[`player${i}Cards`] = [];
          }

          // Only assign cards to ACTIVE players
          players.forEach((player, index) => {
            const playerId = `player${index + 1}`;
            initialGameState[`${playerId}Cards`] = createInitialCardsForPlayer(
              shuffledQuestions, 
              index * GAME_CONSTANTS.INITIAL_CARDS_PER_PLAYER, 
              GAME_CONSTANTS.INITIAL_CARDS_PER_PLAYER
            );
            initialGameState.playerStatus[playerId] = "available";
          });

          // Set remaining slots as not available
          for (let i = players.length; i < 4; i++) {
            const playerId = `player${i + 1}`;
            initialGameState.playerStatus[playerId] = "not_available";
          }

          await initializeNusaCardGameState(topicID, gameID, roomID, players, shuffledQuestions, initialGameState);
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

        // Reset penalty flag when turn changes
        if (newGameState.currentPlayerIndex !== currentPlayerIndex) {
          hasAddedPenalty.current = false;
        }

        // Check for winner - player with 0 cards (only check ACTIVE players)
        const activePlayerCards = [];
        for (let i = 0; i < players.length; i++) {
          const playerId = `player${i + 1}`;
          activePlayerCards.push(newGameState[`${playerId}Cards`]?.length || 0);
        }

        const winnerIndex = activePlayerCards.findIndex(count => count === 0);
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
  }, [isGameReady, players, topicID, gameID, roomID, user?.uid, currentPlayerIndex]);

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
      hasAddedPenalty.current = false; // Reset penalty flag on player change
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

  // Game over effect - MOVED BEFORE CONDITIONAL RETURN
  useEffect(() => {
    if (gameOver) {
      navigate("/");
    }
  }, [gameOver, navigate]);

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

  // FIXED: Game actions with penalty prevention
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

    // Prevent multiple answer submissions
    if (hasAddedPenalty.current) {
      console.log("Answer already processed, skipping");
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
      hasAddedPenalty.current = true; // Prevent duplicate penalties
      
      // Add penalty card
      const penaltyCard = getRandomCardFromAvailablePool();
      const currentCards = gameState[`${myPlayerId}Cards`] || [];
      const updatedCards = [...currentCards, penaltyCard];

      await updateGameState(topicID, gameID, roomID, {
        [`${myPlayerId}Cards`]: updatedCards,
        penaltyAddedAt: Date.now(),
        penaltyAddedBy: 'wrong_answer'
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

    // FIXED: Immediately close modal and reset feedback
    setTimeout(async () => {
      const resetFeedback = {
        player1: newFeedback.player1,
        player2: newFeedback.player2,
        player3: newFeedback.player3,
        player4: newFeedback.player4,
      };
      resetFeedback[myPlayerId] = null;
      
      const nextThrowerIndex = getNextPlayerIndex(lastCardThrowerIndex, players.length);
      
      // FIXED: Close modal immediately with game state update
      await updateGameState(topicID, gameID, roomID, {
        playerAnswerFeedback: resetFeedback,
        currentPlayerIndex: nextThrowerIndex,
        currentActiveTurnPhase: "throwing",
        thrownCard: null,
        questionForModal: null,
        shouldShowQuestionModal: false, // FIXED: Close modal immediately
        lastCardThrowerIndex: null,
      });
      
      // Reset penalty flag after turn change
      setTimeout(() => {
        hasAddedPenalty.current = false;
      }, 1000);
    }, 500); // FIXED: Reduced delay to 500ms
  };

  // FIXED: Modal close handler
  const handleCloseQuestionPromptModal = useCallback(async () => {
    console.log("🔴 Closing modal manually");
    setShouldShowQuestionModal(false);
    setQuestionForModalDisplay(null);
    setThrownCardData(null);
    
    // FIXED: Also update Firebase to ensure modal closes
    await updateGameState(topicID, gameID, roomID, {
      shouldShowQuestionModal: false,
      questionForModal: null,
      thrownCard: null,
    });
  }, [topicID, gameID, roomID]);

  const handleVictoryClose = useCallback(() => {
    setVictory(false);
    setHasLost(false);
    cleanupGame(topicID, gameID, roomID, user);
    navigate("/");
  }, [topicID, gameID, roomID, user, navigate]);

  const handleCloseGameOffcanvas = useCallback(() => {
    setShowGameOffcanvas(false);
  }, []);

  // Computed values - FIXED for active players only
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
      return sharedTimeLeft; // Return shared timer for active player
    }
    // FIXED: Return 0 for inactive players instead of default values
    // This will make the SVG not show timer ring for inactive players
    return 0;
  },
  [sharedTimeLeft, isPlayerTurnStatus]
);
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
          timeLeft={sharedTimeLeft} // FIXED: Pass shared timer
          TIMER_PLAYER_DURATION={GAME_CONSTANTS.THROW_TIMER_SECONDS}
          throwCard={thrownCardData}
          handleCardClicked={handleCardPlayAttempt}
          isCurrentUserTurn={isMyPlayerTurnToThrow}
          currentTurnPhase={currentActiveTurnPhase}
          TIMER_ANSWER_DURATION={GAME_CONSTANTS.ANSWER_TIMER_SECONDS}
          isPlayerTurn={isPlayerTurnStatus}
          getPlayerTimeLeft={getPlayerRemainingTime}
          triggerShuffleAnimation={triggerShuffleAnimation}
          players={players}
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
        timeLeft={sharedTimeLeft} // FIXED: Use shared timer
        TIMER_ANSWER_DURATION={GAME_CONSTANTS.ANSWER_TIMER_SECONDS}
        players={players}
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