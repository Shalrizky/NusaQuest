import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import QuestionModal from "../components/games/nuca/QuestionModal";
import GameArea from "../components/games/nuca/GameArea";
import VictoryOverlay from "../components/games/VictoryOverlay";
import LoseOverlay from "../components/games/LoseOverlay";
import Potion from "../components/games/potion";
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

// Konstanta Permainan
const GAME_CONSTANTS = {
  FIRST_PLAYER_INDEX: 0,
  TURN_FLOW_DIRECTION: "clockwise",
  THROW_TIMER_SECONDS: 15,
  ANSWER_TIMER_SECONDS: 25,
  INITIAL_CARDS_PER_PLAYER: 5,
};

/**
 * @function createInitialCardsForPlayer
 * @description Membuat array kartu awal untuk pemain dengan mengacak dan membagi pertanyaan.
 * @param {Array<Object>} questions - Array semua pertanyaan yang tersedia.
 * @param {number} startIndex - Indeks awal untuk membagi pertanyaan.
 * @param {number} count - Jumlah kartu yang akan diberikan kepada pemain.
 * @returns {Array<Object>} Array objek kartu.
 */
const createInitialCardsForPlayer = (questions, startIndex, count) => {
  const shuffledQuestions = shuffle([...questions]);
  return shuffledQuestions
    .slice(startIndex, startIndex + count)
    .map((q, index) => ({
      ...q,
      id: `card_${startIndex}_${index}_${Date.now()}`,
    }));
};

/**
 * @function NusaCard
 * @description Komponen utama untuk permainan NusaCard. Mengelola status permainan, logika, dan UI.
 * @returns {JSX.Element} Komponen permainan NusaCard.
 */
function NusaCard() {
  // Hooks router untuk parameter permainan
  const { gameID, topicID, roomID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Refs untuk akses stabil ke parameter permainan dan mencegah eksekusi ganda
  const gameIDRef = useRef(gameID);
  const topicIDRef = useRef(topicID);
  const roomIDRef = useRef(roomID);
  const hasCleanedUpRef = useRef(false);
  const hasAwardedAchievementRef = useRef(false);
  const isProcessingVictoryRef = useRef(false);

  // Refs pencegahan penalti
  const hasAddedPenalty = useRef(false);
  const lastTimeoutHandled = useRef(0);

  // Status Permainan Inti
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

  // Status Data Permainan
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

  // Status Alur Permainan
  const [thrownCardData, setThrownCardData] = useState(null);
  const [shouldShowQuestionModal, setShouldShowQuestionModal] = useState(false);
  const [questionForModalDisplay, setQuestionForModalDisplay] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  // Status UI
  const [collectedGameHints, setCollectedGameHints] = useState([]);
  const [showGameOffcanvas, setShowGameOffcanvas] = useState(false);
  const [playerAnswerFeedback, setPlayerAnswerFeedback] = useState({
    player1: null,
    player2: null,
    player3: null,
    player4: null,
  });
  const [triggerShuffleAnimation, setTriggerShuffleAnimation] = useState(false);

  // Status Timer
  const [syncedPlayerTimeLeft, setSyncedPlayerTimeLeft] = useState(0);
  const [localVisualTimeLeft, setLocalVisualTimeLeft] = useState(0);
  const prevPlayerIndexRef = useRef(currentPlayerIndex);
  const visualTimerIntervalRef = useRef(null);

  // Ref untuk mencegah penggunaan Potion ganda
  const potionUsageRef = useRef(false);
  const potionSubmittedRef = useRef(false);

  /**
   * @function getLocalPlayerGlobalIndex
   * @description Mengembalikan indeks global (0-based) dari pengguna saat ini di array pemain.
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
   * @description Memeriksa apakah giliran pengguna saat ini untuk melempar kartu.
   * @returns {boolean} `true` jika ini adalah giliran melempar kartu pengguna saat ini, `false` jika tidak.
   */
  const isMyPlayerTurnToThrow = useCallback(() => {
    const myIndex = getLocalPlayerGlobalIndex();
    return (
      currentPlayerIndex === myIndex && currentActiveTurnPhase === "throwing"
    );
  }, [currentPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]);

  /**
   * @function isMyPlayerTurnToAnswer
   * @description Memeriksa apakah giliran pengguna saat ini untuk menjawab pertanyaan.
   * @returns {boolean} `true` jika ini adalah giliran menjawab pertanyaan pengguna saat ini, `false` jika tidak.
   */
  const isMyPlayerTurnToAnswer = useCallback(() => {
    const myIndex = getLocalPlayerGlobalIndex();
    return (
      currentPlayerIndex === myIndex && currentActiveTurnPhase === "answering"
    );
  }, [currentPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]);

  // ID pemain lokal yang aktif (misalnya "player1" jika indeks globalnya 0)
  const activeLocalPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
  const cardCounts = {
    player1: gameState.player1Cards?.length || 0,
    player2: gameState.player2Cards?.length || 0,
    player3: gameState.player3Cards?.length || 0,
    player4: gameState.player4Cards?.length || 0,
  };
  const displayQuestionModalForMe =
    shouldShowQuestionModal && isMyPlayerTurnToAnswer();

  /**
   * @function getRandomCardFromAvailablePool
   * @description Memilih pertanyaan acak dari kumpulan yang tersedia untuk digunakan sebagai kartu penalti,
   * memastikan tidak ada kartu duplikat yang saat ini ada di tangan pemain penerima.
   * @param {string} receivingPlayerId - ID string pemain yang akan menerima kartu penalti (misalnya "player1").
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
    [gameState.questions, gameState]
  );

  /**
   * @function handleGameOver
   * @description Menangani akhir permainan, membersihkan sumber data di Firebase, dan menavigasi ke halaman utama.
   * @returns {Promise<void>}
   */
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

  /**
   * @hook useGameTimer
   * @description Custom hook untuk mengelola durasi permainan global, memicu `handleGameOver` ketika waktu habis.
   * @param {number} 1800 - Durasi total game dalam detik (30 menit).
   * @param {function(): void} handleGameOver - Callback yang dipanggil saat waktu game habis.
   * @param {Object} gameData - Objek berisi parameter game (topicID, gameID, roomID, user).
   * @returns {{ updateActivity: function(): void }} Objek yang berisi fungsi `updateActivity` untuk memperbarui aktivitas pemain.
   */
  const { updateActivity } = useGameTimer(1800, handleGameOver, {
    topicID: topicIDRef.current,
    gameID: gameIDRef.current,
    roomID: roomIDRef.current,
    user,
  });

  /**
   * @function handleTimeOut
   * @description Mengelola batas waktu giliran pemain. Jika pemain timeout saat melempar, giliran pindah.
   * Jika timeout saat menjawab, pemain diberi kartu penalti.
   * @returns {Promise<void>}
   */
  const handleTimeOut = useCallback(async () => {
    if (!isMyTurn) return;
    const now = Date.now();
    if (now - lastTimeoutHandled.current < 2000) return;
    lastTimeoutHandled.current = now;
    if (currentActiveTurnPhase === "throwing") {
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
        }
      );
    } else if (currentActiveTurnPhase === "answering") {
      if (hasAddedPenalty.current) return;
      hasAddedPenalty.current = true;
      const myPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
      const currentServerState = await getGameState(
        topicIDRef.current,
        gameIDRef.current,
        roomIDRef.current
      );
      const currentCards = currentServerState[`${myPlayerId}Cards`] || [];
      const penaltyCard = getRandomCardFromAvailablePool(myPlayerId);
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
          penaltyAddedBy: "wrong_answer",
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
    playerAnswerFeedback,
    getLocalPlayerGlobalIndex,
    getNextPlayerIndex,
    getRandomCardFromAvailablePool,
    questionForModalDisplay?.hint,
    topicIDRef,
    gameIDRef,
    roomIDRef,
  ]);

  /**
   * @function handleCardPlayAttempt
   * @description Menangani upaya pemain untuk memainkan kartu. Memperbarui status permainan dan memeriksa kemenangan.
   * @param {Object} cardData - Data kartu yang dimainkan.
   * @returns {Promise<void>}
   */
  const handleCardPlayAttempt = async (cardData) => {
    updateActivity();
    if (!isMyPlayerTurnToThrow()) return;
    const myIndex = getLocalPlayerGlobalIndex();
    const myPlayerId = `player${myIndex + 1}`;
    const myCards = gameState[`${myPlayerId}Cards`] || [];
    const updatedCards = myCards.filter((card) => card.id !== cardData.id);

    setTriggerShuffleAnimation(true);

    setTimeout(() => setTriggerShuffleAnimation(false), 500);

    const nextPlayerIndex = getNextPlayerIndex(
      currentPlayerIndex,
      players.length
    );
    const updatePayload = {
      [`${myPlayerId}Cards`]: updatedCards,
      thrownCard: cardData,
      questionForModal: cardData,
      shouldShowQuestionModal: true,
      currentPlayerIndex: nextPlayerIndex,
      currentActiveTurnPhase: "answering",
      lastCardThrowerIndex: currentPlayerIndex,
    };
    if (updatedCards.length === 0) {
      updatePayload.gameStatus = "finished";
      updatePayload.gameWinnerUID = user.uid;
      updatePayload.gameWinnerDisplayName = user.displayName;
      updatePayload.gameWonAt = Date.now();
      updatePayload.achievementAwarded = false;
      updatePayload.shouldShowQuestionModal = false;
      updatePayload.questionForModal = null;
      updatePayload.thrownCard = null;
    }
    await updateGameState(topicID, gameID, roomID, updatePayload); 
  };

  /**
   * @function handlePlayerAnswerSubmission
   * @description Menangani penyerahan jawaban pemain atas sebuah pertanyaan.
   * Mengecek kebenaran jawaban dan memberikan penalti jika salah.
   * @param {Object} result - Hasil jawaban, termasuk kebenaran (`isCorrect`), petunjuk (`hint`),
   * penggunaan ramuan (`usedPotion`), dan apakah ramuan sudah dikurangi (`potionAlreadyReduced`).
   * @returns {Promise<void>}
   */
  const handlePlayerAnswerSubmission = useCallback(
    async (result) => {
      updateActivity(); 
      if (!isMyPlayerTurnToAnswer()) return;
      if (hasAddedPenalty.current) return;

      const { isCorrect, hint, usedPotion,  } = result;
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

      if (!isCorrect && !usedPotion) {
        hasAddedPenalty.current = true; 
        const penaltyCard = getRandomCardFromAvailablePool(myPlayerId); 
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
      } 
      setTimeout(async () => {
        const resetFeedback = { ...newFeedback };
        resetFeedback[myPlayerId] = null;
        const playerWhoJustAnswered = currentPlayerIndex;
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
    ]
  );

  /**
   * @function handleCloseQuestionPromptModal
   * @description Menutup modal pertanyaan secara manual dan mengatur ulang state terkait.
   * @returns {Promise<void>}
   */
  const handleCloseQuestionPromptModal = useCallback(async () => {
    setShouldShowQuestionModal(false);
    setQuestionForModalDisplay(null);
    setThrownCardData(null);

    await updateGameState(topicID, gameID, roomID, {
      shouldShowQuestionModal: false,
      questionForModal: null,
      thrownCard: null,
    });
  }, [topicID, gameID, roomID]);

  /**
   * @function handlePotionUseInModal
   * @description Menangani peristiwa ketika pemain menggunakan Ramuan selama fase pertanyaan.
   * Mencegah penggunaan ganda dan mensimulasikan jawaban yang benar.
   * @returns {Promise<void>}
   */
  const handlePotionUseInModal = useCallback(async () => {
    if (!displayQuestionModalForMe) return;
    if (
      isPotionUsedInModal ||
      potionUsageRef.current ||
      potionSubmittedRef.current
    ) return;
    potionUsageRef.current = true;
    potionSubmittedRef.current = true;
    setIsPotionUsedInModal(true);

    setTimeout(() => {
      const potionResult = {
        isCorrect: true, 
        hint: questionForModalDisplay?.hint || null,
        usedPotion: false, 
        potionAlreadyReduced: true,
      };

      handlePlayerAnswerSubmission(potionResult); 

      setTimeout(() => {
        setIsPotionUsedInModal(false);
        potionUsageRef.current = false;
        potionSubmittedRef.current = false;
      }, 500);
    }, 500);
  }, [
    displayQuestionModalForMe,
    questionForModalDisplay?.hint,
    handlePlayerAnswerSubmission,
    isPotionUsedInModal,
  ]);

  /**
   * @function handleVictoryClose
   * @description Menangani penutupan overlay kemenangan/kekalahan, melakukan pembersihan Firebase, dan menavigasi.
   * @returns {void}
   */
  const handleVictoryClose = useCallback(() => {
    stopGameTimer(topicID, gameID, roomID);
    setGameStartStatus(topicID, gameID, roomID, false);
    setVictory(false);
    setHasLost(false);
    setShowVictoryOverlay(false);

    if (!hasCleanedUpRef.current) {
      hasCleanedUpRef.current = true; 
      cleanupGame(topicID, gameID, roomID, user)
        .then(() => console.log("Database dibersihkan."))
        .catch((error) => console.error("Kesalahan pembersihan:", error));
    }
    navigate("/"); 
  }, [topicID, gameID, roomID, user, navigate]);

  /**
   * @function handleCloseGameOffcanvas
   * @description Menutup offcanvas petunjuk permainan.
   * @returns {void}
   */
  const handleCloseGameOffcanvas = useCallback(() => {
    setShowGameOffcanvas(false);
  }, []);

  /**
   * @function isPlayerTurnStatus
   * @description Memeriksa apakah pemain tertentu adalah pemain yang gilirannya saat ini.
   * Digunakan oleh komponen `GameArea` untuk menentukan indikator giliran.
   * @param {number} playerGlobalIndex - Indeks global pemain yang akan diperiksa.
   * @returns {boolean} `true` jika giliran pemain tersebut, `false` jika tidak.
   */
  const isPlayerTurnStatus = useCallback(
    (playerGlobalIndex) => currentPlayerIndex === playerGlobalIndex,
    [currentPlayerIndex]
  );

  /**
   * @function getPlayerRemainingTime
   * @description Mengembalikan sisa waktu untuk giliran pemain tertentu.
   * Digunakan oleh komponen `GameArea` untuk menampilkan timer.
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

  // --- Efek (Hooks) ---

  /**
   * @effect Inisialisasi Permainan
   * @description Mengambil data pemain, menginisialisasi status permainan di Firebase jika belum ada,
   * dan menyiapkan timer permainan awal. Efek ini berjalan sekali ketika data pemain tersedia.
   */
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

          setGameState(initialGameState); // Perbarui state lokal
        } else {
          console.log("Status permainan yang ada ditemukan, memuat...");
          setGameState(existingGameState); 
        }

        setIsGameReady(true); 
      } catch (error) {
        console.error("Error saat menginisialisasi permainan:", error);
        setIsGameReady(true); 
      }
    };

    initGame(); 
  }, [topicID, gameID, roomID, players]); 

  /**
   * @effect Ambil Pemain Permainan
   * @description Berlangganan pembaruan real-time daftar pemain dari Firebase.
   * Jika tidak ada pemain ditemukan atau semua pemain keluar, picu pembersihan game dan navigasi kembali ke beranda.
   */
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return; 

    const unsubscribe = fetchGamePlayers(
      topicID,
      gameID,
      roomID,
      (playersData) => {
        setPlayers(playersData); 
        if (playersData.length === 0 && !hasCleanedUpRef.current) {
          console.log(
            "Tidak ada pemain ditemukan atau semua pergi, membersihkan permainan..."
          );
          cleanupGame(topicID, gameID, roomID, user);
          navigate("/");
        }
      }
    );

    return () => unsubscribe(); 
  }, [topicID, gameID, roomID, user, navigate, victory]);

  /**
   * @effect Dengarkan Perubahan Status Permainan
   * @description Berlangganan pembaruan real-time status permainan utama dari Firebase.
   * Memperbarui status lokal dan menangani kondisi kemenangan, termasuk penghargaan pencapaian.
   */
  useEffect(() => {
    if (!isGameReady) return;

    const unsubscribe = listenToGameState(
      topicID,
      gameID,
      roomID,
      async (newGameState) => {
        if (newGameState) {
          setGameState(newGameState);
          setCurrentPlayerIndex(newGameState.currentPlayerIndex || 0);
          setCurrentActiveTurnPhase(
            newGameState.currentActiveTurnPhase || "throwing"
          );
          setThrownCardData(newGameState.thrownCard);
          setShouldShowQuestionModal(
            newGameState.shouldShowQuestionModal || false
          );
          setQuestionForModalDisplay(newGameState.questionForModal);
          setPlayerAnswerFeedback(
            newGameState.playerAnswerFeedback || {
              player1: null,
              player2: null,
              player3: null,
              player4: null,
            }
          );
          const firebaseTime =
            newGameState.playerTimers?.[newGameState.currentPlayerIndex];
          if (firebaseTime !== undefined) {
            setSyncedPlayerTimeLeft(firebaseTime);
          } else {
            setSyncedPlayerTimeLeft(0);
          }
          const myIndex = players.findIndex((p) => p.uid === user?.uid);
          const isCurrentPlayerTurn =
            newGameState.currentPlayerIndex === myIndex;
          setIsMyTurn(isCurrentPlayerTurn);
          if (newGameState.currentPlayerIndex !== currentPlayerIndex) {
            hasAddedPenalty.current = false;
          }
          if (newGameState.gameWinnerUID && !isProcessingVictoryRef.current) {
            setVictory(true);
            setWinner(newGameState.gameWinnerDisplayName || "Pemain");
            setIsWinner(user?.uid === newGameState.gameWinnerUID);
            setHasLost(user?.uid !== newGameState.gameWinnerUID);
            setShowVictoryOverlay(true);
            const shouldAwardAchievement =
              user?.uid === newGameState.gameWinnerUID &&
              !newGameState.achievementAwarded && 
              !hasAwardedAchievementRef.current; 
            if (shouldAwardAchievement) {
              isProcessingVictoryRef.current = true; 
              hasAwardedAchievementRef.current = true;
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
                      item_count: (currentPotionData.item_count || 0) + 1,
                      item_img: currentPotionData.item_img,
                    });
                  }
                  await updateGameState(topicID, gameID, roomID, {
                    achievementAwarded: true,
                  });
                } else {
                  hasAwardedAchievementRef.current = false; // Reset jika tidak jadi diberikan
                }
              } catch (error) {
                console.error("Error saat memberikan pencapaian:", error);
                hasAwardedAchievementRef.current = false; 
              } finally {
                isProcessingVictoryRef.current = false;
              }
            }
          } else if (!newGameState.gameWinnerUID) {
            if (victory || gameOver || showVictoryOverlay) {
              setVictory(false);
              setIsWinner(false);
              setHasLost(false);
              setShowVictoryOverlay(false);
              setWinner("");
            }
          }
        }
      }
    );

    return () => unsubscribe();
  }, [
    isGameReady,
    players,
    topicID,
    gameID,
    roomID,
    user?.uid,
    currentPlayerIndex,
    victory,
    gameOver,
    showVictoryOverlay,
    user?.displayName,
  ]);

  /**
   * @effect Reset Refs saat Komponen Tidak Dipasang
   * @description Mengatur ulang `hasAwardedAchievementRef` dan `isProcessingVictoryRef` saat komponen dilepas.
   * Ini memastikan status internal bersih untuk instance komponen berikutnya.
   */
  useEffect(() => {
    return () => {
      hasAwardedAchievementRef.current = false;
      isProcessingVictoryRef.current = false;
    };
  }, []); 

  /**
   * @effect Dengarkan Timer Permainan Global
   * @description Berlangganan timer permainan global dari Firebase dan menangani game over ketika waktu habis.
   */
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

  /**
   * @effect Reset Bendera Penalti saat Perubahan Pemain
   * @description Mengatur ulang ref `hasAddedPenalty` setiap kali indeks pemain saat ini berubah.
   * Ini mencegah penalti ganda jika pemain timeout, lalu giliran pindah.
   */
  useEffect(() => {
    if (prevPlayerIndexRef.current !== currentPlayerIndex) {
      hasAddedPenalty.current = false; 
    }
    prevPlayerIndexRef.current = currentPlayerIndex;
  }, [currentPlayerIndex]); 

  /**
   * @effect Timer Visual Sisi Klien
   * @description Mengelola timer hitung mundur visual sisi klien, menyinkronkannya dengan `syncedPlayerTimeLeft`.
   * Ini untuk tampilan UI yang halus, terlepas dari pembaruan Firebase.
   */
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

  /**
   * @effect Picu Overlay Kemenangan
   * @description Menampilkan overlay kemenangan ketika state `victory` menjadi `true`.
   */
  useEffect(() => {
    if (victory) {
      setShowVictoryOverlay(true);
    }
  }, [victory]); 

  /**
   * @effect Pembersihan Permainan saat Permainan Berakhir (Waktu Habis)
   * @description Melakukan pembersihan akhir ketika game berakhir karena waktu habis
   * (bukan karena kemenangan). Menghentikan timer, memperbarui status game, dan menavigasi.
   */
  useEffect(() => {
    if (gameOver && !victory) {
      console.log(
        "Membersihkan permainan karena: Permainan Berakhir (waktu habis)"
      );
      stopGameTimer(topicID, gameID, roomID); 
      setGameStartStatus(topicID, gameID, roomID, false);

      if (!hasCleanedUpRef.current) {
        hasCleanedUpRef.current = true
        cleanupGame(topicID, gameID, roomID, user)
          .then(() => {
            console.log("Data permainan Firebase dibersihkan.");
          })
          .catch((error) => {
            console.error("Error selama pembersihan:", error);
          });
      }
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  }, [gameOver, victory, topicID, gameID, roomID, user, navigate]); 

  /**
   * @effect Reset Status Ramuan saat Modal Ditutup
   * @description Mengatur ulang status terkait ramuan (potionUsageRef, potionSubmittedRef, isPotionUsedInModal)
   * setiap kali modal pertanyaan tidak lagi ditampilkan.
   */
  useEffect(() => {
    if (!displayQuestionModalForMe) {
      setIsPotionUsedInModal(false);
      potionUsageRef.current = false;
      potionSubmittedRef.current = false;
    }
  }, [displayQuestionModalForMe]);

  /**
   * @hook usePlayerTimer
   * @description Custom hook untuk mengelola timer giliran pemain individu, memicu `handleTimeOut`
   * ketika waktu giliran habis.
   */
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

  // Tampilkan spinner loading sampai permainan siap
  if (!isGameReady) {
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
          <div style={{ pointerEvents: "auto" }}>
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
