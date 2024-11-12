import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import Potion from "../components/games/potion";
import VictoryOverlay from "../components/games/VictoryOverlay";
import LoseOverlay from "../components/games/LoseOverlay";
import Board from "../components/games/uTangga/React-KonvaUlar";
import Dice from "../components/games/uTangga/Dice";
import PlayerTurnBox from "../components/games/uTangga/PlayerTurnBox";
import PlayerList from "../components/games/uTangga/PlayerList";
import { getQuestions, shuffle } from "../services/questionDataServices";
import "../style/routes/UlarTangga.css";

// Tangga dan ular
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
  const { user } = useAuth();
  const navigate = useNavigate();

  // Inisialisasi pemain, dengan satu bot
  const [players, setPlayers] = useState([
    { uid: user.uid, displayName: user.displayName, isBot: false },
    { uid: "bot", displayName: "Bot", isBot: true },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [pionPositionIndex, setPionPositionIndex] = useState([0, 0]);
  const [isPionMoving, setIsPionMoving] = useState(false);
  const [isGameReady, setIsGameReady] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  const [potionUsable, setPotionUsable] = useState(false);
  const [isPotionUsed, setIsPotionUsed] = useState(false);
  const [allowExtraRoll, setAllowExtraRoll] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [diceState, setDiceState] = useState({
    isRolling: false,
    currentNumber: 1,
    lastRoll: null,
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hints, setHints] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  // Inisialisasi pertanyaan
  useEffect(() => {
    const initializeQuestions = async () => {
      const fetchedQuestions = await getQuestions();
      setQuestions(shuffle(fetchedQuestions));
    };
    initializeQuestions();
  }, []);

  // Fungsi untuk menangani akhir giliran dan mengatur posisi pemain
  const handleDiceRollComplete = (diceNumber) => {
    const newPositions = [...pionPositionIndex];
    newPositions[currentPlayerIndex] = Math.min(newPositions[currentPlayerIndex] + diceNumber, 99);

    setPionPositionIndex(newPositions);

    if (newPositions[currentPlayerIndex] === 99) {
      setVictory(true);
      setWinner(players[currentPlayerIndex].displayName);
    } else {
      const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextPlayerIndex);

      // Jika giliran bot, jalankan logika roll otomatis
      if (players[nextPlayerIndex].isBot) {
        setTimeout(() => handleDiceRollComplete(Math.floor(Math.random() * 6) + 1), 1000);
      } else {
        setIsMyTurn(true);
      }
    }
  };

  // Fungsi penggunaan potion
  const handlePotionUse = () => {
    if (!isMyTurn || !potionUsable || isPotionUsed) return;

    const currentPos = pionPositionIndex[currentPlayerIndex];
    const newPositions = [...pionPositionIndex];

    if (tanggaUp[currentPos]) {
      newPositions[currentPlayerIndex] = tanggaUp[currentPos];
    }
    setPionPositionIndex(newPositions);
    setIsPotionUsed(true);
    setPotionUsable(false);
  };

  // Menghitung jika permainan belum siap
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
      <HeaderGame
        layout="home"
        hints={hints}
        showOffcanvas={showOffcanvas}
        setShowOffcanvas={setShowOffcanvas}
        onCloseOffcanvas={() => setShowOffcanvas(false)}
      />
      <Row className="utu-container-board d-flex justify-content-center my-3">
        <Col xs={12} md={6} className="utu-konva px-4">
          <Board
            pionPositionIndex={pionPositionIndex}
            tanggaUp={tanggaUp}
            snakesDown={snakesDown}
            waitingForAnswer={waitingForAnswer}
            isCorrect={isCorrect || isPotionUsed}
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
            onAnswerChange={() => {}}
            isMyTurn={isMyTurn}
          />
          <Dice
            onRollComplete={handleDiceRollComplete}
            disabled={!isMyTurn || isPionMoving || waitingForAnswer}
            diceState={diceState}
            isMyTurn={isMyTurn}
          />
          <Potion
            onUsePotion={handlePotionUse}
            isUsable={isMyTurn && potionUsable && !isPotionUsed && showQuestion}
          />
          <PlayerList
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            isMyTurn={isMyTurn}
          />
        </Col>
      </Row>

      {victory && (
        <VictoryOverlay winner={winner} onClose={() => navigate("/")} />
      )}
      {showQuestion && (
        <LoseOverlay loser={user.displayName} onClose={() => navigate("/")} />
      )}
    </Container>
  );
}

export default UlarTangga;
