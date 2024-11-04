import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image, Form } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import HeaderUtangga from "../components/games/HeaderGame";
import Board from "../components/games/React-KonvaUlar";
import Dice from "../components/games/Dice";
import Potion from "../components/games/potion";
import Question from "../components/games/Question";
import { fetchQuestions } from "../services/questionServices";
import "../style/routes/UlarTangga.css";
import victoryImage from "../assets/games/Utangga/victory.png";
import Achievement from "../assets/games/Utangga/achievement1.png";
import Achievement2 from "../assets/games/Utangga/achievement2.png";
import potionImage from "../assets/games/Utangga/potion.png";
import bgUlarTangga from "../assets/common/bg-ular.png";

// Definisi pemain dummy
const players = [
  {
    id: 1,
    name: "Abrar",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
  {
    id: 2,
    name: "Sahel",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
  {
    id: 3,
    name: "Rangga",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
  {
    id: 4,
    name: "natah",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
];

const tanggaUp = {
  // Naik tangga
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
  // Turun Ular
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
  const [isPionMoving, setIsPionMoving] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [pionPositionIndex, setPionPositionIndex] = useState([0, 0, 0, 0]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null); //baru
  const [questions, setQuestions] = useState([]);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [victory, setVictory] = useState(false);
  const [allowExtraRoll, setAllowExtraRoll] = useState(false);
  const [winner, setWinner] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameTimeLeft, setGameTimeLeft] = useState(1800);
  const [gameOver, setGameOver] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      const fetchedQuestions = await fetchQuestions();
      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
        setCurrentQuestion(fetchedQuestions[0]); // Now this will work
        console.log("Fetched questions:", fetchedQuestions);
      }
    };
    loadQuestions();
  }, []);
  

  useEffect(() => {
    console.log("Show Question:", showQuestion);
    console.log("Current Question:", currentQuestion);
    console.log("Waiting for Answer:", waitingForAnswer);
  }, [showQuestion, currentQuestion, waitingForAnswer]);
  
  // const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;

  const logPionPositions = (newPositions) => { };

  const nextPlayer = () => {
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
    setTimeLeft(30);
  };

  // Pindah ke pemain berikutnya jika waktu habis
  useEffect(() => {
    if (!isPionMoving && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      nextPlayer();
    }
  }, [timeLeft, isPionMoving]);

  // Timer global untuk menghitung waktu permainan
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

  useEffect(() => {
    if (gameOver) {
      alert("Waktu permainan habis! Permainan telah berakhir.");
      navigate("/"); // Arahkan pemain ke halaman utama
    }
  }, [gameOver, navigate]);

  useEffect(() => {
    if (showQuestion && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      nextPlayer();
      setShowQuestion(false);
      setWaitingForAnswer(false);
    }
  }, [timeLeft, showQuestion]);

  const handleDiceRollComplete = () => {
    const diceNumber = 5;
    setIsPionMoving(true);

    setPionPositionIndex((prevPositions) => {
      const newPositions = [...prevPositions];
      let newPosition = newPositions[currentPlayerIndex] + diceNumber;

      if (newPosition > 99) newPosition = 99;

      newPositions[currentPlayerIndex] = newPosition;

      if (newPosition === 99) {
        setVictory(true);
        setWinner(players[currentPlayerIndex].name);
      }

      return newPositions;
    });

    setTimeout(() => {
      setPionPositionIndex((prevPositions) => {
        const newPositions = [...prevPositions];
        let newPosition = newPositions[currentPlayerIndex];

        if (victory) return prevPositions;

        if (tanggaUp[newPosition] || diceNumber === 6) {
          const nextQuestionIndex = (currentQuestionIndex + 1) % questions.length;
          setCurrentQuestionIndex(nextQuestionIndex);
          setCurrentQuestion(questions[nextQuestionIndex]); // Now this will work
          setShowQuestion(true);
          setWaitingForAnswer(true);
          setSubmitted(false);
          setIsCorrect(null);
          setAllowExtraRoll(diceNumber === 6);
        } else if (snakesDown[newPosition]) {
          newPosition = snakesDown[newPosition];
          newPositions[currentPlayerIndex] = newPosition;
          setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
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

    const correctAnswer = currentQuestion?.correctAnswer;
    const isAnswerCorrect = answer === correctAnswer;
    setIsCorrect(isAnswerCorrect);
    setSubmitted(true);

    if (isAnswerCorrect) {
      if (!allowExtraRoll) {
        setPionPositionIndex((prevPositions) => {
          const newPositions = [...prevPositions];
          const currentPos = newPositions[currentPlayerIndex];

          if (tanggaUp[currentPos]) {
            newPositions[currentPlayerIndex] = tanggaUp[currentPos];
          }

          return newPositions;
        });
      }
    }

    setTimeout(() => {
      setShowQuestion(false);
      setWaitingForAnswer(false);
      const nextQuestionIndex = (currentQuestionIndex + 1) % questions.length;
      setCurrentQuestionIndex(nextQuestionIndex);
      setCurrentQuestion(questions[nextQuestionIndex]); // Now this will work
      
      if (!isAnswerCorrect || !allowExtraRoll) {
        setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
      }
      setAllowExtraRoll(false);
    }, 1800);
  };

  return (

    <Container fluid className="utangga-container" style={{ backgroundImage: `url(${bgUlarTangga})` }}>
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

        <Col xs={12} md={6} className="d-flex flex-column align-items-center justify-content-start">
        <div className="player-turn-box">
            {players[currentPlayerIndex] ? (
              <h3>{players[currentPlayerIndex].name}'s Turn</h3>
            ) : (
              <h3>Waiting for player...</h3>
            )}
            {showQuestion && currentQuestion ? (
              <Question
                currentQuestion={currentQuestion}
                selectedAnswer={selectedAnswer}
                handleAnswerChange={handleAnswerChange}
                submitted={submitted}
                isCorrect={isCorrect}
              />
            ) : null}
          </div>

          <div className="timer-display">
            <span className="time-text">{timeLeft}</span>
            <span className="time-label">Sec</span>
          </div>

          <div className="dice-potion-container">
            <Dice onRollComplete={handleDiceRollComplete} disabled={isPionMoving || waitingForAnswer} />
            <Potion />
          </div>

          <div className="player-list mt-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`player-item d-flex align-items-center ${currentPlayerIndex === index ? "active-player" : ""
                  }`}
              >
                <Image src={player.photo || "path/to/placeholder.jpg"} roundedCircle width={40} height={40} />
                {currentPlayerIndex === index && <span className="ml-2">{player.name}</span>}
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

export default UlarTangga;
