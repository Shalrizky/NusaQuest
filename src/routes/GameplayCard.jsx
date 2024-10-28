import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row, Image } from "react-bootstrap";
import "../style/routes/GameplayCard.css";
import DeckPlayer from "../components/games/DeckPlayer";
import BottomDeckCard from "../components/games/BottomDeckCard";
import HeaderNuca from "../components/games/HeaderGame";
import PertanyaanNuca, {
  ListPertanyaanNuca,
} from "../components/games/PertanyaanNuca";
import Potion from "../components/games/potion"; // Pastikan komponen Potion di Import yaa
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

function GameplayCard() {
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
  const timerRef = useRef(null);

  useEffect(() => {
    const generateCards = () => {
      const newCards = Array.from({ length: 4 }, () => getRandomQuestion());
      setCards(newCards);
    };
    generateCards();
  }, []);

  const handleDeckCardClick = (deck) => {
    if (deckCounts[deck] > 0) {
      setDeckCounts((prevCounts) => ({
        ...prevCounts,
        [deck]: prevCounts[deck] - 1,
      }));
      setLastActiveDeck(deck);
      const newQuestion = getRandomQuestion();
      setActiveCard(newQuestion);
      setShowPopup(true);
    }
  };

  const handleBottomCardClick = (card, index) => {
    console.log(card);
    setActiveCard(card);
    setShowPopup(true);
    setLastActiveDeck("bottom");
    removeCardFromDeck(index);
    setIsLoading("right");
  
    // Tambahkan kelas "animate" untuk memulai animasi
    const movingCard = document.querySelector(".moving-card");
    if (movingCard) {
      movingCard.classList.add("animate");
    }
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

    setTimeout(() => {
      setIsCorrectAnswer(null);
      setIsShuffling(true);

      setTimeout(() => {
        setIsShuffling(false);
      }, 2000);
    }, 3000);

    clearTimeout(timerRef.current);
    setActiveCard(null);
    setIsExitingPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsExitingPopup(false);
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
          className="text-center ms-5 d-flex align-items-center"
        >
          {/* Container untuk DeckPlayer dan Gambar Profil */}
          <div className="d-flex align-items-center ml-5 ms-5 ">
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

      <Row className="mb-0 mt-1 justify-content-center align-items-center">
        
          {/* Deck Kiri dengan Gambar PlayerOne */}
          <Col  md={4} xs={12} >
            <div
               className="deck-kiri d-flex flex-column align-items-center"
              onClick={() => handleDeckCardClick("left")}
            >
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
                style={{ transform: "rotate(90deg)" }}
              />
            </div>
          </Col>

          {/* Deck Tengah dengan Shuffle Icon */}
          <Col  md={4} xs={12} className="deck-tengah position-relative d-flex justify-content-center align-items-center">
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
          <Col  md={4} xs={12}>
           
            <div
               className="deck-kanan d-flex flex-column align-items-center "
              onClick={() => handleDeckCardClick("right")}
            >
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
              />{" "}
              {/* Tambahkan isNew */}
            </div>
          </Col>

      </Row>

      <Row className="align-items-center justify-content-center">
        {/* Bottom Deck Card */}
        <Col xs={"auto"} className="text-center ml-5 ms-5">
          <BottomDeckCard cards={cards} onCardClick={handleBottomCardClick} />
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

export default GameplayCard;
