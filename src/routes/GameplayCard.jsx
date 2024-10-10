import React, { useState, useCallback, useRef, useEffect } from "react";
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
  const [cardsToAdd, setCardsToAdd] = useState(0);
  const [timer, setTimer] = useState(20);
  const [isPlayer1CardPushed, setIsPlayer1CardPushed] = useState(false);
  const [canPlayer1SelectCard, setCanPlayer1SelectCard] = useState(false);
  const [displayedCard, setDisplayedCard] = useState(null);
  const [selectedDeckCard, setSelectedDeckCard] = useState(null);
  const [selectedCardPosition, setSelectedCardPosition] = useState({ top: 0, left: 0 });
  const [isCardMoving, setIsCardMoving] = useState(false);
  const [canSelectCard, setCanSelectCard] = useState(false); // State to track if card selection is allowed
  const [thinking, setThinking] = useState(false); // State untuk menunjukkan status berpikir
  const [incorrectAnswer, setIncorrectAnswer] = useState(false); // State untuk tanda silang
  const [loadingIndicator, setLoadingIndicator] = useState(false); // Indikator loading
  const [isPlayer1Thinking, setIsPlayer1Thinking] = useState(false); // Tambahkan indikator untuk Player1
  const [player3Status, setPlayer3Status] = useState(""); // Status untuk Player3 (correct / incorrect)



  const shuffleIconRef = useRef(null);

  // Next player sequence
  const nextPlayer = useCallback(() => {
    if (currentPlayer === "player1") {
      setCurrentPlayer("player3");
    } else if (currentPlayer === "player3") {
      setCurrentPlayer("player2");
    } else {
      setCurrentPlayer("player1");
    }
  }, [currentPlayer]);

  // Ubah logika timer untuk Player1, Player2, dan Player3
useEffect(() => {
  // Jika giliran Player1 atau Player2, timer akan aktif
  if (currentPlayer === "player1" || currentPlayer === "player2") {
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
  } 
  // Jika Player3, timer akan berhenti
  else if (currentPlayer === "player3") {
    setTimer(0);
  }
}, [currentPlayer, nextPlayer]);

// Saat Player3 memilih kartu untuk Player2, hidupkan kembali timer untuk Player2
useEffect(() => {
  if (currentPlayer === "player3" && selectedDeckCard !== null) {
    setTimeout(() => {
      setCanClickDeckCard(false); // Nonaktifkan klik setelah kartu dipilih
      nextPlayer(); // Pindah giliran ke Player2
      setTimer(20); // Timer dimulai kembali untuk Player2
    }, 1000); // Berikan waktu animasi kartu berpindah
  }
}, [selectedDeckCard, currentPlayer, nextPlayer]);


  // Player2 asks a question to Player1 on initial load
  useEffect(() => {
    if (currentPlayer === "player2") {
      handleBackCardClick();
      setThinking(true); // Set thinking state when player2 is prompted
      const thinkingTimeout = setTimeout(() => {
        setThinking(false);
        setIncorrectAnswer(true); // Change to incorrect after 5 seconds
        setTimeout(() => {
          setIncorrectAnswer(false); // Reset after showing incorrect
          nextPlayer(); // Move to the next player
        }, 2000); // Show incorrect for 2 seconds before moving on
      }, 5000); // Show thinking for 5 seconds

      return () => clearTimeout(thinkingTimeout); // Clear timeout on cleanup
    }
  }, [currentPlayer]);

  // Show question when player1 clicks center card stack
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
      setPlayer3Status("correct");
    } else {
      setAnswerStatus("incorrect");
      setPlayer3Status("incorrect");
      setCardsToAdd((prev) => prev + 1);
      
      setIsShuffling(true); // Aktifkan shuffle icon
      setTimeout(() => {
        setIsShuffling(false); // Nonaktifkan setelah 1 detik
      }, 1000); // Durasi shuffle icon
      
      setTimer(0); // Hentikan timer Player2
      setTimeout(() => {
        setIsPlayer1Thinking(true); // Indikator berpikir untuk Player1
        setTimer(20); // Mulai timer untuk Player1
      }, 5000); // Durasi 5 detik sebelum memindahkan timer
    }

    setIsAnswered(true);
    setThinking(false);
    setIncorrectAnswer(false);
  
    setTimeout(() => {
      setShowModal(false);
      startShuffling();
      setCanClickDeckCard(true);
    }, 1500);
};

// Tampilkan indikator status untuk Player1
{currentPlayer === "player1" && isPlayer1Thinking && (
  <div className="status-indicator">
    <span className="thinking">...</span> {/* Indikator berpikir */}
  </div>
)}
  

const handleDeckCardClick = (cardIndex) => {
  if (canSelectCard && currentPlayer === "player3") {
    setLoadingIndicator(true);
    setSelectedDeckCard(cardIndex);
    
    // Atur posisi kartu yang dipilih ke samping ikon shuffle
    setSelectedCardPosition({ top: "50%", left: "85%" }); // Misalnya, 85% untuk menempatkannya di sebelah kanan

    setIsCardMoving(true);

    // Setelah 1 detik, pindah ke pemain berikutnya
    setTimeout(() => {
      setIsCardMoving(false);
      setLoadingIndicator(false);
      nextPlayer();
    }, 1000);
  }
};

  

  // Render Player1's deck cards
  const renderDeckCards = () => {
    return playerCards.player1.map((card, index) => (
      <Image
        key={index}
        src={deckCard}
        alt={`Kartu ${index + 1}`}
        className={`stacked-card stacked-card-${index} ${selectedDeckCard === index ? 'selected-deck-card' : ''}`}
        style={{
          cursor: canClickDeckCard ? "pointer" : "default",
          '--card-index': index,
        }}
        onClick={() => canClickDeckCard && handleDeckCardClick(index)}
      />
    ));
  };

  // Render indikator status di Player3
{currentPlayer === "player3" && player3Status && (
  <div className="status-indicator">
    {player3Status === "correct" ? (
      <span className="correct">✔️</span>
    ) : (
      <span className="incorrect">X</span>
    )}
  </div>
)}

// Render indikator loading
{loadingIndicator && (
  <div className="loading-indicator">
    <span>Loading...</span>
  </div>
)}

const renderSelectedDeckCard = () => {
  if (selectedDeckCard !== null) {
    return (
      <Image
        src={deckCard}
        alt="Selected Deck Card"
        className="selected-deck-card"
        style={{
          position: 'absolute',
          top: selectedCardPosition.top,
          left: selectedCardPosition.left,
          zIndex: 1000,
          transform: 'translate(-50%, -50%)', // Pusatkan kartu
          transition: 'top 0.5s, left 0.5s', // Tambahkan animasi untuk pergerakan
        }}
      />
    );
  }
  return null;
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
        setCanSelectCard(true);  // Allow card selection after shuffle complete
      }, 4000);
      nextPlayer();
    }, 1000);
  };

  const handlePotionClick = () => {
    setShowPotionModal(true);
  };

  const handlePotionConfirm = () => {
    setShowPotionModal(false);
    setShowModal(false);
    startShuffling();
    nextPlayer();
    setIsAnswered(false);
    setSelectedAnswer("");
  };

  const handlePotionCancel = () => {
    setShowPotionModal(false);
  };

  useEffect(() => {
    if (shuffleIconRef.current) {
      shuffleIconRef.current.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    }
  }, [rotation]);

  useEffect(() => {
    if (currentPlayer === 'player3') {
      setCanClickDeckCard(true);
    } else {
      setCanClickDeckCard(false);
    }
  }, [currentPlayer]);

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
                className={`player-profile ${
                  currentPlayer === player ? "active-player" : ""
                }`}
              />
              {currentPlayer === player && (
                <div className="timer-overlay">
                  <span className="timer-text">{timer}s</span>
                </div>
              )}
              {/* Tampilkan indikator berpikir atau tanda silang */}
              {player === "player2" && (
                <div className="status-indicator">
                  {thinking ? (
                    <span className="thinking">...</span>
                  ) : incorrectAnswer ? (
                    <span className="incorrect">X</span>
                  ) : null}
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
                  className={`back-card back-card-${index} animate-card`}
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
                className={`stacked-card stacked-card-${index}`}
                style={{
                  cursor: "default",
                  '--card-index': index,
                }}
              />
            ))}
            {renderDeckCards()}
            <Image
              ref={shuffleIconRef}
              src={shuffleIcon}
              alt="Shuffle"
              className={`shuffle-icon ${isShuffling ? "shuffling" : ""}`}
            />
            {renderSelectedDeckCard()}
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
