import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { usePlayerTimer } from "../../../utils/timerUtils";
import {
  getPlayerGlobalIndex,
  getPlayerCards,
  getPlayerStatus,
  getNextPlayerIndex,
} from "../../../utils/games/nuca/NucaUtils";

// Game Constants
const GAME_CONSTANTS = {
  FIRST_PLAYER_INDEX: 0,
  TURN_FLOW_DIRECTION: "clockwise",
  THROW_TIMER_SECONDS: 30,
  ANSWER_TIMER_SECONDS: 30,
};

// Initial game cards data - extracted to prevent recreating on each render
const INITIAL_CARDS_DATA = {
  player1Cards: [
    {
      id: 1,
      question_text: "Gado Gado adalah makanan khas dari daerah mana:",
      multiple_choices: [
        { answer_text: "Jakarta", is_correct: true },
        { answer_text: "Surabaya", is_correct: false },
        { answer_text: "Bandung", is_correct: false },
        { answer_text: "Solo", is_correct: false },
      ],
      hint: "Ibu kota Indonesia",
    },
    {
      id: 2,
      question_text:
        "Apa yang menjadi sayur asam sedap dan enak untuk disajikan dengan hangat?",
      multiple_choices: [
        { answer_text: "Sayur Lodeh", is_correct: false },
        { answer_text: "Sayur Asem", is_correct: true },
        { answer_text: "Tumis Kangkung", is_correct: false },
        { answer_text: "Gulai Nangka", is_correct: false },
      ],
      hint: "Rasanya segar dan cocok dengan nasi",
    },
    {
      id: 3,
      question_text:
        "Untuk memasak serabi khas Bandung biasanya menggunakan apa?",
      multiple_choices: [
        { answer_text: "Tepung Beras", is_correct: true },
        { answer_text: "Tepung Terigu", is_correct: false },
        { answer_text: "Sagu", is_correct: false },
        { answer_text: "Jagung", is_correct: false },
      ],
      hint: "Terbuat dari padi",
    },
    {
      id: 4,
      question_text: "Berapa lama proses memasak sate maranggi?",
      multiple_choices: [
        { answer_text: "10 menit", is_correct: false },
        { answer_text: "30 menit", is_correct: true },
        { answer_text: "1 jam", is_correct: false },
        { answer_text: "2 jam", is_correct: false },
      ],
      hint: "Waktunya sedang, tidak terlalu lama",
    },
    {
      id: 5,
      question_text:
        "Siapa penemu dodol dan bagaimana sejarahnya hingga menjadi makanan tradisional?",
      multiple_choices: [
        { answer_text: "Tidak diketahui", is_correct: true },
        { answer_text: "Sunan Kalijaga", is_correct: false },
        { answer_text: "Prabu Siliwangi", is_correct: false },
        { answer_text: "Raden Wijaya", is_correct: false },
      ],
      hint: "Asal usulnya sudah sangat lama",
    },
  ],
  player2Cards: [
    {
      id: 6,
      question_text: "Rendang adalah makanan khas dari daerah mana?",
      multiple_choices: [
        { answer_text: "Padang", is_correct: true },
        { answer_text: "Jakarta", is_correct: false },
        { answer_text: "Bandung", is_correct: false },
        { answer_text: "Surabaya", is_correct: false },
      ],
      hint: "Daerah Sumatera Barat",
    },
    {
      id: 7,
      question_text: "Apa bahan utama pembuatan gudeg?",
      multiple_choices: [
        { answer_text: "Nangka muda", is_correct: true },
        { answer_text: "Pepaya muda", is_correct: false },
        { answer_text: "Kelapa muda", is_correct: false },
        { answer_text: "Pisang muda", is_correct: false },
      ],
      hint: "Buah yang besar dan berduri",
    },
    {
      id: 8,
      question_text: "Sate Padang menggunakan bumbu apa?",
      multiple_choices: [
        { answer_text: "Kuah kuning", is_correct: true },
        { answer_text: "Kecap manis", is_correct: false },
        { answer_text: "Sambal kacang", is_correct: false },
        { answer_text: "Bumbu kare", is_correct: false },
      ],
      hint: "Warnanya kuning dan berkuah",
    },
    {
      id: 9,
      question_text: "Makanan khas Betawi yang terkenal adalah?",
      multiple_choices: [
        { answer_text: "Kerak telor", is_correct: true },
        { answer_text: "Bakso", is_correct: false },
        { answer_text: "Mie ayam", is_correct: false },
        { answer_text: "Nasi goreng", is_correct: false },
      ],
      hint: "Terbuat dari telur dan beras ketan",
    },
    {
      id: 10,
      question_text: "Pempek adalah makanan khas dari?",
      multiple_choices: [
        { answer_text: "Palembang", is_correct: true },
        { answer_text: "Medan", is_correct: false },
        { answer_text: "Makassar", is_correct: false },
        { answer_text: "Banjarmasin", is_correct: false },
      ],
      hint: "Kota di Sumatera Selatan",
    },
  ],
  player3Cards: [
    {
      id: 11,
      question_text: "Rawon adalah makanan khas dari?",
      multiple_choices: [
        { answer_text: "Surabaya", is_correct: true },
        { answer_text: "Jakarta", is_correct: false },
        { answer_text: "Bandung", is_correct: false },
        { answer_text: "Semarang", is_correct: false },
      ],
      hint: "Kota pahlawan di Jawa Timur",
    },
    {
      id: 12,
      question_text: "Apa yang membuat rawon berwarna hitam?",
      multiple_choices: [
        { answer_text: "Kluwek", is_correct: true },
        { answer_text: "Kecap", is_correct: false },
        { answer_text: "Tauco", is_correct: false },
        { answer_text: "Petis", is_correct: false },
      ],
      hint: "Bumbu yang berwarna hitam alami",
    },
    {
      id: 13,
      question_text: "Soto Betawi menggunakan santan dari?",
      multiple_choices: [
        { answer_text: "Kelapa", is_correct: true },
        { answer_text: "Kacang", is_correct: false },
        { answer_text: "Susu", is_correct: false },
        { answer_text: "Kemiri", is_correct: false },
      ],
      hint: "Buah yang berair dan berbulu",
    },
    {
      id: 14,
      question_text: "Makanan khas Sunda yang terkenal adalah?",
      multiple_choices: [
        { answer_text: "Nasi liwet", is_correct: true },
        { answer_text: "Nasi gudeg", is_correct: false },
        { answer_text: "Nasi padang", is_correct: false },
        { answer_text: "Nasi rawon", is_correct: false },
      ],
      hint: "Nasi yang dimasak dengan cara khusus",
    },
    {
      id: 15,
      question_text: "Bahan utama membuat ketupat adalah?",
      multiple_choices: [
        { answer_text: "Beras", is_correct: true },
        { answer_text: "Tepung", is_correct: false },
        { answer_text: "Jagung", is_correct: false },
        { answer_text: "Singkong", is_correct: false },
      ],
      hint: "Bahan pokok makanan Indonesia",
    },
  ],
  player4Cards: [
    {
      id: 16,
      question_text: "Coto Makassar berasal dari daerah?",
      multiple_choices: [
        { answer_text: "Sulawesi Selatan", is_correct: true },
        { answer_text: "Sulawesi Utara", is_correct: false },
        { answer_text: "Sulawesi Tengah", is_correct: false },
        { answer_text: "Sulawesi Tenggara", is_correct: false },
      ],
      hint: "Pulau Sulawesi bagian selatan",
    },
    {
      id: 17,
      question_text: "Bahan utama es cendol adalah?",
      multiple_choices: [
        { answer_text: "Tepung beras", is_correct: true },
        { answer_text: "Tepung terigu", is_correct: false },
        { answer_text: "Tepung ketan", is_correct: false },
        { answer_text: "Tepung sagu", is_correct: false },
      ],
      hint: "Tepung dari beras yang digiling",
    },
    {
      id: 18,
      question_text: "Makanan khas Batak yang terkenal adalah?",
      multiple_choices: [
        { answer_text: "Arsik", is_correct: true },
        { answer_text: "Rendang", is_correct: false },
        { answer_text: "Gulai", is_correct: false },
        { answer_text: "Sate", is_correct: false },
      ],
      hint: "Masakan ikan khas Batak",
    },
    {
      id: 19,
      question_text: "Dodol Garut terbuat dari bahan utama?",
      multiple_choices: [
        { answer_text: "Ketan", is_correct: true },
        { answer_text: "Beras", is_correct: false },
        { answer_text: "Jagung", is_correct: false },
        { answer_text: "Singkong", is_correct: false },
      ],
      hint: "Beras yang lengket",
    },
    {
      id: 20,
      question_text: "Minuman khas Bandung yang terkenal adalah?",
      multiple_choices: [
        { answer_text: "Bandrek", is_correct: true },
        { answer_text: "Bajigur", is_correct: false },
        { answer_text: "Sekoteng", is_correct: false },
        { answer_text: "Wedang jahe", is_correct: false },
      ],
      hint: "Minuman hangat khas Sunda",
    },
  ],
  playerStatus: {
    player1: "available",
    player2: "available",
    player3: "available",
    player4: "not_available",
  },
};

function useNucaLogic() {
  // Core Game State
  const [activeLocalPlayerId, setActiveLocalPlayerId] = useState("player1");
  const [currentGameState, setCurrentGameState] = useState(INITIAL_CARDS_DATA);
  const [activePlayerGlobalIndices, setActivePlayerGlobalIndices] = useState(
    []
  );
  const [activeGlobalPlayerIndex, setActiveGlobalPlayerIndex] = useState(0);
  const [allPlayerTimers, setAllPlayerTimers] = useState(() =>
    Array(4).fill(GAME_CONSTANTS.THROW_TIMER_SECONDS)
  );

  // Game Flow State
  const [thrownCardData, setThrownCardData] = useState(null);
  const [shouldShowQuestionModal, setShouldShowQuestionModal] = useState(false);
  const [questionForModalDisplay, setQuestionForModalDisplay] = useState(null);
  const [currentActiveTurnPhase, setCurrentActiveTurnPhase] =
    useState("throwing");
  const [lastCardThrowerGlobalIndex, setLastCardThrowerGlobalIndex] =
    useState(null);

  // UI State
  const [collectedGameHints, setCollectedGameHints] = useState({
    player1: [],
    player2: [],
    player3: [],
    player4: [],
  });
  const [showGameOffcanvas, setShowGameOffcanvas] = useState(false);
  const [triggerShuffleAnimation, setTriggerShuffleAnimation] = useState(false);

  // Refs
  const isTurnTransitioning = useRef(false);

  // Memoized Helper Functions
  const getLocalPlayerGlobalIndex = useCallback(
    () => getPlayerGlobalIndex(activeLocalPlayerId),
    [activeLocalPlayerId]
  );

  const getRandomCardFromAvailablePool = useCallback(() => {
    const allAvailableCards = Object.values(currentGameState)
      .filter(
        (value) =>
          Array.isArray(value) &&
          value.every(
            (item) =>
              typeof item === "object" &&
              "id" in item &&
              "question_text" in item
          )
      )
      .flatMap((cards) => cards || []);

    if (allAvailableCards.length === 0) {
      console.warn("Tidak ada kartu di pool untuk diambil secara acak!");
      return {
        id: Math.floor(Math.random() * 1000) + 100,
        question_text: "Kartu Tambahan Kosong",
        multiple_choices: [{ answer_text: "Default", is_correct: false }],
        hint: "",
      };
    }

    const randomIndex = Math.floor(Math.random() * allAvailableCards.length);
    const chosenCard = { ...allAvailableCards[randomIndex] };
    const currentMaxId = Math.max(
      ...allAvailableCards.map((c) => c.id || 0),
      0
    );
    chosenCard.id = currentMaxId + 1;

    if (chosenCard.hasOwnProperty("is_penalty")) {
      delete chosenCard.is_penalty;
    }

    return chosenCard;
  }, [currentGameState]);

  // Memoized Timer Hook Data
  const timerHookGameData = useMemo(
    () => ({
      isMyTurn: true,
      currentPlayerIndex: activeGlobalPlayerIndex,
      playerTimers: allPlayerTimers,
      topicID: "nusa-card",
      gameID: "game-id",
      roomID: "room-id",
      players: activePlayerGlobalIndices.map((idx) => ({
        id: `player${idx + 1}`,
      })),
    }),
    [activeGlobalPlayerIndex, allPlayerTimers, activePlayerGlobalIndices]
  );

  // Timer Management
  const handleTurnTimeExpiration = useCallback(() => {
    if (isTurnTransitioning.current) {
      console.log(
        "Turn transition already in progress, ignoring time expiration."
      );
      return;
    }
    isTurnTransitioning.current = true;

    if (currentActiveTurnPhase === "throwing") {
      console.log(
        `Waktu melempar habis untuk P_global:${
          activeGlobalPlayerIndex + 1
        }! Langsung berpindah giliran.`
      );
      const nextPlayerIndex = getNextPlayerIndex(
        activeGlobalPlayerIndex,
        activePlayerGlobalIndices,
        GAME_CONSTANTS.TURN_FLOW_DIRECTION
      );
      setActiveGlobalPlayerIndex(nextPlayerIndex);
      setCurrentActiveTurnPhase("throwing");
      setThrownCardData(null);
      setQuestionForModalDisplay(null);
      setShouldShowQuestionModal(false);
      setLastCardThrowerGlobalIndex(null);
      isTurnTransitioning.current = false;
    } else if (currentActiveTurnPhase === "answering") {
      console.log(
        `Waktu menjawab habis untuk P_global:${
          activeGlobalPlayerIndex + 1
        }! Jawaban dianggap salah. Menambah 1 kartu acak.`
      );
      const newRandomCard = getRandomCardFromAvailablePool();

      setCurrentGameState((prevState) => {
        const playerAnsweringId = `player${activeGlobalPlayerIndex + 1}`;
        return {
          ...prevState,
          [`${playerAnsweringId}Cards`]: [
            ...prevState[`${playerAnsweringId}Cards`],
            newRandomCard,
          ],
        };
      });

      setTimeout(() => {
        setShouldShowQuestionModal(false);
        setQuestionForModalDisplay(null);
        setThrownCardData(null);

        const nextThrowerIndex = getNextPlayerIndex(
          lastCardThrowerGlobalIndex,
          activePlayerGlobalIndices,
          GAME_CONSTANTS.TURN_FLOW_DIRECTION
        );
        setActiveGlobalPlayerIndex(nextThrowerIndex);
        setCurrentActiveTurnPhase("throwing");
        setLastCardThrowerGlobalIndex(null);
        isTurnTransitioning.current = false;
      }, 1000);
    }
  }, [
    activePlayerGlobalIndices,
    activeGlobalPlayerIndex,
    currentActiveTurnPhase,
    lastCardThrowerGlobalIndex,
    getRandomCardFromAvailablePool,
  ]);

  const [currentTurnTimeLeft, resetPlayerTurnTimer] = usePlayerTimer(
    currentActiveTurnPhase === "throwing"
      ? GAME_CONSTANTS.THROW_TIMER_SECONDS
      : GAME_CONSTANTS.ANSWER_TIMER_SECONDS,
    handleTurnTimeExpiration,
    timerHookGameData
  );

  // Player Status Functions
  const isPlayerTurnStatus = useCallback(
    (playerGlobalIndex) => activeGlobalPlayerIndex === playerGlobalIndex,
    [activeGlobalPlayerIndex]
  );

  const getPlayerRemainingTime = useCallback(
    (playerGlobalIndex) => {
      if (isPlayerTurnStatus(playerGlobalIndex)) {
        return currentTurnTimeLeft;
      }
      return currentActiveTurnPhase === "throwing"
        ? GAME_CONSTANTS.THROW_TIMER_SECONDS
        : GAME_CONSTANTS.ANSWER_TIMER_SECONDS;
    },
    [currentTurnTimeLeft, isPlayerTurnStatus, currentActiveTurnPhase]
  );

  const isMyPlayerTurnToThrow = useCallback(
    () =>
      activeGlobalPlayerIndex === getLocalPlayerGlobalIndex() &&
      currentActiveTurnPhase === "throwing",
    [activeGlobalPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]
  );

  const isMyPlayerTurnToAnswer = useCallback(
    () =>
      activeGlobalPlayerIndex === getLocalPlayerGlobalIndex() &&
      currentActiveTurnPhase === "answering",
    [activeGlobalPlayerIndex, getLocalPlayerGlobalIndex, currentActiveTurnPhase]
  );

  // Game Actions
  const handleCardPlayAttempt = useCallback(
    (cardData) => {
      if (isTurnTransitioning.current || !isMyPlayerTurnToThrow()) {
        console.log(
          "Bukan giliran Anda untuk melempar kartu atau sedang transisi!"
        );
        return;
      }

      isTurnTransitioning.current = true;

      setThrownCardData(cardData);
      setQuestionForModalDisplay(cardData);
      setLastCardThrowerGlobalIndex(activeGlobalPlayerIndex);
      setTriggerShuffleAnimation(true);
      setTimeout(() => setTriggerShuffleAnimation(false), 500);

      const nextPlayerToAnswerIndex = getNextPlayerIndex(
        activeGlobalPlayerIndex,
        activePlayerGlobalIndices,
        GAME_CONSTANTS.TURN_FLOW_DIRECTION
      );

      setActiveGlobalPlayerIndex(nextPlayerToAnswerIndex);
      setShouldShowQuestionModal(true);
      setCurrentActiveTurnPhase("answering");

      setCurrentGameState((prevState) => {
        const currentUserCards = getPlayerCards(activeLocalPlayerId, prevState);
        const newCards = currentUserCards.filter(
          (card) => card.id !== cardData.id
        );
        return {
          ...prevState,
          [`${activeLocalPlayerId}Cards`]: newCards,
        };
      });

      setTimeout(() => {
        isTurnTransitioning.current = false;
      }, 100);
    },
    [
      isMyPlayerTurnToThrow,
      activeGlobalPlayerIndex,
      activePlayerGlobalIndices,
      activeLocalPlayerId,
    ]
  );

  const handlePlayerAnswerSubmission = useCallback(
    (result) => {
      if (isTurnTransitioning.current || !isMyPlayerTurnToAnswer()) {
        console.log("Bukan giliran Anda untuk menjawab atau sedang transisi!");
        if (isTurnTransitioning.current) return;
        isTurnTransitioning.current = false;
        return;
      }

      isTurnTransitioning.current = true;
      const { isCorrect, hint } = result;

      if (!isCorrect) {
        // HINT HANYA UNTUK PLAYER YANG SALAH MENJAWAB
        const answeringPlayerId = `player${activeGlobalPlayerIndex + 1}`;

        if (hint) {
          setCollectedGameHints((prev) => {
            const currentPlayerHints = prev[answeringPlayerId] || [];
            // Cek apakah hint sudah ada untuk player ini
            if (!currentPlayerHints.includes(hint)) {
              return {
                ...prev,
                [answeringPlayerId]: [...currentPlayerHints, hint],
              };
            }
            return prev;
          });

          // Tampilkan offcanvas HANYA jika ini adalah current user yang salah menjawab
          if (answeringPlayerId === activeLocalPlayerId) {
            setShowGameOffcanvas(true);
          }
        }

        console.log(
          `Jawaban salah! Player ${answeringPlayerId} mendapat hint: ${hint}`
        );
        const newRandomCard = getRandomCardFromAvailablePool();

        setCurrentGameState((prevState) => {
          const playerAnsweringId = `player${activeGlobalPlayerIndex + 1}`;
          return {
            ...prevState,
            [`${playerAnsweringId}Cards`]: [
              ...prevState[`${playerAnsweringId}Cards`],
              newRandomCard,
            ],
          };
        });
      } else {
        console.log("Jawaban benar! Tidak menambah kartu.");
      }

      setTimeout(() => {
        setShouldShowQuestionModal(false);
        setQuestionForModalDisplay(null);
        setThrownCardData(null);

        const nextThrowerIndex = getNextPlayerIndex(
          lastCardThrowerGlobalIndex,
          activePlayerGlobalIndices,
          GAME_CONSTANTS.TURN_FLOW_DIRECTION
        );
        setActiveGlobalPlayerIndex(nextThrowerIndex);
        setCurrentActiveTurnPhase("throwing");
        setLastCardThrowerGlobalIndex(null);
        isTurnTransitioning.current = false;
      }, 1000);
    },
    [
      isMyPlayerTurnToAnswer,
      activeGlobalPlayerIndex,
      activePlayerGlobalIndices,
      activeLocalPlayerId, // Add this dependency
      getRandomCardFromAvailablePool,
      lastCardThrowerGlobalIndex,
    ]
  );

  const getCurrentUserHints = useCallback(() => {
    return collectedGameHints[activeLocalPlayerId] || [];
  }, [collectedGameHints, activeLocalPlayerId]);

  // Modal Management
  const handleCloseQuestionPromptModal = useCallback(() => {
    if (currentActiveTurnPhase === "answering") {
      console.log("Modal pertanyaan ditutup secara manual.");
    }
    setShouldShowQuestionModal(false);
    setQuestionForModalDisplay(null);
    setThrownCardData(null);
  }, [currentActiveTurnPhase]);

  // Effects
  useEffect(() => {
    const availableIndices = [];
    for (let i = 1; i <= 4; i++) {
      if (currentGameState.playerStatus[`player${i}`] === "available") {
        availableIndices.push(i - 1);
      }
    }
    setActivePlayerGlobalIndices(availableIndices);

    if (availableIndices.includes(GAME_CONSTANTS.FIRST_PLAYER_INDEX)) {
      setActiveGlobalPlayerIndex(GAME_CONSTANTS.FIRST_PLAYER_INDEX);
      setCurrentActiveTurnPhase("throwing");
      console.log("🎮 Game dimulai dengan Player 1 sebagai starter!");
    } else if (availableIndices.length > 0) {
      setActiveGlobalPlayerIndex(availableIndices[0]);
      setCurrentActiveTurnPhase("throwing");
      console.log(
        `🎮 Player 1 tidak tersedia, game dimulai dengan P${
          availableIndices[0] + 1
        }`
      );
    } else {
      setActiveGlobalPlayerIndex(-1);
      console.log("❌ Tidak ada pemain yang tersedia!");
    }
  }, [currentGameState.playerStatus]);

  useEffect(() => {
    if (
      activePlayerGlobalIndices.length > 0 &&
      activeGlobalPlayerIndex !== -1
    ) {
      console.log(
        `NusaCard global effect: Giliran dan fase berubah. Mereset timer. Current Phase: ${currentActiveTurnPhase}, Current Player Global Index: ${activeGlobalPlayerIndex}`
      );
      resetPlayerTurnTimer();
    }
  }, [
    activeGlobalPlayerIndex,
    currentActiveTurnPhase,
    resetPlayerTurnTimer,
    activePlayerGlobalIndices.length,
  ]);

  useEffect(() => {
    setAllPlayerTimers((prev) => {
      const newTimers = [...prev];
      if (
        activeGlobalPlayerIndex !== -1 &&
        newTimers[activeGlobalPlayerIndex] !== undefined
      ) {
        newTimers[activeGlobalPlayerIndex] = currentTurnTimeLeft;
      }
      return newTimers;
    });
  }, [currentTurnTimeLeft, activeGlobalPlayerIndex]);

  //! DEBUG FUNCTIONS - Only used by debug tools
  const debugSwitchPlayerTurn = useCallback(() => {
    if (isTurnTransitioning.current) {
      console.log(
        "Turn transition already in progress, ignoring debug switch."
      );
      return;
    }
    isTurnTransitioning.current = true;

    const nextGlobalPlayerIndex = getNextPlayerIndex(
      activeGlobalPlayerIndex,
      activePlayerGlobalIndices,
      GAME_CONSTANTS.TURN_FLOW_DIRECTION
    );
    console.log(
      `Debug Switch: Mengubah giliran dari P${
        activeGlobalPlayerIndex + 1
      } ke P${nextGlobalPlayerIndex + 1}`
    );

    setActiveGlobalPlayerIndex(nextGlobalPlayerIndex);
    setCurrentActiveTurnPhase("throwing");
    setShouldShowQuestionModal(false);
    setLastCardThrowerGlobalIndex(null);
    setThrownCardData(null);
    setQuestionForModalDisplay(null);
    setTriggerShuffleAnimation(true);

    setTimeout(() => setTriggerShuffleAnimation(false), 500);
    isTurnTransitioning.current = false;
  }, [activePlayerGlobalIndices, activeGlobalPlayerIndex]);

  //! DEBUG FUNCTION - Reset game state (only for debug tools)
  const resetFullGameState = useCallback(() => {
    setCurrentGameState(INITIAL_CARDS_DATA);
    setActivePlayerGlobalIndices([]);
    setActiveGlobalPlayerIndex(GAME_CONSTANTS.FIRST_PLAYER_INDEX);
    setAllPlayerTimers(Array(4).fill(GAME_CONSTANTS.THROW_TIMER_SECONDS));
    setThrownCardData(null);
    setShouldShowQuestionModal(false);
    setQuestionForModalDisplay(null);
    setCollectedGameHints({
      player1: [],
      player2: [],
      player3: [],
      player4: [],
    });
    setShowGameOffcanvas(false);
    setCurrentActiveTurnPhase("throwing");
    setLastCardThrowerGlobalIndex(null);
    setTriggerShuffleAnimation(false);
    isTurnTransitioning.current = false;
    resetPlayerTurnTimer();
    console.log("Game state has been reset!");
  }, [resetPlayerTurnTimer]);

  return {
    // Core Game Data
    currentGameState,
    activeLocalPlayerId,
    activeGlobalPlayerIndex,
    allPlayerTimers,
    currentTurnTimeLeft,

    // Game Status
    isMyPlayerTurnToThrow,
    isMyPlayerTurnToAnswer,
    currentActiveTurnPhase,

    // Game Objects
    thrownCardData,
    shouldShowQuestionModal,
    questionForModalDisplay,
    collectedGameHints: getCurrentUserHints(),
    showGameOffcanvas,
    triggerShuffleAnimation,

    // Actions
    setActiveLocalPlayerId,
    setShowGameOffcanvas,
    handleCloseGameOffcanvas: useCallback(
      () => setShowGameOffcanvas(false),
      []
    ),
    handleCardPlayAttempt,
    handlePlayerAnswerSubmission,
    handleCloseQuestionPromptModal,

    // Utility Functions
    getPlayerGlobalIndex,
    getPlayerCards: useCallback(
      (playerId) => getPlayerCards(playerId, currentGameState),
      [currentGameState]
    ),
    getPlayerStatus: useCallback(
      (playerId) => getPlayerStatus(playerId, currentGameState),
      [currentGameState]
    ),
    isPlayerTurnStatus,
    getPlayerRemainingTime,

    // Constants
    playerAnsweringGlobalIndex: activeGlobalPlayerIndex,
    THROW_CARD_DURATION_SECONDS: GAME_CONSTANTS.THROW_TIMER_SECONDS,
    ANSWER_QUESTION_DURATION_SECONDS: GAME_CONSTANTS.ANSWER_TIMER_SECONDS,

    // DEBUG FUNCTIONS - Only for debug tools in development
    debugSwitchPlayerTurn, // DEBUG: Switch to next player turn
    handleTurnTimeExpiration, // DEBUG: Force timer expiration
    resetFullGameState, // DEBUG: Reset entire game state
    setCurrentGameState, // DEBUG: Direct state manipulation
    getRandomCardFromAvailablePool, // DEBUG: Add penalty cards
  };
}

export default useNucaLogic;
