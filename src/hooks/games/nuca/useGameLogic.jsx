import { useState, useEffect, useCallback } from "react";
import { usePlayerTimer } from "../../../utils/timerUtils";
import { getPlayerGlobalIndex, getPlayerCards, getPlayerStatus, getNextPlayerIndex } from "../../../utils/games/nuca/NucaUtils";

const GAME_RULES = {
  FIRST_PLAYER: 0,
  TURN_DIRECTION: "clockwise", // Arah giliran: searah jarum jam
  THROW_TIMER_DURATION: 15, // Durasi timer untuk melempar kartu
  ANSWER_TIMER_DURATION: 15, // Durasi timer untuk menjawab pertanyaan
};

function useGameLogic() {
  const [currentUserId, setCurrentUserId] = useState("player1");
  const [gameState, setGameState] = useState({
    player1Cards: [
      { id: 1, question_text: "Gado Gado adalah makanan khas dari daerah mana:", multiple_choices: [{ answer_text: "Jakarta", is_correct: true }, { answer_text: "Surabaya", is_correct: false }, { answer_text: "Bandung", is_correct: false }, { answer_text: "Solo", is_correct: false }], hint: "Ibu kota Indonesia", },
      { id: 2, question_text: "Apa yang menjadi sayur asam sedap dan enak untuk disajikan dengan hangat?", multiple_choices: [{ answer_text: "Sayur Lodeh", is_correct: false }, { answer_text: "Sayur Asem", is_correct: true }, { answer_text: "Tumis Kangkung", is_correct: false }, { answer_text: "Gulai Nangka", is_correct: false }], hint: "Rasanya segar dan cocok dengan nasi", },
      { id: 3, question_text: "Untuk memasak serabi khas Bandung biasanya menggunakan apa?", multiple_choices: [{ answer_text: "Tepung Beras", is_correct: true }, { answer_text: "Tepung Terigu", is_correct: false }, { answer_text: "Sagu", is_correct: false }, { answer_text: "Jagung", is_correct: false }], hint: "Terbuat dari padi", },
      { id: 4, question_text: "Berapa lama proses memasak sate maranggi?", multiple_choices: [{ answer_text: "10 menit", is_correct: false }, { answer_text: "30 menit", is_correct: true }, { answer_text: "1 jam", is_correct: false }, { answer_text: "2 jam", is_correct: false }], hint: "Waktunya sedang, tidak terlalu lama", },
      { id: 5, question_text: "Siapa penemu dodol dan bagaimana sejarahnya hingga menjadi makanan tradisional?", multiple_choices: [{ answer_text: "Tidak diketahui", is_correct: true }, { answer_text: "Sunan Kalijaga", is_correct: false }, { answer_text: "Prabu Siliwangi", is_correct: false }, { answer_text: "Raden Wijaya", is_correct: false }], hint: "Asal usulnya sudah sangat lama", },
    ],
    player2Cards: [
      { id: 6, question_text: "Rendang adalah makanan khas dari daerah mana?", multiple_choices: [{ answer_text: "Padang", is_correct: true }, { answer_text: "Jakarta", is_correct: false }, { answer_text: "Bandung", is_correct: false }, { answer_text: "Surabaya", is_correct: false }], hint: "Daerah Sumatera Barat", },
      { id: 7, question_text: "Apa bahan utama pembuatan gudeg?", multiple_choices: [{ answer_text: "Nangka muda", is_correct: true }, { answer_text: "Pepaya muda", is_correct: false }, { answer_text: "Kelapa muda", is_correct: false }, { answer_text: "Pisang muda", is_correct: false }], hint: "Buah yang besar dan berduri", },
      { id: 8, question_text: "Sate Padang menggunakan bumbu apa?", multiple_choices: [{ answer_text: "Kuah kuning", is_correct: true }, { answer_text: "Kecap manis", is_correct: false }, { answer_text: "Sambal kacang", is_correct: false }, { answer_text: "Bumbu kare", is_correct: false }], hint: "Warnanya kuning dan berkuah", },
      { id: 9, question_text: "Makanan khas Betawi yang terkenal adalah?", multiple_choices: [{ answer_text: "Kerak telor", is_correct: true }, { answer_text: "Bakso", is_correct: false }, { answer_text: "Mie ayam", is_correct: false }, { answer_text: "Nasi goreng", is_correct: false }], hint: "Terbuat dari telur dan beras ketan", },
      { id: 10, question_text: "Pempek adalah makanan khas dari?", multiple_choices: [{ answer_text: "Palembang", is_correct: true }, { answer_text: "Medan", is_correct: false }, { answer_text: "Makassar", is_correct: false }, { answer_text: "Banjarmasin", is_correct: false }], hint: "Kota di Sumatera Selatan", },
    ],
    player3Cards: [
      { id: 11, question_text: "Rawon adalah makanan khas dari?", multiple_choices: [{ answer_text: "Surabaya", is_correct: true }, { answer_text: "Jakarta", is_correct: false }, { answer_text: "Bandung", is_correct: false }, { answer_text: "Semarang", is_correct: false }], hint: "Kota pahlawan di Jawa Timur", },
      { id: 12, question_text: "Apa yang membuat rawon berwarna hitam?", multiple_choices: [{ answer_text: "Kluwek", is_correct: true }, { answer_text: "Kecap", is_correct: false }, { answer_text: "Tauco", is_correct: false }, { answer_text: "Petis", is_correct: false }], hint: "Bumbu yang berwarna hitam alami", },
      { id: 13, question_text: "Soto Betawi menggunakan santan dari?", multiple_choices: [{ answer_text: "Kelapa", is_correct: true }, { answer_text: "Kacang", is_correct: false }, { answer_text: "Susu", is_correct: false }, { answer_text: "Kemiri", is_correct: false }], hint: "Buah yang berair dan berbulu", },
      { id: 14, question_text: "Makanan khas Sunda yang terkenal adalah?", multiple_choices: [{ answer_text: "Nasi liwet", is_correct: true }, { answer_text: "Nasi gudeg", is_correct: false }, { answer_text: "Nasi padang", is_correct: false }, { answer_text: "Nasi rawon", is_correct: false }], hint: "Nasi yang dimasak dengan cara khusus", },
      { id: 15, question_text: "Bahan utama membuat ketupat adalah?", multiple_choices: [{ answer_text: "Beras", is_correct: true }, { answer_text: "Tepung", is_correct: false }, { answer_text: "Jagung", is_correct: false }, { answer_text: "Singkong", is_correct: false }], hint: "Bahan pokok makanan Indonesia", },
    ],
    player4Cards: [
      { id: 16, question_text: "Coto Makassar berasal dari daerah?", multiple_choices: [{ answer_text: "Sulawesi Selatan", is_correct: true }, { answer_text: "Sulawesi Utara", is_correct: false }, { answer_text: "Sulawesi Tengah", is_correct: false }, { answer_text: "Sulawesi Tenggara", is_correct: false }], hint: "Pulau Sulawesi bagian selatan", },
      { id: 17, question_text: "Bahan utama es cendol adalah?", multiple_choices: [{ answer_text: "Tepung beras", is_correct: true }, { answer_text: "Tepung terigu", is_correct: false }, { answer_text: "Tepung ketan", is_correct: false }, { answer_text: "Tepung sagu", is_correct: false }], hint: "Tepung dari beras yang digiling", },
      { id: 18, question_text: "Makanan khas Batak yang terkenal adalah?", multiple_choices: [{ answer_text: "Arsik", is_correct: true }, { answer_text: "Rendang", is_correct: false }, { answer_text: "Gulai", is_correct: false }, { answer_text: "Sate", is_correct: false }], hint: "Masakan ikan khas Batak", },
      { id: 19, question_text: "Dodol Garut terbuat dari bahan utama?", multiple_choices: [{ answer_text: "Ketan", is_correct: true }, { answer_text: "Beras", is_correct: false }, { answer_text: "Jagung", is_correct: false }, { answer_text: "Singkong", is_correct: false }], hint: "Beras yang lengket", },
      { id: 20, question_text: "Minuman khas Bandung yang terkenal adalah?", multiple_choices: [{ answer_text: "Bandrek", is_correct: true }, { answer_text: "Bajigur", is_correct: false }, { answer_text: "Sekoteng", is_correct: false }, { answer_text: "Wedang jahe", is_correct: false }], hint: "Minuman hangat khas Sunda", },
    ],
    playerStatus: {
      player1: "available",
      player2: "available",
      player3: "available",
      player4: "available",
    },
  });

  const [activePlayerIndices, setActivePlayerIndices] = useState([]);
  const [currentPlayerGlobalIndex, setCurrentPlayerGlobalIndex] = useState(0); // Pemain yang gilirannya (baik melempar atau menjawab)
  const [playerTimersData, setPlayerTimersData] = useState(
    Array(4).fill(GAME_RULES.THROW_TIMER_DURATION)
  );

  const [sentCard, setSentCard] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestionForModal, setCurrentQuestionForModal] = useState(null);
  const [collectedHints, setCollectedHints] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const [currentTurnPhase, setCurrentTurnPhase] = useState("throwing"); // 'throwing' atau 'answering'
  const [lastThrowerGlobalIndex, setLastThrowerGlobalIndex] = useState(null); // Menyimpan index pemain terakhir yang melempar

  const getCurrentUserGlobalIndex = () => getPlayerGlobalIndex(currentUserId);

  const getRandomCardFromPool = useCallback(() => {
    const allAvailableCards = Object.values(gameState)
      .filter(value => Array.isArray(value) && value.every(item => typeof item === 'object' && 'id' in item && 'question_text' in item))
      .flatMap(cards => cards || []); 

    if (allAvailableCards.length === 0) {
      console.warn("Tidak ada kartu di pool untuk diambil secara acak!");
      return { id: Math.floor(Math.random() * 1000) + 100, question_text: "Kartu Tambahan Kosong", multiple_choices: [{answer_text: "Default", is_correct: false}], hint: "" };
    }

    const randomIndex = Math.floor(Math.random() * allAvailableCards.length);
    const chosenCard = { ...allAvailableCards[randomIndex] };

    const currentMaxId = Math.max(...allAvailableCards.map(c => c.id || 0), 0);
    chosenCard.id = currentMaxId + 1; 
    
    if (chosenCard.hasOwnProperty('is_penalty')) {
      delete chosenCard.is_penalty;
    }
    
    return chosenCard;
  }, [gameState]);


  // Inisialisasi pemain aktif dan penentuan giliran pertama
  useEffect(() => {
    const availableIndices = [];
    for (let i = 1; i <= 4; i++) {
      if (gameState.playerStatus[`player${i}`] === "available") {
        availableIndices.push(i - 1);
      }
    }
    setActivePlayerIndices(availableIndices);

    if (availableIndices.includes(GAME_RULES.FIRST_PLAYER)) {
      setCurrentPlayerGlobalIndex(GAME_RULES.FIRST_PLAYER);
      setCurrentTurnPhase("throwing");
      console.log("🎮 Game dimulai dengan Player 1 sebagai starter!");
    } else if (availableIndices.length > 0) {
      setCurrentPlayerGlobalIndex(availableIndices[0]);
      setCurrentTurnPhase("throwing");
      console.log(`🎮 Player 1 tidak tersedia, game dimulai dengan P${availableIndices[0] + 1}`);
    } else {
      setCurrentPlayerGlobalIndex(-1);
      console.log("❌ Tidak ada pemain yang tersedia!");
    }
  }, [gameState.playerStatus]);

  // Handler ketika waktu habis
  const handleTimeEnd = useCallback(() => {
    if (currentTurnPhase === "throwing") {
      console.log(`Waktu melempar habis untuk P_global:${currentPlayerGlobalIndex + 1}! Langsung berpindah giliran.`);
      // Jika fase melempar dan waktu habis, langsung pindah giliran tanpa penalti kartu
      const nextPlayerIndex = getNextPlayerIndex(
        currentPlayerGlobalIndex,
        activePlayerIndices,
        GAME_RULES.TURN_DIRECTION
      );
      setCurrentPlayerGlobalIndex(nextPlayerIndex);
      setCurrentTurnPhase("throwing"); // Tetap di fase melempar untuk giliran berikutnya
      setSentCard(null); // Reset kartu yang dilempar
      setCurrentQuestionForModal(null); // Reset pertanyaan
      setShowQuestionModal(false); // Pastikan ini false
      setLastThrowerGlobalIndex(null); // Reset last thrower
    } else if (currentTurnPhase === "answering") {
      console.log(`Waktu menjawab habis untuk P_global:${currentPlayerGlobalIndex + 1}! Jawaban dianggap salah. Menambah 1 kartu acak.`);
      // Jika fase menjawab dan waktu habis, ini dianggap jawaban salah, jadi berikan 1 kartu penalti
      const newRandomCard = getRandomCardFromPool();

      setGameState(prevState => {
        const playerAnsweringId = `player${currentPlayerGlobalIndex + 1}`;
        const newCards = [...prevState[`${playerAnsweringId}Cards`], newRandomCard]; // Menambah HANYA 1 kartu
        return {
          ...prevState,
          [`${playerAnsweringId}Cards`]: newCards,
        };
      });

      // Penutupan modal akan ditunda 1 detik, lalu pindah giliran
      setTimeout(() => {
        setShowQuestionModal(false);
        setCurrentQuestionForModal(null);
        setSentCard(null);

        // Setelah menjawab, giliran berpindah ke pemain berikutnya yang akan melempar kartu
        const nextThrowerIndex = getNextPlayerIndex(
            lastThrowerGlobalIndex,
            activePlayerIndices,
            GAME_RULES.TURN_DIRECTION
        );
        setCurrentPlayerGlobalIndex(nextThrowerIndex);
        setCurrentTurnPhase("throwing");
        setLastThrowerGlobalIndex(null);
      }, 1000);
    }
  }, [activePlayerIndices, currentPlayerGlobalIndex, currentTurnPhase, gameState, lastThrowerGlobalIndex, getRandomCardFromPool]);


  // Data yang diteruskan ke hook timer
  const gameDataForTimer = {
    isMyTurn: true,
    currentPlayerIndex: currentPlayerGlobalIndex,
    playerTimers: playerTimersData,
    topicID: "nusa-card",
    gameID: "game-id",
    roomID: "room-id",
    players: activePlayerIndices.map((idx) => ({ id: `player${idx + 1}` })),
  };

  const [timeLeft, resetTimer] = usePlayerTimer(
    currentTurnPhase === "throwing" ? GAME_RULES.THROW_TIMER_DURATION : GAME_RULES.ANSWER_TIMER_DURATION,
    handleTimeEnd,
    gameDataForTimer
  );

  // Reset timer setiap kali giliran pemain atau fase berubah
  useEffect(() => {
    const targetPlayerIndexForTimer = currentPlayerGlobalIndex; 
    
    if (activePlayerIndices.length > 0 && targetPlayerIndexForTimer !== null && targetPlayerIndexForTimer !== -1) {
      console.log(
        `NusaCard global effect: Giliran dan fase berubah. Mereset timer. Current Phase: ${currentTurnPhase}, Current Player Global Index: ${currentPlayerGlobalIndex}`
      );
      resetTimer();
    }
  }, [currentPlayerGlobalIndex, currentTurnPhase, resetTimer, activePlayerIndices.length]);

  // Perbarui data timer pemain dengan waktu yang tersisa saat ini
  useEffect(() => {
    setPlayerTimersData((prev) => {
      const newTimers = [...prev];
      if (
        currentPlayerGlobalIndex !== -1 &&
        newTimers[currentPlayerGlobalIndex] !== undefined
      ) {
        newTimers[currentPlayerGlobalIndex] = timeLeft;
      }
      return newTimers;
    });
  }, [timeLeft, currentPlayerGlobalIndex]);

  // Memeriksa apakah giliran pemain tertentu (baik melempar atau menjawab)
  const isPlayerTurn = useCallback((playerGlobalIndex) => {
    return currentPlayerGlobalIndex === playerGlobalIndex; 
  }, [currentPlayerGlobalIndex]);

  // Mendapatkan sisa waktu pemain
  const getPlayerTimeLeft = useCallback((playerGlobalIndex) => {
    if (isPlayerTurn(playerGlobalIndex)) {
        return timeLeft;
    }
    return currentTurnPhase === "throwing" ? GAME_RULES.THROW_TIMER_DURATION : GAME_RULES.ANSWER_TIMER_DURATION;
  }, [timeLeft, isPlayerTurn, currentTurnPhase]);


  // Memeriksa apakah giliran pengguna saat ini untuk melempar kartu
  const isMyTurn = useCallback(() => {
    return currentPlayerGlobalIndex === getCurrentUserGlobalIndex() && currentTurnPhase === "throwing";
  }, [currentPlayerGlobalIndex, currentUserId, currentTurnPhase]);

  // Memeriksa apakah giliran pengguna saat ini untuk menjawab pertanyaan
  const isMyTurnToAnswer = useCallback(() => {
    return currentPlayerGlobalIndex === getCurrentUserGlobalIndex() && currentTurnPhase === "answering";
  }, [currentPlayerGlobalIndex, currentUserId, currentTurnPhase]);

  // Handler ketika kartu diklik oleh pemain
  const handleCardClicked = useCallback((cardData) => {
    if (!isMyTurn()) { 
      console.log("Bukan giliran Anda untuk melempar kartu!");
      return;
    }

    setSentCard(cardData);
    setCurrentQuestionForModal(cardData);
    setLastThrowerGlobalIndex(currentPlayerGlobalIndex); // Simpan index pemain yang melempar

    // Pindah currentPlayerGlobalIndex ke pemain berikutnya yang akan MENJAWAB
    const nextPlayerToAnswerIndex = getNextPlayerIndex(
      currentPlayerGlobalIndex, 
      activePlayerIndices,
      GAME_RULES.TURN_DIRECTION
    );

    setCurrentPlayerGlobalIndex(nextPlayerToAnswerIndex); 
    setShowQuestionModal(true); 
    setCurrentTurnPhase("answering"); 
    
    setGameState((prevState) => {
      const currentUserCards = getPlayerCards(currentUserId, prevState);
      const newCards = currentUserCards.filter((card) => card.id !== cardData.id);

      return {
        ...prevState,
        [`${currentUserId}Cards`]: newCards,
      };
    });
  }, [isMyTurn, currentPlayerGlobalIndex, activePlayerIndices, currentUserId]);

  const handleAnswerSubmittedByPlayer = useCallback((result) => {
    const { isCorrect, hint } = result;

    if (!isMyTurnToAnswer()) { 
        console.log("Bukan giliran Anda untuk menjawab!");
        return;
    }

    if (!isCorrect) {
      if (hint) {
        setCollectedHints((prevHints) => {
          if (!prevHints.includes(hint)) {
            return [...prevHints, hint];
          }
          return prevHints;
        });
        setShowOffcanvas(true);
      }
      console.log("Jawaban salah! Menambah 1 kartu acak.");
      const newRandomCard = getRandomCardFromPool(); 
      
      setGameState(prevState => {
        const playerAnsweringId = `player${currentPlayerGlobalIndex + 1}`; 
        const newCards = [...prevState[`${playerAnsweringId}Cards`], newRandomCard]; 
        return {
          ...prevState,
          [`${playerAnsweringId}Cards`]: newCards,
        };
      });

    } else {
      console.log("Jawaban benar! Tidak menambah kartu.");
      // TIDAK ADA PENAMBAHAN KARTU JIKA JAWABAN BENAR
    }

    // Penutupan modal akan ditunda 1 detik, lalu pindah giliran
    setTimeout(() => {
        setShowQuestionModal(false);
        setCurrentQuestionForModal(null);
        setSentCard(null);

        // Setelah menjawab, giliran berpindah ke pemain berikutnya yang akan melempar kartu
        const nextThrowerIndex = getNextPlayerIndex(
            lastThrowerGlobalIndex, 
            activePlayerIndices,
            GAME_RULES.TURN_DIRECTION
        );
        setCurrentPlayerGlobalIndex(nextThrowerIndex); 
        setCurrentTurnPhase("throwing"); 
        setLastThrowerGlobalIndex(null); 
    }, 1000); 
  }, [isMyTurnToAnswer, currentPlayerGlobalIndex, activePlayerIndices, getRandomCardFromPool, lastThrowerGlobalIndex]); // Tambahkan lastThrowerGlobalIndex ke dependency array

  const handleCloseQuestionModal = useCallback(() => {
    // *** PERUBAHAN: Fungsi ini hanya untuk menutup modal dan mereset kartu/pertanyaan.
    // Logic penalti sudah ditangani oleh handleTimeEnd (jika waktu habis) atau
    // handleAnswerSubmittedByPlayer (jika jawaban disubmit).
    // JANGAN PANGGIL handleAnswerSubmittedByPlayer lagi di sini. ***
    if (currentTurnPhase === "answering") {
        console.log("Modal pertanyaan ditutup secara manual.");
        // handleAnswerSubmittedByPlayer({ isCorrect: false }); // BARIS INI DIHAPUS
    }
    // Cukup set state untuk menutup modal
    setShowQuestionModal(false);
    setCurrentQuestionForModal(null);
    setSentCard(null);
  }, [currentTurnPhase]); // Hapus handleAnswerSubmittedByPlayer dari dependency array

  const handleDebugSwitchTurn = useCallback(() => {
    const nextGlobalPlayerIndex = getNextPlayerIndex(
      currentPlayerGlobalIndex,
      activePlayerIndices,
      GAME_RULES.TURN_DIRECTION
    );
    console.log(
      `Debug Switch: Mengubah giliran dari P${currentPlayerGlobalIndex + 1} ke P${nextGlobalPlayerIndex + 1}`
    );
    setCurrentPlayerGlobalIndex(nextGlobalPlayerIndex);
    setCurrentTurnPhase("throwing");
    setShowQuestionModal(false);
    setLastThrowerGlobalIndex(null);
    setSentCard(null);
    setCurrentQuestionForModal(null);
  }, [activePlayerIndices, currentPlayerGlobalIndex]);

  return {
    gameState,
    currentUserId,
    currentPlayerGlobalIndex,
    playerTimersData,
    timeLeft,
    isMyTurn,
    isMyTurnToAnswer,
    sentCard,
    showQuestionModal,
    currentQuestionForModal,
    collectedHints,
    showOffcanvas,
    setCurrentUserId,
    handleDebugSwitchTurn,
    setShowOffcanvas,
    handleCloseOffcanvas: () => setShowOffcanvas(false),
    handleCardClicked,
    handleAnswerSubmittedByPlayer,
    handleCloseQuestionModal,
    getPlayerGlobalIndex,
    getPlayerCards: (playerId) => getPlayerCards(playerId, gameState),
    getPlayerStatus: (playerId) => getPlayerStatus(playerId, gameState),
    isPlayerTurn,
    getPlayerTimeLeft,
    currentTurnPhase,
    playerAnsweringGlobalIndex: currentPlayerGlobalIndex,
    TIMER_THROW_DURATION: GAME_RULES.THROW_TIMER_DURATION,
    TIMER_ANSWER_DURATION: GAME_RULES.ANSWER_TIMER_DURATION,
  };
}

export default useGameLogic;