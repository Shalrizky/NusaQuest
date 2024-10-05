import React, { useState, useCallback, useRef, useEffect} from "react";
import { Container, Row, Col, Image, Modal, Button } from "react-bootstrap";
import "../style/routes/GameplayCard.css";
import deckCard from "../assets/common/deckCard.png";
import backCard from "../assets/common/backCard.png";
import rightCard from "../assets/common/rightCard.png";
import leftCard from "../assets/common/leftCard.png";
import shuffleIcon from "../assets/common/shuffle.png";
import logoPerson from "../assets/common/logo-person.png";
import HeaderNuca from "../components/HeaderNuca";
import playerProfile from "../assets/common/imageOne.png";
import ramuanIcon from "../assets/common/ramuanIcon.png";

function GameplayCard() {
  const [rotation, setRotation] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [options, setOptions] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("player1");
  const [playerCards, setPlayerCards] = useState({
    player1: [1, 2, 3, 4, 5],
    player2: [1, 2, 3, 4, 5],
    player3: [1, 2, 3, 4, 5],
  });

  const [backCards] = useState([1, 2, 3, 4, 5]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answerStatus, setAnswerStatus] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [animatingCard, setAnimatingCard] = useState(null);
  const [showPotionModal, setShowPotionModal] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedDeckCard, setSelectedDeckCard] = useState(null);

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

  const handleBackCardClick = () => {
    if (currentPlayer === "player1") {
      setCategory("Makanan");
      setQuestion("Apa saja makanan khas Jawa Barat yang paling terkenal dan menjadi favorit masyarakat lokal?");
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
      setIsShuffling(true);
      setRotation(prevRotation => prevRotation + 360);  // Increment rotation by 360 degrees
    } else {
      setAnswerStatus("incorrect");
      setIsShuffling(true);
      setRotation(prevRotation => prevRotation + 360)
    }
    setIsAnswered(true);
    setTimeout(() => {
      nextPlayer();
      setShowModal(false);
      setIsShuffling(false);
    }, 1500);
  };

  useEffect(() => {
    if (shuffleIconRef.current) {
      shuffleIconRef.current.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    }
  }, [rotation]);

  const handleDeckCardClick = (index) => {
    if (!isShuffling && answerStatus === "correct") {
      setSelectedDeckCard(index);
      const updatedPlayerCards = { ...playerCards };
      updatedPlayerCards[currentPlayer] = updatedPlayerCards[currentPlayer].filter((_, i) => i !== index);
      setPlayerCards(updatedPlayerCards);

      // Animate the selected card moving to the center
      const cardElement = document.querySelector(`.stacked-card-${index}`);
      if (cardElement) {
        cardElement.style.transition = "transform 8.0s ease";
        cardElement.style.transform = "translate(-50%, -50%)";
        cardElement.style.position = "absolute";
        cardElement.style.left = "50%";
        cardElement.style.top = "50%";
        cardElement.style.zIndex = "1000";
      }

      // Reset after animation
      setTimeout(() => {
        setSelectedDeckCard(null);
        if (cardElement) {
          cardElement.style.transition = "";
          cardElement.style.transform = "";
          cardElement.style.position = "";
          cardElement.style.left = "";
          cardElement.style.top = "";
          cardElement.style.zIndex = "";
        }
      }, 500);
    }
  };

  const handlePotionClick = () => {
    setShowPotionModal(true);
  };

  // Edit bagian ini untuk mengatur modal potion dan pertanyaan
  const handlePotionConfirm = () => {
    setShowPotionModal(false); // Tutup modal potion
    setShowModal(false); // Tutup modal pertanyaan
  };

  const handlePotionCancel = () => {
    setShowPotionModal(false); // Tutup hanya modal potion
  };

  return (
    <>
      <Container fluid className="room-ruca-container">
      <HeaderNuca />
        <Image src={logoPerson} alt="Logo Person" className="logo-person" />
        {/* Player profiles */}
      <div className="player-profile-container">
        {["player1", "player2", "player3"].map((player, index) => (
          <div key={index} className={`player-profile-wrapper ${player}`}>
            <Image
              src={playerProfile}
              alt={`Profil Pemain ${index + 1}`}
              className={`player-profile ${currentPlayer === player ? "active-player" : ""}`}
            />
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

        <Row className="card-right-section">
          <Col className="d-flex justify-content-center card-right-stack">
            {playerCards.player2.map((card, index) => (
              <Image
                key={index}
                src={rightCard}
                alt={`Kartu kanan ${index + 1}`}
                className={`right-card right-card-${index} ${
                  animatingCard === "player2" && index === playerCards.player2.length - 1
                    ? "card-disappear"
                    : ""
                }`}
              />
            ))}
          </Col>
        </Row>

        <Row className="card-left-section">
          <Col className="d-flex justify-content-center card-left-stack">
            {playerCards.player3.map((card, index) => (
              <Image
                key={index}
                src={leftCard}
                alt={`Kartu kiri ${index + 1}`}
                className={`left-card left-card-${index} ${
                  animatingCard === "player3" && index === playerCards.player3.length - 1
                    ? "card-disappear"
                    : ""
                }`}
              />
            ))}
          </Col>
        </Row>

         {/* Bottom Deck Cards */}
         <Row className="justify-content-center align-items-center card-stack-section">
        <Col xs={12} className="d-flex justify-content-center card-stack position-relative">
          {playerCards[currentPlayer].map((card, index) => (
            <Image
              key={index}
              src={deckCard}
              alt={`Kartu ${index + 1}`}
              className={`stacked-card stacked-card-${index} ${
                selectedDeckCard === index ? "selected-deck-card" : ""
              }`}
              onClick={() => handleDeckCardClick(index)}
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
                  answerStatus === "incorrect" && selectedAnswer === option ? "shake" : ""
                }`}
                onClick={() => handleAnswerClick(option)}
                disabled={isAnswered}
              >
                {option}
              </Button>
            ))}
          </div>
          <div className="ramuan-icon-container">
            <Image src={ramuanIcon} alt="Ramuan" className="ramuan-icon" onClick={handlePotionClick} />
          </div>
        </Modal.Body>
      </Modal>

    <Modal show={showPotionModal} centered className="potion-modal">
        <Modal.Body className="potion-modal-content">
          <p>Menggunakan Potion akan menyelamatkanmu dari pertanyaan ini</p>
          <p>Apakah kamu yakin ingin menggunakan Potion?</p>
          <div className="potion-modal-buttons">
            <Button variant="primary" onClick={handlePotionConfirm} className="ya-potion-button">Ya</Button>
            <Button variant="secondary" onClick={handlePotionCancel} className="tidak-potion-button">Tidak</Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
    </>
  );
}

export default GameplayCard;
