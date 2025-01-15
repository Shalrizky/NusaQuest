import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import Board from "../components/gamesAi/react-KonvaAi";
import Dice from "../components/gamesAi/DiceAi";
import Potion from "../components/games/potion";
import PlayerList from "../components/games/uTangga/PlayerList";
import PlayerTurnBox from "../components/games/uTangga/PlayerTurnBox";
import { getQuestions, shuffle } from "../services/questionDataServices";
import "../style/routes/UlarTangga.css";
import victoryImage from "../assets/games/victory.png";
import Achievement from "../assets/games/achievement1.png";
import Achievement2 from "../assets/games/achievement2.png";
import potionImage from "../assets/games/potion.png";
import bgUlarTangga from "../assets/common/bg-ular.png";

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

function UtanggaVsAi() {
  const { topicID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([
    {
      uid: "player1",
      displayName: user.displayName,
      isBot: false,
    },
    {
      uid: "bot",
      displayName: "Bot",
      isBot: true,
    },
  ]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [pionPositionIndex, setPionPositionIndex] = useState([0, 0]);
  const [diceState, setDiceState] = useState({
    isRolling: false,
    currentNumber: 1,
    lastRoll: null,
  });
  const [isPionMoving, setIsPionMoving] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allowExtraRoll, setAllowExtraRoll] = useState(false);
  const [hints, setHints] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [pendingPosition, setPendingPosition] = useState(null);
  const [animationType, setAnimationType] = useState(null); // 'ladder' atau 'snake'
  const [startPosition, setStartPosition] = useState(null);
  const [endPosition, setEndPosition] = useState(null);

  // Initialize questions
  useEffect(() => {
    const initGame = async () => {
      try {
        const fetchedQuestions = await getQuestions(topicID);
        const shuffledQuestions = shuffle(fetchedQuestions);
        setQuestions(shuffledQuestions);
        setIsGameReady(true);
      } catch (error) {
        console.error("Error initializing game:", error);
      }
    };
    initGame();
  }, [topicID]);

  const moveToPosition = useCallback((position) => {
    const newPositions = [...pionPositionIndex];
    newPositions[currentPlayerIndex] = position;
    setPionPositionIndex(newPositions);
  }, [currentPlayerIndex, pionPositionIndex]);

  // Handle dice roll completion
  const handleDiceRollComplete = useCallback(
    (number) => {
      const diceNumber = number || Math.floor(Math.random() * 6) + 1;
      console.log(`🎲 Dice rolled: ${diceNumber}`);
      
      if (isPionMoving || waitingForAnswer) return;

      const currentPos = pionPositionIndex[currentPlayerIndex];
      let newPos = Math.min(currentPos + diceNumber, 99);
      
      console.log(`🎮 Player ${currentPlayerIndex + 1}'s turn`);
      console.log(`📍 Current Position: ${currentPos}`);
      console.log(`🎯 Target Position: ${newPos}`);

      setDiceState({
        isRolling: false,
        currentNumber: diceNumber,
        lastRoll: diceNumber,
      });

      // Set initial movement
      setIsPionMoving(true);
      setStartPosition(currentPos);
      setEndPosition(newPos);

      // Victory check
      if (newPos === 99) {
        moveToPosition(newPos);
        console.log(`🏆 Victory! ${players[currentPlayerIndex].displayName} wins!`);
        setVictory(true);
        setWinner(players[currentPlayerIndex].displayName);
        setIsPionMoving(false);
        return;
      }

      // Move to initial position after dice roll
      moveToPosition(newPos);

      setTimeout(() => {
        // Check for ladder or snake
        if (tanggaUp[newPos]) {
          console.log(`🪜 Found ladder at ${newPos}! Climbing to ${tanggaUp[newPos]}`);
          setAnimationType('ladder');
          setStartPosition(newPos);
          setEndPosition(tanggaUp[newPos]);
          setIsAnimating(true);
          setPendingPosition(tanggaUp[newPos]);
          setShowQuestion(true);
          setWaitingForAnswer(true);
        } else if (snakesDown[newPos]) {
          console.log(`🐍 Found snake at ${newPos}! Sliding down to ${snakesDown[newPos]}`);
          setAnimationType('snake');
          setStartPosition(newPos);
          setEndPosition(snakesDown[newPos]);
          setIsAnimating(true);
          
          setTimeout(() => {
            moveToPosition(snakesDown[newPos]);
            setIsAnimating(false);
            setAnimationType(null);
            setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
          }, 1000);
        } else if (diceNumber === 6) {
          console.log(`🎯 Got a 6! Extra turn granted!`);
          setShowQuestion(true);
          setWaitingForAnswer(true);
          setAllowExtraRoll(true);
        } else {
          console.log(`➡️ Moving to next player`);
          setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
        }
        setIsPionMoving(false);
      }, 1000);
    },
    [currentPlayerIndex, isPionMoving, pionPositionIndex, players, waitingForAnswer, moveToPosition]
  );

  // Bot logic
  useEffect(() => {
    if (players[currentPlayerIndex]?.isBot && !victory && !showQuestion && !isPionMoving && !isAnimating) {
      const botTurn = async () => {
        console.log(`🤖 Bot's turn`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const botRoll = Math.floor(Math.random() * 6) + 1;
        console.log(`🎲 Bot rolled: ${botRoll}`);

        setDiceState({ 
          isRolling: true, 
          currentNumber: botRoll,
          lastRoll: null 
        });
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        handleDiceRollComplete(botRoll);
      };

      botTurn();
    }
  }, [currentPlayerIndex, players, victory, handleDiceRollComplete, showQuestion, isPionMoving, isAnimating]);

  // Handle answer changes with logs
  const handleAnswerChange = async ({ isCorrect: isAnswerCorrect, hint }) => {
    console.log(`❓ Question answered - Correct: ${isAnswerCorrect}`);
    setIsCorrect(isAnswerCorrect);

    if (!isAnswerCorrect && hint) {
      setHints((prevHints) => [...prevHints, hint]);
      setShowOffcanvas(true);
    }

    setTimeout(() => {
      setShowQuestion(false);
      setWaitingForAnswer(false);

      const nextQuestionIndex = (currentQuestionIndex + 1) % questions.length;
      setCurrentQuestionIndex(nextQuestionIndex);

      if (isAnswerCorrect) {
        if (allowExtraRoll) {
          console.log(`🎲 Extra roll granted!`);
          setAllowExtraRoll(false);
        } else if (pendingPosition !== null) {
          console.log(`🪜 Moving up ladder to position ${pendingPosition}`);
          setIsAnimating(true);
          setAnimationType('ladder');
          setTimeout(() => {
            moveToPosition(pendingPosition);
            setIsAnimating(false);
            setAnimationType(null);
            setPendingPosition(null);
            setStartPosition(null);
            setEndPosition(null);
            setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
          }, 1000);
        } else {
          console.log(`➡️ Moving to next player`);
          setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
        }
      } else {
        console.log(`❌ Wrong answer, moving to next player`);
        setPendingPosition(null);
        setStartPosition(null);
        setEndPosition(null);
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      }
    }, 2000);
  };
  // Bot answer logic
  useEffect(() => {
    if (players[currentPlayerIndex]?.isBot && showQuestion && waitingForAnswer) {
      setTimeout(() => {
        const isCorrect = Math.random() < 0.7;
        handleAnswerChange({ isCorrect });
      }, 2000);
    }
  }, [currentPlayerIndex, players, showQuestion, waitingForAnswer]);

  if (!isGameReady) {
    return <div>Loading...</div>;
  }

  return (
    <Container
      fluid
      className="utangga-container"
      style={{ backgroundImage: `url(${bgUlarTangga})` }}
    >
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
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            isCorrect={isCorrect}
            isAnimating={isAnimating}
            animationType={animationType}
            startPosition={startPosition}
            endPosition={endPosition}
            pendingPosition={pendingPosition}
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
            isMyTurn={!players[currentPlayerIndex]?.isBot}
          />

          <Dice
            onRollComplete={handleDiceRollComplete}
            disabled={
              players[currentPlayerIndex]?.isBot ||
              isPionMoving ||
              victory ||
              waitingForAnswer ||
              isAnimating
            }
            diceState={diceState}
          />

          <Potion />

          <PlayerList
            players={players}
            currentPlayerIndex={currentPlayerIndex}
          />
        </Col>
      </Row>

      {victory && (
        <div className="victory-overlay" onClick={() => navigate("/")}>
          <img src={victoryImage} alt="Victory Logo" className="victory-logo" />
          <h2>{winner} Wins!</h2>
          <p>Kamu mendapatkan:</p>
          <div className="rewards">
            <img src={Achievement} alt="achievement" className="Achievement1-logo" />
            <img src={Achievement2} alt="achievement2" className="Achievement2-logo" />
            <img src={potionImage} alt="potion" className="potion-logo" />
          </div>
          <p>Sentuh dimana saja untuk keluar.</p>
        </div>
      )}
    </Container>
  );
}

export default UtanggaVsAi;