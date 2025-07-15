import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col } from "react-bootstrap";
import HeaderGame from "../components/games/HeaderGame";
import BackStackCard from "../components/games/nuca/BackStackCard";
import PlayingStackCard from "../components/games/nuca/PlayingStackCard";
import SentCard from "../components/games/nuca/SentCardPlayer";
import PlayerProfileNuca from "../components/games/nuca/PlayerProfileNuca";
import NotAvailPlayer from "../assets/games/nuca/notAvailPlayerNuca.png";
import ModalQuestion from "../components/games/nuca/ModalQuestion";
import { usePlayerTimer } from "../utils/timerUtils"; // Pastikan path ini benar
import "../style/routes/NusaCard.css";

const DEFAULT_TIMER_DURATION = 15; // Waktu default untuk setiap giliran

function NusaCard() {
  const [gameState, setGameState] = useState({
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
    player2Cards: 5,
    player3Cards: 5,
    player4Cards: 5,
    playerStatus: {
      player2: "available",
      player3: "available", // Diubah ke 'available' untuk pengujian
      player4: "available", // Diubah ke 'available' untuk pengujian
    },

    // ========== DATA GAMESTATE UTAMA (TERMASUK UNTUK TIMER) ==========
    currentPlayerIndex: 0, // Index pemain yang sedang aktif (0: P1, 1: P2, 2: P3, 3: P4)
    playerTimers: [
      DEFAULT_TIMER_DURATION,
      DEFAULT_TIMER_DURATION,
      DEFAULT_TIMER_DURATION,
      DEFAULT_TIMER_DURATION,
    ], // Timer untuk setiap pemain
    activePlayerIndices: [0, 1, 2, 3], // Contoh awal: semua pemain aktif (akan dihitung ulang di useEffect)

    // Data untuk usePlayerTimer (bisa diisi dari API nanti)
    isGlobalTimerController: true, // Instance usePlayerTimer ini adalah controller global, selalu aktif
    gameTopicID: "nusa-card",
    gameID: "game-id",
    roomID: "room-id",
    players: Array(4)
      .fill(null)
      .map((_, i) => ({ id: `player${i + 1}` })), // Hanya pemain yang aktif (akan dihitung ulang)
    // ========================================================================
  });

  const [userProfile] = useState({});
  const [sentCard, setSentCard] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestionForModal, setCurrentQuestionForModal] = useState(null);
  const [collectedHints, setCollectedHints] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const handleCloseOffcanvas = () => setShowOffcanvas(false);

  // --- Logika Timer dan Giliran ---
  // Callback: Ini HANYA dipanggil oleh usePlayerTimer saat waktu habis
  const handleTimeEnd = useCallback(() => {
    setGameState((prev) => {
      // Cari indeks pemain saat ini dalam daftar pemain aktif
      const currentIndexInActiveList = prev.activePlayerIndices.indexOf(
        prev.currentPlayerIndex
      );
      // Hitung indeks pemain berikutnya dalam daftar aktif
      const nextIndexInActiveList =
        (currentIndexInActiveList + 1) % prev.activePlayerIndices.length;
      // Dapatkan indeks global pemain berikutnya
      const nextGlobalPlayerIndex =
        prev.activePlayerIndices[nextIndexInActiveList];

      console.log(
        `Waktu habis untuk P_global:${
          prev.currentPlayerIndex + 1
        }! Memindahkan giliran dari P${prev.currentPlayerIndex + 1} ke P${
          nextGlobalPlayerIndex + 1
        }`
      );

      return {
        ...prev,
        currentPlayerIndex: nextGlobalPlayerIndex,
        // Reset timer untuk pemain yang baru aktif (di state playerTimers)
        playerTimers: prev.playerTimers.map((timer, index) =>
          index === nextGlobalPlayerIndex ? DEFAULT_TIMER_DURATION : timer
        ),
      };
    });
  }, []); // Dependensi dikosongkan karena menggunakan updater function

  // Data game untuk usePlayerTimer (ambil langsung dari gameState)
  const gameDataForTimer = {
    isMyTurn: gameState.isGlobalTimerController,
    currentPlayerIndex: gameState.currentPlayerIndex,
    playerTimers: gameState.playerTimers,
    topicID: gameState.gameTopicID,
    gameID: gameState.gameID,
    roomID: gameState.roomID,
    players: gameState.players,
  };

  const [timeLeft, resetTimer] = usePlayerTimer(
    DEFAULT_TIMER_DURATION,
    handleTimeEnd,
    gameDataForTimer
  );

  // Effect untuk menginisialisasi daftar pemain aktif (activePlayerIndices) saat komponen dimuat atau playerStatus berubah
  useEffect(() => {
    setGameState((prev) => {
      const availableIndices = [];
      availableIndices.push(0); // Player 1 (user) selalu aktif (indeks 0)
      if (prev.playerStatus.player2 === "available") availableIndices.push(1);
      if (prev.playerStatus.player3 === "available") availableIndices.push(2);
      if (prev.playerStatus.player4 === "available") availableIndices.push(3);

      let newCurrentPlayerIndex = prev.currentPlayerIndex;
      // Jika pemain aktif saat ini tidak lagi available, pindah ke yang pertama di daftar
      if (!availableIndices.includes(newCurrentPlayerIndex)) {
        newCurrentPlayerIndex =
          availableIndices.length > 0 ? availableIndices[0] : -1;
      }

      return {
        ...prev,
        activePlayerIndices: availableIndices,
        currentPlayerIndex: newCurrentPlayerIndex,
        players: availableIndices.map((idx) => ({ id: `player${idx + 1}` })), // Update daftar players untuk usePlayerTimer
      };
    });
  }, [gameState.playerStatus]);

  // Efek untuk mereset timer pada usePlayerTimer saat currentPlayerIndex berubah
  useEffect(() => {
    // Logging ini hanya untuk debugging, tidak mempengaruhi logika
    console.log(
      `NusaCard global effect: Global Player Index changed to ${gameState.currentPlayerIndex}. Mereset timer.`
    );
    if (
      gameState.activePlayerIndices.length > 0 &&
      gameState.currentPlayerIndex !== -1
    ) {
      resetTimer();
    }
  }, [
    gameState.currentPlayerIndex,
    resetTimer,
    gameState.activePlayerIndices.length,
  ]);

  // Update state playerTimers lokal NusaCard setiap detik dari timeLeft yang diberikan usePlayerTimer
  useEffect(() => {
    setGameState((prev) => {
      const newTimers = [...prev.playerTimers];
      if (
        prev.currentPlayerIndex !== -1 &&
        newTimers[prev.currentPlayerIndex] !== undefined
      ) {
        newTimers[prev.currentPlayerIndex] = timeLeft;
      }
      return {
        ...prev,
        playerTimers: newTimers,
      };
    });
  }, [timeLeft, gameState.currentPlayerIndex]);

  // Fungsi helper untuk menentukan apakah ini giliran seorang pemain (berdasarkan indeks global)
  const isPlayerTurn = (playerGlobalIndex) => {
    return gameState.currentPlayerIndex === playerGlobalIndex;
  };

  // Fungsi helper untuk mendapatkan sisa waktu yang ditampilkan pada profil pemain
  const getPlayerTimeLeft = (playerGlobalIndex) => {
    return isPlayerTurn(playerGlobalIndex) ? timeLeft : DEFAULT_TIMER_DURATION;
  };

  // Fungsi untuk manual switch turn (untuk debug)
  const handleDebugSwitchTurn = useCallback(() => {
    setGameState((prev) => {
      const currentListIndex = prev.activePlayerIndices.indexOf(
        prev.currentPlayerIndex
      );
      const nextListIndex =
        (currentListIndex + 1) % prev.activePlayerIndices.length;
      const nextGlobalPlayerIndex = prev.activePlayerIndices[nextListIndex];

      console.log(
        `Debug Switch: Mengubah giliran dari P${
          prev.currentPlayerIndex + 1
        } ke P${nextGlobalPlayerIndex + 1}`
      );

      // Reset timer untuk pemain yang baru aktif (di state playerTimers)
      const newPlayerTimers = prev.playerTimers.map((timer, index) =>
        index === nextGlobalPlayerIndex ? DEFAULT_TIMER_DURATION : timer
      );

      return {
        ...prev,
        currentPlayerIndex: nextGlobalPlayerIndex,
        playerTimers: newPlayerTimers,
      };
    });
  }, []); // Dependensi dikosongkan karena menggunakan updater function

  // --- FUNGSI ASLI ANDA UNTUK handleP1CardClicked ---
  const handleP1CardClicked = (cardData, originalIndex) => {
    setSentCard(cardData);
    setCurrentQuestionForModal(cardData);
    setShowQuestionModal(true);

    setTimeout(() => {
      setGameState((prevState) => {
        const newCards = prevState.player1Cards.filter(
          (card) => card.id !== cardData.id
        );
        return {
          ...prevState,
          player1Cards: newCards,
        };
      });
    }, 1000);
  };

  // --- FUNGSI ASLI ANDA UNTUK handleAnswerSubmittedByPlayer ---
  const handleAnswerSubmittedByPlayer = useCallback((result) => {
    const { isCorrect, hint } = result;
    if (!isCorrect && hint) {
      setCollectedHints((prevHints) => {
        if (!prevHints.includes(hint)) {
          return [...prevHints, hint];
        }
        return prevHints;
      });
      setShowOffcanvas(true);
    } else if (isCorrect) {
      console.log("Jawaban benar!");
    }
  }, []);

  // --- FUNGSI ASLI ANDA UNTUK handleCloseQuestionModal ---
  const handleCloseQuestionModal = useCallback(() => {
    setShowQuestionModal(false);
    setCurrentQuestionForModal(null);
    setSentCard(null);
  }, []);

  return (
    <div className="nusa-page d-flex flex-column">
      <HeaderGame
        hints={collectedHints}
        showOffcanvas={showOffcanvas}
        setShowOffcanvas={setShowOffcanvas}
        onCloseOffcanvas={handleCloseOffcanvas}
      />

      {/* Debug Info */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "12px",
          zIndex: 9999,
        }}
      >
        <div>
          **Current Active Player:** P{gameState.currentPlayerIndex + 1}
        </div>
        <div>**Time Left for Current:** {timeLeft}s</div>
        <hr style={{ borderColor: "white", margin: "5px 0" }} />
        {/* Informasi Timer Tiap Player */}
        <div>**Player Timers:**</div>
        {/* Map berdasarkan indeks global 0-3 untuk menampilkan P1, P2, P3, P4 */}
        {gameState.playerTimers.map((timer, index) => (
          <div key={index}>
            P{index + 1}: {timer}s {isPlayerTurn(index) && "(ACTIVE)"}
          </div>
        ))}
        <hr style={{ borderColor: "white", margin: "5px 0" }} />
        {/* Button Next Player */}
        <button
          onClick={handleDebugSwitchTurn}
          style={{ marginTop: "5px", fontSize: "10px", padding: "5px 10px" }}
        >
          Next Player (Debug)
        </button>
      </div>

      <Container
        fluid
        id="nuca-container"
        className="flex-grow-1 d-flex flex-column justify-content-between"
      >
        {/* Player 3 (Top) - Index 2 */}
        <Row className="justify-content-center align-items-center">
          <Col xs="auto" className="position-relative">
            {gameState.playerStatus.player3 === "available" && (
              <PlayerProfileNuca
                userProfile={userProfile}
                position="top-left"
                totalCards={gameState.player3Cards}
                isActive={isPlayerTurn(2)}
                timeLeft={getPlayerTimeLeft(2)}
                maxTime={DEFAULT_TIMER_DURATION}
              />
            )}
            <BackStackCard
              totalCards={gameState.player3Cards}
              position="top"
              showNotAvail={gameState.playerStatus.player3 === "not_available"}
              notAvailImage={NotAvailPlayer}
            />
          </Col>
        </Row>

        {/* Player 2 (Left) - Index 1, Middle Deck, Player 4 (Right) - Index 3 */}
        <Row className="d-flex justify-content-between align-items-center mx-3 mx-lg-4">
          <Col md={4}>
            <div className="position-relative">
              {gameState.playerStatus.player2 === "available" && (
                <PlayerProfileNuca
                  userProfile={userProfile}
                  position="left"
                  totalCards={gameState.player2Cards}
                  isActive={isPlayerTurn(1)}
                  timeLeft={getPlayerTimeLeft(1)}
                  maxTime={DEFAULT_TIMER_DURATION}
                />
              )}
              <BackStackCard
                totalCards={gameState.player2Cards}
                position="left"
                showNotAvail={
                  gameState.playerStatus.player2 === "not_available"
                }
                notAvailImage={NotAvailPlayer}
              />
            </div>
          </Col>

          <Col
            md={4}
            className="d-flex justify-content-center align-items-center position-relative"
          >
            <BackStackCard
              totalCards={5}
              position="middle"
              showShuffle={true}
            />
            {sentCard && <SentCard cardData={sentCard} />}
          </Col>

          <Col md={4}>
            <div className="position-relative">
              {gameState.playerStatus.player4 === "available" && (
                <PlayerProfileNuca
                  userProfile={userProfile}
                  position="right"
                  totalCards={gameState.player4Cards}
                  isActive={isPlayerTurn(3)}
                  timeLeft={getPlayerTimeLeft(3)}
                  maxTime={DEFAULT_TIMER_DURATION}
                />
              )}
              <BackStackCard
                totalCards={gameState.player4Cards}
                position="right"
                showNotAvail={
                  gameState.playerStatus.player4 === "not_available"
                }
                notAvailImage={NotAvailPlayer}
              />
            </div>
          </Col>
        </Row>

        {/* Player 1 (Bottom) - Index 0 */}
        <Row className="d-flex justify-content-center align-items-center mb-4">
          <Col xs="auto" className="position-relative">
            <PlayingStackCard
              cards={gameState.player1Cards}
              onCardClick={handleP1CardClicked}
            />
            <PlayerProfileNuca
              userProfile={userProfile}
              position="bottom-right"
              totalCards={gameState.player1Cards.length}
              isActive={isPlayerTurn(0)}
              timeLeft={getPlayerTimeLeft(0)}
              maxTime={DEFAULT_TIMER_DURATION}
            />
          </Col>
        </Row>
      </Container>

      {/* Modal Pertanyaan */}
      <ModalQuestion
        show={showQuestionModal}
        questionData={currentQuestionForModal}
        onClose={handleCloseQuestionModal}
        onSubmitAnswer={handleAnswerSubmittedByPlayer}
        isMyTurn={isPlayerTurn(0)}
      />
    </div>
  );
}

export default NusaCard;
