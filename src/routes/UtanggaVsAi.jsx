import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import Board from "../components/gamesAi/react-KonvaAi";
import Dice from "../components/gamesAi/DiceAi";
// import Potion from "../components/games/potion";
import PlayerList from "../components/games/uTangga/PlayerList";
import PlayerTurnBox from "../components/games/uTangga/PlayerTurnBox";
import { getQuestions, shuffle } from "../services/questionDataServices";
import "../style/routes/UlarTangga.css";
import victoryImage from "../assets/games/victory.png";
import Achievement from "../assets/games/achievement1.png";
import Achievement2 from "../assets/games/achievement2.png";
// import potionImage from "../assets/games/potion.png";
import bgUlarTangga from "../assets/common/bg-ular.png";
import defaultProfile from "../assets/common/nusaQuest-logo.png";

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
  const [players, setPlayers] = useState([]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [pionPositionIndex, setPionPositionIndex] = useState([0, 0]);
  const [diceState, setDiceState] = useState({
    isRolling: false,
    currentNumber: 1,
  });
  const [isPionMoving, setIsPionMoving] = useState(false);
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allowExtraRoll, setAllowExtraRoll] = useState(false);
  const [pendingPosition, setPendingPosition] = useState(null);
  const [hints, setHints] = useState([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  //inisialisi pemain
  useEffect(() => {
    if (user) {
      console.log("User Object:", user); // Log seluruh objek user
      console.log("User Photo URL:", user.photoURL); // Log hanya photoURL
      setPlayers([
        {
          uid: "player1",
          displayName: user.displayName,
          isBot: false,
          photoURL: user.googlePhotoURL || user.firebasePhotoURL || defaultProfile, // Menggunakan photoURL dari user atau default
        },
        {
          uid: "bot",
          displayName: "Bot",
          isBot: true,
          photoURL: defaultProfile, // Menggunakan defaultProfile untuk bot
        },
      ]);
    }
  }, [user, defaultProfile]);
  
  
  // Inisialisasi pertanyaan
  useEffect(() => {
    const initGame = async () => {
      try {
        const fetchedQuestions = await getQuestions(topicID);
        const shuffledQuestions = shuffle(fetchedQuestions);
        setQuestions(shuffledQuestions);
        setIsGameReady(true);
      } catch (error) {
        console.error("Error initializing game:", error);
        // Fallback ke pertanyaan default jika fetch gagal
        setQuestions([
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
        ]);
        setIsGameReady(true);
      }
    };
    initGame();
  }, [topicID]);

  // Helper function untuk mengecek kemenangan
  const checkVictory = useCallback(
    (newPosition) => {
      if (newPosition === 99) {
        setVictory(true);
        setWinner(players[currentPlayerIndex].displayName);
        return true;
      }
      return false;
    },
    [currentPlayerIndex, players]
  );

  // Handle kelanjutan lemparan dadu
  const handleDiceRollComplete = useCallback(
    (diceNumber) => {
      if (isPionMoving || waitingForAnswer) return;

      console.log(`Dice rolled: ${diceNumber}`);
      const newPositions = [...pionPositionIndex];
      const currentPos = newPositions[currentPlayerIndex];
      let newPos = Math.min(currentPos + diceNumber, 99);

      setIsPionMoving(true);
      setDiceState({ isRolling: false, currentNumber: diceNumber });

      // First move animation
      newPositions[currentPlayerIndex] = newPos;
      setPionPositionIndex(newPositions);

      if (checkVictory(newPos)) {
        setIsPionMoving(false);
        return;
      }

      // Add delay for basic movement animation
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
          // Add delay for snake animation
          setTimeout(() => {
            newPositions[currentPlayerIndex] = finalPos;
            setPionPositionIndex(newPositions);
            
            // Add delay after snake animation
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
    },
    [currentPlayerIndex, isPionMoving, pionPositionIndex, players.length, checkVictory, waitingForAnswer]
  );

  // Logika Bot
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
        console.log(`Bot rolled: ${botRoll}`);
        
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

  // Handle Answer Changes
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
          // Add animation delay for ladder movement
          setIsPionMoving(true);
          setTimeout(() => {
            const newPositions = [...pionPositionIndex];
            newPositions[currentPlayerIndex] = pendingPosition;
            setPionPositionIndex(newPositions);
            setPendingPosition(null);
            
            // Add delay after ladder animation
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

  // Bot Answer Logic
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
            {/* <Potion /> */}
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
          <p>Kamu mendapatkan:</p>
          <div className="rewards">
            <img src={Achievement} alt="achievement" className="Achievement1-logo" />
            <img src={Achievement2} alt="achievement2" className="Achievement2-logo" />
            {/* <img src={potionImage} alt="potion" className="potion-logo" /> */}
          </div>
          <p>Sentuh dimana saja untuk keluar.</p>
        </div>
      )}
    </Container>
  );
}

export default UtanggaVsAi;