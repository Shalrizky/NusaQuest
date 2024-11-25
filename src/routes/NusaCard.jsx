import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Col, Container, Row, Image, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth"; 
import DeckPlayer from "../components/games/nuca/DeckPlayer";
import BottomDeckCard from "../components/games/nuca/BottomDeckCard";
import HeaderNuca from "../components/games/HeaderGame";
import PertanyaanNuca, { getRandomQuestion } from "../components/games/nuca/PertanyaanNuca";
import Potion from "../components/games/potion";
import PlayerProfile from "../components/games/nuca/PlayerProfile";

import { 
  fetchNusaCardPlayers, 
  setNusaCardGameStatus 
} from "../services/gameDataServicesNuca";
import "../style/routes/NusaCard.css";

// Image imports
import potionImage from "../assets/games/potion.png";
import shuffleIcon from "../assets/games/nuca/shuffle.png";
import checklist from "../assets/games/nuca/checklist.png";
import cross from "../assets/games/nuca/cross.png";
import victoryImage from "../assets/games/victory.png";
import Achievement from "../assets/games/achievement1.png";
import Achievement2 from "../assets/games/achievement2.png";
import defaultPlayerPhoto from "../assets/games/Utangga/narutoa.png";

// Constants
const INITIAL_DECK_COUNT = 4;
const TIMER_DURATION = 15;
const INACTIVITY_DURATION = 600000;
const FEEDBACK_DURATION = 3000;
const POPUP_TRANSITION_DURATION = 2000;
const TURN_TIMER_DURATION = 10;

function NusaCard() {
  const { gameID, topicID, roomID } = useParams(); // Gunakan useParams untuk mendapatkan ID
  const { user } = useAuth(); // Dapatkan data user yang login
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]); // State untuk menyimpan data pemain

  // Gunakan useRef untuk menyimpan referensi ID
  const gameIDRef = useRef(gameID);
  const topicIDRef = useRef(topicID);
  const roomIDRef = useRef(roomID);

  const [deckCounts, setDeckCounts] = useState({});
  const [DECK_ORDER, setDECK_ORDER] = useState([]);

  const [positionsMap, setPositionsMap] = useState({});


  // Fetch players saat komponen dimuat
  useEffect(() => {
    const initGame = async () => {
      try {
        // Set status game
        await setNusaCardGameStatus(topicID, gameID, roomID, "playing");

        // Fetch players
        const unsubscribe = fetchNusaCardPlayers(
          topicID, 
          gameID, 
          roomID, 
          (playersData) => {
            setPlayers(playersData);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error initializing game:", error);
        setLoading(false);
      }
    };

    initGame();
  }, [topicID, gameID, roomID]);

  const [cards, setCards] = useState(() =>
    Array.from({ length: INITIAL_DECK_COUNT }, () => getRandomQuestion())
  );

  // Game state
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [hints, setHints] = useState([]);
  const [lastActiveDeck, setLastActiveDeck] = useState(null);
  const [currentTurn, setCurrentTurn] = useState("bottom");
  const [isShuffling, setIsShuffling] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [isExitingPopup, setIsExitingPopup] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  const [deckDepleted, setDeckDepleted] = useState(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [answeringPlayer, setAnsweringPlayer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

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

  // Get number of players
  const numPlayers = players.length;

  // **Initialize positionsMap, deckCounts, and DECK_ORDER when players change**
  useEffect(() => {
    if (players.length > 0) {
      // Find the index of the current user
      const currentUserIndex = players.findIndex(p => p.uid === user.uid);
      if (currentUserIndex === -1) {
        console.error('Current user not found in players array');
        return;
      }

      // The current user is at 'bottom'
      const positionsMap = { 'bottom': players[currentUserIndex] };

      // Create an array of opponents
      const opponents = players.filter((p, index) => index !== currentUserIndex);

      // Depending on the number of opponents, assign positions
      const opponentPositions = [];
      if (opponents.length === 1) {
        opponentPositions.push('top');
      } else if (opponents.length === 2) {
        opponentPositions.push('right', 'left');
      } else if (opponents.length === 3) {
        opponentPositions.push('right', 'top', 'left');
      }

      // Create the mapping
      opponentPositions.forEach((position, index) => {
        positionsMap[position] = opponents[index];
      });

      setPositionsMap(positionsMap);

      // Initialize deckCounts for opponents
      let initialDeckCounts = {};
      opponentPositions.forEach(position => {
        initialDeckCounts[position] = INITIAL_DECK_COUNT;
      });

      setDeckCounts(initialDeckCounts);

      // Set DECK_ORDER
      setDECK_ORDER(['bottom', ...opponentPositions]);
    }
  }, [players]);

  // **Adjust getPlayerByPosition to use positionsMap**
  const getPlayerByPosition = (position) => {
    return positionsMap[position] || null;
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
        if (prevTime <= 1000) { // Check closer to timeout for inactivity
          clearInterval(inactivityTimerRef.current);
          navigate("/");
          return 0;
        }
        return prevTime - 1000; // Reduce time in smaller intervals (1 second)
      });
    }, 1000);
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
      setHasAnswered(false); 
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
    setAnsweringPlayer(getNextPlayer("bottom"));
    setHasAnswered(false); // Reset hasAnswered when a new question is shown
  
    // Remove the clicked card from the deck
    removeCardFromDeck(index);
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
      lastActiveDeck !== "bottom" && // Adjusted for dynamic decks
      answeringPlayer !== "bottom"
    ) {
      addNewCardToDeck();
    }

    // Delay the closing of the popup by 1 second
    setTimeout(() => {
      const nextTurn = getNextTurn();
      setCurrentTurn(nextTurn);
      setAnsweringPlayer(getNextPlayer(nextTurn));
      handleAnswerTimeout();
    }, 3000);
  };

  const getNextPlayer = (currentDeck) => {
    const currentIndex = DECK_ORDER.indexOf(currentDeck);
    const nextIndex = (currentIndex + 1) % DECK_ORDER.length;
    return DECK_ORDER[nextIndex];
  };  

  const getNextTurn = () => {
    const currentIndex = DECK_ORDER.indexOf(lastActiveDeck);
    const nextIndex = (currentIndex + 1) % DECK_ORDER.length;
    return DECK_ORDER[nextIndex];
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
        setAnsweringPlayer(null);
        setFeedbackIcon({ show: false, isCorrect: null, position: null });
        triggerShuffleAnimation();
        // Move setIsActionInProgress(false) here
        setIsActionInProgress(false);
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
    setAnsweringPlayer(getNextPlayer(nextTurn));
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
    const resetTimerOnActivity = () => resetInactivityTimer();

    // Add event listeners for user activity
    window.addEventListener("click", resetTimerOnActivity);
    window.addEventListener("keydown", resetTimerOnActivity);

    return () => {
      clearInterval(inactivityTimerRef.current);
      window.removeEventListener("click", resetTimerOnActivity);
      window.removeEventListener("keydown", resetTimerOnActivity);
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


  // Get winner's username
  const getWinnerName = () => {
    const winnerPlayer = getPlayerByPosition(winner);
    return winnerPlayer ? winnerPlayer.displayName : "";
  };

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(loadingTimeout);
  }, []);

   // Render loading
   if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );

  }

  return (
    <Container
      fluid
      className="nuca-container d-flex justify-content-around flex-column"
    >
      <HeaderNuca
        layout="home"
        hints={hints}
        showOffcanvas={showOffcanvas}
        setShowOffcanvas={setShowOffcanvas}
        onCloseOffcanvas={() => {
          setShowOffcanvas(false);
        }}
      />

      {/* Top Player */}
{positionsMap['top'] && (
   <Row className="align-items-center justify-content-center mt-0">
     <Col xs={12} md="auto" className="text-center position-relative ms-5 ps-5">
       <div
         onClick={() => handleDeckCardClick("top")}
         className="d-flex align-items-center justify-content-center"
       >
         {currentTurn === "top" && turnTimeRemaining !== null && (
           <div className="timer-overlay-above">{turnTimeRemaining}</div>
         )}
         {showPopup && !hasAnswered && answeringPlayer === "top" && (
           <div className="timer-overlay">{timeRemaining}</div>
         )}
         <DeckPlayer
           count={deckCounts.top}
           isNew={deckCounts.top === 0}
           position="left"
         />
       </div>
     </Col>

     <Col xs={12} md="auto" className="d-flex flex-column align-items-center position-relative ms-5 ps-5 mt-3 mt-md-0">
       <PlayerProfile
         photoURL={getPlayerByPosition("top")?.photoURL}
         displayName={getPlayerByPosition("top")?.displayName || "Top Player"}
         position="top"
         currentTurn={currentTurn}
         answeringPlayer={answeringPlayer}
         turnTimeRemaining={turnTimeRemaining}
         timeRemaining={timeRemaining}
         feedbackIcon={feedbackIcon}
         onDeckCardClick={handleDeckCardClick}
         deckOrder={DECK_ORDER}
       />
     </Col>
   </Row>
)}

{/* Middle Row */}
<Container fluid>
  <Row className="mb-5 mt-n3 align-items-center">
    {/* Left Deck */}
    {positionsMap['left'] && (
      <Col xs={12} md={3} className="position-relative deck-position-left mb-4 mb-md-0">
        <div className="d-flex flex-column align-items-center">
          <PlayerProfile
            photoURL={getPlayerByPosition("left")?.photoURL}
            displayName={getPlayerByPosition("left")?.displayName || "Left Player"}
            position="left"
            currentTurn={currentTurn}
            answeringPlayer={answeringPlayer}
            turnTimeRemaining={turnTimeRemaining}
            timeRemaining={timeRemaining}
            feedbackIcon={feedbackIcon}
            onDeckCardClick={handleDeckCardClick}
            deckOrder={DECK_ORDER}
          />

          <DeckPlayer
            count={deckCounts.left}
            isNew={deckCounts.left === 0}
            style={{ transform: "rotate(90deg)" }}
          />
        </div>
      </Col>
    )}

    {/* Center Deck */}
    <Col
      xs={12}
      md={11}
      className="deck-tengah position-relative d-flex justify-content-center align-items-center mt-3 mt-md-0"
    >
      <DeckPlayer count={4} isNew={false} />
      <div
        className={`position-absolute d-flex justify-content-center align-items-center ${
          isShuffling ? "shuffle-rotate" : ""
        }`}
        style={{ width: "250px" }}
      >
        <Image src={shuffleIcon} style={{ width: "100%", height: "100%" }} />
      </div>
    </Col>

    {/* Right Deck */}
    {positionsMap['right'] && (
      <Col xs={12} md={3} className="position-relative deck-position-right mb-4 mb-md-0">
        <div className="d-flex flex-column align-items-center">
          <PlayerProfile
            photoURL={getPlayerByPosition("right")?.photoURL}
            displayName={getPlayerByPosition("right")?.displayName || "Right Player"}
            position="right"
            currentTurn={currentTurn}
            answeringPlayer={answeringPlayer}
            turnTimeRemaining={turnTimeRemaining}
            timeRemaining={timeRemaining}
            feedbackIcon={feedbackIcon}
            onDeckCardClick={handleDeckCardClick}
            deckOrder={DECK_ORDER}
          />
          <DeckPlayer
            count={deckCounts.right}
            isNew={deckCounts.right === 0}
            position="right"
            style={{ transform: "rotate(-90deg)" }}
          />
        </div>
      </Col>
    )}
  </Row>
</Container>


 {/* Bottom Deck */}
<Row className="align-items-center justify-content-center mt-3">
  <Col xs={12} md="auto" className="text-center position-relative mb-3 mb-md-0">
    <div style={{ position: "relative" }}>
      {showPopup && !hasAnswered && answeringPlayer === "bottom" && (
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
    </div>
  </Col>

  {/* Player Profile */}
  <Col xs={12} md="auto" className="d-flex align-items-center justify-content-start ps-3">
    <PlayerProfile
      photoURL={getPlayerByPosition("bottom")?.photoURL}
      displayName={getPlayerByPosition("bottom")?.displayName || "Bottom Player"}
      position="bottom"
      currentTurn={currentTurn}
      answeringPlayer={answeringPlayer}
      turnTimeRemaining={turnTimeRemaining}
      timeRemaining={timeRemaining}
      feedbackIcon={feedbackIcon}
      onDeckCardClick={handleDeckCardClick}
      deckOrder={DECK_ORDER}
    />
  </Col>
</Row>


      {/* Show the question popup */}
      {showPopup && activeCard && !hasAnswered && (
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
          <img src={victoryImage} alt="Victory Logo" className="victory-logo" />
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
