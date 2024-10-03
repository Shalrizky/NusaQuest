import React, { useState } from "react";
import { Container, Row, Col, Image, Form } from "react-bootstrap";
import HeaderUtangga from "../components/HeaderUtangga";
import Board from "../components/React-KonvaUlar";
import Dice from "../components/Dice";
import Potion from "../components/potion"; // Import komponen Potion
import "../style/routes/UlarTangga.css";
import victoryImage from "../assets/games/Utangga/victory.png"
import Achievement from "../assets/games/Utangga/achievement1.png"
import Achievement2 from "../assets/games/Utangga/achievement2.png"
import potionImage from "../assets/games/Utangga/potion.png"
import bgUlarTangga from "../assets/common/bg-ular.png";

// Definisi pemain
const players = [
  {
    id: 1,
    name: "Anak Bego(AB)",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
  {
    id: 2,
    name: "Sahel Bau",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
  {
    id: 3,
    name: "RanggaSpinner",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
  {
    id: 4,
    name: "natahAFK",
    photo: require("../assets/games/Utangga/narutoa.png"),
  },
];

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

// Mendefinisikan ular dan tangga
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
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [victory, setVictory] = useState(false); // State untuk menang


  const logPionPositions = (newPositions) => {
    console.log("Pion Positions:", newPositions);
  };

  const handleDiceRollComplete = () => {
    const diceNumber=1
    setIsPionMoving(true); // Set animation status
  
    setPionPositionIndex((prevPositions) => {
      const newPositions = [...prevPositions];
      let newPosition = newPositions[currentPlayerIndex] + diceNumber;
  
      if (newPosition > 99) newPosition = 99; // Ensure it doesn't go beyond the board
  
      // Update position before checking for interactions
      newPositions[currentPlayerIndex] = newPosition;
  
      // Check for victory
      if (newPosition === 99) {
        setVictory(true); // Set victory state if the player reaches column 99
      }
  
      logPionPositions(newPositions);
      return newPositions;
    });
  
    setTimeout(() => {
      // After the pawn movement is completed, handle further actions
      setPionPositionIndex((prevPositions) => {
        const newPositions = [...prevPositions];
        let newPosition = newPositions[currentPlayerIndex];
  
        // Check if the new position is a ladder (show question)
        if (tanggaUp[newPosition]) {
          setShowQuestion(true);
          setWaitingForAnswer(true);
          // Stop the movement here until the question is answered
        }
        // If it's a snake, move the pawn down automatically
        else if (snakesDown[newPosition]) {
          newPosition = snakesDown[newPosition];
          console.log(`Pion ${currentPlayerIndex} turun ular ke ${newPosition}`);
          newPositions[currentPlayerIndex] = newPosition;
          logPionPositions(newPositions);
          setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
        } else {
          // If the dice number is 6, ask a question for an extra roll
          if (diceNumber === 6) {
            setShowQuestion(true);
            setWaitingForAnswer(true);
          } else {
            // If the dice number is not 6, move on to the next player
            setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
          }
        }
  
        return newPositions;
      });
  
      setIsPionMoving(false);
    }, 2000); // Allow time for the pawn to move before continuing
  
    // Reset question and answer state
    setSubmitted(false);
    setIsCorrect(null);
  }
  
  
  

  const handleCorrectAnswerForExtraRoll = (isAnswerCorrect) => {
    if (isAnswerCorrect) {
      console.log(`Pemain ${players[currentPlayerIndex].name} menjawab benar dan mendapat kesempatan roll lagi.`);
      setShowQuestion(false);
      setWaitingForAnswer(false);
      // Pemain dapat me-roll dadu kembali
    } else {
      console.log(`Pemain ${players[currentPlayerIndex].name} menjawab salah, giliran pindah ke pemain berikutnya.`);
      setShowQuestion(false);
      setWaitingForAnswer(false);
      setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
    }
  };
  
  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setSelectedAnswer(answer);
  
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    const isAnswerCorrect = answer === correctAnswer;
    setIsCorrect(isAnswerCorrect);
    setSubmitted(true);
  
    if (isAnswerCorrect) {
      // Trigger animation to move up the ladder if the answer is correct
      setPionPositionIndex((prevPositions) => {
        const newPositions = [...prevPositions];
        const currentPos = newPositions[currentPlayerIndex];
  
        if (tanggaUp[currentPos]) {
          const targetPosition = tanggaUp[currentPos];
          newPositions[currentPlayerIndex] = targetPosition;
          console.log(`Pion ${currentPlayerIndex} naik tangga ke ${targetPosition}`);
        }
  
        logPionPositions(newPositions);
        return newPositions;
      });
  
      // Jika jawabannya benar, dan sebelumnya pemain mendapat angka 6, izinkan roll ulang
      handleCorrectAnswerForExtraRoll(true);
    } else {
      // Jika jawabannya salah, dan sebelumnya pemain mendapat angka 6, hentikan giliran
      handleCorrectAnswerForExtraRoll(false);
    }
  
    setTimeout(() => {
      setShowQuestion(false);
      setWaitingForAnswer(false);
      setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
    }, 1800);
  };
  
  
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
            {players[currentPlayerIndex] ? (
              <h3>{players[currentPlayerIndex].name}'s Turn</h3>
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

          {/* Komponen Dadu */}
          <Dice
            onRollComplete={handleDiceRollComplete}
            disabled={isPionMoving || waitingForAnswer}
          />
          {/* Tambahkan komponen Potion di bawah tombol Roll */}
          <button><Potion /></button>

          {/* Daftar pemain */}
          <div className="player-list mt-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`player-item d-flex align-items-center ${
                  currentPlayerIndex === index ? "active-player" : ""
                }`}
              >
                <Image
                  src={player.photo || "path/to/placeholder.jpg"}
                  roundedCircle
                  width={40}
                  height={40}
                />
                {currentPlayerIndex === index && (
                  <span className="ml-2">{player.name}</span>
                )}
              </div>
            ))}
          </div>
        </Col>
      </Row>
       {/*Show Overlay Victory */}
       {victory && (
        <div className="victory-overlay">
          <img src={victoryImage} alt="Victory Logo" className="victory-logo" />
          <h2>{players[currentPlayerIndex].name} Wins!</h2>
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
