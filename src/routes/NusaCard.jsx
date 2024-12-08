// NusaCard.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Col, Container, Row, Image, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth"; 
import DeckPlayer from "../components/games/nuca/DeckPlayer";
import BottomDeckCard from "../components/games/nuca/BottomDeckCard";
import HeaderNuca from "../components/games/HeaderGame";
import PertanyaanNuca from "../components/games/nuca/PertanyaanNuca";
import Potion from "../components/games/potion";
import PlayerProfile from "../components/games/nuca/PlayerProfile";

import { 
  fetchNusaCardPlayers, 
  setNusaCardGameStatus,
  initializeNusaCardGameState,
  getNusaCardGameState,
  listenToNusaCardGameState,
  resetNusaCardGameState,
  checkVictoryCondition,
  submitPlayerAnswer,
  listenToPlayerAnswers,
  cleanupNusaCardGame,
} from "../services/gameDataServicesNuca";

import "../style/routes/NusaCard.css";

// Import images
import potionImage from "../assets/games/potion.png";
import shuffleIcon from "../assets/games/nuca/shuffle.png";
import victoryImage from "../assets/games/victory.png";
import Achievement from "../assets/games/achievement1.png";
import Achievement2 from "../assets/games/achievement2.png";

// Constants
const INITIAL_DECK_COUNT = 4;
const TIMER_DURATION = 15; // Time for answering a question
const INACTIVITY_DURATION = 600000; // 10 minutes in milliseconds
const FEEDBACK_DURATION = 3000; // 3 seconds in milliseconds
const POPUP_TRANSITION_DURATION = 2000; // 2 seconds in milliseconds
const TURN_TIMER_DURATION = 10; // 10 seconds

function NusaCard() {
  const { gameID, topicID, roomID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);

  const [deckCounts, setDeckCounts] = useState({});
  const [DECK_ORDER, setDECK_ORDER] = useState([]);
  const [positionsMap, setPositionsMap] = useState({});

  // Game State
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

  // Ref to track if component is mounted
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize Game
  useEffect(() => {
    const initGame = async () => {
      try {
        // **IMPORTANT: Reset old state first to avoid leftover data triggering victory**
        await resetNusaCardGameState(topicID, gameID, roomID);

        // After reset, set gameStatus to "playing"
        await setNusaCardGameStatus(topicID, gameID, roomID, "playing");

        // Listen to players data
        const unsubscribePlayers = fetchNusaCardPlayers(
          topicID, 
          gameID, 
          roomID, 
          async (playersData) => {
            console.log("Players fetched:", playersData);
            setPlayers(playersData);
            setLoading(false);

            // After getting players data, check if state exists
            const currentGameState = await getNusaCardGameState(topicID, gameID, roomID);
            if (!currentGameState) {
              // If not, initialize new state
              await initializeNusaCardGameState(topicID, gameID, roomID, playersData);
              console.log("Game state initialized successfully.");
            }
          }
        );

        // Listen to gameState changes
        const unsubscribeGameState = listenToNusaCardGameState(topicID, gameID, roomID, (state) => {
          console.log("Real-time game state update received:", state);
          if (state) {
            setDeckCounts(state.deckCounts || {});
            setDECK_ORDER(state.DECK_ORDER || []);
            setGameStatusState(state.gameStatus || 'playing');
            setCards(state.cards || []);
            // Update other states based on gameState if necessary
            setIsShuffling(state.isShuffling || false);
            setVictory(state.victory || false);
            setWinner(state.winner || "");
            setDeckDepleted(state.deckDepleted || null);
            setShowPopup(state.showPopup || false);
            setActiveCard(state.activeCard || null);
            setHasAnswered(state.hasAnswered || false);
            setIsActionInProgress(state.isActionInProgress || false);
            setAnsweringPlayer(state.answeringPlayer || null);
            setIsCorrectAnswer(state.isCorrectAnswer || null);
            setFeedbackIcon(state.feedbackIcon || { show: false, isCorrect: null, position: null });
            // setPlayerWhoPlayed(state.playerWhoPlayed || null); // Optional: Jika perlu

            // Additional Logic to Show Popup if Another Player Played a Card
            if (state.activeCard && state.playerWhoPlayed !== user.uid) {
              setShowPopup(true);
              setActiveCard(state.activeCard);
              setAnsweringPlayer(state.answeringPlayer);
              setIsActionInProgress(state.isActionInProgress);
              setHasAnswered(false);
              // Reset feedback icon or other necessary states
            }
          }
        });

        // Listen to player answers
        const unsubscribePlayerAnswers = listenToPlayerAnswers(
          topicID,
          gameID,
          roomID,
          (answersData) => {
            console.log("Player answers received:", answersData);
            // Implement logic to handle player answers if needed
          }
        );

        return () => {
          unsubscribePlayers();
          unsubscribeGameState();
          unsubscribePlayerAnswers();
        };
      } catch (error) {
        console.error("Error initializing game:", error);
        setLoading(false);
      }
    };

    initGame();
  }, [topicID, gameID, roomID, user.uid]);

  // Map Players to Positions
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
          console.log("Inactivity timeout reached. Redirecting to home.");
          navigate("/");
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);
  };

  const handleDeckCardClick = async (deck) => {
    console.log(`Deck clicked: ${deck}`);
    resetInactivityTimer();
    if (
      currentTurn !== deck ||
      showPopup ||
      isActionInProgress ||
      isShuffling
    )
      return;

    if (deckCounts[deck] > 0) {
      console.log(`Deck "${deck}" has cards. Proceeding to play.`);
      setIsActionInProgress(true);
      setDeckCounts((prev) => ({
        ...prev,
        [deck]: prev[deck] - 1,
      }));
      setLastActiveDeck(deck);
      const newCard = getRandomQuestion();
      const nextPlayer = getNextPlayer(deck);

      // Update the game state in Firebase
      await updateNusaCardGameState(topicID, gameID, roomID, {
        deckCounts: { [deck]: deckCounts[deck] - 1 },
        activeCard: newCard,
        playerWhoPlayed: user.uid, // Mengatur pemain yang melempar kartu
        showPopup: true,
        answeringPlayer: nextPlayer,
        isActionInProgress: true,
        lastActiveDeck: deck,
      });

      // Optionally, you can add the new card to the deck in Firebase if needed
    }
  };

  const handleBottomCardClick = async (card, index) => {
    console.log("BottomDeckCard clicked:", { card, index });
    resetInactivityTimer();
    if (
      currentTurn !== "bottom" ||
      showPopup ||
      isActionInProgress ||
      isShuffling
    )
      return;

    setIsActionInProgress(true);
    setActiveCard(card);
    setShowPopup(true);
    setLastActiveDeck("bottom");
    setAnsweringPlayer(getNextPlayer("bottom"));
    setHasAnswered(false);

    removeCardFromDeck(index);

    // Update the game state in Firebase
    await updateNusaCardGameState(topicID, gameID, roomID, {
      cards: cards.filter((_, cardIndex) => cardIndex !== index),
      activeCard: card,
      playerWhoPlayed: user.uid,
      showPopup: true,
      answeringPlayer: getNextPlayer("bottom"),
      isActionInProgress: true,
      lastActiveDeck: "bottom",
    });
  };

  const handleAnswerSelect = async (isCorrect, wasTimeout = false) => {
    if (hasAnswered) return;

    console.log("Answer selected:", { isCorrect, wasTimeout });

    clearInterval(timerRef.current);
    setTimeRemaining(TIMER_DURATION);
    setIsCorrectAnswer(isCorrect);
    setHasAnswered(true);

    setFeedbackIcon({
      show: true,
      isCorrect,
      position: answeringPlayer,
    });

    // Submit player's answer to Firebase
    await submitPlayerAnswer(topicID, gameID, roomID, user.uid, isCorrect);

    if (!isCorrect && !wasTimeout) {
      console.log(`Answer incorrect. Incrementing deck count for ${answeringPlayer}.`);
      incrementDeckCount(answeringPlayer);
    }

    if (
      isCorrect &&
      lastActiveDeck !== "bottom" &&
      answeringPlayer !== "bottom"
    ) {
      console.log(`Answer correct. Adding new card to deck.`);
      addNewCardToDeck();
    }

    // After FEEDBACK_DURATION, proceed to the next turn
    setTimeout(async () => {
      if (!isMounted.current) return; // Prevent state updates if unmounted

      // Reset relevant fields in Firebase
      await updateNusaCardGameState(topicID, gameID, roomID, {
        showPopup: false,
        activeCard: null,
        isCorrectAnswer: null,
        feedbackIcon: { show: false, isCorrect: null, position: null },
        isActionInProgress: false,
        answeringPlayer: null,
        hasAnswered: false,
      });

      const nextTurn = getNextTurn();
      console.log(`Proceeding to next turn: ${nextTurn}`);
      setCurrentTurn(nextTurn);
      setAnsweringPlayer(getNextPlayer(nextTurn));
      handleAnswerTimeout();
    }, FEEDBACK_DURATION);
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
    console.log(`Removing card at index ${index} from deck.`);
    setCards((prev) => prev.filter((_, cardIndex) => cardIndex !== index));
    // Optionally, update Firebase
  };

  const addNewCardToDeck = () => {
    const newCard = { ...getRandomQuestion(), isNew: true };
    console.log("Adding new card to deck:", newCard);
    setCards((prev) => [...prev, newCard]);
    // Optionally, update Firebase
  };

  const incrementDeckCount = (deck) => {
    if (deck === "bottom") {
      console.log("Adding new card to bottom deck.");
      addNewCardToDeck();
    } else {
      console.log(`Incrementing deck count for ${deck}.`);
      setDeckCounts((prev) => ({
        ...prev,
        [deck]: prev[deck] + 1,
      }));
    }
    // Optionally, update Firebase
  };

  const handleAnswerTimeout = () => {
    setTimeout(() => {
      if (!isMounted.current) return;
      console.log("Handling answer timeout.");
      setIsCorrectAnswer(null);
      setActiveCard(null);
      setIsExitingPopup(true);

      setTimeout(() => {
        if (!isMounted.current) return;
        setShowPopup(false);
        setIsExitingPopup(false);
        setAnsweringPlayer(null);
        setFeedbackIcon({ show: false, isCorrect: null, position: null });
        triggerShuffleAnimation();
        setIsActionInProgress(false); // Reset the action flag
      }, POPUP_TRANSITION_DURATION);
    }, FEEDBACK_DURATION);
  };

  const triggerShuffleAnimation = () => {
    console.log("Triggering shuffle animation.");
    setIsShuffling(true);
    setTurnTimeRemaining(null);
    setTimeout(() => {
      if (!isMounted.current) return;
      setIsShuffling(false);
      startTurnTimer();
    }, 500);
  };

  const handleTurnTimeout = () => {
    console.log("Turn timer expired. Proceeding to next turn.");
    const nextTurn = getNextPlayer(currentTurn);
    setCurrentTurn(nextTurn);
    setLastActiveDeck(currentTurn);
    setAnsweringPlayer(getNextPlayer(nextTurn));
    triggerShuffleAnimation();
  };

  const startTurnTimer = () => {
    if (victory || deckDepleted || showPopup || isActionInProgress) return;

    console.log(`Starting turn timer for ${TURN_TIMER_DURATION} seconds.`);
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

  // Initialize inactivity timer and reset on user activity
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

  // Monitor game state for victory conditions
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Check victory only if gameStatus = 'playing'
    if (gameStatus !== 'playing') return;

    let victoryTriggered = false;

    Object.entries(deckCounts).forEach(([deck, count]) => {
      if (count === 0 && !deckDepleted) {
        console.log(`Deck "${deck}" depleted. Victory condition met.`);
        setDeckDepleted(deck);
        victoryTriggered = true;
      }
    });

    if (cards.length === 0 && !deckDepleted) {
      console.log(`All cards depleted from bottom deck. Victory condition met.`);
      setDeckDepleted("bottom");
      victoryTriggered = true;
    }

    if (victoryTriggered && !victory) {
      setVictory(true);
      setWinner(deckDepleted || "bottom");
      setIsActionInProgress(false); // Reset the action flag on victory
      console.log(`Victory triggered! Winner: ${deckDepleted || "bottom"}`);
    }
  }, [deckCounts, cards, deckDepleted, victory, gameStatus]);

  // Handle popup timer
  useEffect(() => {
    if (showPopup && answeringPlayer) {
      console.log(`Popup opened. Starting answer timer for ${TIMER_DURATION} seconds.`);
      setTimeRemaining(TIMER_DURATION);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [showPopup, answeringPlayer]);

  // Handle answer timeout
  useEffect(() => {
    if (timeRemaining === 0) {
      console.log("Answer timer expired.");
      handleAnswerSelect(false, true);
    }
  }, [timeRemaining]);

  // Start turn timer when appropriate
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

  // Handle loading state
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

      {/* Display Pop-up Pertanyaan untuk Pemain Lain */}
      {showPopup && activeCard && playerWhoPlayed !== user.uid && (
        <>
          <div style={{ position: "relative", zIndex: "2000" }}>
            <PertanyaanNuca
              question={activeCard.question}
              options={activeCard.options}
              correctAnswer={activeCard.correctAnswer}
              onAnswerSelect={(isCorrect) => handleAnswerSelect(isCorrect)}
              isExiting={isExitingPopup}
            />
          </div>
          <div className="potion-icon">
            <Potion />
          </div>
        </>
      )}

      {/* Display Pop-up Pertanyaan untuk Pemain yang Memainkan Kartu */}
      {showPopup && activeCard && playerWhoPlayed === user.uid && (
        <>
          <div style={{ position: "relative", zIndex: "2000" }}>
            <PertanyaanNuca
              question={activeCard.question}
              options={activeCard.options}
              correctAnswer={activeCard.correctAnswer}
              onAnswerSelect={(isCorrect) => handleAnswerSelect(isCorrect)}
              isExiting={isExitingPopup}
            />
          </div>
          <div className="potion-icon">
            <Potion />
          </div>
        </>
      )}

      {/* Victory Overlay */}
      {victory && (
        <div
          className="victory-overlay"
          onClick={async () => {
            console.log("Victory overlay clicked. Cleaning up game.");
            // Reset state after victory to start a fresh game next time
            await cleanupNusaCardGame(topicID, gameID, roomID);
            navigate("/");
          }}
        >
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
