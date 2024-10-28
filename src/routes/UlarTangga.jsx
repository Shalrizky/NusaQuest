import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image, Form } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import HeaderUtangga from "../components/games/HeaderGame";
import Board from "../components/games/React-KonvaUlar";
import Dice from "../components/games/Dice";
import Potion from "../components/games/potion";
// import  {fetchQuestions} from "../services/questionServices";
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
  const [victory, setVictory] = useState(false);
  const [allowExtraRoll, setAllowExtraRoll] = useState(false);
  const [winner, setWinner] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameTimeLeft, setGameTimeLeft] = useState(1800);
  const [gameOver, setGameOver] = useState(false);

  // const [questions, setQuestions] = useState([]);

  // useEffect(() => {
  //   fetchQuestions(setQuestions);  // Panggil tanpa async/await
  // }, []);

  // useEffect(() => {
  //   // Debug untuk memastikan questions ter-update
  //   console.log("Updated Questions State:", questions);
  // }, [questions]);  // Akan dipanggil setiap kali questions berubah


  const navigate = useNavigate();

  const logPionPositions = (newPositions) => {
  };

  const nextPlayer = () => {
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
    setTimeLeft(30); // Reset waktu ke 3 detik untuk pemain berikutnya
  };

  useEffect(() => {
    if (!isPionMoving && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId); // Bersihkan timer saat tidak digunakan
    } else if (timeLeft === 0) {
      nextPlayer(); // Pindah ke pemain berikutnya jika waktu habis
    }
  }, [timeLeft, isPionMoving]);

  /// Timer global untuk menghitung waktu permainan
  useEffect(() => {
    if (gameTimeLeft > 0) {
      const gameTimer = setInterval(() => {
        setGameTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          console.log("Sisa waktu permainan:", Math.floor(newTime / 60) + ":" + String(newTime % 60).padStart(2, '0'));
          return newTime;
        });
      }, 1000);
      return () => clearInterval(gameTimer);
    } else {
      setGameOver(true); // Tandai permainan berakhir
    }
  }, [gameTimeLeft]);


  // Arahkan ke halaman lain atau tampilkan pesan ketika waktu habis
  useEffect(() => {
    if (gameOver) {
      alert("Waktu permainan habis! Permainan telah berakhir.");
      navigate("/"); // Arahkan pemain ke halaman utama
    }
  }, [gameOver, navigate]);

  useEffect(() => {
    if (showQuestion) {

      if (timeLeft > 0) {
        const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timerId); // Bersihkan timer jika waktu habis
      } else {

        nextPlayer();
        setShowQuestion(false);
        setWaitingForAnswer(false);
      }
    }
  }, [timeLeft, showQuestion]);

  const handleDiceRollComplete = (diceNumber) => {
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

      logPionPositions(newPositions);
      return newPositions;
    });

    setTimeout(() => {
      setPionPositionIndex((prevPositions) => {
        const newPositions = [...prevPositions];
        let newPosition = newPositions[currentPlayerIndex];

        if (victory) return prevPositions;

        // Jika bertemu tangga, tampilkan pertanyaan khusus untuk naik tangga
        if (tanggaUp[newPosition]) {
          setShowQuestion(true);
          setWaitingForAnswer(true);
          setSubmitted(false);
          setIsCorrect(null);
          setAllowExtraRoll(false);
        }
        // Jika bertemu ular, turun otomatis dan giliran berpindah
        else if (snakesDown[newPosition]) {
          newPosition = snakesDown[newPosition];
          newPositions[currentPlayerIndex] = newPosition;
          logPionPositions(newPositions);
          setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
        }
        // Jika mendapatkan angka 6, berikan pertanyaan untuk giliran ulang
        else if (diceNumber === 6) {
          setShowQuestion(true);
          setWaitingForAnswer(true);
          setSubmitted(false);
          setIsCorrect(null);
          setAllowExtraRoll(true);
        }
        // Jika pemain sudah mendapat kesempatan roll ulang sebelumnya
        else if (allowExtraRoll) {
          setAllowExtraRoll(false);
          nextPlayer(); // Pindah ke pemain berikutnya
        }
        // Jika bukan angka 6 dan tidak ada roll ulang, pindah ke pemain berikutnya
        else {
          nextPlayer(); // Pindah ke pemain berikutnya
        }

        return newPositions;
      });

      setIsPionMoving(false);
    }, 2000);

    // Reset state setelah pemain selesai
    setSubmitted(false);
    setIsCorrect(null);
    setTimeLeft(30); // Reset timer ke 3 detik setelah lemparan selesai
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
      } else {
        setPionPositionIndex((prevPositions) => {
          const newPositions = [...prevPositions];
          const currentPos = newPositions[currentPlayerIndex];

          if (tanggaUp[currentPos]) {
            const targetPosition = tanggaUp[currentPos];
            newPositions[currentPlayerIndex] = targetPosition;
          }

          logPionPositions(newPositions);
          return newPositions;
        });
        setAllowExtraRoll(false);
        setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
      }
    } else {
      setAllowExtraRoll(false);
      setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
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
                        className={`form-check ${submitted
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
            <Dice onRollComplete={handleDiceRollComplete} disabled={isPionMoving || waitingForAnswer} />
            <Potion />
          </div>


          {/* Daftar pemain */}
          <div className="player-list mt-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`player-item d-flex align-items-center ${currentPlayerIndex === index ? "active-player" : ""
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

// ini yang bener + timer