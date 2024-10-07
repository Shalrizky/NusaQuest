import React, { useState, useCallback, useRef, useEffect } from "react";
import { Container, Row, Col, Image, Modal, Button } from "react-bootstrap";
import "../style/routes/GameplayCard.css";
import deckCard from "../assets/common/deckCard.png";
import backCard from "../assets/common/backCard.png";
import rightCard from "../assets/common/rightCard.png";
import leftCard from "../assets/common/leftCard.png";
import shuffleIcon from "../assets/icons/shuffle.png";
import logoPerson from "../assets/common/logo-person.png";
import HeaderNuca from "../components/HeaderNuca";
import playerProfile from "../assets/common/imageOne.png";
import ramuanIcon from "../assets/icons/ramuanIcon.png";

function GameplayCard() {
  const [rotation, setRotation] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showPotionModal, setShowPotionModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [options, setOptions] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("player1");
  const [playerCards, setPlayerCards] = useState({
    player1: [1, 2, 3, 4, 5],
    player2: [1, 2, 3, 4, 5],
    player3: [1, 2, 3, 4, 5],
  });
  const [backCards, setBackCards] = useState([1, 2, 3, 4, 5]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answerStatus, setAnswerStatus] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [canClickDeckCard, setCanClickDeckCard] = useState(false);
  const [selectedDeckCard, setSelectedDeckCard] = useState(null);
  const [cardsToAdd, setCardsToAdd] = useState(0);
  const [timer, setTimer] = useState(20);
  const [isPlayer1CardPushed, setIsPlayer1CardPushed] = useState(false);
  const [canPlayer1SelectCard, setCanPlayer1SelectCard] = useState(false);
  const [displayedCard, setDisplayedCard] = useState(null); // Card to display next to shuffle

  const shuffleIconRef = useRef(null);

  const nextPlayer = useCallback(() => {
    if (currentPlayer === "player1") {
      setCurrentPlayer("player2");
    } else if (currentPlayer === "player2") {
      setCurrentPlayer("player3");
    } else {
      setCurrentPlayer("player1");
    }
  }, [currentPlayer]);

  useEffect(() => {
    setTimer(20);
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          clearInterval(countdown);
          nextPlayer();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [currentPlayer, nextPlayer]);

  const handleBackCardClick = () => {
    if (currentPlayer === "player1") {
      setCategory("Makanan");
      setQuestion(
        "Apa saja makanan khas Jawa Barat yang paling terkenal dan menjadi favorit masyarakat lokal?"
      );
      setOptions(["Soto Betawi", "Gudeg", "Batagor", "Rendang"]);
      setShowModal(true);
      setSelectedAnswer("");
      setIsAnswered(false);
      setAnswerStatus("");
    }
  };

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    if (answer === "Batagor") {
      setAnswerStatus("correct");
      // No card reduction when the answer is correct
    } else {
      setAnswerStatus("incorrect");
      setCardsToAdd((prev) => prev + 1);
    }
    setIsAnswered(true);
    setTimeout(() => {
      setShowModal(false);
      startShuffling();
    }, 1500);
  };

  const addCardToCurrentPlayer = useCallback(() => {
    if (cardsToAdd > 0) {
      setPlayerCards((prevCards) => {
        const updatedCards = { ...prevCards };
        updatedCards[currentPlayer] = [
          ...updatedCards[currentPlayer],
          updatedCards[currentPlayer].length + 1,
        ];
        return updatedCards;
      });
      setCardsToAdd((prev) => prev - 1);
    }
  }, [cardsToAdd, currentPlayer]);

  useEffect(() => {
    if (!isShuffling && cardsToAdd > 0) {
      addCardToCurrentPlayer();
    }
  }, [isShuffling, cardsToAdd, addCardToCurrentPlayer]);

  const startShuffling = () => {
    setIsShuffling(true);
    setRotation((prevRotation) => prevRotation + 360);

    setTimeout(() => {
      setIsShuffling(false);
      setIsPlayer1CardPushed(true);

      setTimeout(() => {
        setCanPlayer1SelectCard(true);
        setIsPlayer1CardPushed(false);
      }, 4000);

      nextPlayer();
    }, 1000);
  };

  const handleDeckCardClick = (index) => {
    if (canClickDeckCard && canPlayer1SelectCard) {
      const updatedPlayerCards = { ...playerCards };
      const selectedCard = updatedPlayerCards["player1"][index];
      updatedPlayerCards["player1"] = updatedPlayerCards["player1"].filter(
        (_, i) => i !== index
      );

      setPlayerCards(updatedPlayerCards);
      setDisplayedCard(selectedCard); // Card displayed next to shuffle
      setSelectedDeckCard(index);

      setTimeout(() => {
        setSelectedDeckCard(null);
        setCanClickDeckCard(false);
        setCanPlayer1SelectCard(false);
      }, 500);
    }
  };

  const handlePotionClick = () => {
    setShowPotionModal(true);
  };

  const handlePotionConfirm = () => {
    setShowPotionModal(false);
    setShowModal(false);
  };

  const handlePotionCancel = () => {
    setShowPotionModal(false);
  };

  useEffect(() => {
    if (shuffleIconRef.current) {
      shuffleIconRef.current.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    }
  }, [rotation]);

  return (
    <>
      <Container fluid className="room-ruca-container">
        <HeaderNuca />
        <Image src={logoPerson} alt="Logo Person" className="logo-person" />

        {/* Kartu yang dipilih ditampilkan di samping ikon shuffle */}
        {displayedCard !== null && (
          <Image
            src={deckCard}
            alt="Kartu yang dipilih"
            className="displayed-card"
          />
        )}

        {/* Player profiles */}
        <div className="player-profile-container">
          {["player1", "player2", "player3"].map((player, index) => (
            <div key={index} className={`player-profile-wrapper ${player}`}>
              <Image
                src={playerProfile}
                alt={`Profil Pemain ${index + 1}`}
                className={`player-profile ${
                  currentPlayer === player ? "active-player" : ""
                }`}
              />
              {currentPlayer === player && (
                <div className="timer-overlay">
                  <span className="timer-text">{timer}s</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back Cards in the center */}
        <Row className="justify-content-center align-items-center card-center-section">
          <Col xs={12} className="d-flex justify-content-center">
            <div className="back-card-stack">
              {backCards.map((card, index) => (
                <Image
                  key={index}
                  src={backCard}
                  alt={`Kartu belakang ${index + 1}`}
                  className={`back-card back-card-${index}`}
                  onClick={handleBackCardClick}
                />
              ))}
            </div>
          </Col>
        </Row>

        {/* Right Cards */}
        <Row className="card-right-section">
          <Col className="d-flex justify-content-center card-right-stack">
            {playerCards.player2.map((card, index) => (
              <Image
                key={index}
                src={rightCard}
                alt={`Kartu kanan ${index + 1}`}
                className={`right-card right-card-${index}`}
                style={{
                  zIndex: playerCards.player2.length - index,
                  top: `${index * 30}px`,
                }}
              />
            ))}
          </Col>
        </Row>

        {/* Left Cards */}
        <Row className="card-left-section">
          <Col className="d-flex justify-content-center card-left-stack">
            {playerCards.player3.map((card, index) => (
              <Image
                key={index}
                src={leftCard}
                alt={`Kartu kiri ${index + 1}`}
                className={`left-card left-card-${index}`}
              />
            ))}
          </Col>
        </Row>

        {/* Bottom Deck Cards for Player 1 */}
        <Row className="justify-content-center align-items-center card-stack-section">
          <Col xs={12} className="d-flex justify-content-center card-stack position-relative">
            {playerCards["player1"].map((card, index) => (
              <Image
                key={index}
                src={deckCard}
                alt={`Kartu ${index + 1}`}
                className={`stacked-card stacked-card-${index} ${
                  selectedDeckCard === index ? "selected-deck-card" : ""
                } ${isPlayer1CardPushed ? "card-pushed" : ""}`}
                onClick={() => handleDeckCardClick(index)}
                style={{
                  cursor: canClickDeckCard && canPlayer1SelectCard ? "pointer" : "default",
                  '--card-index': index,
                }}
              />
            ))}
            <Image
              ref={shuffleIconRef}
              src={shuffleIcon}
              alt="Shuffle"
              className={`shuffle-icon ${isShuffling ? "shuffling" : ""}`}
            />
          </Col>
        </Row>

        {/* Modal for questions */}
        <Modal show={showModal} centered className="transparent-modal">
          <Modal.Body className="modal-content-body">
            <div className="modal-category">{category}</div>
            <h5 className="modal-text">{question}</h5>
            <div className="question-options">
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    isAnswered && selectedAnswer === option
                      ? answerStatus === "correct"
                        ? "success"
                        : "danger"
                      : "primary"
                  }
                  className={`answer-option ${
                    answerStatus === "incorrect" && selectedAnswer === option
                      ? "shake"
                      : ""
                  }`}
                  onClick={() => handleAnswerClick(option)}
                  disabled={isAnswered}
                >
                  {option}
                </Button>
              ))}
            </div>
            <div className="ramuan-icon-container">
              <Image
                src={ramuanIcon}
                alt="Ramuan"
                className="ramuan-icon"
                onClick={handlePotionClick}
              />
            </div>
          </Modal.Body>
        </Modal>

        <Modal show={showPotionModal} centered className="potion-modal">
          <Modal.Body className="potion-modal-content">
            <p>Menggunakan Potion akan menyelamatkanmu dari pertanyaan ini</p>
            <p>Apakah kamu yakin ingin menggunakan Potion?</p>
            <div className="potion-modal-buttons">
              <Button
                variant="primary"
                onClick={handlePotionConfirm}
                className="ya-potion-button"
              >
                Ya
              </Button>
              <Button
                variant="secondary"
                onClick={handlePotionCancel}
                className="tidak-potion-button"
              >
                Tidak
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}

export default GameplayCard;
