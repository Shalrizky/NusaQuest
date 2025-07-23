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
  ANSWER_TIMER_SECONDS: 20,
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
      setVictory(false);
      setIsWinner(false);
      setHasLost(false);
      setShowVictoryOverlay(false);
      setWinner("");
      
      await cleanupGame(topicID, gameID, roomID, user);
      setTimeout(() => navigate("/"), 1000);
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
      console.log(`⏰ CLIENT: Throwing timeout for player ${currentPlayerIndex + 1}. Moving to next player.`);
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
      console.log(`⏰ CLIENT: Answering timeout for player ${currentPlayerIndex + 1}. Adding penalty card.`);

      if (hasAddedPenalty.current) {
        console.log("⏰ Penalty already added, skipping duplicate penalty.");
        return;
      }
      hasAddedPenalty.current = true;

      const myPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
      const currentServerState = await getGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current);
      const currentCards = currentServerState[`${myPlayerId}Cards`] || [];

      const recentPenalty = currentCards.find(card =>
        card.isPenalty &&
        card.id &&
        (now - parseInt(card.id.split('_')[1])) < 5000
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

      await updateGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current, {
        [`${myPlayerId}Cards`]: updatedCards,
        playerAnswerFeedback: newFeedback,
        penaltyAddedAt: now, 
        penaltyAddedBy: 'timeout'
      });

      if (questionForModalDisplay?.hint) {
        setCollectedGameHints(prev => [...prev, questionForModalDisplay.hint]);
        setShowGameOffcanvas(true);
      }

      setTimeout(async () => {
        const resetFeedback = { ...newFeedback };
        resetFeedback[myPlayerId] = null;
        
        const playerWhoJustAnswered = currentPlayerIndex;
        
        console.log(`↩️ Player ${playerWhoJustAnswered + 1} (who just timed out) now gets turn to throw.`);
        await updateGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current, {
          playerAnswerFeedback: resetFeedback,
          currentPlayerIndex: playerWhoJustAnswered,
          currentActiveTurnPhase: "throwing",
          thrownCard: null,
          questionForModal: null,
          shouldShowQuestionModal: false,
          lastCardThrowerIndex: null,
        });
        
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
  const [localPlayerTimeLeft, resetPlayerTimer] = usePlayerTimer(
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

  // Award victory potions - DIPERBAIKI untuk konsisten dengan UlarTangga
  const awardVictoryPotions = useCallback(async () => {
    if (!user?.uid) {
      console.error("No user UID available for potion award");
      return false;
    }

    try {
      console.log("🏆 Awarding victory potions to:", user.displayName);
      
      // Update achievement - gunakan gameID dinamis, bukan hardcoded
      const isAchievementUpdated = await updateWinningAchievement(
        user.uid,
        gameID, // Gunakan gameID dari params, bukan hardcoded "game1" 
        topicID
      );

      console.log("Achievement updated:", isAchievementUpdated);

      if (isAchievementUpdated) {
        // Award potion - sama seperti UlarTangga
        const currentPotionData = await getPotionData(user.uid);
        if (currentPotionData) {
          await saveNewPotionData(user.uid, {
            item_name: currentPotionData.item_name,
            item_count: (currentPotionData.item_count || 0) + 1,
            item_img: currentPotionData.item_img,
          });
          console.log("🧪 Potion awarded successfully");
        } else {
          console.warn("No potion data found for user");
        }
        return true;
      }

      console.log("Achievement was not updated (possibly already exists)");
      return false;
    } catch (error) {
      console.error("Error awarding victory potions:", error);
      return false;
    }
  }, [user?.uid, gameID, topicID]); // Pastikan dependency benar

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      if (players.length === 0) return;

      try {
        await setGameStatus(topicID, gameID, roomID, "playing");
        const existingGameState = await getGameState(topicID, gameID, roomID);

        if (!existingGameState || !existingGameState.questions || !existingGameState.playerTimers || existingGameState.playerTimers.length === 0) {
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
            playerTimers: new Array(players.length).fill(GAME_CONSTANTS.THROW_TIMER_SECONDS),
            gameWinnerUID: null,
            gameWinnerDisplayName: null,
            gameWonAt: null,
            achievementAwarded: false,
          };
          
          if (players.length > 0) {
            initialGameState.playerTimers[0] = GAME_CONSTANTS.THROW_TIMER_SECONDS;
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

          await initializeNusaCardGameState(topicID, gameID, roomID, players, shuffledQuestions, initialGameState);
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

    const unsubscribe = fetchGamePlayers(topicID, gameID, roomID, (playersData) => {
      setPlayers(playersData);
      if (playersData.length === 0 && !hasCleanedUpRef.current) {
        console.log("No players found or all left, cleaning up game...");
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

        // --- LOGIKA KEMENANGAN YANG DIPERBAIKI ---
        const playerCardCounts = {};
        for (let i = 0; i < players.length; i++) {
          const playerId = `player${i + 1}`;
          playerCardCounts[playerId] = newGameState[`${playerId}Cards`]?.length || 0;
        }

        const potentialWinnerIndex = Object.keys(playerCardCounts).findIndex(
          (playerId, index) => playerCardCounts[playerId] === 0 && newGameState.playerStatus?.[playerId] === "available"
        );

        if (potentialWinnerIndex !== -1) {
          if (!newGameState.gameWinnerUID) {
              const winnerPlayer = players[potentialWinnerIndex];
              if (winnerPlayer) {
                  if (user?.uid === winnerPlayer.uid) {
                      console.log(`🎉 Saya (${user?.displayName}) menang! Mengupdate pemenang di Firebase.`);
                      
                      // Update Firebase dengan status kemenangan
                      updateGameState(topicID, gameID, roomID, {
                          gameStatus: 'finished',
                          gameWinnerUID: winnerPlayer.uid,
                          gameWinnerDisplayName: winnerPlayer.displayName,
                          gameWonAt: Date.now()
                      }).then(async () => {
                        // Award achievement dan potion - SAMA SEPERTI ULAR TANGGA
                        try {
                          const potionAwarded = await awardVictoryPotions();
                          console.log("🏆 Victory rewards processing completed");
                          
                          // Set victory states
                          setVictory(true);
                          setIsWinner(true);
                          setWinner(winnerPlayer.displayName);
                          setShowVictoryOverlay(true);
                          
                          // Update achievement awarded flag di Firebase
                          await updateGameState(topicID, gameID, roomID, { 
                            achievementAwarded: true 
                          });
                        } catch (error) {
                          console.error("Error awarding victory rewards:", error);
                          // Tetap tampilkan victory meski ada error
                          setVictory(true);
                          setIsWinner(true);
                          setWinner(winnerPlayer.displayName);
                          setShowVictoryOverlay(true);
                        }
                      });
                  }
              }
          }

          // Setelah pemenang teridentifikasi di Firebase, setiap klien akan menampilkan overlay
          if (newGameState.gameWinnerUID) {
              setVictory(true);
              setWinner(newGameState.gameWinnerDisplayName || "Player");
              setIsWinner(user?.uid === newGameState.gameWinnerUID);
              setHasLost(user?.uid !== newGameState.gameWinnerUID);
              setShowVictoryOverlay(true);
          }
        } else {
          if (victory || gameOver) {
            console.log("Resetting local victory/game over state as no winner found in Firebase.");
            setVictory(false);
            setIsWinner(false);
            setHasLost(false);
            setShowVictoryOverlay(false);
            setWinner("");
          }
        }
        // --- AKHIR LOGIKA KEMENANGAN YANG DIPERBAIKI ---
      }
    });

    return () => unsubscribe();
  }, [isGameReady, players, topicID, gameID, roomID, user?.uid, currentPlayerIndex, victory, gameOver, awardVictoryPotions]);

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

      const isAnyPlayerActive = currentPlayerIndex !== null && currentPlayerIndex >= 0 && players.length > 0;
      
      if (syncedPlayerTimeLeft > 0 && isAnyPlayerActive) {
          visualTimerIntervalRef.current = setInterval(() => {
              setLocalVisualTimeLeft(prevTime => {
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

  // Victory overlay effect - sama seperti UlarTangga
  useEffect(() => {
    if (victory) {
      setShowVictoryOverlay(true);
    }
  }, [victory]);

  // Cleanup effect - HANYA untuk gameOver, bukan victory
  useEffect(() => {
    // HANYA cleanup untuk gameOver (waktu habis), BUKAN untuk victory
    if (gameOver && !victory) {
      console.log("Cleaning up game due to: Game Over (time up)");
      stopGameTimer(topicID, gameID, roomID);
      setGameStartStatus(topicID, gameID, roomID, false);
      
      if (!hasCleanedUpRef.current) {
        cleanupGame(topicID, gameID, roomID, user).then(() => {
          console.log("Firebase game data cleaned up.");
          hasCleanedUpRef.current = true;
        }).catch(error => {
          console.error("Error during cleanup:", error);
        });
      }
      
      // Langsung navigate untuk gameOver
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

  const handlePlayerAnswerSubmission = useCallback(async (result) => {
    updateActivity();
    if (!isMyPlayerTurnToAnswer()) {
      console.log("Not your turn to answer!");
      return;
    }

    if (hasAddedPenalty.current) {
      console.log("Answer already processed, skipping");
      return;
    }

    const { isCorrect, hint } = result;
    const myIndex = getLocalPlayerGlobalIndex();
    const myPlayerId = `player${myIndex + 1}`;

    const newFeedback = { ...playerAnswerFeedback };
    newFeedback[myPlayerId] = isCorrect ? "correct" : "incorrect";

    await updateGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current, { 
      playerAnswerFeedback: newFeedback
    });

    if (!isCorrect) {
      hasAddedPenalty.current = true;

      const penaltyCard = getRandomCardFromAvailablePool();
      const currentCards = gameState[`${myPlayerId}Cards`] || [];
      const updatedCards = [...currentCards, penaltyCard];

      await updateGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current, { 
        [`${myPlayerId}Cards`]: updatedCards,
        penaltyAddedAt: Date.now(),
        penaltyAddedBy: 'wrong_answer'
      });

      if (hint) {
        setCollectedGameHints(prev => [...prev, hint]);
        setShowGameOffcanvas(true);
      }

      console.log(`🃏 Penalty! Player ${myPlayerId} gets a card.`);
    } else {
      console.log(`✅ Correct answer from Player ${myPlayerId}.`);
    }

    setTimeout(async () => {
      const resetFeedback = { ...newFeedback };
      resetFeedback[myPlayerId] = null;
      
      const playerWhoJustAnswered = currentPlayerIndex;
      
      console.log(`↩️ Player ${playerWhoJustAnswered + 1} (who just answered) now gets turn to throw.`);
      await updateGameState(topicIDRef.current, gameIDRef.current, roomIDRef.current, {
        playerAnswerFeedback: resetFeedback,
        currentPlayerIndex: playerWhoJustAnswered,
        currentActiveTurnPhase: "throwing",
        thrownCard: null,
        questionForModal: null,
        shouldShowQuestionModal: false,
        lastCardThrowerIndex: null,
      });

      setTimeout(() => {
        hasAddedPenalty.current = false;
      }, 500);
    }, 500);
  }, [
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
  ]);

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

  // Handle victory close - SAMA SEPERTI ULAR TANGGA
  const handleVictoryClose = useCallback(() => {
    console.log("🏆 Victory overlay closed, cleaning up and navigating...");
    
    // Cleanup saat user close overlay
    stopGameTimer(topicID, gameID, roomID);
    setGameStartStatus(topicID, gameID, roomID, false);
    
    // Reset victory states
    setVictory(false);
    setHasLost(false);
    setShowVictoryOverlay(false);
    
    // Cleanup game dan navigate
    if (!hasCleanedUpRef.current) {
      cleanupGame(topicID, gameID, roomID, user).then(() => {
        console.log("Firebase game data cleaned up on victory close.");
        hasCleanedUpRef.current = true;
        navigate("/");
      }).catch(error => {
        console.error("Error during cleanup on victory close:", error);
        navigate("/"); // Navigate anyway jika ada error
      });
    } else {
      navigate("/");
    }
  }, [topicID, gameID, roomID, user, navigate]);

  const handleCloseGameOffcanvas = useCallback(() => {
    setShowGameOffcanvas(false);
  }, []);

  // Calculated values
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