// UtanggaVsAi.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import HeaderGame from "../components/games/HeaderGame";
import Board from "../components/gamesAi/react-KonvaAi";
import Dice from "../components/gamesAi/DiceAi";
import Potion from "../components/games/potion";
import PlayerList from "../components/games/uTangga/PlayerList";
import "../style/routes/UlarTangga.css";
import victoryImage from "../assets/games/victory.png";
import Achievement from "../assets/games/achievement1.png";
import Achievement2 from "../assets/games/achievement2.png";
import potionImage from "../assets/games/potion.png";
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
  // Tambahkan pertanyaan lainnya sesuai kebutuhan
];

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
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pemain: 1 pengguna dan 1 bot
  const [players, setPlayers] = useState([
    {
      uid: "player1",
      displayName: user.displayName,
      // photo: user.photoURL || require("../assets/games/Utangga/placeholder.jpg"),
      isBot: false,
    },
    {
      uid: "bot",
      displayName: "Bot",
      // photo: require("../assets/games/Utangga/bot.jpg"), // Pastikan gambar bot tersedia
      isBot: true,
    },
  ]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [pionPositionIndex, setPionPositionIndex] = useState([0, 0]); // [player, bot]
  const [diceState, setDiceState] = useState({
    isRolling: false,
    currentNumber: 1,
  });
  const [isPionMoving, setIsPionMoving] = useState(false);
  const [victory, setVictory] = useState(false);
  const [winner, setWinner] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allowExtraRoll, setAllowExtraRoll] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameTimeLeft, setGameTimeLeft] = useState(1800); // 30 menit
  const [gameOver, setGameOver] = useState(false);
  const [pendingPosition, setPendingPosition] = useState(null); // Posisi yang akan dituju setelah menjawab

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
    () => {
      const diceNumber=5
      console.log(`Dice rolled: ${diceNumber}`);
      const newPositions = [...pionPositionIndex];
      const currentPos = newPositions[currentPlayerIndex];
      let newPos = Math.min(currentPos + diceNumber, 99);

      setIsPionMoving(true);
      setDiceState({ isRolling: false, currentNumber: diceNumber });

      // Update posisi pion sementara ke newPos
      newPositions[currentPlayerIndex] = newPos;
      setPionPositionIndex(newPositions);

      // Cek kemenangan
      if (checkVictory(newPos)) {
        setIsPionMoving(false);
        return;
      }

      // Cek tangga atau ular
      const isLadder = tanggaUp[newPos] !== undefined;
      const isSnake = snakesDown[newPos] !== undefined;
      const finalPos = tanggaUp[newPos] || snakesDown[newPos] || newPos;

      if (isLadder) {
        setPendingPosition(finalPos); // Simpan posisi akhir tangga
        setShowQuestion(true);
        setSubmitted(false);
        setIsCorrect(false); // Reset isCorrect sebelum jawaban
        setAllowExtraRoll(false);
        // Pion tetap di currentPos sampai jawaban
      } else if (isSnake) {
        // Jika ular, langsung turun ke posisi akhir ular
        newPositions[currentPlayerIndex] = finalPos;
        setPionPositionIndex(newPositions);
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      } else if (diceNumber === 6) {
        setShowQuestion(true);
        setSubmitted(false);
        setIsCorrect(false); // Reset isCorrect sebelum jawaban
        setAllowExtraRoll(true);
      } else {
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      }

      setIsPionMoving(false);
    },
    [currentPlayerIndex, pionPositionIndex, players.length, checkVictory, tanggaUp, snakesDown]
  );

  // Logika Bot
  useEffect(() => {
    if (
      players[currentPlayerIndex].isBot &&
      !victory &&
      !showQuestion &&
      !isPionMoving
    ) {
      const botTurn = async () => {
        // Delay sebelum bot mengambil giliran
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const botRoll = Math.floor(Math.random() * 6) + 1; // Roll dadu secara acak
        console.log(`Bot rolled: ${botRoll}`);

        // Mulai animasi dadu
        setDiceState({ isRolling: true, currentNumber: botRoll });

        // Berhenti animasi setelah durasi tertentu
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setDiceState({ isRolling: false, currentNumber: botRoll });
        handleDiceRollComplete(botRoll); // Jalankan logika setelah animasi selesai
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
  ]);

  // Timer global untuk menghitung waktu permainan
  useEffect(() => {
    if (gameTimeLeft > 0) {
      const gameTimer = setInterval(() => {
        setGameTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          return newTime;
        });
      }, 1000);
      return () => clearInterval(gameTimer);
    } else {
      setGameOver(true);
    }
  }, [gameTimeLeft]);

  // Menangani game over
  useEffect(() => {
    if (gameOver) {
      alert("Waktu permainan habis! Permainan telah berakhir.");
      navigate("/"); // Arahkan pemain ke halaman utama
    }
  }, [gameOver, navigate]);

  // Timer untuk setiap giliran pemain
  useEffect(() => {
    if (!showQuestion && !victory && !gameOver) {
      if (timeLeft > 0) {
        const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timerId);
      } else {
        // Jika waktu habis, pindah ke pemain berikutnya
        setTimeLeft(30);
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      }
    }
  }, [timeLeft, showQuestion, victory, gameOver, players.length]);

  // Menangani perubahan jawaban
  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setSelectedAnswer(answer);

    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    const isAnswerCorrect = answer === correctAnswer;
    setIsCorrect(isAnswerCorrect);
    setSubmitted(true);

    console.log(
      `Player ${currentPlayerIndex} answered: ${answer}, Correct: ${isAnswerCorrect}`
    );

    if (isAnswerCorrect) {
      if (pendingPosition !== null) {
        // Jika ada pendingPosition, pindahkan pion ke posisi tersebut
        const newPositions = [...pionPositionIndex];
        newPositions[currentPlayerIndex] = pendingPosition;
        setPionPositionIndex(newPositions);
        setPendingPosition(null);
      }

      if (allowExtraRoll) {
        // Pemain mendapat kesempatan roll ulang
        setAllowExtraRoll(false);
      } else {
        // Tidak perlu mengubah giliran
      }
    } else {
      // Jika jawaban salah, pindah giliran
      setAllowExtraRoll(false);
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
      setPendingPosition(null); // Reset pendingPosition karena jawaban salah
    }

    // Setelah menjawab, sembunyikan pertanyaan dan tampilkan giliran berikutnya
    setTimeout(() => {
      setShowQuestion(false);
      setSelectedAnswer("");
      setSubmitted(false);
      setIsCorrect(null);
      setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
      setTimeLeft(30);
    }, 1800);
  };

  return (
    <Container
      fluid
      className="utangga-container"
      style={{ backgroundImage: `url(${bgUlarTangga})` }}
    >
      <HeaderGame layout="home" />

      <Row className="utu-container-board d-flex justify-content-center my-3">
        <Col xs={12} md={6} className="utu-konva px-4">
          <Board
            pionPositionIndex={pionPositionIndex}
            tanggaUp={tanggaUp}
            snakesDown={snakesDown}
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            isCorrect={isCorrect} // Tambahkan isCorrect sebagai prop
          />
        </Col>

        <Col
          xs={12}
          md={6}
          className="d-flex flex-column align-items-center justify-content-center px-4 gap-4"
        >
          {/* Kotak Giliran Pemain */}
          <div className="player-turn-box">
            {players[currentPlayerIndex] ? (
              <h3>{players[currentPlayerIndex].displayName}'s Turn</h3>
            ) : (
              <h3>Waiting for player...</h3>
            )}

            {/* Pertanyaan */}
            {showQuestion && (
              <div className="question-section">
                <Form>
                  <Form.Group>
                    <Form.Label>
                      {questions[currentQuestionIndex].question}
                    </Form.Label>
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <div
                        key={index}
                        className={`form-check ${submitted
                            ? option === questions[currentQuestionIndex].correctAnswer
                              ? "correct-answer"
                              : "wrong-answer"
                            : ""
                          }`}
                      >
                        <input
                          type="radio"
                          name="quizOption"
                          id={`quizOption${index}`}
                          value={option}
                          onChange={handleAnswerChange}
                          checked={selectedAnswer === option}
                          className="d-none"
                        />
                        <label
                          htmlFor={`quizOption${index}`}
                          className="form-check-label"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </Form.Group>
                </Form>
                {submitted && (
                  <div className="answer-feedback">
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timer pemain */}
          <div className="timer-display">
            <span className="time-text">{timeLeft}</span>
            <span className="time-label">Sec</span>
          </div>

          {/* Dadu dan Potion */}
          <div className="dice-potion-container">
            <Dice
              onRollComplete={(number) => {
                handleDiceRollComplete(number);
              }}
              disabled={
                players[currentPlayerIndex].isBot ||
                isPionMoving ||
                victory ||
                showQuestion
              }
              diceState={diceState}
            />
            <Potion />
          </div>

          {/* Daftar pemain */}
          <PlayerList
            players={players}
            currentPlayerIndex={currentPlayerIndex}
          />
        </Col>
      </Row>

      {/* Overlay Victory */}
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
