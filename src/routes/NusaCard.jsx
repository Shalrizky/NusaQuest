import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row, Image } from "react-bootstrap";
import "../style/routes/NusaCard.css";
import DeckPlayer from "../components/games/DeckPlayer";
import BottomDeckCard from "../components/games/BottomDeckCard";
import HeaderNuca from "../components/games/HeaderGame";
import PertanyaanNuca, {
  ListPertanyaanNuca,
} from "../components/games/PertanyaanNuca";
import Potion from "../components/games/potion";
// image import
import potionImage from "../assets/games/Utangga/potion.png";
import shuffleIcon from "../assets/common/shuffle.png";
import checklist from "../assets/common/checklist.png";
import cross from "../assets/common/cross.png";
import victoryImage from "../assets/games/Utangga/victory.png";
import Achievement from "../assets/games/Utangga/achievement1.png";
import Achievement2 from "../assets/games/Utangga/achievement2.png";

// Definisi pemain dummy
const players = [
  {
    id: 1,
    name: "Abrar",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
  {
    id: 2,
    name: "Sahel",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
  {
    id: 3,
    name: "Rangga",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
  {
    id: 4,
    name: "Natah",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
];

const getRandomQuestion = () => {
  const randomCategory =
    ListPertanyaanNuca[Math.floor(Math.random() * ListPertanyaanNuca.length)];
  const randomQuestion =
    randomCategory.questions[
      Math.floor(Math.random() * randomCategory.questions.length)
    ];
  return {
    category: randomCategory.category,
    question: randomQuestion.question,
    options: randomQuestion.options,
    correctAnswer: randomQuestion.correctAnswer,
  };
};

function NusaCard() {
  const navigate = useNavigate();
  const [deckCounts, setDeckCounts] = useState({
    top: 4,
    left: 4,
    right: 4,
  });

  // Inisialisasi cards dengan pertanyaan awal
  const [cards, setCards] = useState(() => {
    const newCards = Array.from({ length: 4 }, () => getRandomQuestion());
    return newCards;
  });

  const isFirstRender = useRef(true);

  const [lastActiveDeck, setLastActiveDeck] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExitingPopup, setIsExitingPopup] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");

  // Tambahkan state baru untuk menandai deck yang habis
  const [deckDepleted, setDeckDepleted] = useState(null);

  // Tambahkan variabel state untuk mengatur giliran
  const deckOrder = ["bottom", "right", "top", "left"];
  const [currentTurn, setCurrentTurn] = useState("bottom");

  // Tambahkan variabel state untuk mencegah double click
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // Tambahkan variabel state untuk timer
  const [timeRemaining, setTimeRemaining] = useState(15);
  const timerRef = useRef(null);

  // Tambahkan state untuk pemain yang harus menjawab
  const [answeringPlayer, setAnsweringPlayer] = useState(null);

  // State dan ref untuk timer inaktivitas
  const [inactivityTimeRemaining, setInactivityTimeRemaining] = useState(30000);
  const inactivityTimerRef = useRef(null);

  // Fungsi untuk reset timer inaktivitas
  const resetInactivityTimer = () => {
    setInactivityTimeRemaining(30000);
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
    }
    startInactivityTimer();
  };

  // Fungsi untuk memulai timer inaktivitas
  const startInactivityTimer = () => {
    inactivityTimerRef.current = setInterval(() => {
      setInactivityTimeRemaining((prevTime) => {
        console.log(`Waktu inaktivitas tersisa: ${prevTime - 1} detik`);
        if (prevTime - 1 <= 0) {
          clearInterval(inactivityTimerRef.current);
          navigate('/'); // Mengarahkan ke halaman home
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // useEffect untuk timer inaktivitas
  useEffect(() => {
    // Memulai timer saat komponen dimount
    startInactivityTimer();

    // Menambahkan event listener untuk klik
    window.addEventListener('click', resetInactivityTimer);

    // Cleanup saat komponen unmount
    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
      window.removeEventListener('click', resetInactivityTimer);
    };
  }, [navigate]);

  useEffect(() => {
    if (isFirstRender.current) {
      // Jika render pertama, set flag menjadi false dan jangan lakukan apa-apa
      isFirstRender.current = false;
      return;
    }

    // Periksa deck top, left, right
    Object.keys(deckCounts).forEach((deck) => {
      if (deckCounts[deck] === 0 && !deckDepleted) {
        console.log(`Deck ${deck} habis!`);
        setDeckDepleted(deck);
      }
    });

    // Periksa deck bottom (cards)
    if (cards.length === 0 && !deckDepleted) {
      console.log(`Deck bottom habis!`);
      setDeckDepleted('bottom');
    }
  }, [deckCounts, cards, deckDepleted]);

  // useEffect untuk mengatur timer ketika popup muncul
  useEffect(() => {
    if (showPopup && answeringPlayer) {
      setTimeRemaining(15);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [showPopup, answeringPlayer]);

  useEffect(() => {
    if (timeRemaining === 0) handleTimeOut();
  }, [timeRemaining]);

  const handleTimeOut = () => {
    // Jika waktu habis dan pemain belum menjawab
    handleAnswerSelect(false, true); // Anggap jawaban salah
  };

  const handleDeckCardClick = (deck) => {
    resetInactivityTimer();
    if (currentTurn !== deck || showPopup || isActionInProgress) return;
    if (deckCounts[deck] > 0) {
      setIsActionInProgress(true);
      setDeckCounts((prevCounts) => ({
        ...prevCounts,
        [deck]: prevCounts[deck] - 1,
      }));
      setLastActiveDeck(deck);
      const newQuestion = getRandomQuestion();
      setActiveCard(newQuestion);

      // Tentukan pemain yang harus menjawab
      let answeringPlayer;
      if (deck === "bottom") {
        answeringPlayer = "right";
      } else if (deck === "right") {
        answeringPlayer = "top";
      } else if (deck === "top") {
        answeringPlayer = "left";
      } else if (deck === "left") {
        answeringPlayer = "bottom";
      }
      setAnsweringPlayer(answeringPlayer);
      setShowPopup(true);
    }
  };

  const handleBottomCardClick = (card, index) => {
    if (currentTurn !== "bottom" || showPopup || isActionInProgress) return;
    setIsActionInProgress(true);
    console.log(card);
    setActiveCard(card);
    setShowPopup(true);
    setLastActiveDeck("bottom");
    removeCardFromDeck(index);
    setIsLoading("right");

    // Tentukan pemain yang harus menjawab
    let answeringPlayer = "right";
    setAnsweringPlayer(answeringPlayer);
  };

  const removeCardFromDeck = (index) => {
    setCards((prevCards) =>
      prevCards.filter((_, cardIndex) => cardIndex !== index)
    );
  };

  const incrementDeckCount = (deck) => {
    if (deck === "bottom") {
      // Untuk deck bottom, tambahkan kartu baru ke array cards
      addNewCardToDeck();
    } else {
      // Untuk deck lain, tambahkan jumlah kartu di deckCounts
      setDeckCounts((prevCounts) => ({
        ...prevCounts,
        [deck]: prevCounts[deck] + 1,
      }));
    }
  };

  const addNewCardToDeck = () => {
    const newQuestion = getRandomQuestion();
    setCards((prevCards) => [
      ...prevCards,
      { ...newQuestion, isNew: true },
    ]);
  };

  const [answerStatus, setAnswerStatus] = useState({
    top: null,
    right: null,
    bottom: null,
    left: null,
  });

  const [feedbackIcon, setFeedbackIcon] = useState({
    show: false,
    isCorrect: null,
    position: null,
  });

  const updateAnswerStatus = (player, isCorrect) => {
    setAnswerStatus((prevStatus) => ({
      ...prevStatus,
      [player]: isCorrect,
    }));
  };

  const handleAnswerSelect = (isCorrect, wasTimeout = false) => {
    clearInterval(timerRef.current);
    setIsLoading(null);
    setIsCorrectAnswer(isCorrect);

    // Tampilkan ikon umpan balik di profil pemain yang menjawab
    setFeedbackIcon({
      show: true,
      isCorrect: isCorrect,
      position: answeringPlayer,
    });

    updateAnswerStatus(answeringPlayer, isCorrect);

    if (!isCorrect && !wasTimeout) {
      // Tambahkan satu kartu ke deck pemain yang menjawab
      incrementDeckCount(answeringPlayer);
    }

    // Jika jawaban benar dan lastActiveDeck adalah "left", tambahkan kartu baru ke deck bawah
    if (isCorrect && lastActiveDeck === "left" && answeringPlayer !== "bottom") {
      addNewCardToDeck();
    }

    const nextTurn =
      deckOrder[(deckOrder.indexOf(lastActiveDeck) + 1) % deckOrder.length];
    setCurrentTurn(nextTurn);

    // Setelah pemain menjawab, periksa apakah ada deck yang habis
    if (deckDepleted && !victory) {
      setVictory(true);
      setWinner(deckDepleted);
    }

    setTimeout(() => {
      setIsCorrectAnswer(null);
      setActiveCard(null);
      setIsExitingPopup(true);

      setTimeout(() => {
        setShowPopup(false);
        setIsExitingPopup(false);
        setIsActionInProgress(false);
        setAnsweringPlayer(null);
        setFeedbackIcon({ show: false, isCorrect: null, position: null });

        setIsShuffling(true);
        setTimeout(() => {
          setIsShuffling(false);
        }, 500);

        setAnswerStatus((prevStatus) => ({
          ...prevStatus,
          [answeringPlayer]: null,
        }));
      }, 2000);
    }, 3000);
  };

  // Function to render feedback icon
  const renderFeedbackIcon = (position) => {
    if (!feedbackIcon.show || feedbackIcon.position !== position) return null;

    return (
      <div className="feedback-icon-container">
        <img
          src={feedbackIcon.isCorrect ? checklist : cross}
          alt={feedbackIcon.isCorrect ? "Correct" : "Incorrect"}
          className="feedback-icon-profile"
        />
      </div>
    );
  };

  // Fungsi untuk mendapatkan data pemain berdasarkan posisi
  const getPlayerByPosition = (position) => {
    switch (position) {
      case "bottom":
        return players[0];
      case "right":
        return players[1];
      case "top":
        return players[2];
      case "left":
        return players[3];
      default:
        return null;
    }
  };

  return (
    <Container
      fluid
      className="nuca-container d-flex justify-content-around flex-column"
    >
      <HeaderNuca layout="home" />

      <Row className="mb-5 justify-content-center align-items-center">
        <Col
          md={2}
          xs={12}
          className="text-center ms-5 ml-5 d-flex align-items-center position-relative"
        >
          {/* Container untuk DeckPlayer dan Gambar Profil */}
          <div
            className="d-flex align-items-center ml-5 ms-5 position-relative"
            style={{ position: "relative" }}
          >
            {/* Timer untuk pemain atas */}
            {showPopup && answeringPlayer === "top" && (
              <div
                className={`timer-overlay ${
                  timeRemaining <= 5 ? "shake-animation" : ""
                }`}
              >
                {timeRemaining}
              </div>
            )}
            <div
              onClick={() => handleDeckCardClick("top")}
              style={{ position: "relative" }}
            >
              <DeckPlayer
                count={deckCounts.top}
                isNew={deckCounts.top === 0}
                position="left"
              />
            </div>
            <Image
              src={getPlayerByPosition("top").photo}
              alt="Player Profile"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                marginLeft: "100px",
              }}
            />
            {renderFeedbackIcon("top")}
          </div>
        </Col>
      </Row>

      <Row className="mb-5 mt-0 justify-content-center align-items-center">
        {/* Deck Kiri dengan Gambar Player */}
        <Col md={4} xs={12} className="position-relative">
          <div
            className="d-flex flex-column align-items-center position-relative"
            onClick={() => handleDeckCardClick("left")}
            style={{ position: "relative" }}
          >
            {/* Timer untuk pemain kiri */}
            {showPopup && answeringPlayer === "left" && (
              <div className="timer-overlay">{timeRemaining}</div>
            )}
            <Image
              src={getPlayerByPosition("left").photo}
              alt="Player Left"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
              }}
            />
            {renderFeedbackIcon("left")}
            <DeckPlayer
              count={deckCounts.left}
              isNew={deckCounts.left === 0}
              style={{ transform: "rotate(900deg)" }}
            />
          </div>
        </Col>

        {/* Deck Tengah dengan Shuffle Icon */}
        <Col
          md={4}
          xs={12}
          className="deck-tengah position-relative d-flex justify-content-center align-items-center"
        >
          <DeckPlayer count={4} isNew={false} />
          <div
            className={`position-absolute d-flex justify-content-center align-items-center ${
              isShuffling ? "shuffle-rotate" : ""
            }`}
            style={{ width: "250px", height: "250px", zIndex: 1 }}
          >
            <Image
              src={shuffleIcon}
              alt="Shuffle Icon"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </Col>

        {/* Deck Kanan dengan Gambar Player */}
        <Col md={4} xs={12} className="position-relative">
          <div
            className="d-flex flex-column align-items-center position-relative"
            onClick={() => handleDeckCardClick("right")}
            style={{ position: "relative" }}
          >
            {/* Timer untuk pemain kanan */}
            {showPopup && answeringPlayer === "right" && (
              <div className="timer-overlay">{timeRemaining}</div>
            )}

            <Image
              src={getPlayerByPosition("right").photo}
              alt="Player Right"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
              }}
            />

            {renderFeedbackIcon("right")}

            <DeckPlayer
              count={deckCounts.right}
              isNew={deckCounts.right === 0}
              position="right"
              className="deck-kanan-rotate"
            />
          </div>
        </Col>
      </Row>

      {/* Bottom Deck Card */}
      <Row className="align-items-center justify-content-center">
        <Col xs={"auto"} className="text-center ml-5 ms-5 position-relative">
          <div style={{ position: "relative" }}>
            {/* Timer untuk pemain bawah */}
            {showPopup && answeringPlayer === "bottom" && (
              <div className="timer-overlay">{timeRemaining}</div>
            )}

            <BottomDeckCard
              cards={cards}
              onCardClick={handleBottomCardClick}
              showPopup={showPopup}
              isExitingPopup={isExitingPopup}
            />

            {renderFeedbackIcon("bottom")}
          </div>
        </Col>

        {/* Player Image di Samping Kanan */}
        <Col xs="auto" className="d-flex align-items-center p-3">
          <Image
            src={getPlayerByPosition("bottom").photo}
            alt="Player Bottom"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </Col>
      </Row>

      {/* Show the question popup */}
      {showPopup && activeCard && (
        <>
          <div style={{ position: "relative", zIndex: "2000" }}>
            <PertanyaanNuca
              question={activeCard.question}
              options={activeCard.options}
              correctAnswer={activeCard.correctAnswer}
              onAnswerSelect={handleAnswerSelect}
              isExiting={isExitingPopup}
            />
          </div>
          <Potion
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: "3000", // Potion berada di atas z-index PertanyaanNuca
            }}
          />
        </>
      )}

      {/* Show Overlay Victory */}
      {victory && (
        <div className="victory-overlay" onClick={() => navigate("/")}>
          <img
            src={victoryImage}
            alt="Victory Logo"
            className="victory-logo"
          />
          {/* Menghapus tampilan nama pemenang */}
          <p>Kamu mendapatkan:</p>
          <div className="rewards">
            <img
              src={Achievement}
              alt="achievement"
              className="Achievement1-logo"
            />
            <img
              src={Achievement2}
              alt="achievement2"
              className="Achievement2-logo"
            />
            <img src={potionImage} alt="potion" className="potion-logo" />
          </div>
          <p>Sentuh dimana saja untuk keluar.</p>
        </div>
      )}
    </Container>
  );
}

export default NusaCard;
