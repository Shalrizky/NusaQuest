import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row, Image } from "react-bootstrap";
import "../style/routes/NusaCard.css";
import DeckPlayer from "../components/games/DeckPlayer";
import BottomDeckCard from "../components/games/BottomDeckCard";
import HeaderNuca from "../components/games/HeaderGame";
import PertanyaanNuca, { getRandomQuestion } from "../components/games/PertanyaanNuca";
import Potion from "../components/games/potion";

// Image imports
import potionImage from "../assets/games/Utangga/potion.png";
import shuffleIcon from "../assets/common/shuffle.png";
import checklist from "../assets/common/checklist.png";
import cross from "../assets/common/cross.png";
import victoryImage from "../assets/games/Utangga/victory.png";
import Achievement from "../assets/games/Utangga/achievement1.png";
import Achievement2 from "../assets/games/Utangga/achievement2.png";

// Constants
const INITIAL_DECK_COUNT = 4;
const TIMER_DURATION = 15;
const INACTIVITY_DURATION = 30000;
const FEEDBACK_DURATION = 3000;
const POPUP_TRANSITION_DURATION = 2000;

const PLAYERS = [
  { id: 1, name: "Abrar", photo: require("../assets/games/Utangga/narutoa.png") },
  { id: 2, name: "Sahel", photo: require("../assets/games/Utangga/narutoa.png") },
  { id: 3, name: "Rangga", photo: require("../assets/games/Utangga/narutoa.png") },
  { id: 4, name: "Natah", photo: require("../assets/games/Utangga/narutoa.png") }
];

const DECK_ORDER = ["bottom", "right", "top", "left"];

function NusaCard() {
  const navigate = useNavigate();
  const [deckCounts, setDeckCounts] = useState({
    top: INITIAL_DECK_COUNT,
    left: INITIAL_DECK_COUNT,
    right: INITIAL_DECK_COUNT
  });

  const [cards, setCards] = useState(() => 
    Array.from({ length: INITIAL_DECK_COUNT }, () => getRandomQuestion())
  );

  // Game state
  const [lastActiveDeck, setLastActiveDeck] = useState(null);
  const [currentTurn, setCurrentTurn] = useState("bottom");
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExitingPopup, setIsExitingPopup] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  const [deckDepleted, setDeckDepleted] = useState(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [answeringPlayer, setAnsweringPlayer] = useState(null);

  // Timers
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [inactivityTimeRemaining, setInactivityTimeRemaining] = useState(INACTIVITY_DURATION);
  const timerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Feedback state
  const [answerStatus, setAnswerStatus] = useState({
    top: null,
    right: null,
    bottom: null,
    left: null
  });
  
  const [feedbackIcon, setFeedbackIcon] = useState({
    show: false,
    isCorrect: null,
    position: null
  });

  const getPlayerByPosition = (position) => {
    const positionMap = {
      bottom: 0,
      right: 1,
      top: 2,
      left: 3
    };
    return PLAYERS[positionMap[position]];
  };

  // Timer handlers
  const resetInactivityTimer = () => {
    setInactivityTimeRemaining(INACTIVITY_DURATION);
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
    }
    startInactivityTimer();
  };

  const startInactivityTimer = () => {
    inactivityTimerRef.current = setInterval(() => {
      setInactivityTimeRemaining((prevTime) => {
        if (prevTime <= 100000) {
          clearInterval(inactivityTimerRef.current);
          navigate('/');
          return 0;
        }
        return prevTime - 100000;
      });
    }, 100000);
  };

  // Game logic handlers
  const handleDeckCardClick = (deck) => {
    resetInactivityTimer();
    if (currentTurn !== deck || showPopup || isActionInProgress) return;
    
    if (deckCounts[deck] > 0) {
      setIsActionInProgress(true);
      setDeckCounts(prev => ({
        ...prev,
        [deck]: prev[deck] - 1
      }));
      setLastActiveDeck(deck);
      setActiveCard(getRandomQuestion());
      setAnsweringPlayer(getNextPlayer(deck));
      setShowPopup(true);
    }
  };

  const handleBottomCardClick = (card, index) => {
    if (currentTurn !== "bottom" || showPopup || isActionInProgress) return;
    
    setIsActionInProgress(true);
    setActiveCard(card);
    setShowPopup(true);
    setLastActiveDeck("bottom");
    removeCardFromDeck(index);
    setAnsweringPlayer("right");
  };

  const handleAnswerSelect = (isCorrect, wasTimeout = false) => {
    clearInterval(timerRef.current);
    setIsCorrectAnswer(isCorrect);

    setFeedbackIcon({
      show: true,
      isCorrect,
      position: answeringPlayer
    });

    updateAnswerStatus(answeringPlayer, isCorrect);

    if (!isCorrect && !wasTimeout) {
      incrementDeckCount(answeringPlayer);
    }

    if (isCorrect && lastActiveDeck === "left" && answeringPlayer !== "bottom") {
      addNewCardToDeck();
    }

    const nextTurn = getNextTurn();
    setCurrentTurn(nextTurn);

    if (deckDepleted && !victory) {
      setVictory(true);
      setWinner(deckDepleted);
    }

    handleAnswerTimeout();
  };

  // Helper functions
  const getNextPlayer = (currentDeck) => {
    const playerMap = {
      bottom: "right",
      right: "top",
      top: "left",
      left: "bottom"
    };
    return playerMap[currentDeck];
  };

  const getNextTurn = () => {
    const currentIndex = DECK_ORDER.indexOf(lastActiveDeck);
    return DECK_ORDER[(currentIndex + 1) % DECK_ORDER.length];
  };

  const removeCardFromDeck = (index) => {
    setCards(prev => prev.filter((_, cardIndex) => cardIndex !== index));
  };

  const addNewCardToDeck = () => {
    setCards(prev => [...prev, { ...getRandomQuestion(), isNew: true }]);
  };

  const incrementDeckCount = (deck) => {
    if (deck === "bottom") {
      addNewCardToDeck();
    } else {
      setDeckCounts(prev => ({
        ...prev,
        [deck]: prev[deck] + 1
      }));
    }
  };

  const updateAnswerStatus = (player, isCorrect) => {
    setAnswerStatus(prev => ({
      ...prev,
      [player]: isCorrect
    }));
  };

  const handleAnswerTimeout = () => {
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

        setAnswerStatus(prev => ({
          ...prev,
          [answeringPlayer]: null
        }));
      }, POPUP_TRANSITION_DURATION);
    }, FEEDBACK_DURATION);
  };

  // Effects
  useEffect(() => {
    startInactivityTimer();
    window.addEventListener('click', resetInactivityTimer);

    return () => {
      clearInterval(inactivityTimerRef.current);
      window.removeEventListener('click', resetInactivityTimer);
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    Object.entries(deckCounts).forEach(([deck, count]) => {
      if (count === 0 && !deckDepleted) {
        setDeckDepleted(deck);
      }
    });

    if (cards.length === 0 && !deckDepleted) {
      setDeckDepleted('bottom');
    }
  }, [deckCounts, cards, deckDepleted]);

  useEffect(() => {
    if (showPopup && answeringPlayer) {
      setTimeRemaining(TIMER_DURATION);
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [showPopup, answeringPlayer]);

  useEffect(() => {
    if (timeRemaining === 0) {
      handleAnswerSelect(false, true);
    }
  }, [timeRemaining]);

  // Render helper functions
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

  

  return (
    <Container
      fluid
      className="nuca-container d-flex justify-content-around flex-column"
    >
      <HeaderNuca layout="home" />

      {/* Top Row */}
{/* Top Row */}
<Row className="mb-5 justify-content-center align-items-center">
  <Col
    md={2}
    xs={12}
    className="text-center ms-5 ml-5 d-flex align-items-center position-relative"
  >
    <div
      className="d-flex align-items-center ml-5 ms-5 position-relative"
    >
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
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          marginLeft: "100px",
        }}
      />
      {renderFeedbackIcon("top")}
    </div>
  </Col>
</Row>

{/* Middle Row - Modified to spread decks wider */}
<Container fluid>
  <Row className="mb-5 mt-0">
    {/* Left Deck */}
    <Col md={3} className="position-relative deck-position-left">
      <div
        className="d-flex flex-column align-items-center position-relative"
        onClick={() => handleDeckCardClick("left")}
      >
        {showPopup && answeringPlayer === "left" && (
          <div className="timer-overlay">{timeRemaining}</div>
        )}
        <Image
          src={getPlayerByPosition("left").photo}
          alt="Player Left"
          style={{
            width: "80px",
            height: "80px",
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

    {/* Empty space between left deck and center */}
    <Col md={2} />

    {/* Center Deck */}
    <Col
      md={2}
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

    {/* Empty space between center and right deck */}
    <Col md={3} />

    {/* Right Deck */}
    <Col md={2} className="position-relative deck-position-right">
      <div
        className="d-flex flex-column align-items-center position-relative"
        onClick={() => handleDeckCardClick("right")}
      >
        {showPopup && answeringPlayer === "right" && (
          <div className="timer-overlay">{timeRemaining}</div>
        )}
        <Image
          src={getPlayerByPosition("right").photo}
          alt="Player Right"
          style={{
            width: "80px",
            height: "80px",
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
</Container>

{/* Bottom Row */}
<Row className="align-items-center justify-content-center">
  <Col xs={"auto"} className="text-center ml-5 ms-5 position-relative">
    <div style={{ position: "relative" }}>
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
  <Col xs="auto" className="d-flex align-items-center p-3">
    <Image
      src={getPlayerByPosition("bottom").photo}
      alt="Player Bottom"
      style={{ width: "80px", height: "80px", borderRadius: "50%" }}
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
              left: "80%",
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