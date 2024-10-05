import React, { useState, useCallback } from "react";
import { Container, Row, Col, Image, Modal, Button } from "react-bootstrap";
import "../style/routes/GameplayCard.css";
import deckCard from '../assets/common/deckCard.png';
import backCard from '../assets/common/backCard.png';
import rightCard from '../assets/common/rightCard.png';
import leftCard from '../assets/common/leftCard.png';
import shuffleIcon from '../assets/icons/shuffle.png';
import logoPerson from '../assets/common/logo-person.png';
import btnTemp from '../assets/common/btnTemp.png';
import HeaderNuca from '../components/HeaderNuca';
import playerProfile from '../assets/common/imageOne.png';
import ramuanIcon from '../assets/icons/ramuanIcon.png';

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

  // Fungsi untuk mengganti pemain
  const nextPlayer = useCallback(() => {
    if (currentPlayer === "player1") {
      setCurrentPlayer("player2");
    } else if (currentPlayer === "player2") {
      setCurrentPlayer("player3");
    } else {
      setCurrentPlayer("player1");
    }
  }, [currentPlayer]);

  // Fungsi untuk menghandle klik pada kartu
  const handleCardClick = () => {
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

  // Fungsi untuk menghandle jawaban
  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    if (answer === "Batagor") {
      setAnswerStatus("correct");
      if (playerCards[currentPlayer].length > 1) {
        setAnimatingCard(currentPlayer);
        setTimeout(() => {
          setPlayerCards((prevCards) => ({
            ...prevCards,
            [currentPlayer]: prevCards[currentPlayer].slice(0, -1),
          }));
          setAnimatingCard(null);
        }, 500);
      }
    } else {
      setAnswerStatus("incorrect");
      setPlayerCards((prevCards) => ({
        ...prevCards,
        [currentPlayer]: [...prevCards[currentPlayer], prevCards[currentPlayer].length + 1],
      }));
    }
    setIsAnswered(true);
    setTimeout(() => {
      nextPlayer();
      setShowModal(false);
    }, 1500);
  };

  // Fungsi untuk menghandle klik pada ramuanIcon
  const handlePotionClick = () => {
    setShowPotionModal(true);
  };

  const handlePotionConfirm = () => {
    // Logic untuk menggunakan potion, misalnya menutup pertanyaan atau mengubah status pemain
    setShowPotionModal(false);
    setShowModal(false);
  };

  const handlePotionCancel = () => {
    setShowPotionModal(false);
  };

  return (
    <>
      <HeaderNuca />
      <Container fluid className="room-ruca-container">
        <div className="btn-temp-container">
          <Image
            src={btnTemp}
            alt="Tombol Suhu"
            className="btn-temp"
          />
        </div>
        <Image src={logoPerson} alt="Logo Person" className="logo-person" />

        {/* Posisi foto profil untuk setiap pemain */}
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

        {/* Elemen kartu belakang di tengah */}
        <Row className="justify-content-center align-items-center card-center-section">
          <Col xs={12} className="d-flex justify-content-center">
            <div className="back-card-stack">
              {backCards.map((card, index) => (
                <Image
                  key={index}
                  src={backCard}
                  alt={`Kartu belakang ${index + 1}`}
                  className={`back-card back-card-${index}`}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </Col>
        </Row>

        {/* Bagian kanan, kiri, dan bawah untuk kartu pemain */}
        <Row className="card-right-section">
          <Col className="d-flex justify-content-center card-right-stack">
            {playerCards.player2.map((card, index) => (
              <Image
                key={index}
                src={rightCard}
                alt={`Kartu kanan ${index + 1}`}
                className={`right-card right-card-${index} ${animatingCard === 'player2' && index === playerCards.player2.length - 1 ? 'card-disappear' : ''}`}
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
                className={`left-card left-card-${index} ${animatingCard === 'player3' && index === playerCards.player3.length - 1 ? 'card-disappear' : ''}`}
              />
            ))}
          </Col>
        </Row>

        {/* Elemen tumpukan kartu kuning dan ikon shuffle */}
        <Row className="justify-content-center align-items-center card-stack-section">
          <Col xs={12} className="d-flex justify-content-center card-stack position-relative">
            {playerCards.player1.map((card, index) => (
              <Image
                key={index}
                src={deckCard}
                alt={`Kartu ${index + 1}`}
                className={`stacked-card stacked-card-${index} ${animatingCard === 'player1' && index === playerCards.player1.length - 1 ? 'card-disappear' : ''}`}
              />
            ))}
            <Image
              src={shuffleIcon}
              alt="Shuffle"
              className="shuffle-icon"
              onClick={() => setRotation(rotation + 720)}
              style={{ cursor: 'pointer', transform: `translate(-50%, -50%) rotate(${rotation}deg)`, transition: 'transform 4s ease' }}
            />
          </Col>
        </Row>

        {/* Modal untuk pertanyaan */}
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
                  className={`answer-option ${answerStatus === "incorrect" && selectedAnswer === option ? "shake" : ""}`}
                  onClick={() => handleAnswerClick(option)}
                  disabled={isAnswered}
                >
                  {option}
                </Button>
              ))}
            </div>

            {/* Tambahkan Icon Ramuan */}
            <div className="ramuan-icon-container">
              <Image src={ramuanIcon} alt="Ramuan" className="ramuan-icon" onClick={handlePotionClick} />
            </div>
          </Modal.Body>
        </Modal>

        {/* Modal untuk konfirmasi penggunaan ramuan */}
        <Modal show={showPotionModal} centered onHide={handlePotionCancel} className="transparent-modal">
          <Modal.Body className="modal-content-body">
            <h5>Menggunakan Potion akan menyelamatkanmu dari pertanyaan ini</h5>
            <p>Apakah Kamu Yakin Ingin Menggunakan Potion?</p>
            <div className="d-flex justify-content-around">
              <Button variant="success" onClick={handlePotionConfirm}>
                Ya
              </Button>
              <Button variant="danger" onClick={handlePotionCancel}>
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
