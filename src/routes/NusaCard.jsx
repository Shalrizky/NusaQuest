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
  setNusaCardGameStatus,
  initializeNusaCardGameState,
  getNusaCardGameState,
  listenToNusaCardGameState,
  resetNusaCardGameState, // Pastikan ini diimport
} from "../services/gameDataServicesNuca";

import "../style/routes/NusaCard.css";

// Import gambar yang diperlukan
import potionImage from "../assets/games/potion.png";
import shuffleIcon from "../assets/games/nuca/shuffle.png";
import checklist from "../assets/games/nuca/checklist.png";
import cross from "../assets/games/nuca/cross.png";
import victoryImage from "../assets/games/victory.png";
import Achievement from "../assets/games/achievement1.png";
import Achievement2 from "../assets/games/achievement2.png";

// Konstanta
const INITIAL_DECK_COUNT = 4;
const TIMER_DURATION = 15;
const INACTIVITY_DURATION = 600000;
const FEEDBACK_DURATION = 3000;
const POPUP_TRANSITION_DURATION = 2000;
const TURN_TIMER_DURATION = 10;

function NusaCard() {
  const { gameID, topicID, roomID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);

  const gameIDRef = useRef(gameID);
  const topicIDRef = useRef(topicID);
  const roomIDRef = useRef(roomID);

  const [deckCounts, setDeckCounts] = useState({});
  const [DECK_ORDER, setDECK_ORDER] = useState([]);
  const [positionsMap, setPositionsMap] = useState({});

  // State Game
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

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [inactivityTimeRemaining, setInactivityTimeRemaining] = useState(INACTIVITY_DURATION);
  const timerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  const [turnTimeRemaining, setTurnTimeRemaining] = useState(null);
  const turnTimerRef = useRef(null);

  const [feedbackIcon, setFeedbackIcon] = useState({
    show: false,
    isCorrect: null,
    position: null,
  });

  const [gameStatus, setGameStatusState] = useState('');

  const [cards, setCards] = useState(() =>
    Array.from({ length: INITIAL_DECK_COUNT }, () => getRandomQuestion())
  );

  useEffect(() => {
    const initGame = async () => {
      try {
        // **PENTING: Reset state lama terlebih dahulu agar tidak ada sisa data yang memicu victory**
        await resetNusaCardGameState(topicID, gameID, roomID);

        // Setelah reset, set gameStatus menjadi "playing"
        await setNusaCardGameStatus(topicID, gameID, roomID, "playing");

        // Dengarkan data pemain
        const unsubscribePlayers = fetchNusaCardPlayers(
          topicID, 
          gameID, 
          roomID, 
          async (playersData) => {
            setPlayers(playersData);
            setLoading(false);

            // Setelah dapat data pemain, cek apakah state sudah ada
            const currentGameState = await getNusaCardGameState(topicID, gameID, roomID);
            if (!currentGameState) {
              // Jika tidak ada, inisialisasi state baru
              await initializeNusaCardGameState(topicID, gameID, roomID, playersData);
              console.log("Game state berhasil diinisialisasi.");
            }
          }
        );

        // Dengarkan perubahan pada gameState
        const unsubscribeGameState = listenToNusaCardGameState(topicID, gameID, roomID, (state) => {
          if (state) {
            setDeckCounts(state.deckCounts || {});
            setDECK_ORDER(state.DECK_ORDER || []);
            setGameStatusState(state.gameStatus || 'playing');
          }
        });

        return () => {
          unsubscribePlayers();
          unsubscribeGameState();
        };
      } catch (error) {
        console.error("Error initializing game:", error);
        setLoading(false);
      }
    };

    initGame();
  }, [topicID, gameID, roomID, user.uid]);

  useEffect(() => {
    if (players.length > 0) {
      const currentUserIndex = players.findIndex(p => p.uid === user.uid);
      if (currentUserIndex === -1) {
        console.error('Current user not found in players array');
        return;
      }

      const positionsMap = { 'bottom': players[currentUserIndex] };
      const opponents = players.filter((p, index) => index !== currentUserIndex);

      const opponentPositions = [];
      if (opponents.length === 1) {
        opponentPositions.push('top');
      } else if (opponents.length === 2) {
        opponentPositions.push('right', 'left');
      } else if (opponents.length === 3) {
        opponentPositions.push('right', 'top', 'left');
      }

      opponentPositions.forEach((position, index) => {
        positionsMap[position] = opponents[index];
      });

      setPositionsMap(positionsMap);

      let initialDeckCounts = {
        bottom: INITIAL_DECK_COUNT,
      };
      opponentPositions.forEach(position => {
        initialDeckCounts[position] = INITIAL_DECK_COUNT;
      });

      setDeckCounts(initialDeckCounts);
      setDECK_ORDER(['bottom', ...opponentPositions]);
    }
  }, [players, user.uid]);

  const getPlayerByPosition = (position) => {
    return positionsMap[position] || null;
  };

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
        if (prevTime <= 1000) {
          clearInterval(inactivityTimerRef.current);
          navigate("/");
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);
  };

  const handleDeckCardClick = (deck) => {
    resetInactivityTimer();
    if (currentTurn !== deck || showPopup || isActionInProgress || isShuffling)
      return;

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
    if (currentTurn !== "bottom" || showPopup || isActionInProgress || isShuffling)
      return;

    if (turnTimerRef.current) {
      clearInterval(turnTimerRef.current);
      setTurnTimeRemaining(null);
    }

    setIsActionInProgress(true);
    setActiveCard(card);
    setShowPopup(true);
    setLastActiveDeck("bottom");
    setAnsweringPlayer(getNextPlayer("bottom"));
    setHasAnswered(false);

    removeCardFromDeck(index);
  };

  const handleAnswerSelect = (isCorrect, wasTimeout = false) => {
    if (hasAnswered) return;

    clearInterval(timerRef.current);
    setTimeRemaining(TIMER_DURATION);
    setIsCorrectAnswer(isCorrect);
    setHasAnswered(true);

    setFeedbackIcon({
      show: true,
      isCorrect,
      position: answeringPlayer,
    });

    if (!isCorrect && !wasTimeout) {
      incrementDeckCount(answeringPlayer);
    }

    if (isCorrect && lastActiveDeck !== "bottom" && answeringPlayer !== "bottom") {
      addNewCardToDeck();
    }

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
        setIsActionInProgress(false);
      }, POPUP_TRANSITION_DURATION);
    }, FEEDBACK_DURATION);
  };

  const triggerShuffleAnimation = () => {
    setIsShuffling(true);
    setTurnTimeRemaining(null);
    setTimeout(() => {
      setIsShuffling(false);
      startTurnTimer();
    }, 500);
  };

  const handleTurnTimeout = () => {
    const nextTurn = getNextPlayer(currentTurn);
    setCurrentTurn(nextTurn);
    setLastActiveDeck(currentTurn);
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

  useEffect(() => {
    startInactivityTimer();
    const resetTimerOnActivity = () => resetInactivityTimer();

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

    // Cek victory hanya jika gameStatus = 'playing'
    if (gameStatus !== 'playing') return;

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
  }, [deckCounts, cards, deckDepleted, victory, gameStatus]);

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

  useEffect(() => {
    if (!isShuffling && !showPopup && !isActionInProgress) {
      startTurnTimer();
    } else {
      if (turnTimerRef.current) {
        clearInterval(turnTimerRef.current);
        setTurnTimeRemaining(null);
      }
    }
  }, [currentTurn, isShuffling, showPopup, isActionInProgress]);

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

      <Container fluid>
        <Row className="mb-5 mt-n3 align-items-center">
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

      {victory && (
        <div className="victory-overlay" onClick={async () => {
          // Reset state setelah kemenangan agar game baru dimulai fresh lain kali
          await resetNusaCardGameState(topicID, gameID, roomID);
          navigate("/");
        }}>
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
