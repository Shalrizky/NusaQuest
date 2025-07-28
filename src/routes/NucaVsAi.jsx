import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import BotProfile from "../assets/common/nusaQuest-logo.png"
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
  FIRST_PLAYER_INDEX: 0, // Indeks pemain pertama (biasanya pemain manusia)
  TURN_FLOW_DIRECTION: "clockwise", // Arah aliran giliran
  INITIAL_CARDS_PER_PLAYER: 5, // Jumlah kartu awal per pemain
  THROW_TIMER_SECONDS: 15, // Durasi timer untuk fase melempar kartu (manusia)
  ANSWER_TIMER_SECONDS: 25, // Durasi timer untuk fase menjawab pertanyaan (manusia)
  HUMAN_TIMEOUT_GRACE_PERIOD_MS: 500, // Periode toleransi kecil untuk timeout pemain manusia (milidetik)
  AI_ANSWER_CORRECT_CHANCE: 0.5, // Peluang AI menjawab benar (0.0 - 1.0)
  AI_THROW_DELAY_MS: 2500, // Penundaan AI sebelum melempar kartu (milidetik)
  AI_ANSWER_DELAY_MS: 3500, // Penundaan AI sebelum menjawab pertanyaan (milidetik)
  FEEDBACK_DISPLAY_DURATION: 1500, // Durasi tampilan umpan balik jawaban (benar/salah)
  PENALTY_ANIMATION_DURATION: 500, // Durasi animasi saat kartu penalti ditambahkan
};

/**
 * @function createInitialCardsForPlayer
 * @description Membuat array kartu awal untuk pemain dengan mengacak dan membagi pertanyaan.
 * Fungsi ini digunakan untuk menginisialisasi kartu untuk pemain manusia dan bot.
 * @param {Array<Object>} questions - Array semua pertanyaan yang tersedia.
 * @param {number} startIndex - Indeks awal untuk mengambil pertanyaan dari `shuffledQuestions`.
 * @param {number} count - Jumlah kartu yang akan diberikan kepada pemain.
 * @returns {Array<Object>} Array objek kartu yang dibuat untuk pemain.
 */
const createInitialCardsForPlayer = (questions, startIndex, count) => {
  const shuffledQuestions = shuffle([...questions]);
  return shuffledQuestions
    .slice(startIndex, Math.min(shuffledQuestions.length, startIndex + count))
    .map((q, index) => ({
      ...q,
      id: `card_${startIndex}_${index}_${Date.now()}_${Math.random()}`, // ID unik untuk setiap kartu
    }));
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
  const { user } = useAuth(); // Mengambil data pengguna yang login
  const navigate = useNavigate();
  const location = useLocation();
  const { aiCardsCount } = location.state || { aiCardsCount: 0 }; // Mengambil jumlah bot yang diminta dari state navigasi

  // Refs untuk mencegah eksekusi ganda dan mengelola timeout
  const hasAddedPenalty = useRef(false); // Ref untuk mencegah penalti ganda
  const lastTimeoutHandled = useRef(0); // Ref untuk debounce penanganan timeout
  const visualTimerIntervalRef = useRef(null); // Ref untuk interval timer visual
  const currentTurnActionTimeoutRef = useRef(null); // Ref untuk timeout aksi giliran (khususnya AI)
  const prevPlayerIndexRef = useRef(0); // Ref untuk melacak indeks pemain sebelumnya

  // Status Permainan Inti (dielola secara lokal untuk mode Vs AI)
  const [gameState, setGameState] = useState({
    players: [], // Array objek pemain (manusia + bot)
    currentPlayerIndex: 0, // Indeks pemain yang gilirannya saat ini
    currentActiveTurnPhase: "throwing", // Fase giliran saat ini ("throwing" atau "answering")
    thrownCard: null, // Kartu yang terakhir dilempar ke tengah
    questionForModal: null, // Pertanyaan yang ditampilkan di modal
    shouldShowQuestionModal: false, // Mengontrol visibilitas modal pertanyaan
    player1Cards: [], // Kartu untuk pemain 1 (manusia)
    bot1Cards: [], // Kartu untuk bot 1 (posisi player2, dinamakan bot1Cards)
    bot2Cards: [], // Kartu untuk bot 2 (posisi player3, dinamakan bot2Cards)
    bot3Cards: [], // Kartu untuk bot 3 (posisi player4, dinamakan bot3Cards)
    playerStatus: {
      player1: "not_available", // Status ketersediaan slot pemain
      bot1: "not_available",
      bot2: "not_available",
      bot3: "not_available",
    },
    questions: [], // Semua pertanyaan yang dimuat untuk game
    currentQuestionIndex: 0, // Indeks pertanyaan yang sedang digunakan (jika ada)
    playerTimers: [], // Array untuk menyimpan sisa waktu per pemain (tidak digunakan secara langsung untuk visual, tapi dipertahankan)
    gameWinnerUID: null, // UID pemenang game
    gameWinnerDisplayName: null, // Display name pemenang game
    gameWonAt: null, // Timestamp kemenangan game
    achievementAwarded: false, // Flag untuk status penghargaan achievement (jika ada)
    lastCardThrowerIndex: null, // Indeks pemain terakhir yang melempar kartu
    playerAnswerFeedback: {
      // Umpan balik jawaban untuk setiap pemain
      player1: null,
      bot1: null,
      bot2: null,
      bot3: null,
    },
    collectedGameHints: [], // Petunjuk yang terkumpul selama game
    showGameOffcanvas: false, // Mengontrol visibilitas offcanvas petunjuk
    triggerShuffleAnimation: false, // Memicu animasi pengocokan kartu
    syncedPlayerTimeLeft: 0, // Waktu sisa pemain yang disinkronkan (untuk tampilan timer)
    localVisualTimeLeft: 0, // Waktu sisa visual lokal untuk timer
    victory: false, // Status kemenangan game secara keseluruhan
    winner: "", // Nama pemenang game
    gameOver: false, // Status game over
    isWinner: false, // Apakah pemain lokal adalah pemenang
    hasLost: false, // Apakah pemain lokal kalah
    showVictoryOverlay: false, // Mengontrol visibilitas overlay kemenangan/kekalahan
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

  const [isGameReady, setIsGameReady] = useState(false); // Status kesiapan game

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

  // ID pemain lokal yang aktif (`player1`, `player2`, dst. sesuai indeks global)
  const activeLocalPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;

  // Jumlah kartu untuk setiap pemain (mapping ke botXCards untuk AI)
  const cardCounts = {
    player1: gameState.player1Cards?.length || 0,
    bot1: gameState.bot1Cards?.length || 0, // Bot pertama ada di posisi player2Cards
    bot2: gameState.bot2Cards?.length || 0, // Bot kedua ada di posisi player3Cards
    bot3: gameState.bot3Cards?.length || 0, // Bot ketiga ada di posisi player4Cards
  };

  // Apakah modal pertanyaan harus ditampilkan untuk pemain lokal
  const displayQuestionModalForMe =
    shouldShowQuestionModal && isMyPlayerTurnToAnswer();

  /**
   * @function getRandomCardFromAvailablePool
   * @description Memilih pertanyaan acak dari kumpulan yang tersedia untuk digunakan sebagai kartu penalti.
   * Digunakan untuk pemain manusia maupun bot saat menjawab salah/timeout.
   * @returns {Object} Objek pertanyaan yang ditandai sebagai kartu penalti.
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
      isPenalty: true, // Menandai kartu ini sebagai kartu penalti
    };
  }, [gameState.questions]);

  /**
   * @function handleTimeOut
   * @description Mengelola batas waktu giliran pemain manusia.
   * Jika pemain timeout saat melempar, giliran pindah. Jika timeout saat menjawab, diberi penalti.
   * **DIPERBAIKI:** Logika timeout hanya berlaku untuk pemain manusia.
   * @returns {void}
   */
  const handleTimeOut = useCallback(() => {
    const activePlayer = players[currentPlayerIndex];
    const isHumanPlayerActive = activePlayer?.uid === user?.uid;

    // Pastikan ini benar-benar giliran pemain manusia yang timeout
    if (!isHumanPlayerActive) {
      return;
    }

    const now = Date.now();
    // Debounce timeout untuk mencegah eksekusi ganda jika dipicu terlalu cepat
    if (
      now - lastTimeoutHandled.current <
      GAME_CONSTANTS.HUMAN_TIMEOUT_GRACE_PERIOD_MS
    ) {
      console.log("⏰ Timeout sudah ditangani baru-baru ini, dilewati.");
      return;
    }

    lastTimeoutHandled.current = now;
    console.log(
      `⏰ TIMEOUT untuk pemain ${activePlayer.displayName} pada fase ${currentActiveTurnPhase}.`
    );

    // Bersihkan semua timer/timeout yang sedang berjalan untuk giliran ini
    if (visualTimerIntervalRef.current) {
      clearInterval(visualTimerIntervalRef.current);
      visualTimerIntervalRef.current = null;
    }
    if (currentTurnActionTimeoutRef.current) {
      clearTimeout(currentTurnActionTimeoutRef.current);
      currentTurnActionTimeoutRef.current = null;
    }

    if (currentActiveTurnPhase === "throwing") {
      // Pemain timeout saat melempar kartu: giliran langsung pindah ke pemain berikutnya
      const nextIndex = getNextPlayerIndex(currentPlayerIndex, players.length);
      console.log(
        `🔄 Giliran beralih ke pemain ${nextIndex + 1} karena timeout melempar.`
      );

      setGameState((prev) => ({
        ...prev,
        currentPlayerIndex: nextIndex,
        currentActiveTurnPhase: "throwing", // Fase tetap "throwing" untuk pemain berikutnya
        thrownCard: null,
        questionForModal: null,
        shouldShowQuestionModal: false,
        triggerShuffleAnimation: false,
        localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS, // Reset timer visual
        syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS, // Reset timer sinkron
        playerAnswerFeedback: {
          // Reset umpan balik jawaban
          ...prev.playerAnswerFeedback,
          [`player${prev.currentPlayerIndex + 1}`]: null,
        },
      }));
    } else if (currentActiveTurnPhase === "answering") {
      // Pemain timeout saat menjawab pertanyaan: dianggap salah dan diberikan kartu penalti
      const myPlayerId = `player${getLocalPlayerGlobalIndex() + 1}`;
      const penaltyCard = getRandomCardFromAvailablePool();

      setGameState((prev) => {
        const currentCards = prev[`${myPlayerId}Cards`] || [];
        const updatedCards = [...currentCards, penaltyCard]; // Tambahkan kartu penalti

        const newFeedback = { ...prev.playerAnswerFeedback };
        newFeedback[myPlayerId] = "incorrect"; // Set umpan balik ke "incorrect"

        let updatedHints = prev.collectedGameHints;
        let showOffcanvas = prev.showGameOffcanvas;

        // Tampilkan hint jika tersedia pada pertanyaan yang dijawab salah
        if (questionForModal?.hint) {
          updatedHints = [...updatedHints, questionForModal.hint];
          showOffcanvas = true;
        }

        console.log(
          `❌ Pemain ${activePlayer.displayName} timeout menjawab. Menambahkan penalty card.`
        );

        // Atur timeout untuk membersihkan umpan balik setelah durasi tertentu
        setTimeout(() => {
          setGameState((current) => ({
            ...current,
            playerAnswerFeedback: {
              ...current.playerAnswerFeedback,
              [`player${current.currentPlayerIndex + 1}`]: null, // Reset umpan balik
            },
            // Giliran kembali ke pemain yang sama untuk melempar kartu (setelah dihukum)
            currentPlayerIndex: current.currentPlayerIndex,
            currentActiveTurnPhase: "throwing",
            thrownCard: null,
            questionForModal: null,
            shouldShowQuestionModal: false,
            localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS, // Reset timer
            syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
          }));
          hasAddedPenalty.current = false; // Reset flag penalti
        }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);

        // Memicu animasi pengocokan kartu
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
          triggerShuffleAnimation: true, // Memicu animasi pengocokan
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
      // Pastikan ini giliran pemain manusia untuk melempar
      if (!isMyPlayerTurnToThrow()) {
        console.log("Bukan giliranmu untuk melempar kartu!");
        return;
      }

      const myIndex = getLocalPlayerGlobalIndex();
      const myPlayerId = `player${myIndex + 1}`; // ID pemain berdasarkan indeks global

      setGameState((prev) => {
        const myCards = prev[`${myPlayerId}Cards`] || [];
        const updatedCards = myCards.filter((card) => card.id !== cardData.id); // Hapus kartu yang dilempar

        const nextPlayerIndex = getNextPlayerIndex(
          prev.currentPlayerIndex,
          prev.players.length
        ); // Tentukan pemain berikutnya yang akan menjawab

        let updatePayload = {
          [`${myPlayerId}Cards`]: updatedCards,
          thrownCard: cardData, // Kartu yang dilempar
          questionForModal: cardData, // Pertanyaan yang akan muncul di modal
          shouldShowQuestionModal: true, // Tampilkan modal pertanyaan
          currentPlayerIndex: nextPlayerIndex, // Pindahkan giliran ke pemain berikutnya
          currentActiveTurnPhase: "answering", // Fase berubah menjadi menjawab
          lastCardThrowerIndex: prev.currentPlayerIndex, // Simpan siapa yang melempar kartu
          triggerShuffleAnimation: true, // Memicu animasi pengocokan
          localVisualTimeLeft: GAME_CONSTANTS.ANSWER_TIMER_SECONDS, // Reset timer visual untuk menjawab
          syncedPlayerTimeLeft: GAME_CONSTANTS.ANSWER_TIMER_SECONDS, // Reset timer sinkron untuk menjawab
        };

        // Periksa kondisi kemenangan jika kartu pemain habis
        if (updatedCards.length === 0) {
          console.log(`🎉 ${user?.displayName} menang dengan kartu terakhir!`);
          updatePayload = {
            ...updatePayload,
            gameWinnerUID: user.uid,
            gameWinnerDisplayName: user.displayName,
            gameWonAt: Date.now(),
            achievementAwarded: false, // Achievement hanya di-award sekali jika ada integrasi eksternal
            shouldShowQuestionModal: false, // Tutup modal jika menang
            questionForModal: null,
            thrownCard: null,
            victory: true, // Set status kemenangan
            winner: user.displayName,
            isWinner: true, // Pemain lokal adalah pemenang
            hasLost: false,
            showVictoryOverlay: true, // Tampilkan overlay kemenangan
            triggerShuffleAnimation: false, // Hentikan animasi pengocokan
          };
        }

        // Timeout untuk mereset animasi pengocokan
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
      // Pastikan ini giliran pemain manusia untuk menjawab
      if (!isMyPlayerTurnToAnswer()) {
        console.log("Bukan giliranmu untuk menjawab!");
        return;
      }

      // Mencegah pemrosesan jawaban ganda jika penalti sudah ditambahkan
      if (hasAddedPenalty.current) {
        console.log("Jawaban sudah diproses, dilewati");
        return;
      }

      const { isCorrect, hint } = result;
      const myIndex = getLocalPlayerGlobalIndex();
      const myPlayerId = `player${myIndex + 1}`; // ID pemain berdasarkan indeks global

      setGameState((prev) => {
        const newFeedback = { ...prev.playerAnswerFeedback };
        newFeedback[myPlayerId] = isCorrect ? "correct" : "incorrect"; // Set umpan balik jawaban

        let updatedCards = prev[`${myPlayerId}Cards`] || [];
        let updatedHints = prev.collectedGameHints;
        let showOffcanvas = prev.showGameOffcanvas;
        let triggerAnim = false; // Flag untuk memicu animasi

        if (!isCorrect) {
          hasAddedPenalty.current = true; // Set flag penalti untuk mencegah duplikasi
          const penaltyCard = getRandomCardFromAvailablePool(); // Ambil kartu penalti
          updatedCards = [...updatedCards, penaltyCard]; // Tambahkan kartu penalti

          if (hint) {
            updatedHints = [...updatedHints, hint]; // Tambahkan hint jika ada
            showOffcanvas = true; // Tampilkan offcanvas hint
          }

          console.log(`Penalti! Pemain ${myPlayerId} mendapat kartu.`);
          triggerAnim = true; // Memicu animasi
        } else {
          console.log(`Jawaban benar dari Pemain ${myPlayerId}.`);
        }

        // Timeout untuk mereset animasi pengocokan
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

        // Timeout untuk mereset umpan balik dan memindahkan giliran kembali ke pemain yang sama
        setTimeout(() => {
          setGameState((current) => {
            const resetFeedback = { ...current.playerAnswerFeedback };
            resetFeedback[myPlayerId] = null; // Hapus umpan balik

            console.log(
              `↩️ Giliran kembali ke pemain ${user?.displayName} untuk melempar setelah jawaban.`
            );

            return {
              ...current,
              playerAnswerFeedback: resetFeedback,
              currentPlayerIndex: current.currentPlayerIndex, // Giliran kembali ke pemain yang sama
              currentActiveTurnPhase: "throwing", // Fase berubah menjadi melempar
              thrownCard: null,
              questionForModal: null,
              shouldShowQuestionModal: false,
              localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS, // Reset timer
              syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
            };
          });

          hasAddedPenalty.current = false; // Reset flag penalti
        }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);

        return {
          ...prev,
          playerAnswerFeedback: newFeedback,
          [`${myPlayerId}Cards`]: updatedCards,
          collectedGameHints: updatedHints,
          showGameOffcanvas: showOffcanvas,
          triggerShuffleAnimation: triggerAnim, // Memicu animasi
        };
      });
    },
    [
      isMyPlayerTurnToAnswer,
      getLocalPlayerGlobalIndex,
      getRandomCardFromAvailablePool,
      user?.displayName,
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
      console.log(`🤖 AI Throw Attempt - UID: ${aiUid}`);

      setGameState((prev) => {
        const aiPlayerIndex = prev.players.findIndex((p) => p.uid === aiUid);

        // Validasi: pastikan AI ada dan ini gilirannya dan fase yang benar
        if (aiPlayerIndex === -1) {
          console.log(`❌ AI with UID ${aiUid} not found in players array`);
          return prev;
        }
        const aiPlayer = prev.players[aiPlayerIndex];
        console.log(
          `🤖 Found AI: ${aiPlayer.displayName} at index ${aiPlayerIndex}`
        );

        if (prev.currentPlayerIndex !== aiPlayerIndex) {
          console.log(
            `❌ Not AI's turn. Current: ${prev.currentPlayerIndex}, AI: ${aiPlayerIndex}`
          );
          return prev;
        }
        if (prev.currentActiveTurnPhase !== "throwing") {
          console.log(
            `❌ Wrong phase. Current: ${prev.currentActiveTurnPhase}, Expected: throwing`
          );
          return prev;
        }

        const aiPlayerId = `player${aiPlayerIndex + 1}`; // ID slot pemain AI
        const aiCards = prev[`${aiPlayerId}Cards`] || [];

        console.log(
          `🤖 AI ${aiPlayer.displayName} has ${aiCards.length} cards`
        );

        // Jika AI tidak punya kartu untuk dilempar, lewati giliran
        if (aiCards.length === 0) {
          console.log(
            `🤖 AI ${aiPlayer.displayName} has no cards to throw. Skipping turn.`
          );
          const nextIndex = getNextPlayerIndex(
            aiPlayerIndex,
            prev.players.length
          );
          return {
            ...prev,
            currentPlayerIndex: nextIndex, // Pindah giliran
            currentActiveTurnPhase: "throwing", // Tetap di fase melempar untuk pemain berikutnya
            thrownCard: null,
            questionForModal: null,
            shouldShowQuestionModal: false,
            lastCardThrowerIndex: null,
            triggerShuffleAnimation: false,
            localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
            syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
          };
        }

        // Pilih kartu acak untuk dilempar
        const randomCardIndex = Math.floor(Math.random() * aiCards.length);
        const cardToThrow = aiCards[randomCardIndex];

        console.log(
          `🤖 AI ${aiPlayer.displayName} throwing card: "${cardToThrow.question_text}"`
        );

        const updatedAiCards = aiCards.filter(
          (card) => card.id !== cardToThrow.id
        ); // Hapus kartu dari tangan AI

        console.log(
          `🤖 AI Cards: ${aiCards.length} → ${updatedAiCards.length}`
        );

        const nextAnswererIndex = getNextPlayerIndex(
          aiPlayerIndex,
          prev.players.length
        ); // Tentukan pemain berikutnya yang akan menjawab

        let newStateUpdate = {
          [`${aiPlayerId}Cards`]: updatedAiCards,
          thrownCard: cardToThrow,
          questionForModal: cardToThrow,
          shouldShowQuestionModal: true, // Tampilkan modal pertanyaan untuk pemain berikutnya
          currentPlayerIndex: nextAnswererIndex, // Pindah giliran ke pemain berikutnya
          currentActiveTurnPhase: "answering", // Fase berubah menjadi menjawab
          lastCardThrowerIndex: aiPlayerIndex,
          triggerShuffleAnimation: true, // Memicu animasi pengocokan
          localVisualTimeLeft: GAME_CONSTANTS.ANSWER_TIMER_SECONDS, // Reset timer untuk menjawab
          syncedPlayerTimeLeft: GAME_CONSTANTS.ANSWER_TIMER_SECONDS,
        };

        // Periksa kondisi kemenangan AI
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
            victory: true, // Set status kemenangan
            winner: aiPlayer.displayName,
            isWinner: false, // Pemain lokal bukan pemenang
            hasLost: true, // Pemain lokal kalah
            showVictoryOverlay: true, // Tampilkan overlay kemenangan/kekalahan
            triggerShuffleAnimation: false, // Hentikan animasi
          };
        }

        // Timeout untuk mereset animasi pengocokan
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

        // Validasi: pastikan AI ada, ini gilirannya, dan fase yang benar
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

        // Jika tidak ada pertanyaan untuk dijawab (kasus error/sinkronisasi), AI tetap dihukum
        if (!question) {
          console.warn(
            `🤖 AI ${prev.players[aiPlayerIndex]?.displayName} has no question to answer. Skipping answer phase.`
          );

          const penaltyCard = getRandomCardFromAvailablePool();
          const updatedCards = [
            ...(prev[`${aiPlayerId}Cards`] || []),
            penaltyCard,
          ];
          const newFeedback = { ...prev.playerAnswerFeedback };
          newFeedback[aiPlayerId] = "incorrect";

          // Timeout untuk mereset umpan balik dan memindahkan giliran
          setTimeout(() => {
            setGameState((current) => ({
              ...current,
              playerAnswerFeedback: {
                ...current.playerAnswerFeedback,
                [aiPlayerId]: null,
              },
              currentPlayerIndex: aiPlayerIndex, // Giliran kembali ke AI yang sama
              currentActiveTurnPhase: "throwing", // Fase berubah ke melempar
              thrownCard: null,
              questionForModal: null,
              shouldShowQuestionModal: false,
              triggerShuffleAnimation: false,
              localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
              syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
            }));
          }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);

          // Timeout untuk mereset animasi pengocokan
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
            triggerShuffleAnimation: true, // Memicu animasi
          };
        }

        // Tentukan apakah AI menjawab benar atau salah secara acak
        const isCorrect =
          Math.random() < GAME_CONSTANTS.AI_ANSWER_CORRECT_CHANCE;
        const newFeedback = { ...prev.playerAnswerFeedback };
        newFeedback[aiPlayerId] = isCorrect ? "correct" : "incorrect"; // Set umpan balik

        let updatedCards = prev[`${aiPlayerId}Cards`] || [];
        let triggerAnim = false;

        if (!isCorrect) {
          const penaltyCard = getRandomCardFromAvailablePool(); // Ambil kartu penalti
          updatedCards = [...updatedCards, penaltyCard]; // Tambahkan kartu penalti
          console.log(
            `🤖 Penalty! Bot ${prev.players[aiPlayerIndex].displayName} answered incorrectly and received a card.`
          );
          triggerAnim = true; // Memicu animasi
        } else {
          console.log(
            `🤖 Bot ${prev.players[aiPlayerIndex].displayName} answered correctly.`
          );
        }

        // Timeout untuk mereset animasi pengocokan
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

        // Timeout untuk mereset umpan balik dan memindahkan giliran kembali ke AI yang sama
        setTimeout(() => {
          setGameState((current) => {
            const resetFeedback = { ...current.playerAnswerFeedback };
            resetFeedback[aiPlayerId] = null; // Hapus umpan balik

            return {
              ...current,
              playerAnswerFeedback: resetFeedback,
              currentPlayerIndex: aiPlayerIndex, // Giliran kembali ke AI yang sama
              currentActiveTurnPhase: "throwing", // Fase berubah ke melempar
              thrownCard: null,
              questionForModal: null,
              shouldShowQuestionModal: false,
              localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS, // Reset timer
              syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS,
            };
          });
        }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);

        return {
          ...prev,
          playerAnswerFeedback: newFeedback,
          [`${aiPlayerId}Cards`]: updatedCards,
          triggerShuffleAnimation: triggerAnim, // Memicu animasi
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
   * @description Menangani penutupan overlay kemenangan/kekalahan dan menavigasi kembali ke halaman utama.
   * @returns {void}
   */
  const handleVictoryClose = useCallback(() => {
    console.log("🏆 Overlay kemenangan ditutup - pengalihan segera");
    setGameState((prev) => ({
      ...prev,
      victory: false,
      hasLost: false,
      showVictoryOverlay: false,
    }));
    navigate("/"); // Kembali ke halaman utama
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
    if (!user) return; // Pastikan user tersedia

    const humanPlayer = {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL || user.googlePhotoURL || null,
      position: 0, // Pemain manusia selalu di posisi 0
      isAI: false,
    };

    const aiPlayers = [];
    const maxBots = 3;
    const numBotsToCreate = Math.min(aiCardsCount, maxBots);

    for (let i = 0; i < numBotsToCreate; i++) {
      aiPlayers.push({
        uid: `ai_${i + 1}`, 
        photoURL: BotProfile,
        position: i + 1, 
        isAI: true,
      });
    }

    setGameState((prev) => ({
      ...prev,
      players: [humanPlayer, ...aiPlayers], // Menggabungkan pemain manusia dan bot
    }));
  }, [user, aiCardsCount]); // Dependensi: `user` dan `aiCardsCount`

  /**
   * @effect Inisialisasi Status Permainan Lokal
   * @description Mengambil pertanyaan, mengacaknya, dan mendistribusikan kartu awal
   * ke semua pemain (manusia dan bot). Menyiapkan status awal game (`playerCards`, `playerStatus`, dll.).
   * Efek ini dipicu setelah `players` diinisialisasi dan `isGameReady` belum `true`.
   */
  const initializeLocalGameState = useCallback(async () => {
    if (gameState.players.length === 0 || isGameReady) return; // Hanya inisialisasi jika pemain sudah ada dan game belum siap

    try {
      const fetchedQuestions = await getQuestions(topicID); // Ambil pertanyaan berdasarkan topicID

      if (fetchedQuestions.length === 0) {
        console.error("No questions fetched! Cannot initialize game.");
        setIsGameReady(true);
        return;
      }

      const shuffledQuestions = shuffle([...fetchedQuestions]); // Acak pertanyaan

      // Inisialisasi timer pemain (secara lokal, tidak ke Firebase)
      const initialPlayerTimers = new Array(gameState.players.length).fill(
        GAME_CONSTANTS.THROW_TIMER_SECONDS
      );

      const initialPlayerCards = {}; // Objek untuk menyimpan kartu setiap pemain
      const initialPlayerStatus = {}; // Objek untuk menyimpan status setiap slot pemain

      // Distribusikan kartu awal ke setiap pemain (manusia dan bot)
      gameState.players.forEach((player, index) => {
        const playerId = `player${index + 1}`; // ID slot pemain (player1, player2, ...)
        initialPlayerCards[`${playerId}Cards`] = createInitialCardsForPlayer(
          shuffledQuestions,
          index * GAME_CONSTANTS.INITIAL_CARDS_PER_PLAYER, // Ambil subset pertanyaan unik untuk kartu awal
          GAME_CONSTANTS.INITIAL_CARDS_PER_PLAYER
        );
        initialPlayerStatus[playerId] = "available"; // Tandai slot ini sebagai tersedia
      });

      // Menandai slot pemain yang tidak terisi (jika total pemain < 4) sebagai 'not_available'
      for (let i = gameState.players.length; i < 4; i++) {
        const playerId = `player${i + 1}`;
        initialPlayerStatus[playerId] = "not_available";
        initialPlayerCards[`${playerId}Cards`] = []; // Pastikan array kartu kosong untuk slot tidak tersedia
      }

      setGameState((prev) => ({
        ...prev,
        ...initialPlayerCards, // Menambahkan kartu ke gameState
        playerStatus: initialPlayerStatus, // Menambahkan status slot pemain
        questions: shuffledQuestions, // Menyimpan pertanyaan yang diacak
        playerTimers: initialPlayerTimers, // Menyimpan timer awal
        currentPlayerIndex: GAME_CONSTANTS.FIRST_PLAYER_INDEX, // Set pemain pertama sebagai pemain saat ini
        currentActiveTurnPhase: "throwing", // Set fase awal sebagai melempar
        syncedPlayerTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS, // Sinkronkan timer visual
        localVisualTimeLeft: GAME_CONSTANTS.THROW_TIMER_SECONDS, // Set timer visual lokal
      }));

      setIsGameReady(true); // Game siap dimainkan
    } catch (error) {
      console.error("Error initializing game (Vs AI):", error);
      setIsGameReady(true);
    }
  }, [gameState.players, topicID, isGameReady]); // Dependensi: `players`, `topicID`, `isGameReady`

  /**
   * @effect Trigger Inisialisasi Permainan
   * @description Memanggil `initializeLocalGameState` ketika daftar pemain sudah terisi
   * dan game belum siap. Ini memastikan inisialisasi hanya terjadi setelah pemain disiapkan.
   */
  useEffect(() => {
    if (gameState.players.length > 0 && !isGameReady) {
      initializeLocalGameState();
    }
  }, [gameState.players, isGameReady, initializeLocalGameState]); // Dependensi pada `players`, `isGameReady`, dan `initializeLocalGameState`

  /**
   * @effect Manajemen Giliran Utama (Manusia & AI)
   * @description Hook ini adalah inti dari alur giliran. Ini membersihkan timer sebelumnya,
   * menentukan apakah giliran AI atau manusia, dan menjadwalkan aksi atau timer yang sesuai.
   * Ini akan berulang setiap kali `currentPlayerIndex` atau `currentActiveTurnPhase` berubah.
   * @returns {function(): void} Fungsi cleanup untuk membersihkan timeout/interval saat unmount atau dependensi berubah.
   */
  useEffect(() => {
    // Lewati efek ini jika game belum siap, tidak ada pemain, atau sudah ada pemenang/game over
    if (!isGameReady || players.length === 0 || victory || gameOver) {
      console.log(
        "Skipping useEffect: isGameReady",
        isGameReady,
        "players.length",
        players.length,
        "victory",
        victory,
        "gameOver",
        gameOver
      );
      return;
    }

    // Bersihkan semua timer/timeout yang mungkin masih aktif dari giliran sebelumnya
    if (visualTimerIntervalRef.current) {
      clearInterval(visualTimerIntervalRef.current);
      visualTimerIntervalRef.current = null;
    }
    if (currentTurnActionTimeoutRef.current) {
      clearTimeout(currentTurnActionTimeoutRef.current);
      currentTurnActionTimeoutRef.current = null;
    }

    const activePlayer = players[currentPlayerIndex]; // Pemain yang gilirannya saat ini
    const isHumanTurn = activePlayer?.uid === user?.uid; // Apakah ini giliran pemain manusia

    console.log(`--- useEffect: CURRENT TURN ---`);
    console.log(
      `Active Player: ${activePlayer?.displayName} (Index: ${currentPlayerIndex}, isAI: ${activePlayer?.isAI})`
    );
    console.log(`Current Phase: ${currentActiveTurnPhase}`);

    // Tentukan durasi timer berdasarkan fase giliran
    const timerDuration =
      currentActiveTurnPhase === "throwing"
        ? GAME_CONSTANTS.THROW_TIMER_SECONDS
        : GAME_CONSTANTS.ANSWER_TIMER_SECONDS;

    // Set nilai awal timer di state lokal
    setGameState((prev) => ({
      ...prev,
      localVisualTimeLeft: timerDuration,
      syncedPlayerTimeLeft: timerDuration,
      // Memperbarui hanya timer pemain saat ini di array playerTimers
      playerTimers: prev.playerTimers.map((t, idx) =>
        idx === currentPlayerIndex ? timerDuration : t
      ),
    }));

    console.log(`Set initial timers to ${timerDuration}s`);

    if (activePlayer && activePlayer.isAI) {
      // --- Logika Giliran AI ---
      const aiActionDelay =
        currentActiveTurnPhase === "throwing"
          ? GAME_CONSTANTS.AI_THROW_DELAY_MS // Delay untuk AI melempar
          : GAME_CONSTANTS.AI_ANSWER_DELAY_MS; // Delay untuk AI menjawab

      console.log(
        `🤖 Giliran AI untuk ${activePlayer.displayName}. Menjadwalkan aksi dalam ${aiActionDelay}ms.`
      );

      // Mulai hitungan mundur visual segera untuk AI
      visualTimerIntervalRef.current = setInterval(() => {
        setGameState((prev) => {
          const newTime = Math.max(0, prev.localVisualTimeLeft - 1);
          return { ...prev, localVisualTimeLeft: newTime }; // Kurangi waktu visual lokal
        });
      }, 1000); // Setiap 1 detik

      // Jadwalkan aksi AI setelah penundaan
      currentTurnActionTimeoutRef.current = setTimeout(() => {
        console.log(
          `🤖 Bot ${activePlayer.displayName} melakukan aksi untuk fase: ${currentActiveTurnPhase}`
        );

        if (currentActiveTurnPhase === "throwing") {
          handleAIThrowCard(activePlayer.uid); // Panggil fungsi melempar AI
        } else if (currentActiveTurnPhase === "answering") {
          handleAIAnswerQuestion(activePlayer.uid); // Panggil fungsi menjawab AI
        }
      }, aiActionDelay);
    } else if (isHumanTurn) {
      // --- Logika Giliran Pemain Manusia ---
      console.log(
        `👨 Giliran Manusia untuk ${activePlayer.displayName}. Memulai timer visual.`
      );

      visualTimerIntervalRef.current = setInterval(() => {
        setGameState((prev) => {
          const newTime = Math.max(0, prev.localVisualTimeLeft - 1);

          if (newTime <= 0) {
            // Jika timer visual habis, bersihkan interval dan picu `handleTimeOut`
            clearInterval(visualTimerIntervalRef.current);
            visualTimerIntervalRef.current = null;
            console.log(
              `Visual timer untuk Manusia (${activePlayer.displayName}) mencapai 0. Memicu handleTimeOut.`
            );

            // Gunakan setTimeout (0ms) untuk memastikan `handleTimeOut` dipanggil
            // setelah state update saat ini selesai, menghindari race condition.
            setTimeout(() => {
              handleTimeOut();
            }, 0);
          }

          return { ...prev, localVisualTimeLeft: newTime }; // Kurangi waktu visual lokal
        });
      }, 1000); // Setiap 1 detik
    }

    // Fungsi cleanup untuk useEffect ini
    return () => {
      console.log("Cleanup useEffect untuk manajemen giliran.");
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
    victory, // Termasuk victory dan gameOver agar useEffect di-skip saat game berakhir
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
      hasAddedPenalty.current = false; // Reset flag penalti
      lastTimeoutHandled.current = 0; // Reset timestamp timeout terakhir
      console.log(
        `Reset penalty flags. Prev: ${prevPlayerIndexRef.current}, Current: ${currentPlayerIndex}`
      );
    }
    prevPlayerIndexRef.current = currentPlayerIndex; // Simpan indeks pemain saat ini untuk perbandingan selanjutnya
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

    // Jika timer di-reset ke nilai penuh, itu mengindikasikan perubahan giliran (termasuk setelah timeout)
    const timerDuration =
      currentActiveTurnPhase === "throwing"
        ? GAME_CONSTANTS.THROW_TIMER_SECONDS
        : GAME_CONSTANTS.ANSWER_TIMER_SECONDS;

    if (
      localVisualTimeLeft === timerDuration &&
      prevPlayerIndexRef.current !== currentPlayerIndex
    ) {
      console.log(
        `🔄 Detected turn change from ${prevPlayerIndexRef.current} to ${currentPlayerIndex}`
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
      console.log(
        "Membersihkan permainan karena: Permainan Berakhir (waktu habis)"
      );
      // Navigasi setelah penundaan singkat untuk pengalaman pengguna yang lebih baik
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
      {/* Komponen HeaderGame */}
      <HeaderGame
        hints={collectedGameHints}
        showOffcanvas={showGameOffcanvas}
        // Fungsi untuk mengubah state `showGameOffcanvas` di `gameState`
        setShowOffcanvas={(val) =>
          setGameState((prev) => ({ ...prev, showGameOffcanvas: val }))
        }
        onCloseOffcanvas={handleCloseGameOffcanvas}
        currentUser={user} // Meneruskan data pengguna untuk keperluan header
      />

      {/* Area Utama Permainan */}
      <Container
        fluid
        id="nuca-container"
        className="flex-grow-1 d-flex flex-column justify-content-between"
      >
        <GameArea
          currentUserId={activeLocalPlayerId} // ID pemain lokal untuk referensi posisi
          gameState={gameState} // Seluruh state game lokal
          playerAnswerFeedback={playerAnswerFeedback} // Umpan balik jawaban pemain
          currentPlayerGlobalIndex={currentPlayerIndex} // Indeks pemain yang gilirannya saat ini
          cardCounts={cardCounts} // Jumlah kartu setiap pemain/bot
          timeLeft={localVisualTimeLeft} // Waktu sisa untuk timer visual
          TIMER_PLAYER_DURATION={GAME_CONSTANTS.THROW_TIMER_SECONDS}
          throwCard={thrownCard} // Kartu yang dilempar ke tengah
          handleCardClicked={handleCardPlayAttempt} // Handler klik kartu pemain manusia
          isCurrentUserTurn={isMyPlayerTurnToThrow} // Apakah giliran melempar kartu pemain manusia
          currentTurnPhase={currentActiveTurnPhase} // Fase giliran saat ini
          TIMER_ANSWER_DURATION={GAME_CONSTANTS.ANSWER_TIMER_SECONDS}
          isPlayerTurn={isPlayerTurnStatus} // Fungsi untuk memeriksa giliran pemain (universal)
          getPlayerTimeLeft={getPlayerRemainingTime} // Fungsi untuk mendapatkan sisa waktu pemain (universal)
          triggerShuffleAnimation={triggerShuffleAnimation} // Memicu animasi pengocokan
          players={players} // Data lengkap semua pemain (manusia + bot)
        />
      </Container>

      {/* Modal Pertanyaan */}
      <QuestionModal
        show={displayQuestionModalForMe} // Tampilkan modal hanya jika giliran manusia untuk menjawab
        questionData={questionForModal} // Data pertanyaan yang akan ditampilkan
        onClose={handleCloseQuestionPromptModal} // Handler penutupan modal
        onSubmitAnswer={handlePlayerAnswerSubmission} // Handler pengiriman jawaban pemain manusia
        isMyTurnToAnswer={isMyPlayerTurnToAnswer()} // Konfirmasi apakah giliran manusia untuk menjawab
        playerAnswerFeedback={playerAnswerFeedback} // Umpan balik jawaban
        currentPlayerId={activeLocalPlayerId} // ID pemain lokal
        playerAnsweringId={`player${currentPlayerIndex + 1}`} // ID pemain yang sedang menjawab
        timeLeft={localVisualTimeLeft} // Waktu sisa di timer modal
        TIMER_ANSWER_DURATION={GAME_CONSTANTS.ANSWER_TIMER_SECONDS}
        players={players} // Data pemain lengkap
        isPotionUsed={false} // Ramuan tidak digunakan di mode Vs AI (atau diatur di tempat lain)
      />

      {/* Overlay Kemenangan/Kekalahan */}
      {victory &&
        showVictoryOverlay &&
        (isWinner ? (
          <VictoryOverlay
            winner={winner}
            onClose={handleVictoryClose}
            isVsAiGame={true}
          /> // Overlay kemenangan
        ) : hasLost ? (
          <LoseOverlay loser={user.displayName} onClose={handleVictoryClose} /> // Overlay kekalahan
        ) : null)}
    </div>
  );
}

export default NusaCardVsAi;
