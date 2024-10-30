import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image, Form, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { database, ref, onValue, set, get, remove } from "../firebaseConfig";
import HeaderUtangga from "../components/games/HeaderGame";
import Board from "../components/games/React-KonvaUlar";
import Dice from "../components/games/Dice";
import Potion from "../components/games/potion";
import "../style/routes/UlarTangga.css";
import victoryImage from "../assets/games/Utangga/victory.png";
import Achievement from "../assets/games/Utangga/achievement1.png";
import Achievement2 from "../assets/games/Utangga/achievement2.png";
import potionImage from "../assets/games/Utangga/potion.png";
import bgUlarTangga from "../assets/common/bg-ular.png";

// Definisi pertanyaan
const questions = [
  {
    id: 1,
    question: "Makanan paling enak apa di Jawa?",
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
  const { user, isLoggedIn } = useAuth();
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
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameTimeLeft, setGameTimeLeft] = useState(1800);
  const [gameOver, setGameOver] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const navigate = useNavigate();

  // Initialize game status
  useEffect(() => {
    const initializeGame = async () => {
      try {
        const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
        await set(gameStatusRef, 'playing');
        console.log("Game status set to playing");
        setIsGameReady(true);
      } catch (error) {
        console.error("Error setting game status:", error);
      }
    };

    initializeGame();
  }, []);

  // Players setup
  useEffect(() => {
    if (!isGameReady) return;

    console.log("Setting up player listeners");
    const playersRef = ref(
      database,
      `rooms/${topicID}/${gameID}/${roomID}/players`
    );
    
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const playersData = snapshot.val() || {};
      const playersArray = Object.values(playersData);
  
      console.log("Fetched players in UlarTangga:", playersArray);
      console.log("Database path:", `rooms/${topicID}/${gameID}/${roomID}/players`);
  
      setPlayers(playersArray);
      setPionPositionIndex(new Array(playersArray.length).fill(0));
    });

    return () => {
      console.log("Cleaning up player listeners");
      unsubscribe();
    };
  }, [isGameReady, gameID, topicID, roomID]);

  useEffect(() => {
    const playersRef = ref(
      database,
      `rooms/${topicID}/${gameID}/${roomID}/players`
    );

    const unsubscribe = onValue(playersRef, async (snapshot) => {
      const playersData = snapshot.val() || {};
      const playerCount = Object.keys(playersData).length;

      // Jika tidak ada player, reset game
      if (playerCount === 0) {
        const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
        await set(gameStatusRef, null);
        navigate('/'); // Atau navigate ke halaman yang sesuai
      }
    });

    return () => unsubscribe();
  }, [topicID, gameID, roomID, navigate]);

  // Modifikasi cleanup effect
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (victory || gameOver) {
          const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
          await set(gameStatusRef, null);
          console.log("Game status reset on game end");
        }
      };
      cleanup();
    };
  }, [victory, gameOver, topicID, gameID, roomID]);

  // Tambahkan effect untuk handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      e.preventDefault();
      e.returnValue = '';

      // Reset game status dan hapus player saat menutup browser
      const gameStatusRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/gameStatus`);
      await set(gameStatusRef, null);
      
      // Hapus player dari room
      if (user?.uid) {
        const playerRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players/${user.uid}`);
        await remove(playerRef);
        
        // Update current players count
        const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
        const snapshot = await get(playersRef);
        const currentCount = snapshot.exists() ? Object.keys(snapshot.val()).length - 1 : 0;
        const currentPlayersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/currentPlayers`);
        await set(currentPlayersRef, Math.max(0, currentCount));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [topicID, gameID, roomID, user]);

  // Ensure currentPlayerIndex is within bounds
  useEffect(() => {
    if (currentPlayerIndex >= players.length) {
      setCurrentPlayerIndex(0);
    }
  }, [currentPlayerIndex, players.length]);

  const nextPlayer = () => {
    if (players.length > 0) {
      setCurrentPlayerIndex(
        (prevIndex) => (prevIndex + 1) % players.length
      );
      setTimeLeft(30);
    }
  };

  // Timer for each player's turn
  useEffect(() => {
    if (!isPionMoving && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      nextPlayer();
    }
  }, [timeLeft, isPionMoving, players.length]);

  // Global game timer
  useEffect(() => {
    if (gameTimeLeft > 0) {
      const gameTimer = setInterval(() => {
        setGameTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(gameTimer);
    } else {
      setGameOver(true);
    }
  }, [gameTimeLeft]);

  // Handle game over
  useEffect(() => {
    if (gameOver) {
      alert("Waktu permainan habis! Permainan telah berakhir.");
      navigate("/");
    }
  }, [gameOver, navigate]);

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
    setTimeLeft(30);
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
    <Container
      fluid
      className="utangga-container"
      style={{ backgroundImage: `url(${bgUlarTangga})` }}
    >
      <HeaderUtangga layout="home" />

      <Row className="utu-container-left">
        <Col xs={12} md={6} className="utu-konva">
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
          className="d-flex flex-column align-items-center justify-content-start"
        >
          <div className="player-turn-box">
            {players.length > 0 && players[currentPlayerIndex] ? (
              <h3>{players[currentPlayerIndex].displayName}'s Turn</h3>
            ) : (
              <h3>Waiting for player...</h3>
            )}
            {showQuestion && waitingForAnswer && (
              <Form>
                <Form.Group>
                  <Form.Label>
                    {questions[currentQuestionIndex].question}
                  </Form.Label>
                  {questions[currentQuestionIndex].options.map(
                    (option, index) => (
                      <div
                        key={index}
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
                        <label
                          htmlFor={`foodChoice${index}`}
                          className="form-check-label"
                        >
                          {option}
                        </label>
                      </div>
                    )
                  )}
                </Form.Group>
              </Form>
            )}
          </div>

          <div className="timer-display">
            <span className="time-text">{timeLeft}</span>
            <span className="time-label">Sec</span>
          </div>

          <div className="dice-potion-container">
            <Dice
              onRollComplete={handleDiceRollComplete}
              disabled={isPionMoving || waitingForAnswer}
            />
            <Potion />
          </div>

          <div className="player-list mt-3">
            {players.map((player, index) => (
              <div
                key={player.uid}
                className={`player-item d-flex align-items-center ${
                  currentPlayerIndex === index ? "active-player" : ""
                }`}
              >
                <Image
                  src={player.photoURL || "path/to/placeholder.jpg"}
                  roundedCircle
                  width={40}
                  height={40}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "path/to/placeholder.jpg";
                  }}
                />
                <span className="ml-2">{player.displayName}</span>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      {victory && (
        <div className="victory-overlay" onClick={() => navigate("/")}>
          <img
            src={victoryImage}
            alt="Victory Logo"
            className="victory-logo"
          />
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
            <img
              src={potionImage}
              alt="potion"
              className="potion-logo"
            />
          </div>
          <p>Sentuh dimana saja untuk keluar.</p>
        </div>
      )}
    </Container>
  );
}

export default UlarTangga;