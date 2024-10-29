import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row, Image } from "react-bootstrap";
import "../style/routes/NusaCard.css";
import DeckPlayer from "../components/games/DeckPlayer";
import BottomDeckCard from "../components/games/BottomDeckCard";
import HeaderNuca from "../components/games/HeaderGame";
import PertanyaanNuca, {
  ListPertanyaanNuca,
} from "../components/games/PertanyaanNuca";
import Potion from "../components/games/potion";
import shuffleIcon from "../assets/common/shuffle.png";
import PlayerOne from "../assets/common/imageOne.png";

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
  const [deckCounts, setDeckCounts] = useState({
    top: 4,
    left: 4,
    right: 4,
  });

  const [lastActiveDeck, setLastActiveDeck] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExitingPopup, setIsExitingPopup] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);

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

  useEffect(() => {
    const generateCards = () => {
      const newCards = Array.from({ length: 4 }, () => getRandomQuestion());
      setCards(newCards);
    };
    generateCards();
  }, []);

  // useEffect untuk mengatur timer ketika popup muncul
  useEffect(() => {
    if (showPopup && answeringPlayer) {
      // Mulai timer
      setTimeRemaining(15);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            handleTimeOut(); // Waktu habis
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // Bersihkan timer ketika popup ditutup
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [showPopup, answeringPlayer]);

  const handleTimeOut = () => {
    // Jika waktu habis dan pemain belum menjawab
    handleAnswerSelect(false); // Anggap jawaban salah
  };

  const handleDeckCardClick = (deck) => {
    if (currentTurn !== deck || showPopup || isActionInProgress) return; // Bukan giliran pemain ini atau aksi sedang berlangsung
    if (deckCounts[deck] > 0) {
      setIsActionInProgress(true); // Mulai aksi
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
    if (currentTurn !== "bottom" || showPopup || isActionInProgress) return; // Bukan giliran pemain ini atau aksi sedang berlangsung
    setIsActionInProgress(true); // Mulai aksi
    console.log(card);
    setActiveCard(card);
    setShowPopup(true);
    setLastActiveDeck("bottom");
    removeCardFromDeck(index);
    setIsLoading("right");

    // Tentukan pemain yang harus menjawab
    let answeringPlayer = "right"; // Pemain kanan yang menjawab
    setAnsweringPlayer(answeringPlayer);
  };

  const removeCardFromDeck = (index) => {
    setCards((prevCards) =>
      prevCards.filter((_, cardIndex) => cardIndex !== index)
    );
  };

  const incrementDeckCount = (deck) => {
    setDeckCounts((prevCounts) => ({
      ...prevCounts,
      [deck]: prevCounts[deck] + 1,
    }));
  };

  const addNewCardToDeck = () => {
    const newQuestion = getRandomQuestion();
    setCards((prevCards) => [
      ...prevCards,
      { ...newQuestion, isNew: true }, // Tandai kartu baru
    ]);
  };

  const handleAnswerSelect = (isCorrect) => {
    // Hentikan timer ketika pemain menjawab
    clearInterval(timerRef.current);

    setIsLoading(null);
    setIsCorrectAnswer(isCorrect);

    if (!isCorrect) {
      switch (lastActiveDeck) {
        case "bottom":
          incrementDeckCount("right");
          break;
        case "right":
          incrementDeckCount("top");
          break;
        case "top":
          incrementDeckCount("left");
          break;
        case "left":
          addNewCardToDeck(); // Tambah kartu baru dengan animasi
          break;
        default:
          break;
      }
    }

    // Lanjutkan ke giliran pemain berikutnya
    const currentPlayerIndex = deckOrder.indexOf(lastActiveDeck);
    const nextPlayerIndex = (currentPlayerIndex + 1) % deckOrder.length;
    setCurrentTurn(deckOrder[nextPlayerIndex]);

    setTimeout(() => {
      setIsCorrectAnswer(null);
      setIsShuffling(true);

      setTimeout(() => {
        setIsShuffling(false);
      }, 2000);
    }, 3000);

    setActiveCard(null);
    setIsExitingPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsExitingPopup(false);
      setIsActionInProgress(false); // Akhiri aksi
      setAnsweringPlayer(null); // Reset pemain yang menjawab
    }, 2000);
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
              <div className="timer-overlay">{timeRemaining}</div>
            )}
            <div
              onClick={() => handleDeckCardClick("top")}
              style={{ position: "relative" }}
            >
              <DeckPlayer count={deckCounts.top} isNew={deckCounts.top === 0} />
            </div>
            <Image
              src={PlayerOne}
              alt="Player Profile"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                marginLeft: "100px",
              }}
            />
          </div>
        </Col>
      </Row>

      <Row className="mb-5 mt-0 justify-content-center align-items-center">
        {/* Deck Kiri dengan Gambar PlayerOne */}
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
              src={PlayerOne}
              alt="Player One"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
              }}
            />
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
          <DeckPlayer count={4} isNew={false} />{" "}
          {/* Tidak ada animasi untuk deck tengah */}
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

        {/* Deck Kanan dengan Gambar PlayerOne */}
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
              src={PlayerOne}
              alt="Player One"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
              }}
            />
            <DeckPlayer
              count={deckCounts.right}
              isNew={deckCounts.right === 0}
              className="deck-kanan-rotate" 
            />{" "}
            {/* Tambahkan isNew */}
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
            isExitingPopup={isExitingPopup} />
          </div>
        </Col>

        {/* Player One Image di Samping Kanan */}
        <Col xs="auto" className="d-flex align-items-center p-3">
          <Image
            src={PlayerOne}
            alt="Player One"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </Col>
      </Row>

      {showPopup && activeCard && (
        <div style={{ position: "relative", zIndex: "2200" }}>
          <PertanyaanNuca
            question={activeCard.question}
            options={activeCard.options}
            correctAnswer={activeCard.correctAnswer}
            onAnswerSelect={handleAnswerSelect}
            isExiting={isExitingPopup}
          />
          <Potion style={{ zIndex: "5000" }} />{" "}
          {/* Menambahkan komponen Potion di sini */}
        </div>
      )}
    </Container>
  );
}

export default NusaCard;
