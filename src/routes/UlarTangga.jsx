import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image, Form, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import HeaderGame from "../components/games/HeaderGame";
import Board from "../components/games/React-KonvaUlar";
import Dice from "../components/games/Dice";
import Potion from "../components/games/potion";
import {
  fetchGamePlayers,
  setGameStatus,
  cleanupGame,
} from "../services/gameDataServices";
import "../style/routes/UlarTangga.css";
import victoryImage from "../assets/games/Utangga/victory.png";
import Achievement from "../assets/games/Utangga/achievement1.png";
import Achievement2 from "../assets/games/Utangga/achievement2.png";
import potionImage from "../assets/games/Utangga/potion.png";

// Import timer utilities
import { usePlayerTimer, useGameTimer } from "../utils/timerUtils";

// Definisi pertanyaan
const questions = [
  {
    id: 1,
    question:
      "Makanan paling enak apa di Jawa barat yang tipenya salad dengan bumbu kacang?",
    options: ["Soto Betawi", "Gudeg", "Batagor", "Rendang"],
    correctAnswer: "Gudeg",
  },
  {
    id: 2,
    question: "Siapa pahlawan nasional dari Jawa Timur?",
    options: ["Diponegoro", "Sudirman", "Bung Tomo", "Soekarno"],
    correctAnswer: "Bung Tomo",
  },
];

const tanggaUp = {
  5: 24,
  16: 66,
  61: 80,
  64: 75,
  72: 88,
  85: 94,
  19: 59,
  27: 48,
  49: 69,
};

const snakesDown = {
  22: 1,
  29: 8,
  57: 38,
  65: 43,
  67: 13,
  90: 48,
  93: 66,
  98: 76,
};

function UlarTangga() {
  const { gameID, topicID, roomID } = useParams();
  const [players, setPlayers] = useState([]);
  const { user } = useAuth();
  const [pionPositionIndex, setPionPositionIndex] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isPionMoving, setIsPionMoving] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [victory, setVictory] = useState(false);
  const [allowExtraRoll, setAllowExtraRoll] = useState(false);
  const [winner, setWinner] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const navigate = useNavigate();

  // Player timer, reset with each player's turn
  const [timeLeft, resetPlayerTimer] = usePlayerTimer(30, () => nextPlayer());

  // Global game timer
  const gameTimeLeft = useGameTimer(1800, () => setGameOver(true));

  // Initialize game
  useEffect(() => {
    const initializeGame = async () => {
      try {
        await setGameStatus(topicID, gameID, roomID, "playing");
        setIsGameReady(true);
      } catch (error) {
        console.error("Error setting game status:", error);
      }
    };

    initializeGame();
  }, [topicID, gameID, roomID]);

  // Setup players
  useEffect(() => {
    if (!isGameReady) return;

    const unsubscribe = fetchGamePlayers(
      topicID,
      gameID,
      roomID,
      (playersData) => {
        setPlayers(playersData);
        setPionPositionIndex(new Array(playersData.length).fill(0));

        if (playersData.length === 0) {
          cleanupGame(topicID, gameID, roomID, user);
          navigate("/");
        }
      }
    );

    return () => unsubscribe();
  }, [isGameReady, topicID, gameID, roomID, user, navigate]);

  // Cleanup on unmount or game end
  useEffect(() => {
    return () => {
      if (victory || gameOver) {
        cleanupGame(topicID, gameID, roomID, user);
      }
    };
  }, [victory, gameOver, topicID, gameID, roomID, user]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      cleanupGame(topicID, gameID, roomID, user);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [topicID, gameID, roomID, user]);

  // Ensure currentPlayerIndex is within bounds
  useEffect(() => {
    if (currentPlayerIndex >= players.length) {
      setCurrentPlayerIndex(0);
    }
  }, [currentPlayerIndex, players.length]);

  // Handle game over
  useEffect(() => {
    if (gameOver) {
      alert("Waktu permainan habis! Permainan telah berakhir.");
      navigate("/");
    }
  }, [gameOver, navigate]);

  const nextPlayer = () => {
    if (players.length > 0) {
      setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
      resetPlayerTimer(); // Reset timer untuk pemain berikutnya
    }
  };

  const handleDiceRollComplete = (diceNumber) => {
    if (players.length === 0) return;

    setIsPionMoving(true);

    setPionPositionIndex((prevPositions) => {
      const newPositions = [...prevPositions];
      const playerIndex = currentPlayerIndex % players.length;

      let newPosition = newPositions[playerIndex] + diceNumber;

      if (!Number.isFinite(newPosition)) {
        console.error("Invalid newPosition:", newPosition);
        newPosition = 0;
      }

      if (newPosition > 99) newPosition = 99;

      newPositions[playerIndex] = newPosition;

      if (newPosition === 99) {
        setVictory(true);
        setWinner(players[playerIndex]?.displayName || "Player");
      }

      return newPositions;
    });

    setTimeout(() => {
      setPionPositionIndex((prevPositions) => {
        const newPositions = [...prevPositions];
        let newPosition = newPositions[currentPlayerIndex];

        if (victory) return prevPositions;

        if (tanggaUp[newPosition]) {
          setShowQuestion(true);
          setWaitingForAnswer(true);
          setSubmitted(false);
          setIsCorrect(null);
          setAllowExtraRoll(false);
        } else if (snakesDown[newPosition]) {
          newPosition = snakesDown[newPosition];
          newPositions[currentPlayerIndex] = newPosition;
          nextPlayer();
        } else if (diceNumber === 6) {
          setShowQuestion(true);
          setWaitingForAnswer(true);
          setSubmitted(false);
          setIsCorrect(null);
          setAllowExtraRoll(true);
        } else if (allowExtraRoll) {
          setAllowExtraRoll(false);
          nextPlayer();
        } else {
          nextPlayer();
        }

        return newPositions;
      });

      setIsPionMoving(false);
    }, 2000);

    setSubmitted(false);
    setIsCorrect(null);
    resetPlayerTimer(); // Reset timer untuk pemain berikutnya
  };

  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setSelectedAnswer(answer);

    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    const isAnswerCorrect = answer === correctAnswer;
    setIsCorrect(isAnswerCorrect);
    setSubmitted(true);

    if (isAnswerCorrect) {
      if (allowExtraRoll) {
        // Allow extra roll logic
      } else {
        setPionPositionIndex((prevPositions) => {
          const newPositions = [...prevPositions];
          const currentPos = newPositions[currentPlayerIndex];

          if (tanggaUp[currentPos]) {
            const targetPosition = tanggaUp[currentPos];
            newPositions[currentPlayerIndex] = targetPosition;
          }

          return newPositions;
        });
        setAllowExtraRoll(false);
        nextPlayer();
      }
    } else {
      setAllowExtraRoll(false);
      nextPlayer();
    }

    setTimeout(() => {
      setShowQuestion(false);
      setWaitingForAnswer(false);
      setCurrentQuestionIndex(
        (prevIndex) => (prevIndex + 1) % questions.length
      );
    }, 1800);
  };

  if (!isGameReady) {
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="utangga-container d-flex flex-column">
      <HeaderGame layout="home" />

      {/* Global Game Timer Display (uncomment when debugging) */}
      {/* <div className="game-timer-display">
        <span className="game-time-text">{Math.floor(gameTimeLeft / 60)}</span>
        <span className="game-time-label">Min</span>
        <span className="game-time-text">{gameTimeLeft % 60}</span>
        <span className="game-time-label">Sec</span>
      </div> */}

      <Row className="utu-container-board d-flex justify-content-center ">
        <Col xs={12} md={6} className="utu-konva px-4">
          <Board
            pionPositionIndex={pionPositionIndex}
            setPionPositionIndex={setPionPositionIndex}
            tanggaUp={tanggaUp}
            snakesDown={snakesDown}
            waitingForAnswer={waitingForAnswer}
            isCorrect={isCorrect}
            setIsCorrect={setIsCorrect}
            currentPlayerIndex={currentPlayerIndex}
          />
        </Col>

        <Col
          xs={12}
          md={6}
          className="d-flex flex-column align-items-center justify-content-center px-4 gap-4"
        >
          <div className="player-turn-box text-center d-flex flex-column align-items-center justify-content-center">
            {players.length > 0 && players[currentPlayerIndex] ? (
              <h4 className="box-player-name">
                {players[currentPlayerIndex].displayName}'s Turn
              </h4>
            ) : (
              <h4 className="box-player-name">Waiting for player...</h4>
            )}
            {showQuestion && waitingForAnswer && (
              <Form>
                <Form.Group>
                  <Form.Label className="question-text">
                    {questions[currentQuestionIndex].question}
                  </Form.Label>
                  {questions[currentQuestionIndex].options.map(
                    (option, index) => (
                      <label
                        key={index}
                        htmlFor={`foodChoice${index}`}
                        className={`form-check ${
                          submitted
                            ? option ===
                              questions[currentQuestionIndex].correctAnswer
                              ? "correct-answer"
                              : "wrong-answer"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="foodChoice"
                          id={`foodChoice${index}`}
                          value={option}
                          onChange={handleAnswerChange}
                          checked={selectedAnswer === option}
                          className="d-none"
                        />
                        <span className="question-answer-text">{option}</span>
                      </label>
                    )
                  )}
                </Form.Group>
              </Form>
            )}
          </div>

          <div className="timer-player d-flex justify-content-center align-items-center gap-2 mb-3">
            <span className="timer-count">{timeLeft}</span>
            <span className="timer-text">Sec</span>
          </div>

          {/* Render komponen dice */}
          <Dice
            onRollComplete={handleDiceRollComplete}
            disabled={isPionMoving || waitingForAnswer}
          />

          {/* Render komponen potion */}
          <Potion />

          {/* Daftar pemain di bagian bawah */}
          <div className="player-list d-flex justify-content-center align-items-center my-3">
            {players.slice(0, 4).map((player, index) => (
              <div
                key={player.uid}
                className={`player-item ${
                  currentPlayerIndex === index ? "active-player" : ""
                }`}
              >
                <Image
                  src={player.photoURL || "path/to/placeholder.jpg"}
                  roundedCircle
                  width={60}
                  height={60}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "path/to/placeholder.jpg";
                  }}
                />
                <div className="player-name">{player.displayName}</div>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      {victory && (
        <div className="victory-overlay" onClick={() => navigate("/")}>
          <img src={victoryImage} alt="Victory Logo" className="victory-logo" />
          <h2>{winner} Wins!</h2>
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

export default UlarTangga;
