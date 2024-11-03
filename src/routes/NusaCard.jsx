import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row, Image } from "react-bootstrap";
import "../style/routes/NusaCard.css";
import DeckPlayer from "../components/games/DeckPlayer";
import BottomDeckCard from "../components/games/BottomDeckCard";
import HeaderNuca from "../components/games/HeaderGame";
import PertanyaanNuca, {
  getRandomQuestion,
} from "../components/games/PertanyaanNuca";
import Potion from "../components/games/potion";

// Image imports
import potionImage from "../assets/games/Utangga/potion.png";
import shuffleIcon from "../assets/common/shuffle.png";
import checklist from "../assets/common/checklist.png";
import cross from "../assets/common/cross.png";
import victoryImage from "../assets/games/Utangga/victory.png";
import Achievement from "../assets/games/Utangga/achievement1.png";
import Achievement2 from "../assets/games/Utangga/achievement2.png";
import defaultPlayerPhoto from "../assets/games/Utangga/narutoa.png";

// Constants
const INITIAL_DECK_COUNT = 4;
const TIMER_DURATION = 15;
const INACTIVITY_DURATION = 30000;
const FEEDBACK_DURATION = 3000;
const POPUP_TRANSITION_DURATION = 2000;
const TURN_TIMER_DURATION = 10;

// Reintroduce the PLAYERS array with usernames and photos
const PLAYERS = [
  { id: 1, name: "Player1", photo: defaultPlayerPhoto, position: "bottom" },
  { id: 2, name: "Player2", photo: defaultPlayerPhoto, position: "right" },
  { id: 3, name: "Player3", photo: defaultPlayerPhoto, position: "top" },
  { id: 4, name: "Player4", photo: defaultPlayerPhoto, position: "left" },
];

const DECK_ORDER = ["bottom", "right", "top", "left"];

function NusaCard() {
  const navigate = useNavigate();
  const [deckCounts, setDeckCounts] = useState({
    top: INITIAL_DECK_COUNT,
    left: INITIAL_DECK_COUNT,
    right: INITIAL_DECK_COUNT,
  });

  const [cards, setCards] = useState(() =>
    Array.from({ length: INITIAL_DECK_COUNT }, () => getRandomQuestion())
  );

  // Game state
  const [lastActiveDeck, setLastActiveDeck] = useState(null);
  const [currentTurn, setCurrentTurn] = useState("bottom");
  const [isShuffling, setIsShuffling] = useState(true); // Start with shuffling animation
  const [showPopup, setShowPopup] = useState(false);
  const [isExitingPopup, setIsExitingPopup] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  const [deckDepleted, setDeckDepleted] = useState(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [answeringPlayer, setAnsweringPlayer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false); // New state

  // Timers
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [inactivityTimeRemaining, setInactivityTimeRemaining] =
    useState(INACTIVITY_DURATION);
  const timerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Turn timer
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(null);
  const turnTimerRef = useRef(null);

  // Feedback state
  const [feedbackIcon, setFeedbackIcon] = useState({
    show: false,
    isCorrect: null,
    position: null,
  });

  // Reintroduce getPlayerByPosition function
  const getPlayerByPosition = (position) => {
    return PLAYERS.find((player) => player.position === position);
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
          navigate("/");
          return 0;
        }
        return prevTime - 100000;
      });
    }, 100000);
  };

  // Game logic handlers
  const handleDeckCardClick = (deck) => {
    resetInactivityTimer();
    if (
      currentTurn !== deck ||
      showPopup ||
      isActionInProgress ||
      isShuffling
    )
      return;

    // Stop the turn timer
    if (turnTimerRef.current) {
      clearInterval(turnTimerRef.current);
      setTurnTimeRemaining(null);
    }

    if (deckCounts[deck] > 0) {
      setIsActionInProgress(true);
      setDeckCounts((prev) => ({
        ...prev,
        [deck]: prev[deck] - 1,
      }));
      setLastActiveDeck(deck);
      setActiveCard(getRandomQuestion());
      setAnsweringPlayer(getNextPlayer(deck));
      setShowPopup(true);
      setHasAnswered(false); // Reset hasAnswered when a new question is shown
    }
  };

  const handleBottomCardClick = (card, index) => {
    if (
      currentTurn !== "bottom" ||
      showPopup ||
      isActionInProgress ||
      isShuffling
    )
      return;

    // Stop the turn timer
    if (turnTimerRef.current) {
      clearInterval(turnTimerRef.current);
      setTurnTimeRemaining(null);
    }

    setIsActionInProgress(true);
    setActiveCard(card);
    setShowPopup(true);
    setLastActiveDeck("bottom");
    removeCardFromDeck(index);
    setAnsweringPlayer("right");
    setHasAnswered(false); // Reset hasAnswered when a new question is shown
  };

  const handleAnswerSelect = (isCorrect, wasTimeout = false) => {
    if (hasAnswered) return; // Prevent further actions if already answered

    clearInterval(timerRef.current);
    setTimeRemaining(TIMER_DURATION); // Reset the question timer
    setIsCorrectAnswer(isCorrect);
    setHasAnswered(true); // Set hasAnswered to true after selecting an answer

    setFeedbackIcon({
      show: true,
      isCorrect,
      position: answeringPlayer,
    });

    if (!isCorrect && !wasTimeout) {
      incrementDeckCount(answeringPlayer);
    }

    if (
      isCorrect &&
      lastActiveDeck === "left" &&
      answeringPlayer !== "bottom"
    ) {
      addNewCardToDeck();
    }

    // Delay the closing of the popup by 1 second
    setTimeout(() => {
      const nextTurn = getNextTurn();
      setCurrentTurn(nextTurn);
      handleAnswerTimeout();
    }, 1000);
  };

  // Helper functions
  const getNextPlayer = (currentDeck) => {
    const playerMap = {
      bottom: "right",
      right: "top",
      top: "left",
      left: "bottom",
    };
    return playerMap[currentDeck];
  };

  const getNextTurn = () => {
    const currentIndex = DECK_ORDER.indexOf(lastActiveDeck);
    return DECK_ORDER[(currentIndex + 1) % DECK_ORDER.length];
  };

  const removeCardFromDeck = (index) => {
    setCards((prev) => prev.filter((_, cardIndex) => cardIndex !== index));
  };

  const addNewCardToDeck = () => {
    setCards((prev) => [...prev, { ...getRandomQuestion(), isNew: true }]);
  };

  const incrementDeckCount = (deck) => {
    if (deck === "bottom") {
      addNewCardToDeck();
    } else {
      setDeckCounts((prev) => ({
        ...prev,
        [deck]: prev[deck] + 1,
      }));
    }
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
        triggerShuffleAnimation();
      }, POPUP_TRANSITION_DURATION);
    }, FEEDBACK_DURATION);
  };

  const triggerShuffleAnimation = () => {
    setIsShuffling(true);
    setTurnTimeRemaining(null); // Clear turn timer during shuffle
    setTimeout(() => {
      setIsShuffling(false);
      // Start the next player's turn timer after shuffle animation
      startTurnTimer();
    }, 500);
  };

  // Handle turn timeout
  const handleTurnTimeout = () => {
    // Skip the current player's turn
    const nextTurn = getNextPlayer(currentTurn);
    setCurrentTurn(nextTurn);
    setLastActiveDeck(currentTurn); // Update lastActiveDeck to currentTurn before moving on
    triggerShuffleAnimation();
  };

  const startTurnTimer = () => {
    if (victory || deckDepleted || showPopup || isActionInProgress) return;

    setTurnTimeRemaining(TURN_TIMER_DURATION);
    if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    turnTimerRef.current = setInterval(() => {
      setTurnTimeRemaining((prev) => {
        if (prev === 1) {
          clearInterval(turnTimerRef.current);
          handleTurnTimeout();
          return null;
        } else {
          return prev - 1;
        }
      });
    }, 1000);
  };

  // Effects
  useEffect(() => {
    startInactivityTimer();
    window.addEventListener("click", resetInactivityTimer);

    // Start the game with shuffle animation and then start the first turn timer
    setTimeout(() => {
      setIsShuffling(false);
      startTurnTimer();
    }, 500);

    return () => {
      clearInterval(inactivityTimerRef.current);
      window.removeEventListener("click", resetInactivityTimer);
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
      setDeckDepleted("bottom");
    }

    if (deckDepleted && !victory) {
      setVictory(true);
      setWinner(deckDepleted);
    }
  }, [deckCounts, cards, deckDepleted]);

  useEffect(() => {
    if (showPopup && answeringPlayer) {
      setTimeRemaining(TIMER_DURATION);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
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

  // Update turn timer when currentTurn changes
  useEffect(() => {
    if (!isShuffling && !showPopup && !isActionInProgress) {
      startTurnTimer();
    } else {
      // Clear the turn timer if shuffling or popup is shown
      if (turnTimerRef.current) {
        clearInterval(turnTimerRef.current);
        setTurnTimeRemaining(null);
      }
    }
  }, [currentTurn, isShuffling, showPopup, isActionInProgress]);

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

  // Get winner's username
  const getWinnerName = () => {
    const winnerPlayer = getPlayerByPosition(winner);
    return winnerPlayer ? winnerPlayer.name : "";
  };

  return (
    <Container
      fluid
      className="nuca-container d-flex justify-content-around flex-column"
    >
      <HeaderNuca layout="home" />

      <Row className="align-items-center justify-content-center">
  {/* DeckPlayer Column */}
  <Col xs="auto" className="text-center position-relative ms-5 ps-5">
    <div
      onClick={() => handleDeckCardClick("top")}
      className="d-flex align-items-center"
    >
      {currentTurn === "top" && turnTimeRemaining !== null && (
        <div className="timer-overlay-above">{turnTimeRemaining}</div>
      )}
      {showPopup && answeringPlayer === "top" && (
        <div className="timer-overlay">{timeRemaining}</div>
      )}
      <DeckPlayer
        count={deckCounts.top}
        isNew={deckCounts.top === 0}
        position="left"
      />
    </div>
  </Col>

  {/* Player Profile Column */}
  <Col xs="auto" className="d-flex flex-column position-relative ms-5 ps-5">
    <Image
      src={getPlayerByPosition("top").photo}
      alt="Player Profile"
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "50%",
      }}
    />
    <div className="player-name mt-2">
      {getPlayerByPosition("top").name}
    </div>
    {renderFeedbackIcon("top")}
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
              {currentTurn === "left" && turnTimeRemaining !== null && (
                <div className="timer-overlay-above">{turnTimeRemaining}</div>
              )}
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
              <div className="player-name">
                {getPlayerByPosition("left").name}
              </div>
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
              {currentTurn === "right" && turnTimeRemaining !== null && (
                <div className="timer-overlay-above">{turnTimeRemaining}</div>
              )}
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
              <div className="player-name">
                {getPlayerByPosition("right").name}
              </div>
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
            {currentTurn === "bottom" && turnTimeRemaining !== null && (
              <div className="timer-overlay-above">{turnTimeRemaining}</div>
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
        <Col
          xs="auto"
          className="d-flex flex-column align-items-center p-3 position-relative"
        >
          <Image
            src={getPlayerByPosition("bottom").photo}
            alt="Player Bottom"
            style={{ width: "80px", height: "80px", borderRadius: "50%" }}
          />
          <div className="player-name">
            {getPlayerByPosition("bottom").name}
          </div>
        </Col>
      </Row>

      {/* Show the question popup */}
      {showPopup && activeCard && !hasAnswered && (
        // Prevent showing popup if answered
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
          <div className="potion-icon">
            <Potion />
          </div>
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
          <p>Pemenang: {getWinnerName()}</p>
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
