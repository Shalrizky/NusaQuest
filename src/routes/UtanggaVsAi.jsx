// UtanggaVsAi.js
import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import Board from "../components/gamesAi/react-KonvaAi";
import Dice from "../components/gamesAi/DiceAi";
import PlayerList from "../components/games/uTangga/PlayerList";
import PlayerTurnBox from "../components/games/uTangga/PlayerTurnBox";
import { getQuestions, shuffle } from "../services/questionDataServices";
import "../style/routes/UlarTangga.css";
import victoryImage from "../assets/games/victory.png";
import Achievement from "../assets/games/achievement1.png";
import Achievement2 from "../assets/games/achievement2.png";
import bgUlarTangga from "../assets/common/bg-ular.png";
import defaultProfile from "../assets/common/nusaQuest-logo.png";

const tanggaUp = {
  5: 24, 16: 66, 61: 80, 64: 75, 72: 88, 
  85: 94, 19: 59, 27: 48, 49: 69,
};

const snakesDown = {
  22: 1, 29: 8, 57: 38, 65: 43, 67: 13, 
  90: 48, 93: 66, 98: 76,
};

function UtanggaVsAi() {
  const { topicID, roomID } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const aiCardsCount = location.state?.aiCardsCount || 1;

  // Game state
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [pionPositionIndex, setPionPositionIndex] = useState([]);
  const [diceState, setDiceState] = useState({
    isRolling: false,
    currentNumber: 1,
  });
  const [isPionMoving, setIsPionMoving] = useState(false);
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  
  // Questions state
  const [showQuestion, setShowQuestion] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allowExtraRoll, setAllowExtraRoll] = useState(false);
  const [pendingPosition, setPendingPosition] = useState(null);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  
  // UI state
  const [hints, setHints] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);

  // In the player initialization useEffect:
  useEffect(() => {
    if (user) {
      const mainPlayer = {
        uid: "player1",
        displayName: user.displayName,
        isBot: false,
        photoURL: user.googlePhotoURL || user.firebasePhotoURL || defaultProfile,
      };

      // Only create bot players if we're in room5 (VS AI mode)
      if (roomID === "room5") {
        const botPlayers = Array.from({ length: aiCardsCount }, (_, index) => ({
          uid: `bot${index + 1}`,
          displayName: `Bot ${index + 1}`,
          isBot: true,
          photoURL: defaultProfile,
        }));
        setPlayers([mainPlayer, ...botPlayers]);
        setPionPositionIndex(new Array(1 + aiCardsCount).fill(0));
      } else {
        // For multiplayer, keep existing player logic
        setPlayers([mainPlayer]);
        setPionPositionIndex([0]);
      }
    }
  }, [user, aiCardsCount, roomID]);

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
        // Fallback questions
        setQuestions([
          {
            id: 1,
            question: "What's the most famous food in Java?",
            options: ["Soto Betawi", "Gudeg", "Batagor", "Rendang"],
            correctAnswer: "Gudeg",
          },
          {
            id: 2,
            question: "Who is a national hero from East Java?",
            options: ["Diponegoro", "Sudirman", "Bung Tomo", "Soekarno"],
            correctAnswer: "Bung Tomo",
          },
        ]);
        setIsGameReady(true);
      }
    };
    initGame();
  }, [topicID]);

  // Check for victory
  const checkVictory = useCallback((newPosition) => {
    if (newPosition === 99) {
      setVictory(true);
      setWinner(players[currentPlayerIndex].displayName);
      return true;
    }
    return false;
  }, [currentPlayerIndex, players]);

  // Handle dice roll completion
  const handleDiceRollComplete = useCallback((diceNumber) => {
    if (isPionMoving || waitingForAnswer) return;

    const newPositions = [...pionPositionIndex];
    const currentPos = newPositions[currentPlayerIndex];
    let newPos = Math.min(currentPos + diceNumber, 99);

    setIsPionMoving(true);
    setDiceState({ isRolling: false, currentNumber: diceNumber });

    newPositions[currentPlayerIndex] = newPos;
    setPionPositionIndex(newPositions);

    if (checkVictory(newPos)) {
      setIsPionMoving(false);
      return;
    }

    setTimeout(() => {
      const isLadder = tanggaUp[newPos] !== undefined;
      const isSnake = snakesDown[newPos] !== undefined;
      const finalPos = tanggaUp[newPos] || snakesDown[newPos] || newPos;

      if (isLadder) {
        setPendingPosition(finalPos);
        setShowQuestion(true);
        setWaitingForAnswer(true);
        setIsCorrect(null);
        setAllowExtraRoll(false);
        setIsPionMoving(false);
      } else if (isSnake) {
        setTimeout(() => {
          newPositions[currentPlayerIndex] = finalPos;
          setPionPositionIndex(newPositions);
          
          setTimeout(() => {
            setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
            setIsPionMoving(false);
          }, 500);
        }, 500);
      } else if (diceNumber === 6) {
        setShowQuestion(true);
        setWaitingForAnswer(true);
        setIsCorrect(null);
        setAllowExtraRoll(true);
        setIsPionMoving(false);
      } else {
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
        setIsPionMoving(false);
      }
    }, 1000);
  }, [currentPlayerIndex, isPionMoving, pionPositionIndex, players.length, checkVictory, waitingForAnswer]);

  // Bot turn handling
  useEffect(() => {
    if (
      players[currentPlayerIndex]?.isBot &&
      !victory &&
      !showQuestion &&
      !isPionMoving &&
      !waitingForAnswer
    ) {
      const botTurn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const botRoll = Math.floor(Math.random() * 6) + 1;
        
        setDiceState({ isRolling: true, currentNumber: botRoll });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        handleDiceRollComplete(botRoll);
      };

      botTurn();
    }
  }, [
    currentPlayerIndex,
    players,
    victory,
    handleDiceRollComplete,
    showQuestion,
    isPionMoving,
    waitingForAnswer
  ]);

  // Handle answer changes
  const handleAnswerChange = async ({ isCorrect: isAnswerCorrect, hint }) => {
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
        if (pendingPosition !== null) {
          setIsPionMoving(true);
          setTimeout(() => {
            const newPositions = [...pionPositionIndex];
            newPositions[currentPlayerIndex] = pendingPosition;
            setPionPositionIndex(newPositions);
            setPendingPosition(null);
            
            setTimeout(() => {
              if (!allowExtraRoll) {
                setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
              }
              setIsPionMoving(false);
            }, 500);
          }, 500);
        } else if (allowExtraRoll) {
          setAllowExtraRoll(false);
        }
      } else {
        setAllowExtraRoll(false);
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
        setPendingPosition(null);
      }
    }, 2000);
  };

  // Bot answer logic
  useEffect(() => {
    if (players[currentPlayerIndex]?.isBot && showQuestion && waitingForAnswer) {
      setTimeout(() => {
        const isCorrect = Math.random() < 0.7; // 70% chance to answer correctly
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

          <div className="dice-potion-container">
            <Dice
              onRollComplete={handleDiceRollComplete}
              disabled={
                players[currentPlayerIndex]?.isBot ||
                isPionMoving ||
                victory ||
                waitingForAnswer
              }
              diceState={diceState}
            />
          </div>

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
          <p>You earned:</p>
          <div className="rewards">
            <img src={Achievement} alt="achievement" className="Achievement1-logo" />
            <img src={Achievement2} alt="achievement2" className="Achievement2-logo" />
          </div>
          <p>Touch anywhere to exit.</p>
        </div>
      )}
    </Container>
  );
}

export default UtanggaVsAi;