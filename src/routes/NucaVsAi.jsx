import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import QuestionModal from "../components/games/nuca/QuestionModal";
import GameArea from "../components/games/nuca/GameArea";
import VictoryOverlay from "../components/games/VictoryOverlay";
import LoseOverlay from "../components/games/LoseOverlay";
import { getQuestions, shuffle } from "../services/questionDataServices";
import "../style/routes/NusaCard.css";

// Konstanta permainan
const GAME_CONSTANTS = {
  FIRST_PLAYER_INDEX: 0,
  TURN_FLOW_DIRECTION: "clockwise",
  INITIAL_CARDS_PER_PLAYER: 5,
  THROW_TIMER_SECONDS: 15,
  ANSWER_TIMER_SECONDS: 25,
  AI_ANSWER_CORRECT_CHANCE: 0.5,
  AI_THROW_DELAY_MS: 2500,
  AI_ANSWER_DELAY_MS: 3500,
  HUMAN_TIMEOUT_GRACE_PERIOD_MS: 500,
  FEEDBACK_DISPLAY_DURATION: 1500,
  PENALTY_ANIMATION_DURATION: 500,
};

/**
 * @function createInitialCardsForPlayer
 * @description Membuat array kartu awal untuk pemain dengan mengacak dan membagi pertanyaan.
 */
const createInitialCardsForPlayer = (questions, startIndex, count) => {
  const shuffledQuestions = shuffle([...questions]);
  return shuffledQuestions
    .slice(startIndex, Math.min(shuffledQuestions.length, startIndex + count))
    .map((q, index) => ({
      ...q,
      id: `card_${startIndex}_${index}_${Date.now()}_${Math.random()}`,
    }));
};

/**
 * @function NusaCardVsAi
 * @description Komponen utama untuk permainan NusaCard melawan AI.
 */
function NusaCardVsAi() {
  const { topicID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { aiCardsCount } = location.state || { aiCardsCount: 0 };

  // Refs untuk mencegah eksekusi ganda dan timeout handling
  const hasAddedPenalty = useRef(false);
  const lastTimeoutHandled = useRef(0);
  const visualTimerIntervalRef = useRef(null);
  const currentTurnActionTimeoutRef = useRef(null);
  const prevPlayerIndexRef = useRef(0);

  // Status Permainan Inti
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayerIndex: 0,
    currentActiveTurnPhase: "throwing",
    thrownCard: null,
    questionForModal: null,
    shouldShowQuestionModal: false,
    player1Cards: [],
    bot2Cards: [],
    bot3Cards: [],
    bot4Cards: [],
    playerStatus: {
      player1: "not_available",
      bot1: "not_available",
      bot2: "not_available",
      bot3: "not_available",
    },
    questions: [],
    currentQuestionIndex: 0,
    playerTimers: [],
    gameWinnerUID: null,
    gameWinnerDisplayName: null,
    gameWonAt: null,
    achievementAwarded: false,
    lastCardThrowerIndex: null,
    playerAnswerFeedback: {
      player1: null,
      bot1: null,
      bot2: null,
      bot3: null,
    },
    collectedGameHints: [],
    showGameOffcanvas: false,
    triggerShuffleAnimation: false,
    syncedPlayerTimeLeft: 0,
    localVisualTimeLeft: 0,
    victory: false,
    winner: "",
    gameOver: false,
    isWinner: false,
    hasLost: false,
    showVictoryOverlay: false,
  });

  // Destructure untuk akses yang lebih mudah
  const {
    players,
    currentPlayerIndex,
    currentActiveTurnPhase,
    thrownCard,
    questionForModal,
    shouldShowQuestionModal,
    playerAnswerFeedback,
    collectedGameHints,
    showGameOffcanvas,
    triggerShuffleAnimation,
    localVisualTimeLeft,
    victory,
    winner,
    gameOver,
    isWinner,
    hasLost,
    showVictoryOverlay,
  } = gameState;

  const [isGameReady, setIsGameReady] = useState(false);

  /**
   * @function getLocalPlayerGlobalIndex
   */
  const getLocalPlayerGlobalIndex = useCallback(() => {
    if (!user?.uid || !players.length) return 0;
    const myPlayerIndex = players.findIndex((p) => p.uid === user.uid);
    return myPlayerIndex !== -1 ? myPlayerIndex : 0;
  }, [players, user?.uid]);

  /**
   * @function getNextPlayerIndex
   */
  const getNextPlayerIndex = useCallback((currentIndex, totalPlayers) => {
    return (currentIndex + 1) % totalPlayers;
  }, []);

  /**
   * @function isMyPlayerTurnToThrow
   */
  const isMyPlayerTurnToThrow = useCallback(() => {
    const myIndex = getLocalPlayerGlobalIndex();
    return (
      currentPlayerIndex === myIndex && currentActiveTurnPhase === "throwing"
    );
  }, [currentPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]);

  /**
   * @function isMyPlayerTurnToAnswer
   */
  const isMyPlayerTurnToAnswer = useCallback(() => {
    const myIndex = getLocalPlayerGlobalIndex();
    return (
      currentPlayerIndex === myIndex && currentActiveTurnPhase === "answering"
    );
  }, [currentPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]);

  const activeLocalPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;

  const cardCounts = {
    player1: gameState.player1Cards?.length || 0,
    bot1: gameState.bot2Cards?.length || 0,
    bot2: gameState.bot3Cards?.length || 0,
    bot3: gameState.bot4Cards?.length || 0,
  };

  const displayQuestionModalForMe =
    shouldShowQuestionModal && isMyPlayerTurnToAnswer();

  /**
   * @function getRandomCardFromAvailablePool
   */
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

  /**
   * @function handleTimeOut
   * @description Mengelola batas waktu giliran pemain manusia - DIPERBAIKI
   */
  const handleTimeOut = useCallback(() => {
    const activePlayer = players[currentPlayerIndex];
    const isHumanPlayerActive = activePlayer?.uid === user?.uid;

    if (!isHumanPlayerActive) {
      return;
    }

    const now = Date.now();
    if (now - lastTimeoutHandled.current < GAME_CONSTANTS.HUMAN_TIMEOUT_GRACE_PERIOD_MS) {
      console.log("⏰ Timeout sudah ditangani baru-baru ini, dilewati.");
      return;
    }

    lastTimeoutHandled.current = now;
    console.log(`⏰ TIMEOUT untuk pemain ${activePlayer.displayName} pada fase ${currentActiveTurnPhase}.`);

    // Clear existing timers
    if (visualTimerIntervalRef.current) {
      clearInterval(visualTimerIntervalRef.current);
      visualTimerIntervalRef.current = null;
    }
    if (currentTurnActionTimeoutRef.current) {
      clearTimeout(currentTurnActionTimeoutRef.current);
      currentTurnActionTimeoutRef.current = null;
    }

    if (currentActiveTurnPhase === "throwing") {
      // Player timeout saat melempar - pindah giliran
      const nextIndex = getNextPlayerIndex(currentPlayerIndex, players.length);
      console.log(`🔄 Giliran beralih ke pemain ${nextIndex + 1} karena timeout melempar.`);

      setGameState((prev) => ({
        ...prev,
        currentPlayerIndex: nextIndex,
        currentActiveTurnPhase: "throwing",
        thrownCard: null,
        questionForModal: null,
        shouldShowQuestionModal: false,
        triggerShuffleAnimation: false,
        localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
        syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
        playerAnswerFeedback: {
          ...prev.playerAnswerFeedback,
          [`player${prev.currentPlayerIndex + 1}`]: null
        },
      }));

    } else if (currentActiveTurnPhase === "answering") {
      // Player timeout saat menjawab - anggap salah dan berikan penalty
      const myPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
      const penaltyCard = getRandomCardFromAvailablePool();

      setGameState((prev) => {
        const currentCards = prev[`${myPlayerId}Cards`] || [];
        const updatedCards = [...currentCards, penaltyCard];

        const newFeedback = { ...prev.playerAnswerFeedback };
        newFeedback[myPlayerId] = "incorrect";

        let updatedHints = prev.collectedGameHints;
        let showOffcanvas = prev.showGameOffcanvas;

        // Tampilkan hint jika tersedia
        if (questionForModal?.hint) {
          updatedHints = [...updatedHints, questionForModal.hint];
          showOffcanvas = true;
        }

        console.log(`❌ Pemain ${activePlayer.displayName} timeout menjawab. Menambahkan penalty card.`);

        // Set feedback display timer
        setTimeout(() => {
          setGameState((current) => ({
            ...current,
            playerAnswerFeedback: {
              ...current.playerAnswerFeedback,
              [myPlayerId]: null
            },
            currentPlayerIndex: current.currentPlayerIndex,
            currentActiveTurnPhase: "throwing",
            thrownCard: null,
            questionForModal: null,
            shouldShowQuestionModal: false,
            localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
            syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
          }));
          hasAddedPenalty.current = false;
        }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);

        return {
          ...prev,
          [`${myPlayerId}Cards`]: updatedCards,
          playerAnswerFeedback: newFeedback,
          collectedGameHints: updatedHints,
          showGameOffcanvas: showOffcanvas,
          triggerShuffleAnimation: true,
        };
      });

      // Reset shuffle animation
      setTimeout(() => {
        setGameState((current) => ({
          ...current,
          triggerShuffleAnimation: false
        }));
      }, GAME_CONSTANTS.PENALTY_ANIMATION_DURATION);
    }
  }, [
    user?.uid,
    players,
    currentPlayerIndex,
    currentActiveTurnPhase,
    getLocalPlayerGlobalIndex,
    getNextPlayerIndex,
    getRandomCardFromAvailablePool,
    questionForModal?.hint,
  ]);

  /**
   * @function handleCardPlayAttempt
   */
  const handleCardPlayAttempt = useCallback(
    (cardData) => {
      if (!isMyPlayerTurnToThrow()) {
        console.log("Bukan giliranmu untuk melempar kartu!");
        return;
      }

      const myIndex = getLocalPlayerGlobalIndex();
      const myPlayerId = `player${myIndex + 1}`;

      setGameState((prev) => {
        const myCards = prev[`${myPlayerId}Cards`] || [];
        const updatedCards = myCards.filter((card) => card.id !== cardData.id);

        const nextPlayerIndex = getNextPlayerIndex(
          prev.currentPlayerIndex,
          prev.players.length
        );

        let updatePayload = {
          [`${myPlayerId}Cards`]: updatedCards,
          thrownCard: cardData,
          questionForModal: cardData,
          shouldShowQuestionModal: true,
          currentPlayerIndex: nextPlayerIndex,
          currentActiveTurnPhase: "answering",
          lastCardThrowerIndex: prev.currentPlayerIndex,
          triggerShuffleAnimation: true,
          localVisualTimeLeft: GAME_CONSTANTS.ANSWER_TIMER_SECONDS,
          syncedPlayerTimeLeft: GAME_CONSTANTS.ANSWER_TIMER_SECONDS,
        };

        // Periksa kondisi kemenangan
        if (updatedCards.length === 0) {
          console.log(`🎉 ${user?.displayName} menang dengan kartu terakhir!`);
          updatePayload = {
            ...updatePayload,
            gameWinnerUID: user.uid,
            gameWinnerDisplayName: user.displayName,
            gameWonAt: Date.now(),
            achievementAwarded: false,
            shouldShowQuestionModal: false,
            questionForModal: null,
            thrownCard: null,
            victory: true,
            winner: user.displayName,
            isWinner: true,
            hasLost: false,
            showVictoryOverlay: true,
            triggerShuffleAnimation: false,
          };
        }

        setTimeout(
          () =>
            setGameState((current) => ({ ...current, triggerShuffleAnimation: false })),
          GAME_CONSTANTS.PENALTY_ANIMATION_DURATION
        );

        return { ...prev, ...updatePayload };
      });
    },
    [isMyPlayerTurnToThrow, getLocalPlayerGlobalIndex, getNextPlayerIndex, user?.displayName, user?.uid]
  );

  /**
   * @function handlePlayerAnswerSubmission
   */
  const handlePlayerAnswerSubmission = useCallback(
    (result) => {
      if (!isMyPlayerTurnToAnswer()) {
        console.log("Bukan giliranmu untuk menjawab!");
        return;
      }

      if (hasAddedPenalty.current) {
        console.log("Jawaban sudah diproses, dilewati");
        return;
      }

      const { isCorrect, hint } = result;
      const myIndex = getLocalPlayerGlobalIndex();
      const myPlayerId = `player${myIndex + 1}`;

      setGameState((prev) => {
        const newFeedback = { ...prev.playerAnswerFeedback };
        newFeedback[myPlayerId] = isCorrect ? "correct" : "incorrect";

        let updatedCards = prev[`${myPlayerId}Cards`] || [];
        let updatedHints = prev.collectedGameHints;
        let showOffcanvas = prev.showGameOffcanvas;
        let triggerAnim = false;

        if (!isCorrect) {
          hasAddedPenalty.current = true;
          const penaltyCard = getRandomCardFromAvailablePool();
          updatedCards = [...updatedCards, penaltyCard];

          if (hint) {
            updatedHints = [...updatedHints, hint];
            showOffcanvas = true;
          }

          console.log(`Penalti! Pemain ${myPlayerId} mendapat kartu.`);
          triggerAnim = true;
        } else {
          console.log(`Jawaban benar dari Pemain ${myPlayerId}.`);
        }

        if (triggerAnim) {
          setTimeout(
            () =>
              setGameState((current) => ({ ...current, triggerShuffleAnimation: false })),
            GAME_CONSTANTS.PENALTY_ANIMATION_DURATION
          );
        }

        setTimeout(() => {
          setGameState((current) => {
            const resetFeedback = { ...current.playerAnswerFeedback };
            resetFeedback[myPlayerId] = null;

            console.log(`↩️ Giliran kembali ke pemain ${user?.displayName} untuk melempar setelah jawaban.`);

            return {
              ...current,
              playerAnswerFeedback: resetFeedback,
              currentPlayerIndex: current.currentPlayerIndex,
              currentActiveTurnPhase: "throwing",
              thrownCard: null,
              questionForModal: null,
              shouldShowQuestionModal: false,
              localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
              syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
            };
          });

          hasAddedPenalty.current = false;
        }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);

        return {
          ...prev,
          playerAnswerFeedback: newFeedback,
          [`${myPlayerId}Cards`]: updatedCards,
          collectedGameHints: updatedHints,
          showGameOffcanvas: showOffcanvas,
          triggerShuffleAnimation: triggerAnim,
        };
      });
    },
    [
      isMyPlayerTurnToAnswer,
      getLocalPlayerGlobalIndex,
      getRandomCardFromAvailablePool,
      currentPlayerIndex,
      user?.displayName,
    ]
  );

  /**
   * @function handleAIThrowCard - DIPERBAIKI
   */
  const handleAIThrowCard = useCallback(
    (aiUid) => {
      console.log(`🤖 AI Throw Attempt - UID: ${aiUid}`);

      setGameState((prev) => {
        const aiPlayerIndex = prev.players.findIndex((p) => p.uid === aiUid);

        if (aiPlayerIndex === -1) {
          console.log(`❌ AI with UID ${aiUid} not found in players array`);
          return prev;
        }

        const aiPlayer = prev.players[aiPlayerIndex];
        console.log(`🤖 Found AI: ${aiPlayer.displayName} at index ${aiPlayerIndex}`);

        if (prev.currentPlayerIndex !== aiPlayerIndex) {
          console.log(`❌ Not AI's turn. Current: ${prev.currentPlayerIndex}, AI: ${aiPlayerIndex}`);
          return prev;
        }

        if (prev.currentActiveTurnPhase !== "throwing") {
          console.log(`❌ Wrong phase. Current: ${prev.currentActiveTurnPhase}, Expected: throwing`);
          return prev;
        }

        const aiPlayerId = `player${aiPlayerIndex + 1}`;
        const aiCards = prev[`${aiPlayerId}Cards`] || [];

        console.log(`🤖 AI ${aiPlayer.displayName} has ${aiCards.length} cards`);

        if (aiCards.length === 0) {
          console.log(`🤖 AI ${aiPlayer.displayName} has no cards to throw. Skipping turn.`);
          const nextIndex = getNextPlayerIndex(aiPlayerIndex, prev.players.length);
          return {
            ...prev,
            currentPlayerIndex: nextIndex,
            currentActiveTurnPhase: "throwing",
            thrownCard: null,
            questionForModal: null,
            shouldShowQuestionModal: false,
            lastCardThrowerIndex: null,
            triggerShuffleAnimation: false,
            localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
            syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
          };
        }

        const randomCardIndex = Math.floor(Math.random() * aiCards.length);
        const cardToThrow = aiCards[randomCardIndex];

        console.log(`🤖 AI ${aiPlayer.displayName} throwing card: "${cardToThrow.question_text}"`);

        const updatedAiCards = aiCards.filter((card) => card.id !== cardToThrow.id);

        console.log(`🤖 AI Cards: ${aiCards.length} → ${updatedAiCards.length}`);

        const nextAnswererIndex = getNextPlayerIndex(aiPlayerIndex, prev.players.length);

        console.log(`🤖 Next answerer: Player ${nextAnswererIndex + 1} (${prev.players[nextAnswererIndex]?.displayName})`);

        let newStateUpdate = {
          [`${aiPlayerId}Cards`]: updatedAiCards,
          thrownCard: cardToThrow,
          questionForModal: cardToThrow,
          shouldShowQuestionModal: true,
          currentPlayerIndex: nextAnswererIndex,
          currentActiveTurnPhase: "answering",
          lastCardThrowerIndex: aiPlayerIndex,
          triggerShuffleAnimation: true,
          localVisualTimeLeft: GAME_CONSTANTS.ANSWER_TIMER_SECONDS,
          syncedPlayerTimeLeft: GAME_CONSTANTS.ANSWER_TIMER_SECONDS,
        };

        if (updatedAiCards.length === 0) {
          console.log(`🎉 ${aiPlayer.displayName} WON with the last card!`);
          newStateUpdate = {
            ...newStateUpdate,
            gameWinnerUID: aiUid,
            gameWinnerDisplayName: aiPlayer.displayName,
            gameWonAt: Date.now(),
            shouldShowQuestionModal: false,
            questionForModal: null,
            thrownCard: null,
            victory: true,
            winner: aiPlayer.displayName,
            isWinner: false,
            hasLost: true,
            showVictoryOverlay: true,
            triggerShuffleAnimation: false,
          };
        }

        setTimeout(() => {
          setGameState((current) => ({
            ...current,
            triggerShuffleAnimation: false,
          }));
        }, GAME_CONSTANTS.PENALTY_ANIMATION_DURATION);

        console.log(`✅ AI ${aiPlayer.displayName} successfully threw card.`);

        return { ...prev, ...newStateUpdate };
      });
    },
    [players, getNextPlayerIndex]
  );

  /**
   * @function handleAIAnswerQuestion - DIPERBAIKI
   */
  const handleAIAnswerQuestion = useCallback(
    (aiUid) => {
      setGameState((prev) => {
        const aiPlayerIndex = prev.players.findIndex((p) => p.uid === aiUid);

        if (
          aiPlayerIndex === -1 ||
          prev.currentPlayerIndex !== aiPlayerIndex ||
          prev.currentActiveTurnPhase !== "answering"
        ) {
          console.log(
            `🤖 Bot ${prev.players[aiPlayerIndex]?.displayName} skipped answer, not its turn/phase.`
          );
          return prev;
        }

        const aiPlayerId = `player${aiPlayerIndex + 1}`;
        const question = prev.questionForModal;

        if (!question) {
          console.warn(
            `🤖 AI ${prev.players[aiPlayerIndex]?.displayName} has no question to answer. Skipping answer phase.`
          );

          const penaltyCard = getRandomCardFromAvailablePool();
          const updatedCards = [...(prev[`${aiPlayerId}Cards`] || []), penaltyCard];
          const newFeedback = { ...prev.playerAnswerFeedback };
          newFeedback[aiPlayerId] = "incorrect";

          setTimeout(() => {
            setGameState((current) => ({
              ...current,
              playerAnswerFeedback: {
                ...current.playerAnswerFeedback,
                [aiPlayerId]: null
              },
              currentPlayerIndex: aiPlayerIndex,
              currentActiveTurnPhase: "throwing",
              thrownCard: null,
              questionForModal: null,
              shouldShowQuestionModal: false,
              triggerShuffleAnimation: false,
              localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
              syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
            }));
          }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);

          setTimeout(
            () =>
              setGameState((current) => ({ ...current, triggerShuffleAnimation: false })),
            GAME_CONSTANTS.PENALTY_ANIMATION_DURATION
          );

          return {
            ...prev,
            playerAnswerFeedback: newFeedback,
            [`${aiPlayerId}Cards`]: updatedCards,
            triggerShuffleAnimation: true,
          };
        }

        const isCorrect = Math.random() < GAME_CONSTANTS.AI_ANSWER_CORRECT_CHANCE;
        const newFeedback = { ...prev.playerAnswerFeedback };
        newFeedback[aiPlayerId] = isCorrect ? "correct" : "incorrect";

        let updatedCards = prev[`${aiPlayerId}Cards`] || [];
        let triggerAnim = false;

        if (!isCorrect) {
          const penaltyCard = getRandomCardFromAvailablePool();
          updatedCards = [...updatedCards, penaltyCard];
          console.log(
            `🤖 Penalty! Bot ${prev.players[aiPlayerIndex].displayName} answered incorrectly and received a card.`
          );
          triggerAnim = true;
        } else {
          console.log(
            `🤖 Bot ${prev.players[aiPlayerIndex].displayName} answered correctly.`
          );
        }

        if (triggerAnim) {
          setTimeout(
            () =>
              setGameState((current) => ({ ...current, triggerShuffleAnimation: false })),
            GAME_CONSTANTS.PENALTY_ANIMATION_DURATION
          );
        }

        setTimeout(() => {
          setGameState((current) => {
            const resetFeedback = { ...current.playerAnswerFeedback };
            resetFeedback[aiPlayerId] = null;

            return {
              ...current,
              playerAnswerFeedback: resetFeedback,
              currentPlayerIndex: aiPlayerIndex,
              currentActiveTurnPhase: "throwing",
              thrownCard: null,
              questionForModal: null,
              shouldShowQuestionModal: false,
              localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
              syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
            };
          });
        }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);

        return {
          ...prev,
          playerAnswerFeedback: newFeedback,
          [`${aiPlayerId}Cards`]: updatedCards,
          triggerShuffleAnimation: triggerAnim,
        };
      });
    },
    [players, getRandomCardFromAvailablePool, questionForModal]
  );

  /**
   * @function handleCloseQuestionPromptModal
   */
  const handleCloseQuestionPromptModal = useCallback(() => {
    console.log("Menutup modal secara manual");
    setGameState((prev) => ({
      ...prev,
      shouldShowQuestionModal: false,
      questionForModal: null,
      thrownCard: null,
    }));
  }, []);

  /**
   * @function handleVictoryClose
   */
  const handleVictoryClose = useCallback(() => {
    console.log("🏆 Overlay kemenangan ditutup - pengalihan segera");
    setGameState((prev) => ({
      ...prev,
      victory: false,
      hasLost: false,
      showVictoryOverlay: false,
    }));
    navigate("/");
  }, [navigate]);

  /**
   * @function handleCloseGameOffcanvas
   */
  const handleCloseGameOffcanvas = useCallback(() => {
    setGameState((prev) => ({ ...prev, showGameOffcanvas: false }));
  }, []);

  /**
   * @function isPlayerTurnStatus
   */
  const isPlayerTurnStatus = useCallback(
    (playerGlobalIndex) => currentPlayerIndex === playerGlobalIndex,
    [currentPlayerIndex]
  );

  /**
   * @function getPlayerRemainingTime
   */
  const getPlayerRemainingTime = useCallback(
    (playerGlobalIndex) => {
      if (currentPlayerIndex === playerGlobalIndex) {
        return localVisualTimeLeft;
      }
      return 0;
    },
    [localVisualTimeLeft, currentPlayerIndex]
  );

  /**
   * @effect Inisialisasi Pemain
   */
  useEffect(() => {
    if (!user) return;

    const humanPlayer = {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL || user.googlePhotoURL || null,
      position: 0,
      isAI: false,
    };

    console.log("NusaCardVsAi: Human Player object created:", humanPlayer);

    const aiPlayers = [];
    const maxBots = 3;
    const numBotsToCreate = Math.min(aiCardsCount, maxBots);


    for (let i = 0; i < numBotsToCreate; i++) {
      aiPlayers.push({
        uid: `ai_${i + 1}`,
        displayName: `Bot ${String.fromCharCode(65 + i)}`,
        photoURL: "https://www.gravatar.com/avatar/?d=retro&s=200",
        position: i + 1,
        isAI: true,
      });
    }

    setGameState((prev) => ({
      ...prev,
      players: [humanPlayer, ...aiPlayers],
    }));
  }, [user, aiCardsCount]);

  /**
   * @effect Inisialisasi Status Permainan Lokal
   */
  const initializeLocalGameState = useCallback(async () => {
    if (gameState.players.length === 0 || isGameReady) return;

    try {
      const fetchedQuestions = await getQuestions(topicID);

      if (fetchedQuestions.length === 0) {
        console.error("No questions fetched! Cannot initialize game.");
        setIsGameReady(true);
        return;
      }

      const shuffledQuestions = shuffle([...fetchedQuestions]);

      const initialPlayerTimers = new Array(gameState.players.length).fill(
        GAME_CONSTANTS.THROW_TIMER_SECONDS
      );

      const initialPlayerCards = {};
      const initialPlayerStatus = {};

      gameState.players.forEach((player, index) => {
        const playerId = `player${index + 1}`;
        initialPlayerCards[`${playerId}Cards`] = createInitialCardsForPlayer(
          shuffledQuestions,
          index * GAME_CONSTANTS.INITIAL_CARDS_PER_PLAYER,
          GAME_CONSTANTS.INITIAL_CARDS_PER_PLAYER
        );
        initialPlayerStatus[playerId] = "available";
      });

      for (let i = gameState.players.length; i < 4; i++) {
        const playerId = `player${i + 1}`;
        initialPlayerStatus[playerId] = "not_available";
        initialPlayerCards[`${playerId}Cards`] = [];
      }

      setGameState((prev) => ({
        ...prev,
        ...initialPlayerCards,
        playerStatus: initialPlayerStatus,
        questions: shuffledQuestions,
        playerTimers: initialPlayerTimers,
        currentPlayerIndex: GAME_CONSTANTS.FIRST_PLAYER_INDEX,
        currentActiveTurnPhase: "throwing",
        syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
        localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
      }));

      setIsGameReady(true);
    } catch (error) {
      console.error("Error initializing game (Vs AI):", error);
      setIsGameReady(true);
    }
  }, [gameState.players, topicID, isGameReady]);

  /**
   * @effect Trigger Inisialisasi Permainan
   */
  useEffect(() => {
    if (gameState.players.length > 0 && !isGameReady) {
      initializeLocalGameState();
    }
  }, [gameState.players, isGameReady, initializeLocalGameState]);

  /**
   * @effect Manajemen Giliran Utama - DIPERBAIKI
   */
  useEffect(() => {
    if (!isGameReady || players.length === 0 || victory || gameOver) {
      console.log("Skipping useEffect: isGameReady", isGameReady, "players.length", players.length, "victory", victory, "gameOver", gameOver);
      return;
    }

    // Clear any existing timers/timeouts from previous turns
    if (visualTimerIntervalRef.current) {
      clearInterval(visualTimerIntervalRef.current);
      visualTimerIntervalRef.current = null;
    }
    if (currentTurnActionTimeoutRef.current) {
      clearTimeout(currentTurnActionTimeoutRef.current);
      currentTurnActionTimeoutRef.current = null;
    }

    const activePlayer = players[currentPlayerIndex];
    const isHumanTurn = activePlayer?.uid === user?.uid;

    console.log(`--- useEffect: CURRENT TURN ---`);
    console.log(`Active Player: ${activePlayer?.displayName} (Index: ${currentPlayerIndex}, isAI: ${activePlayer?.isAI})`);
    console.log(`Current Phase: ${currentActiveTurnPhase}`);

    const timerDuration = currentActiveTurnPhase === "throwing"
      ? GAME_CONSTANTS.THROW_TIMER_SECONDS
      : GAME_CONSTANTS.ANSWER_TIMER_SECONDS;

    // Set initial timer values
    setGameState((prev) => ({
      ...prev,
      localVisualTimeLeft: timerDuration,
      syncedPlayerTimeLeft: timerDuration,
      playerTimers: prev.playerTimers.map((t, idx) =>
        idx === currentPlayerIndex ? timerDuration : t
      ),
    }));

    console.log(`Set initial timers to ${timerDuration}s`);

    if (activePlayer && activePlayer.isAI) {
      // AI's turn
      const aiActionDelay = currentActiveTurnPhase === "throwing"
        ? GAME_CONSTANTS.AI_THROW_DELAY_MS
        : GAME_CONSTANTS.AI_ANSWER_DELAY_MS;

      console.log(`🤖 AI Turn for ${activePlayer.displayName}. Scheduling action in ${aiActionDelay}ms.`);

      // Start visual countdown immediately
      visualTimerIntervalRef.current = setInterval(() => {
        setGameState((prev) => {
          const newTime = Math.max(0, prev.localVisualTimeLeft - 1);
          return { ...prev, localVisualTimeLeft: newTime };
        });
      }, 1000);

      // Schedule AI action
      currentTurnActionTimeoutRef.current = setTimeout(() => {
        console.log(`🤖 Bot ${activePlayer.displayName} performing action for phase: ${currentActiveTurnPhase}`);

        if (currentActiveTurnPhase === "throwing") {
          handleAIThrowCard(activePlayer.uid);
        } else if (currentActiveTurnPhase === "answering") {
          handleAIAnswerQuestion(activePlayer.uid);
        }
      }, aiActionDelay);

    } else if (isHumanTurn) {
      // Human player's turn
      console.log(`👨 Human Turn for ${activePlayer.displayName}. Starting visual timer.`);

      visualTimerIntervalRef.current = setInterval(() => {
        setGameState((prev) => {
          const newTime = Math.max(0, prev.localVisualTimeLeft - 1);

          if (newTime <= 0) {
            clearInterval(visualTimerIntervalRef.current);
            visualTimerIntervalRef.current = null;
            console.log(`Visual timer for Human (${activePlayer.displayName}) reached 0. Triggering handleTimeOut.`);

            // Use setTimeout to avoid state update during render
            setTimeout(() => {
              handleTimeOut();
            }, 0);
          }

          return { ...prev, localVisualTimeLeft: newTime };
        });
      }, 1000);
    }

    // Cleanup function
    return () => {
      console.log("Cleanup useEffect for turn management.");
      if (currentTurnActionTimeoutRef.current) {
        clearTimeout(currentTurnActionTimeoutRef.current);
        currentTurnActionTimeoutRef.current = null;
      }
      if (visualTimerIntervalRef.current) {
        clearInterval(visualTimerIntervalRef.current);
        visualTimerIntervalRef.current = null;
      }
    };
  }, [
    currentPlayerIndex,
    currentActiveTurnPhase,
    isGameReady,
    players,
    user?.uid,
    handleAIThrowCard,
    handleAIAnswerQuestion,
    handleTimeOut,
    victory,
    gameOver,
  ]);

  /**
   * @effect Reset Bendera Penalti saat Perubahan Pemain
   */
  useEffect(() => {
    if (prevPlayerIndexRef.current !== currentPlayerIndex) {
      hasAddedPenalty.current = false;
      lastTimeoutHandled.current = 0;
      console.log(`Reset penalty flags. Prev: ${prevPlayerIndexRef.current}, Current: ${currentPlayerIndex}`);
    }
    prevPlayerIndexRef.current = currentPlayerIndex;
  }, [currentPlayerIndex]);

  /**
   * @effect Handle State Changes setelah Timeout - BARU
   */
  useEffect(() => {
    if (!isGameReady || players.length === 0 || victory || gameOver) {
      return;
    }

    // Jika timer sudah di-reset ke nilai penuh, berarti ada perubahan giliran
    const timerDuration = currentActiveTurnPhase === "throwing"
      ? GAME_CONSTANTS.THROW_TIMER_SECONDS
      : GAME_CONSTANTS.ANSWER_TIMER_SECONDS;

    if (localVisualTimeLeft === timerDuration && prevPlayerIndexRef.current !== currentPlayerIndex) {
      console.log(`🔄 Detected turn change from ${prevPlayerIndexRef.current} to ${currentPlayerIndex}`);
    }
  }, [localVisualTimeLeft, currentPlayerIndex, currentActiveTurnPhase, isGameReady, players.length, victory, gameOver]);

  /**
   * @effect Picu Overlay Kemenangan
   */
  useEffect(() => {
    if (victory) {
      setGameState((prev) => ({ ...prev, showVictoryOverlay: true }));
      console.log("Victory state detected. Showing overlay.");
    }
  }, [victory]);

  /**
   * @effect Pembersihan Permainan saat Permainan Berakhir
   */
  useEffect(() => {
    if (gameOver && !victory) {
      console.log("Membersihkan permainan karena: Permainan Berakhir (waktu habis)");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }, [gameOver, victory, navigate]);

  // Tampilkan spinner loading sampai permainan siap
  if (!isGameReady || players.length === 0) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Memuat...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="nusa-page d-flex flex-column">
      <HeaderGame
        hints={collectedGameHints}
        showOffcanvas={showGameOffcanvas}
        setShowOffcanvas={(val) => setGameState((prev) => ({ ...prev, showGameOffcanvas: val }))}
        onCloseOffcanvas={handleCloseGameOffcanvas}
        currentUser={user}
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
          throwCard={thrownCard}
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
        questionData={questionForModal}
        onClose={handleCloseQuestionPromptModal}
        onSubmitAnswer={handlePlayerAnswerSubmission}
        isMyTurnToAnswer={isMyPlayerTurnToAnswer()}
        playerAnswerFeedback={playerAnswerFeedback}
        currentPlayerId={activeLocalPlayerId}
        playerAnsweringId={`player${currentPlayerIndex + 1}`}
        timeLeft={localVisualTimeLeft}
        TIMER_ANSWER_DURATION={GAME_CONSTANTS.ANSWER_TIMER_SECONDS}
        players={players}
        isPotionUsed={false}
      />

      {victory &&
        showVictoryOverlay &&
        (isWinner ? (
          <VictoryOverlay winner={winner} onClose={handleVictoryClose} isVsAiGame={true} /> 
        ) : hasLost ? (
          <LoseOverlay loser={user.displayName} onClose={handleVictoryClose} />
        ) : null)}
    </div>
  );
}

export default NusaCardVsAi;