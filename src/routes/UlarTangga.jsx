import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import Potion from "../components/games/Potion";
import VictoryOverlay from "../components/games/VictoryOverlay";
import Board from "../components/games/uTangga/React-KonvaUlar";
import Dice from "../components/games/uTangga/Dice";
import PlayerTurnBox from "../components/games/uTangga/PlayerTurnBox";
import PlayerList from "../components/games/uTangga/PlayerList";
import {
  fetchGamePlayers,
  setGameStatus,
  cleanupGame,
} from "../services/gameDataServices";
import {
  getPotionData,
  saveNewPotionData,
} from "../services/itemsDataServices";
import { usePlayerTimer, useGameTimer } from "../utils/timerUtils";
import "../style/routes/UlarTangga.css";

const questions = [
  {
    id: 1,
    question:
      "Makanan paling enak apa di Jawa Barat yang tipenya salad dengan bumbu kacang?",
    options: ["Soto Betawi", "Gado-gado", "Batagor", "Rendang"],
    correctAnswer: "Gado-gado",
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [pionPositionIndex, setPionPositionIndex] = useState([]);
  const [isPionMoving, setIsPionMoving] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [victory, setVictory] = useState(false);
  const [allowExtraRoll, setAllowExtraRoll] = useState(false);
  const [winner, setWinner] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [potionUsable, setPotionUsable] = useState(false);
  const [isPotionUsed, setIsPotionUsed] = useState(false);

  const [timeLeft, resetPlayerTimer] = usePlayerTimer(30, () => nextPlayer());
  const gameTimeLeft = useGameTimer(1800, () => setGameOver(true));

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

  useEffect(() => {
    return () => {
      if (victory || gameOver) {
        cleanupGame(topicID, gameID, roomID, user);
      }
    };
  }, [victory, gameOver, topicID, gameID, roomID, user]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      cleanupGame(topicID, gameID, roomID, user);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [topicID, gameID, roomID, user]);

  useEffect(() => {
    if (currentPlayerIndex >= players.length) {
      setCurrentPlayerIndex(0);
    }
  }, [currentPlayerIndex, players.length]);

  useEffect(() => {
    if (gameOver) {
      alert("Waktu permainan habis! Permainan telah berakhir.");
      navigate("/");
    }
  }, [gameOver, gameTimeLeft, navigate]);

  const nextPlayer = () => {
    setPotionUsable(false);
    if (players.length > 0) {
      setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
      resetPlayerTimer();
    }
  };

  const awardVictoryPotions = async (winningPlayer) => {
    try {
      const currentPotionData = await getPotionData(winningPlayer.uid);

      if (currentPotionData) {
        await saveNewPotionData(winningPlayer.uid, {
          item_name: currentPotionData.item_name,
          item_count: currentPotionData.item_count + 1,
          item_img: currentPotionData.item_img,
        });
      }
    } catch (error) {
      console.error("Error awarding victory potions:", error);
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
        const winningPlayer = players[playerIndex];
        setWinner(winningPlayer?.displayName || "Player");
        // Berikan 2 potion untuk pemenang
        if (winningPlayer) {
          awardVictoryPotions(winningPlayer);
        }
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
          setIsCorrect(null);
          setAllowExtraRoll(false);
          setPotionUsable(true);
        } else if (snakesDown[newPosition]) {
          newPosition = snakesDown[newPosition];
          newPositions[currentPlayerIndex] = newPosition;
          nextPlayer();
        } else if (diceNumber === 6) {
          setShowQuestion(true);
          setWaitingForAnswer(true);
          setIsCorrect(null);
          setAllowExtraRoll(true);
          setPotionUsable(true);
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

    setIsCorrect(null);
    resetPlayerTimer();
  };

  const handleAnswerChange = (isAnswerCorrect) => {
    setIsCorrect(isAnswerCorrect);
  
    if (isAnswerCorrect) {
      if (allowExtraRoll) {
        // Reset potionUsable saat pemain akan roll dadu lagi
        setPotionUsable(false);
        // Logika untuk lempar dadu tambahan
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

  const skipQuestion = () => {
    setShowQuestion(false);
    setWaitingForAnswer(false);
    setPotionUsable(false);
    setIsCorrect(true);
    setIsPotionUsed(true);

    const currentPosition = pionPositionIndex[currentPlayerIndex];
    if (tanggaUp[currentPosition]) {
      const targetPosition = tanggaUp[currentPosition];
      setPionPositionIndex((prevPositions) => {
        const newPositions = [...prevPositions];
        newPositions[currentPlayerIndex] = targetPosition;
        return newPositions;
      });
      setIsPionMoving(true);

      setTimeout(() => {
        setIsPionMoving(false);
        setIsPotionUsed(false);
        nextPlayer();
      }, 1000);
    } else {
      setIsPotionUsed(false);
      nextPlayer();
    }
  };

  if (!isGameReady) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="utangga-container d-flex flex-column">
      <HeaderGame layout="home" />

      <Row className="utu-container-board d-flex justify-content-center">
        <Col xs={12} md={6} className="utu-konva px-4">
          <Board
            pionPositionIndex={pionPositionIndex}
            setPionPositionIndex={setPionPositionIndex}
            tanggaUp={tanggaUp}
            snakesDown={snakesDown}
            waitingForAnswer={waitingForAnswer}
            isCorrect={isCorrect || isPotionUsed}
            setIsCorrect={setIsCorrect}
            currentPlayerIndex={currentPlayerIndex}
          />
        </Col>

        <Col
          xs={12}
          md={6}
          className="d-flex flex-column align-items-center justify-content-center px-4 gap-4"
        >
          <PlayerTurnBox
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            showQuestion={showQuestion}
            waitingForAnswer={waitingForAnswer}
            currentQuestion={questions[currentQuestionIndex]}
            onAnswerChange={handleAnswerChange}
          />

          <div className="timer-player d-flex justify-content-center align-items-center gap-2 mb-3">
            <span className="timer-count">{timeLeft}</span>
            <span className="timer-text">Sec</span>
          </div>

          <Dice
            onRollComplete={handleDiceRollComplete}
            disabled={isPionMoving || waitingForAnswer}
          />
          <Potion onUsePotion={skipQuestion} isUsable={potionUsable} />

          <PlayerList
            players={players}
            currentPlayerIndex={currentPlayerIndex}
          />
        </Col>
      </Row>

      {victory && (
        <VictoryOverlay winner={winner} onClose={() => navigate("/")} />
      )}
    </Container>
  );
}

export default UlarTangga;
