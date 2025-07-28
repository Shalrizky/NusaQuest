import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import BotProfile from "../assets/common/nusaQuest-logo.png";
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
  HUMAN_TIMEOUT_GRACE_PERIOD_MS: 500,
  AI_ANSWER_CORRECT_CHANCE: 0.65,
  AI_THROW_DELAY_MS: 2800,
  AI_ANSWER_DELAY_MS: 3800,
  FEEDBACK_DISPLAY_DURATION: 1500,
  PENALTY_ANIMATION_DURATION: 500,
};

/**
 * @function createInitialCardsForPlayer
 * @description Membuat array kartu awal untuk pemain dengan mengambil pertanyaan unik
 * dari kumpulan yang tersedia. Fungsi ini memastikan setiap kartu di tangan awal pemain
 * memiliki `question_text` yang unik di antara kartu-kartu yang didistribusikan.
 * @param {Array<Object>} allQuestions - Array semua pertanyaan yang tersedia.
 * @param {Set<string>} existingQuestionTexts - Set of question texts already distributed to other players.
 * @param {number} count - Jumlah kartu yang akan diberikan kepada pemain.
 * @returns {Array<Object>} Array objek kartu yang dibuat untuk pemain.
 */
const createInitialCardsForPlayer = (
  allQuestions,
  existingQuestionTexts,
  count
) => {
  const availableQuestions = allQuestions.filter(
    (q) => !existingQuestionTexts.has(q.question_text)
  );
  const shuffledAvailableQuestions = shuffle([...availableQuestions]);
  const selectedCards = [];
  const selectedQuestionTexts = new Set();

  for (
    let i = 0;
    i < shuffledAvailableQuestions.length && selectedCards.length < count;
    i++
  ) {
    const question = shuffledAvailableQuestions[i];
    if (!selectedQuestionTexts.has(question.question_text)) {
      selectedCards.push({
        ...question,
        id: `card_${question.id}_${Date.now()}_${Math.random()}`,
      });
      selectedQuestionTexts.add(question.question_text);
    }
  }
  return selectedCards;
};

/**
 * @function NusaCardVsAi
 * @description Komponen utama untuk permainan NusaCard dalam mode Versus AI (pemain tunggal melawan bot).
 * Mengelola seluruh alur permainan, state lokal, interaksi pemain, perilaku AI,
 * dan kondisi kemenangan/kekalahan.
 * @returns {JSX.Element} Komponen permainan NusaCard Vs AI.
 */
function NusaCardVsAi() {
  // Hooks router untuk parameter permainan dan navigasi
  const { topicID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { aiCardsCount } = location.state || { aiCardsCount: 0 };

  // Refs untuk mencegah eksekusi ganda dan mengelola timeout
  const hasAddedPenalty = useRef(false);
  const lastTimeoutHandled = useRef(0);
  const visualTimerIntervalRef = useRef(null);
  const currentTurnActionTimeoutRef = useRef(null);
  const prevPlayerIndexRef = useRef(0);

  // Status Permainan Inti (dikelola secara lokal untuk mode Vs AI)
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayerIndex: 0,
    currentActiveTurnPhase: "throwing",
    thrownCard: null,
    questionForModal: null,
    shouldShowQuestionModal: false,
    player1Cards: [],
    bot1Cards: [],
    bot2Cards: [],
    bot3Cards: [],
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

  // Destructure `gameState` untuk akses yang lebih mudah di JSX dan fungsi-fungsi
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

  // ? ========================================
  // ? Fungsi Universal (Digunakan oleh Pemain Manusia & Bot)
  // ? ========================================

  /**
   * @function getLocalPlayerGlobalIndex
   * @description Mengembalikan indeks global (0-based) dari pemain manusia.
   * @returns {number} Indeks global pemain lokal, atau 0 jika tidak ditemukan.
   */
  const getLocalPlayerGlobalIndex = useCallback(() => {
    if (!user?.uid || !players.length) return 0;
    const myPlayerIndex = players.findIndex((p) => p.uid === user.uid);
    return myPlayerIndex !== -1 ? myPlayerIndex : 0;
  }, [players, user?.uid]);

  /**
   * @function getNextPlayerIndex
   * @description Menghitung indeks pemain berikutnya dalam urutan giliran melingkar.
   * @param {number} currentIndex - Indeks pemain saat ini.
   * @param {number} totalPlayers - Jumlah total pemain dalam permainan.
   * @returns {number} Indeks pemain berikutnya.
   */
  const getNextPlayerIndex = useCallback((currentIndex, totalPlayers) => {
    return (currentIndex + 1) % totalPlayers;
  }, []);

  /**
   * @function isMyPlayerTurnToThrow
   * @description Memeriksa apakah giliran pemain lokal (manusia) untuk melempar kartu.
   * @returns {boolean} `true` jika giliran melempar kartu pemain lokal, `false` jika tidak.
   */
  const isMyPlayerTurnToThrow = useCallback(() => {
    const myIndex = getLocalPlayerGlobalIndex();
    return (
      currentPlayerIndex === myIndex && currentActiveTurnPhase === "throwing"
    );
  }, [currentPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]);

  /**
   * @function isMyPlayerTurnToAnswer
   * @description Memeriksa apakah giliran pemain lokal (manusia) untuk menjawab pertanyaan.
   * @returns {boolean} `true` jika giliran menjawab pertanyaan pemain lokal, `false` jika tidak.
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
    bot1: gameState.bot1Cards?.length || 0,
    bot2: gameState.bot2Cards?.length || 0,
    bot3: gameState.bot3Cards?.length || 0,
  };
  const displayQuestionModalForMe =
    shouldShowQuestionModal && isMyPlayerTurnToAnswer();

  /**
   * @function getRandomCardFromAvailablePool
   * @description Memilih pertanyaan acak dari kumpulan yang tersedia untuk digunakan sebagai kartu penalti,
   * memastikan tidak ada kartu duplikat berdasarkan `question_text` yang sudah ada di tangan pemain penerima.
   * @param {string} receivingPlayerId - The string ID of the player who will receive the penalty card (e.g., "player1", "bot1").
   * @returns {Object} Objek pertanyaan yang ditandai sebagai kartu penalti.
   */
  const getRandomCardFromAvailablePool = useCallback(
    (receivingPlayerId) => {
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
      const currentPlayerCards = gameState[`${receivingPlayerId}Cards`] || [];
      const currentPlayerQuestionTexts = new Set(
        currentPlayerCards.map((card) => card.question_text)
      );
      const uniqueAvailableQuestions = availableQuestions.filter(
        (q) => !currentPlayerQuestionTexts.has(q.question_text)
      );
      const poolToDrawFrom =
        uniqueAvailableQuestions.length > 0
          ? uniqueAvailableQuestions
          : availableQuestions;
      const randomIndex = Math.floor(Math.random() * poolToDrawFrom.length);
      const chosenQuestion = { ...poolToDrawFrom[randomIndex] };

      return {
        ...chosenQuestion,
        id: `penalty_${Date.now()}_${Math.random()}`,
        isPenalty: true,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      gameState.questions,
      gameState.player1Cards,
      gameState.bot1Cards,
      gameState.bot2Cards,
      gameState.bot3Cards,
    ]
  );

  /**
   * @function handleTimeOut
   * @description Mengelola batas waktu giliran pemain manusia.
   * Jika pemain timeout saat melempar, giliran pindah. Jika timeout saat menjawab, diberi penalti.
   * Logika timeout hanya berlaku untuk pemain manusia.
   * @returns {void}
   */
  const handleTimeOut = useCallback(() => {
    const activePlayer = players[currentPlayerIndex];
    const isHumanPlayerActive = activePlayer?.uid === user?.uid;
    if (!isHumanPlayerActive) {
      return;
    }
    const now = Date.now();
    if (
      now - lastTimeoutHandled.current <
      GAME_CONSTANTS.HUMAN_TIMEOUT_GRACE_PERIOD_MS
    ) {
      return;
    }
    lastTimeoutHandled.current = now;
    if (visualTimerIntervalRef.current) {
      clearInterval(visualTimerIntervalRef.current);
      visualTimerIntervalRef.current = null;
    }
    if (currentTurnActionTimeoutRef.current) {
      clearTimeout(currentTurnActionTimeoutRef.current);
      currentTurnActionTimeoutRef.current = null;
    }
    if (currentActiveTurnPhase === "throwing") {
      const nextIndex = getNextPlayerIndex(currentPlayerIndex, players.length);
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
          [`player${prev.currentPlayerIndex + 1}`]: null,
        },
      }));
    } else if (currentActiveTurnPhase === "answering") {
      const myPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
      const penaltyCard = getRandomCardFromAvailablePool(myPlayerId); 
      setGameState((prev) => {
        const currentCards = prev[`${myPlayerId}Cards`] || [];
        const updatedCards = [...currentCards, penaltyCard];
        const newFeedback = { ...prev.playerAnswerFeedback };
        newFeedback[myPlayerId] = "incorrect";
        let updatedHints = prev.collectedGameHints;
        let showOffcanvas = prev.showGameOffcanvas;
        if (questionForModal?.hint) {
          updatedHints = [...updatedHints, questionForModal.hint];
          showOffcanvas = true;
        }
        setTimeout(() => {
          setGameState((current) => ({
            ...current,
            playerAnswerFeedback: {
              ...current.playerAnswerFeedback,
              [`player${current.currentPlayerIndex + 1}`]: null, 
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
        setTimeout(() => {
          setGameState((current) => ({
            ...current,
            triggerShuffleAnimation: false,
          }));
        }, GAME_CONSTANTS.PENALTY_ANIMATION_DURATION);

        return {
          ...prev,
          [`${myPlayerId}Cards`]: updatedCards,
          playerAnswerFeedback: newFeedback,
          collectedGameHints: updatedHints,
          showGameOffcanvas: showOffcanvas,
          triggerShuffleAnimation: true, 
        };
      });
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

  // ? ========================================
  // ? Fungsi Khusus Player
  // ? ========================================

  /**
   * @function handleCardPlayAttempt
   * @description Menangani upaya pemain manusia untuk melempar kartu.
   * Ini memperbarui state permainan dengan kartu yang dilempar dan memindahkan giliran ke fase menjawab.
   * Juga memeriksa kondisi kemenangan jika kartu pemain habis.
   * @param {Object} cardData - Objek data kartu yang dilempar oleh pemain.
   * @returns {void}
   */
  const handleCardPlayAttempt = useCallback(
    (cardData) => {
      if (!isMyPlayerTurnToThrow()) {
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
        if (updatedCards.length === 0) {
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
            setGameState((current) => ({
              ...current,
              triggerShuffleAnimation: false,
            })),
          GAME_CONSTANTS.PENALTY_ANIMATION_DURATION
        );

        return { ...prev, ...updatePayload };
      });
    },
    [
      isMyPlayerTurnToThrow,
      getLocalPlayerGlobalIndex,
      getNextPlayerIndex,
      user?.displayName,
      user?.uid,
    ]
  );

  /**
   * @function handlePlayerAnswerSubmission
   * @description Menangani penyerahan jawaban pemain manusia atas sebuah pertanyaan.
   * Ini mengecek kebenaran jawaban dan memberikan penalti jika salah.
   * @param {Object} result - Objek hasil jawaban, termasuk `isCorrect` (boolean) dan `hint` (string).
   * @returns {void}
   */
  const handlePlayerAnswerSubmission = useCallback(
    (result) => {
      if (!isMyPlayerTurnToAnswer()) {
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
          const penaltyCard = getRandomCardFromAvailablePool(myPlayerId); 
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
              setGameState((current) => ({
                ...current,
                triggerShuffleAnimation: false,
              })),
            GAME_CONSTANTS.PENALTY_ANIMATION_DURATION
          );
        }
        setTimeout(() => {
          setGameState((current) => {
            const resetFeedback = { ...current.playerAnswerFeedback };
            resetFeedback[myPlayerId] = null; 
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
    ]
  );

  // ? ========================================
  // ? Fungsi Khusus Bot (AI)
  // ? ========================================

  /**
   * @function handleAIThrowCard
   * @description Menangani aksi melempar kartu oleh pemain AI.
   * Bot akan memilih kartu acak dari tangannya dan memperbarui state game.
   * Ini juga memeriksa kondisi kemenangan AI.
   * @param {string} aiUid - UID dari pemain AI yang sedang bermain.
   * @returns {void}
   */
  const handleAIThrowCard = useCallback(
    (aiUid) => {
      console.log(`AI Throw Attempt - UID: ${aiUid}`);
      setGameState((prev) => {
        const aiPlayerIndex = prev.players.findIndex((p) => p.uid === aiUid);
        if (aiPlayerIndex === -1) {
          return prev;
        }
        const aiPlayer = prev.players[aiPlayerIndex];
        if (prev.currentPlayerIndex !== aiPlayerIndex) {
          return prev;
        }
        if (prev.currentActiveTurnPhase !== "throwing") {
          return prev;
        }
        const aiPlayerId = `player${aiPlayerIndex + 1}`; 
        const aiCards = prev[`${aiPlayerId}Cards`] || [];
        if (aiCards.length === 0) {
          const nextIndex = getNextPlayerIndex(
            aiPlayerIndex,
            prev.players.length
          );

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
        const updatedAiCards = aiCards.filter(
          (card) => card.id !== cardToThrow.id
        ); 
        const nextAnswererIndex = getNextPlayerIndex(
          aiPlayerIndex,
          prev.players.length
        );
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

        console.log(`AI ${aiPlayer.displayName} successfully threw card.`);
        return { ...prev, ...newStateUpdate };
      });
    },
    [getNextPlayerIndex]
  );

  /**
   * @function handleAIAnswerQuestion
   * @description Menangani aksi menjawab pertanyaan oleh pemain AI.
   * AI akan menjawab benar atau salah berdasarkan `AI_ANSWER_CORRECT_CHANCE`.
   * Jika salah, AI akan menerima kartu penalti.
   * @param {string} aiUid - UID dari pemain AI yang sedang menjawab.
   * @returns {void}
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
          return prev;
        }
        const aiPlayerId = `player${aiPlayerIndex + 1}`;
        const question = prev.questionForModal;
        if (!question) {
          const penaltyCard = getRandomCardFromAvailablePool(aiPlayerId);
          const updatedCards = [
            ...(prev[`${aiPlayerId}Cards`] || []),
            penaltyCard,
          ];
          const newFeedback = { ...prev.playerAnswerFeedback };
          newFeedback[aiPlayerId] = "incorrect";
          setTimeout(() => {
            setGameState((current) => ({
              ...current,
              playerAnswerFeedback: {
                ...current.playerAnswerFeedback,
                [aiPlayerId]: null,
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
              setGameState((current) => ({
                ...current,
                triggerShuffleAnimation: false,
              })),
            GAME_CONSTANTS.PENALTY_ANIMATION_DURATION
          );

          return {
            ...prev,
            playerAnswerFeedback: newFeedback,
            [`${aiPlayerId}Cards`]: updatedCards,
            triggerShuffleAnimation: true, 
          };
        }
        const isCorrect =
          Math.random() < GAME_CONSTANTS.AI_ANSWER_CORRECT_CHANCE;
        const newFeedback = { ...prev.playerAnswerFeedback };
        newFeedback[aiPlayerId] = isCorrect ? "correct" : "incorrect"; 
        let updatedCards = prev[`${aiPlayerId}Cards`] || [];
        let triggerAnim = false;
        if (!isCorrect) {
          const penaltyCard = getRandomCardFromAvailablePool(aiPlayerId); 
          updatedCards = [...updatedCards, penaltyCard]; 
          triggerAnim = true;
        } else {
          console.log(
            `Bot ${prev.players[aiPlayerIndex].displayName} answered correctly.`
          );
        }
        if (triggerAnim) {
          setTimeout(
            () =>
              setGameState((current) => ({
                ...current,
                triggerShuffleAnimation: false,
              })),
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
    [getRandomCardFromAvailablePool]
  );

  // ? ========================================
  // ? Fungsi UI & Navigasi
  // ? ========================================

  /**
   * @function handleCloseQuestionPromptModal
   * @description Menutup modal pertanyaan dan mengatur ulang state terkait.
   * @returns {void}
   */
  const handleCloseQuestionPromptModal = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      shouldShowQuestionModal: false,
      questionForModal: null,
      thrownCard: null,
    }));
  }, []);

  /**
   * @function handleVictoryClose
   * @description Menangani penutupan overlay kemenangan/kekalahan dan menavigasi kembali ke halaman utama.
   * @returns {void}
   */
  const handleVictoryClose = useCallback(() => {
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
   * @description Menutup offcanvas petunjuk permainan.
   * @returns {void}
   */
  const handleCloseGameOffcanvas = useCallback(() => {
    setGameState((prev) => ({ ...prev, showGameOffcanvas: false }));
  }, []);

  /**
   * @function isPlayerTurnStatus
   * @description Fungsi utilitas untuk `GameArea` yang memeriksa apakah pemain tertentu sedang gilirannya.
   * @param {number} playerGlobalIndex - Indeks global pemain yang akan diperiksa.
   * @returns {boolean} `true` jika giliran pemain tersebut, `false` jika tidak.
   */
  const isPlayerTurnStatus = useCallback(
    (playerGlobalIndex) => currentPlayerIndex === playerGlobalIndex,
    [currentPlayerIndex]
  );

  /**
   * @function getPlayerRemainingTime
   * @description Fungsi utilitas untuk `GameArea` yang mengembalikan sisa waktu untuk giliran pemain yang aktif.
   * @param {number} playerGlobalIndex - Indeks global pemain yang akan diperiksa.
   * @returns {number} Sisa waktu dalam detik. Akan 0 jika bukan giliran pemain tersebut.
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

  // ? ========================================
  // ? Use Effect (Hooks)
  // ? ========================================

  /**
   * @effect Inisialisasi Pemain (Manusia & Bot)
   * @description Menginisialisasi objek pemain manusia dan bot berdasarkan `aiCardsCount`
   * dari `location.state`. Efek ini hanya berjalan sekali saat komponen mount.
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
    const aiPlayers = [];
    const maxBots = 3;
    const numBotsToCreate = Math.min(aiCardsCount, maxBots);
    for (let i = 0; i < numBotsToCreate; i++) {
      aiPlayers.push({
        uid: `ai_${i + 1}`,
        photoURL: BotProfile,
        displayName: `Bot ${i + 1}`,
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
   * @description Mengambil pertanyaan, mengacaknya, dan mendistribusikan kartu awal
   * ke semua pemain (manusia dan bot). Menyiapkan status awal game (`playerCards`, `playerStatus`, dll.).
   * Efek ini dipicu setelah `players` diinisialisasi dan `isGameReady` belum `true`.
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
      const distributedQuestionTexts = new Set();
      const initialPlayerCards = {}; 
      const initialPlayerStatus = {}; 
      gameState.players.forEach((player, index) => {
        const playerId = `player${index + 1}`; 
        const cards = createInitialCardsForPlayer(
          fetchedQuestions,
          distributedQuestionTexts,
          GAME_CONSTANTS.INITIAL_CARDS_PER_PLAYER
        );
        initialPlayerCards[`${playerId}Cards`] = cards;
        initialPlayerStatus[playerId] = "available"; 
        cards.forEach((card) =>
          distributedQuestionTexts.add(card.question_text)
        );
      });
      for (let i = gameState.players.length; i < 4; i++) {
        const playerId = `player${i + 1}`;
        initialPlayerStatus[playerId] = "not_available";
        initialPlayerCards[`${playerId}Cards`] = []; 
      }
      const initialPlayerTimers = new Array(gameState.players.length).fill(
        GAME_CONSTANTS.THROW_TIMER_SECONDS
      );
      setGameState((prev) => ({
        ...prev,
        ...initialPlayerCards,
        playerStatus: initialPlayerStatus, 
        questions: fetchedQuestions, 
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
   * @description Memanggil `initializeLocalGameState` ketika daftar pemain sudah terisi
   * dan game belum siap. Ini memastikan inisialisasi hanya terjadi setelah pemain disiapkan.
   */
  useEffect(() => {
    if (gameState.players.length > 0 && !isGameReady) {
      initializeLocalGameState();
    }
  }, [gameState.players, isGameReady, initializeLocalGameState]); 

  /**
   * @effect Manajemen Giliran Utama (Manusia & AI)
   * @description Hook ini adalah inti dari alur giliran. Ini membersihkan timer sebelumnya,
   * menentukan apakah giliran AI atau manusia, dan menjadwalkan aksi atau timer yang sesuai.
   * Ini akan berulang setiap kali `currentPlayerIndex` atau `currentActiveTurnPhase` berubah.
   * @returns {function(): void} Fungsi cleanup untuk membersihkan timeout/interval saat unmount atau dependensi berubah.
   */
  useEffect(() => {
    if (!isGameReady || players.length === 0 || victory || gameOver) {
      return;
    }
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
    const timerDuration =
      currentActiveTurnPhase === "throwing"
        ? GAME_CONSTANTS.THROW_TIMER_SECONDS
        : GAME_CONSTANTS.ANSWER_TIMER_SECONDS;
    setGameState((prev) => ({
      ...prev,
      localVisualTimeLeft: timerDuration,
      syncedPlayerTimeLeft: timerDuration,
      playerTimers: prev.playerTimers.map((t, idx) =>
        idx === currentPlayerIndex ? timerDuration : t
      ),
    }));
    if (activePlayer && activePlayer.isAI) {
      const aiActionDelay =
        currentActiveTurnPhase === "throwing"
          ? GAME_CONSTANTS.AI_THROW_DELAY_MS 
          : GAME_CONSTANTS.AI_ANSWER_DELAY_MS; 
      visualTimerIntervalRef.current = setInterval(() => {
        setGameState((prev) => {
          const newTime = Math.max(0, prev.localVisualTimeLeft - 1);
          return { ...prev, localVisualTimeLeft: newTime }; 
        });
      }, 1000); 
      currentTurnActionTimeoutRef.current = setTimeout(() => {
        if (currentActiveTurnPhase === "throwing") {
          handleAIThrowCard(activePlayer.uid); 
        } else if (currentActiveTurnPhase === "answering") {
          handleAIAnswerQuestion(activePlayer.uid); 
        }
      }, aiActionDelay);
    } else if (isHumanTurn) {
      visualTimerIntervalRef.current = setInterval(() => {
        setGameState((prev) => {
          const newTime = Math.max(0, prev.localVisualTimeLeft - 1);
          if (newTime <= 0) {
            clearInterval(visualTimerIntervalRef.current);
            visualTimerIntervalRef.current = null;
            setTimeout(() => {
              handleTimeOut();
            }, 0);
          }

          return { ...prev, localVisualTimeLeft: newTime }; 
        });
      }, 1000);
    }

    // Fungsi cleanup untuk useEffect ini
    return () => {
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
   * @description Mengatur ulang ref `hasAddedPenalty` dan `lastTimeoutHandled`
   * setiap kali `currentPlayerIndex` berubah. Ini penting untuk mencegah
   * penalti ganda atau penanganan timeout yang salah antar giliran.
   */
  useEffect(() => {
    if (prevPlayerIndexRef.current !== currentPlayerIndex) {
      hasAddedPenalty.current = false; 
      lastTimeoutHandled.current = 0; 
    }
    prevPlayerIndexRef.current = currentPlayerIndex; 
  }, [currentPlayerIndex]);

  /**
   * @effect Handle State Changes setelah Timeout - BARU
   * @description Efek ini berfungsi sebagai pengamat perubahan state yang terjadi
   * setelah `handleTimeOut` dipanggil. Tujuannya mungkin untuk logging atau debugging
   * tambahan saat giliran beralih karena timeout.
   * (Catatan: Ini adalah efek pengamatan. Logikanya ada di `handleTimeOut`.)
   */
  useEffect(() => {
    if (!isGameReady || players.length === 0 || victory || gameOver) {
      return;
    }
    const timerDuration =
      currentActiveTurnPhase === "throwing"
        ? GAME_CONSTANTS.THROW_TIMER_SECONDS
        : GAME_CONSTANTS.ANSWER_TIMER_SECONDS;

    if (
      localVisualTimeLeft === timerDuration &&
      prevPlayerIndexRef.current !== currentPlayerIndex
    ) {
      console.log(
        `Detected turn change from ${prevPlayerIndexRef.current} to ${currentPlayerIndex}`
      );
    }
  }, [
    localVisualTimeLeft,
    currentPlayerIndex,
    currentActiveTurnPhase,
    isGameReady,
    players.length,
    victory,
    gameOver,
  ]);

  /**
   * @effect Picu Overlay Kemenangan
   * @description Memperbarui state `showVictoryOverlay` menjadi `true`
   * setiap kali state `victory` berubah menjadi `true`.
   */
  useEffect(() => {
    if (victory) {
      setGameState((prev) => ({ ...prev, showVictoryOverlay: true }));
      console.log("Victory state detected. Showing overlay.");
    }
  }, [victory]);

  /**
   * @effect Pembersihan Permainan saat Permainan Berakhir
   * @description Menangani transisi keluar dari permainan ketika game over
   * (baik karena waktu habis atau kondisi kekalahan lainnya, tapi bukan kemenangan).
   * Navigasi ke halaman utama setelah penundaan.
   * (Catatan: Untuk mode Vs AI, cleanup di Firebase tidak relevan karena state bersifat lokal).
   */
  useEffect(() => {
    if (gameOver && !victory) {
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }, [gameOver, victory, navigate]);

  // Tampilkan spinner loading sampai permainan siap (pemain diinisialisasi dan kartu didistribusikan)
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
        setShowOffcanvas={(val) =>
          setGameState((prev) => ({ ...prev, showGameOffcanvas: val }))
        }
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

      {/* Overlay Kemenangan/Kekalahan */}
      {victory &&
        showVictoryOverlay &&
        (isWinner ? (
          <VictoryOverlay
            winner={winner}
            onClose={handleVictoryClose}
            isVsAiGame={true}
          /> 
        ) : hasLost ? (
          <LoseOverlay loser={user.displayName} onClose={handleVictoryClose} />
        ) : null)}
    </div>
  );
}

export default NusaCardVsAi;
