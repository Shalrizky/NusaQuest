import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import QuestionModal from "../components/games/nuca/QuestionModal";
import GameArea from "../components/games/nuca/GameArea";
import VictoryOverlay from "../components/games/VictoryOverlay";
import LoseOverlay from "../components/games/LoseOverlay";
import Potion from "../components/games/potion"

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
  ANSWER_TIMER_SECONDS: 20,
  INITIAL_CARDS_PER_PLAYER: 5,
};

// Create initial cards for player
const createInitialCardsForPlayer = (questions, startIndex, count) => {
  const shuffledQuestions = shuffle([...questions]);
  return shuffledQuestions
    .slice(startIndex, startIndex + count)
    .map((q, index) => ({
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
  const hasAwardedAchievementRef = useRef(false);
  const isProcessingVictoryRef = useRef(false);

  // Penalty prevention refs
  const hasAddedPenalty = useRef(false);
  const lastTimeoutHandled = useRef(0);

  // Core Game State
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isGameReady, setIsGameReady] = useState(false);
  const [currentActiveTurnPhase, setCurrentActiveTurnPhase] =
    useState("throwing");
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [hasLost, setHasLost] = useState(false);
  const [showVictoryOverlay, setShowVictoryOverlay] = useState(false);
  const [isPotionUsedInModal, setIsPotionUsedInModal] = useState(false);

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
    playerTimers: [],
    gameWinnerUID: null,
    gameWinnerDisplayName: null,
    gameWonAt: null,
    achievementAwarded: false,
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
  const [syncedPlayerTimeLeft, setSyncedPlayerTimeLeft] = useState(0);
  const [localVisualTimeLeft, setLocalVisualTimeLeft] = useState(0);
  const prevPlayerIndexRef = useRef(currentPlayerIndex);
  const visualTimerIntervalRef = useRef(null);

  const getLocalPlayerGlobalIndex = useCallback(() => {
    if (!user?.uid || !players.length) return 0;
    const myPlayerIndex = players.findIndex((p) => p.uid === user.uid);
    return myPlayerIndex !== -1 ? myPlayerIndex : 0;
  }, [players, user?.uid]);

  const getNextPlayerIndex = useCallback((currentIndex, totalPlayers) => {
    return (currentIndex + 1) % totalPlayers;
  }, []);

  const isMyPlayerTurnToThrow = useCallback(() => {
    const myIndex = getLocalPlayerGlobalIndex();
    return (
      currentPlayerIndex === myIndex && currentActiveTurnPhase === "throwing"
    );
  }, [currentPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]);

  const isMyPlayerTurnToAnswer = useCallback(() => {
    const myIndex = getLocalPlayerGlobalIndex();
    return (
      currentPlayerIndex === myIndex && currentActiveTurnPhase === "answering"
    );
  }, [currentPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]);

  // Calculated values - MOVED UP before usage
  const activeLocalPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
  const cardCounts = {
    player1: gameState.player1Cards?.length || 0,
    player2: gameState.player2Cards?.length || 0,
    player3: gameState.player3Cards?.length || 0,
    player4: gameState.player4Cards?.length || 0,
  };

  const displayQuestionModalForMe =
    shouldShowQuestionModal && isMyPlayerTurnToAnswer();

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
      setVictory(false);
      setIsWinner(false);
      setHasLost(false);
      setShowVictoryOverlay(false);
      setWinner("");

      await cleanupGame(topicID, gameID, roomID, user);
      setTimeout(() => navigate("/"));
    } catch (error) {
      console.error("Error handling game over:", error);
      navigate("/");
    }
  }, [topicID, gameID, roomID, user, navigate]);

  // Handle timeout logic
  const handleTimeOut = useCallback(async () => {
    if (!isMyTurn) return;

    const now = Date.now();
    if (now - lastTimeoutHandled.current < 2000) {
      console.log("⏰ Timeout already handled recently, skipping");
      return;
    }
    lastTimeoutHandled.current = now;

    if (currentActiveTurnPhase === "throwing") {
      console.log(
        `⏰ CLIENT: Throwing timeout for player ${
          currentPlayerIndex + 1
        }. Moving to next player.`
      );
      const nextIndex = getNextPlayerIndex(currentPlayerIndex, players.length);
      await updateGameState(
        topicIDRef.current,
        gameIDRef.current,
        roomIDRef.current,
        {
          currentPlayerIndex: nextIndex,
          currentActiveTurnPhase: "throwing",
          thrownCard: null,
          questionForModal: null,
          shouldShowQuestionModal: false,
          lastCardThrowerIndex: null,
        }
      );
    } else if (currentActiveTurnPhase === "answering") {
      console.log(
        `⏰ CLIENT: Answering timeout for player ${
          currentPlayerIndex + 1
        }. Adding penalty card.`
      );

      if (hasAddedPenalty.current) {
        console.log("⏰ Penalty already added, skipping duplicate penalty.");
        return;
      }
      hasAddedPenalty.current = true;

      const myPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
      const currentServerState = await getGameState(
        topicIDRef.current,
        gameIDRef.current,
        roomIDRef.current
      );
      const currentCards = currentServerState[`${myPlayerId}Cards`] || [];

      const recentPenalty = currentCards.find(
        (card) =>
          card.isPenalty &&
          card.id &&
          now - parseInt(card.id.split("_")[1]) < 5000
      );
      if (recentPenalty) {
        console.log("⏰ Recent penalty detected, skipping penalty addition.");
        hasAddedPenalty.current = false;
        return;
      }

      const penaltyCard = getRandomCardFromAvailablePool();
      const updatedCards = [...currentCards, penaltyCard];

      const newFeedback = { ...playerAnswerFeedback };
      newFeedback[myPlayerId] = "incorrect";

      await updateGameState(
        topicIDRef.current,
        gameIDRef.current,
        roomIDRef.current,
        {
          [`${myPlayerId}Cards`]: updatedCards,
          playerAnswerFeedback: newFeedback,
          penaltyAddedAt: now,
          penaltyAddedBy: "timeout",
        }
      );

      if (questionForModalDisplay?.hint) {
        setCollectedGameHints((prev) => [
          ...prev,
          questionForModalDisplay.hint,
        ]);
        setShowGameOffcanvas(true);
      }

      setTimeout(async () => {
        const resetFeedback = { ...newFeedback };
        resetFeedback[myPlayerId] = null;

        const playerWhoJustAnswered = currentPlayerIndex;

        console.log(
          `↩️ Player ${
            playerWhoJustAnswered + 1
          } (who just timed out) now gets turn to throw.`
        );
        await updateGameState(
          topicIDRef.current,
          gameIDRef.current,
          roomIDRef.current,
          {
            playerAnswerFeedback: resetFeedback,
            currentPlayerIndex: playerWhoJustAnswered,
            currentActiveTurnPhase: "throwing",
            thrownCard: null,
            questionForModal: null,
            shouldShowQuestionModal: false,
            lastCardThrowerIndex: null,
          }
        );

        setTimeout(() => {
          hasAddedPenalty.current = false;
        }, 500);
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
    topicIDRef,
    gameIDRef,
    roomIDRef,
  ]);

  // Use usePlayerTimer hook
  usePlayerTimer(
    currentActiveTurnPhase === "throwing"
      ? GAME_CONSTANTS.THROW_TIMER_SECONDS
      : GAME_CONSTANTS.ANSWER_TIMER_SECONDS,
    handleTimeOut,
    {
      topicID: topicIDRef.current,
      gameID: gameIDRef.current,
      roomID: roomIDRef.current,
      isMyTurn: isMyTurn,
      currentPlayerIndex: getLocalPlayerGlobalIndex(),
      playerTimers: gameState.playerTimers,
      players: players,
    }
  );

  // Game timer (global game duration)
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

        if (
          !existingGameState ||
          !existingGameState.questions ||
          !existingGameState.playerTimers ||
          existingGameState.playerTimers.length === 0
        ) {
          console.log("Initializing new game state for NusaCard...");
          const fetchedQuestions = await getQuestions(topicID);
          const shuffledQuestions = shuffle(fetchedQuestions);

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
            playerTimers: new Array(players.length).fill(
              GAME_CONSTANTS.THROW_TIMER_SECONDS
            ),
            gameWinnerUID: null,
            gameWinnerDisplayName: null,
            gameWonAt: null,
            achievementAwarded: false,
          };

          if (players.length > 0) {
            initialGameState.playerTimers[0] =
              GAME_CONSTANTS.THROW_TIMER_SECONDS;
          }

          for (let i = 1; i <= 4; i++) {
            initialGameState[`player${i}Cards`] = [];
          }

          players.forEach((player, index) => {
            const playerId = `player${index + 1}`;
            initialGameState[`${playerId}Cards`] = createInitialCardsForPlayer(
              shuffledQuestions,
              index * GAME_CONSTANTS.INITIAL_CARDS_PER_PLAYER,
              GAME_CONSTANTS.INITIAL_CARDS_PER_PLAYER
            );
            initialGameState.playerStatus[playerId] = "available";
          });

          for (let i = players.length; i < 4; i++) {
            const playerId = `player${i + 1}`;
            initialGameState.playerStatus[playerId] = "not_available";
          }

          await initializeNusaCardGameState(
            topicID,
            gameID,
            roomID,
            players,
            shuffledQuestions,
            initialGameState
          );
          await initializeGameTimer(topicID, gameID, roomID, 1800);

          setGameState(initialGameState);
        } else {
          console.log("Existing game state found, loading...");
          setGameState(existingGameState);
        }

        setIsGameReady(true);
      } catch (error) {
        console.error("Error initializing game:", error);
        setIsGameReady(true);
      }
    };

    initGame();
  }, [topicID, gameID, roomID, players]);

  // Fetch players
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;

    const unsubscribe = fetchGamePlayers(
      topicID,
      gameID,
      roomID,
      (playersData) => {
        setPlayers(playersData);
        if (playersData.length === 0 && !hasCleanedUpRef.current) {
          console.log("No players found or all left, cleaning up game...");
          cleanupGame(topicID, gameID, roomID, user);
          navigate("/");
        }
      }
    );

    return () => unsubscribe();
  }, [topicID, gameID, roomID, user, navigate, victory]);

  // Listen to game state changes
  useEffect(() => {
    if (!isGameReady) return;

    const unsubscribe = listenToGameState(topicID, gameID, roomID, async (newGameState) => {
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

        const firebaseTime = newGameState.playerTimers?.[newGameState.currentPlayerIndex];
        if (firebaseTime !== undefined) {
            setSyncedPlayerTimeLeft(firebaseTime);
        } else {
            setSyncedPlayerTimeLeft(0);
        }

        const myIndex = players.findIndex(p => p.uid === user?.uid);
        const isCurrentPlayerTurn = newGameState.currentPlayerIndex === myIndex;
        setIsMyTurn(isCurrentPlayerTurn);

        if (newGameState.currentPlayerIndex !== currentPlayerIndex) {
          hasAddedPenalty.current = false;
        }

        // Victory logic
        if (newGameState.gameWinnerUID && !isProcessingVictoryRef.current) {
          setVictory(true);
          setWinner(newGameState.gameWinnerDisplayName || "Player");
          setIsWinner(user?.uid === newGameState.gameWinnerUID);
          setHasLost(user?.uid !== newGameState.gameWinnerUID);
          setShowVictoryOverlay(true);

          const shouldAwardAchievement = (
            user?.uid === newGameState.gameWinnerUID && 
            !newGameState.achievementAwarded && 
            !hasAwardedAchievementRef.current
          );

          if (shouldAwardAchievement) {
            console.log(`🌟 Memproses achievement untuk ${user?.displayName}...`);
            isProcessingVictoryRef.current = true;
            hasAwardedAchievementRef.current = true;
            
            try {
              const isAchievementUpdated = await updateWinningAchievement(
                user.uid,
                gameID, 
                topicID
              );

              console.log("Achievement update result:", isAchievementUpdated);

              if (isAchievementUpdated) {
                const currentPotionData = await getPotionData(user.uid);
                if (currentPotionData) {
                  await saveNewPotionData(user.uid, {
                    item_name: currentPotionData.item_name,
                    item_count: (currentPotionData.item_count || 0) + 1,
                    item_img: currentPotionData.item_img,
                  });
                  console.log("🧪 Potion berhasil diberikan");
                }

                await updateGameState(topicID, gameID, roomID, { 
                  achievementAwarded: true 
                });
                console.log("✅ Flag achievement awarded di-set ke Firebase");

              } else {
                console.log("⚠️ Achievement sudah ada sebelumnya, skip award");
                hasAwardedAchievementRef.current = false;
              }
            } catch (error) {
              console.error("❌ Error saat award achievement:", error);
              hasAwardedAchievementRef.current = false;
            } finally {
              isProcessingVictoryRef.current = false;
            }
          }
        } else if (!newGameState.gameWinnerUID) {
          if (victory || gameOver || showVictoryOverlay) {
            console.log("🔄 Reset status kemenangan");
            setVictory(false);
            setIsWinner(false);
            setHasLost(false);
            setShowVictoryOverlay(false);
            setWinner("");
          }
        }
      }
    });

    return () => unsubscribe();
  }, [isGameReady, players, topicID, gameID, roomID, user?.uid, currentPlayerIndex]);

  // Reset refs saat component unmount
  useEffect(() => {
    return () => {
      hasAwardedAchievementRef.current = false;
      isProcessingVictoryRef.current = false;
    };
  }, []);

  // Listen to game timer
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;
    const unsubscribe = listenToGameTimer(
      topicID,
      gameID,
      roomID,
      (remainingTime) => {
        if (remainingTime <= 0) {
          stopGameTimer(topicID, gameID, roomID);
          handleGameOver();
        }
      }
    );
    return () => unsubscribe();
  }, [topicID, gameID, roomID, handleGameOver]);

  // Reset timer saat pemain berubah
  useEffect(() => {
    if (prevPlayerIndexRef.current !== currentPlayerIndex) {
      hasAddedPenalty.current = false;
    }
    prevPlayerIndexRef.current = currentPlayerIndex;
  }, [currentPlayerIndex]);

  // Client-side visual timer logic
  useEffect(() => {
    if (visualTimerIntervalRef.current) {
      clearInterval(visualTimerIntervalRef.current);
    }

    setLocalVisualTimeLeft(syncedPlayerTimeLeft);

    const isAnyPlayerActive =
      currentPlayerIndex !== null &&
      currentPlayerIndex >= 0 &&
      players.length > 0;

    if (syncedPlayerTimeLeft > 0 && isAnyPlayerActive) {
      visualTimerIntervalRef.current = setInterval(() => {
        setLocalVisualTimeLeft((prevTime) => {
          const newTime = Math.max(0, prevTime - 1);
          if (newTime <= 0) {
            clearInterval(visualTimerIntervalRef.current);
            visualTimerIntervalRef.current = null;
          }
          return newTime;
        });
      }, 1000);
    } else {
      setLocalVisualTimeLeft(0);
    }

    return () => {
      if (visualTimerIntervalRef.current) {
        clearInterval(visualTimerIntervalRef.current);
        visualTimerIntervalRef.current = null;
      }
    };
  }, [syncedPlayerTimeLeft, currentPlayerIndex, players.length]);

  // Victory overlay effect
  useEffect(() => {
    if (victory) {
      setShowVictoryOverlay(true);
    }
  }, [victory]);

  // Cleanup effect
  useEffect(() => {
    if (gameOver && !victory) {
      console.log("Cleaning up game due to: Game Over (time up)");
      stopGameTimer(topicID, gameID, roomID);
      setGameStartStatus(topicID, gameID, roomID, false);

      if (!hasCleanedUpRef.current) {
        cleanupGame(topicID, gameID, roomID, user)
          .then(() => {
            console.log("Firebase game data cleaned up.");
            hasCleanedUpRef.current = true;
          })
          .catch((error) => {
            console.error("Error during cleanup:", error);
          });
      }

      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }, [gameOver, victory, topicID, gameID, roomID, user, navigate]);

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

    const updatePayload = {
      [`${myPlayerId}Cards`]: updatedCards,
      thrownCard: cardData,
      questionForModal: cardData,
      shouldShowQuestionModal: true,
      currentPlayerIndex: nextPlayerIndex,
      currentActiveTurnPhase: "answering",
      lastCardThrowerIndex: currentPlayerIndex,
    };

    // Check victory condition
    if (updatedCards.length === 0) {
      console.log(`🎉 ${user?.displayName} menang dengan kartu terakhir!`);
      updatePayload.gameStatus = 'finished';
      updatePayload.gameWinnerUID = user.uid;
      updatePayload.gameWinnerDisplayName = user.displayName;
      updatePayload.gameWonAt = Date.now();
      updatePayload.achievementAwarded = false;
      updatePayload.shouldShowQuestionModal = false;
      updatePayload.questionForModal = null;
      updatePayload.thrownCard = null;
    }

    await updateGameState(topicID, gameID, roomID, updatePayload);
  }

  const handlePlayerAnswerSubmission = useCallback(
    async (result) => {
      updateActivity();
      if (!isMyPlayerTurnToAnswer()) {
        console.log("Not your turn to answer!");
        return;
      }

      if (hasAddedPenalty.current) {
        console.log("Answer already processed, skipping");
        return;
      }

      const { isCorrect, hint, usedPotion, potionAlreadyReduced } = result;
      const myIndex = getLocalPlayerGlobalIndex();
      const myPlayerId = `player${myIndex + 1}`;

      const newFeedback = { ...playerAnswerFeedback };
      newFeedback[myPlayerId] = isCorrect ? "correct" : "incorrect";

      await updateGameState(
        topicIDRef.current,
        gameIDRef.current,
        roomIDRef.current,
        {
          playerAnswerFeedback: newFeedback,
        }
      );

      // Handle potion usage - Skip completely since Potion component handles it
      if (usedPotion && !potionAlreadyReduced) {
        console.log("🧪 Potion used, but should be handled by Potion component");
        // This should not happen anymore since Potion component reduces count
      } else if (potionAlreadyReduced) {
        console.log("🧪 Potion already reduced by Potion component, skipping reduction");
      }

      if (!isCorrect && !usedPotion) {
        hasAddedPenalty.current = true;

        const penaltyCard = getRandomCardFromAvailablePool();
        const currentCards = gameState[`${myPlayerId}Cards`] || [];
        const updatedCards = [...currentCards, penaltyCard];

        await updateGameState(
          topicIDRef.current,
          gameIDRef.current,
          roomIDRef.current,
          {
            [`${myPlayerId}Cards`]: updatedCards,
            penaltyAddedAt: Date.now(),
            penaltyAddedBy: "wrong_answer",
          }
        );

        if (hint) {
          setCollectedGameHints((prev) => [...prev, hint]);
          setShowGameOffcanvas(true);
        }

        console.log(`🃏 Penalty! Player ${myPlayerId} gets a card.`);
      } else {
        console.log(`✅ ${potionAlreadyReduced ? 'Potion used (already reduced)' : usedPotion ? 'Potion used' : 'Correct answer'} from Player ${myPlayerId}.`);
      }

      setTimeout(async () => {
        const resetFeedback = { ...newFeedback };
        resetFeedback[myPlayerId] = null;

        const playerWhoJustAnswered = currentPlayerIndex;

        console.log(
          `↩️ Player ${
            playerWhoJustAnswered + 1
          } (who just answered) now gets turn to throw.`
        );
        await updateGameState(
          topicIDRef.current,
          gameIDRef.current,
          roomIDRef.current,
          {
            playerAnswerFeedback: resetFeedback,
            currentPlayerIndex: playerWhoJustAnswered,
            currentActiveTurnPhase: "throwing",
            thrownCard: null,
            questionForModal: null,
            shouldShowQuestionModal: false,
            lastCardThrowerIndex: null,
          }
        );

        setTimeout(() => {
          hasAddedPenalty.current = false;
        }, 500);
      }, 500);
    },
    [
      updateActivity,
      isMyPlayerTurnToAnswer,
      getLocalPlayerGlobalIndex,
      playerAnswerFeedback,
      gameState,
      getRandomCardFromAvailablePool,
      currentPlayerIndex,
      topicIDRef,
      gameIDRef,
      roomIDRef,
      user.uid,
    ]
  );

  const handleCloseQuestionPromptModal = useCallback(async () => {
    console.log("🔴 Closing modal manually");
    setShouldShowQuestionModal(false);
    setQuestionForModalDisplay(null);
    setThrownCardData(null);

    await updateGameState(topicID, gameID, roomID, {
      shouldShowQuestionModal: false,
      questionForModal: null,
      thrownCard: null,
    });
  }, [topicID, gameID, roomID]);

  // Ref untuk prevent double potion usage - MOVED UP
  const potionUsageRef = useRef(false);
  const potionSubmittedRef = useRef(false); // ADDED: Track if already submitted

  // Handle potion usage in modal
  const handlePotionUseInModal = useCallback(async () => {
    if (!displayQuestionModalForMe) return;
    
    // STRONG prevention dengan multiple checks
    if (isPotionUsedInModal || potionUsageRef.current || potionSubmittedRef.current) {
      console.log("🧪 Potion already being used, skipping");
      return;
    }
    
    // Set ALL flags immediately untuk prevent any double execution
    potionUsageRef.current = true;
    potionSubmittedRef.current = true;
    setIsPotionUsedInModal(true);
    
    console.log("🧪 Potion used during question - starting process");
    
    // DON'T reduce database here - let Potion component handle it
    // Show overlay feedback, then submit answer
    setTimeout(() => {
      const potionResult = {
        isCorrect: true,
        hint: questionForModalDisplay?.hint || null,
        usedPotion: false, // Database already reduced by Potion component
        potionAlreadyReduced: true // Flag for logging
      };
      
      handlePlayerAnswerSubmission(potionResult);
      
      // Reset states setelah submit
      setTimeout(() => {
        setIsPotionUsedInModal(false);
        potionUsageRef.current = false;
        potionSubmittedRef.current = false;
      }, 500);
    }, 500);
  }, [displayQuestionModalForMe, questionForModalDisplay?.hint, handlePlayerAnswerSubmission, isPotionUsedInModal]);

  // Reset potion state saat modal tutup
  useEffect(() => {
    if (!displayQuestionModalForMe) {
      setIsPotionUsedInModal(false);
      potionUsageRef.current = false;
      potionSubmittedRef.current = false;
    }
  }, [displayQuestionModalForMe]);

  const handleVictoryClose = useCallback(() => {
    console.log("🏆 Victory overlay closing - immediate redirect");
    
    // Firebase cleanup (jalankan di background)
    stopGameTimer(topicID, gameID, roomID);
    setGameStartStatus(topicID, gameID, roomID, false);
    
    // Reset states
    setVictory(false);
    setHasLost(false);
    setShowVictoryOverlay(false);
    
    // Cleanup Firebase di background dan LANGSUNG navigate
    if (!hasCleanedUpRef.current) {
      hasCleanedUpRef.current = true;
      
      // Jalankan cleanup async tanpa blocking navigation
      cleanupGame(topicID, gameID, roomID, user)
        .then(() => console.log("✅ Firebase cleaned up"))
        .catch(error => console.error("❌ Cleanup error:", error));
    }
    
    // LANGSUNG navigate tanpa setTimeout atau delay apapun
    navigate("/");
  }, [topicID, gameID, roomID, user, navigate]);

  const handleCloseGameOffcanvas = useCallback(() => {
    setShowGameOffcanvas(false);
  }, []);

  // Utility functions for GameArea
  const isPlayerTurnStatus = useCallback(
    (playerGlobalIndex) => currentPlayerIndex === playerGlobalIndex,
    [currentPlayerIndex]
  );

  const getPlayerRemainingTime = useCallback(
    (playerGlobalIndex) => {
      if (currentPlayerIndex === playerGlobalIndex) {
        return localVisualTimeLeft;
      }
      return 0;
    },
    [localVisualTimeLeft, currentPlayerIndex]
  );

  // Render loading
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
          timeLeft={localVisualTimeLeft}
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

      {displayQuestionModalForMe && (
        <div 
          style={{ 
            zIndex: 9999, 
          }}
        >
          <div style={{ pointerEvents: 'auto' }}> 
            <Potion 
              onUsePotion={handlePotionUseInModal}
              isUsable={true && !isPotionUsedInModal}
            />
          </div>
        </div>
      )}

      <QuestionModal
        show={displayQuestionModalForMe}
        questionData={questionForModalDisplay}
        onClose={handleCloseQuestionPromptModal}
        onSubmitAnswer={handlePlayerAnswerSubmission}
        isMyTurnToAnswer={isMyPlayerTurnToAnswer()}
        playerAnswerFeedback={playerAnswerFeedback}
        currentPlayerId={activeLocalPlayerId}
        playerAnsweringId={`player${currentPlayerIndex + 1}`}
        timeLeft={localVisualTimeLeft}
        TIMER_ANSWER_DURATION={GAME_CONSTANTS.ANSWER_TIMER_SECONDS}
        players={players}
        isPotionUsed={isPotionUsedInModal}
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