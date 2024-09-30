import React, { useState } from "react";
import { Container, Row, Col, Image, Form } from "react-bootstrap";
import HeaderUtangga from "../components/HeaderUtangga";
import Board from "../components/React-KonvaUlar";
import Dice from "../components/Dice";
import Potion from "../components/potion"; // Import komponen Potion
import "../style/routes/UlarTangga.css";
import bgUlarTangga from "../assets/common/bg-ular.png";

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

const snakesAndLadders = {
  5: 24,
  16: 66,
  61: 80,
  64: 75,
  72: 88,
  85: 94,
  19: 59,
  27: 48,
  49: 69,
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
  const [pionPositions, setPionPositions] = useState([0, 0, 0, 0]); // 4 pion di posisi awal (0)
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false); // Cegah pion naik sebelum menjawab dengan benar

  // Kolom di mana ada tangga dan muncul pertanyaan
  const questionColumns = [5, 16, 61, 64, 72, 85, 19, 27, 49];

  // Mengubah posisi pion berdasarkan nilai dadu
  const handleDiceRollComplete = () => {
    const diceNumber = 5;  // Misalkan nilai dadu yang sudah dihasilkan
    setIsPionMoving(true); // Pion mulai bergerak
  
    setPionPositions((prevPositions) => {
      const newPositions = [...prevPositions];
      let newPosition = newPositions[currentPlayerIndex] + diceNumber;
  
      if (newPosition > 99) newPosition = 99;
  
      // Jika pion berhenti di salah satu kolom pertanyaan
      if (questionColumns.includes(newPosition)) {
        setShowQuestion(true);
        setWaitingForAnswer(true); // Jangan biarkan pion naik sampai pertanyaan dijawab dengan benar
      } else {
        setShowQuestion(false); // Sembunyikan pertanyaan jika tidak di kolom yang ditentukan
        // Pindahkan giliran hanya jika tidak ada pertanyaan
        setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
      }
  
      newPositions[currentPlayerIndex] = newPosition;
      return newPositions;
    });
  
    setSubmitted(false);
    setIsCorrect(null);
  
    setTimeout(() => {
      setIsPionMoving(false);
    }, 2500);
  };
  

  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setSelectedAnswer(answer);
  
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    const isAnswerCorrect = answer === correctAnswer;
    setIsCorrect(isAnswerCorrect);
    setSubmitted(true);
  
    if (isAnswerCorrect) {
      // Hanya jika jawabannya benar, pion akan naik tangga (jika ada tangga)
      setPionPositions((prevPositions) => {
        const newPositions = [...prevPositions];
        const currentPos = newPositions[currentPlayerIndex];
  
        // Cek apakah pemain berada di kolom tangga dan perbarui posisinya jika benar
        if (snakesAndLadders[currentPos]) {
          newPositions[currentPlayerIndex] = snakesAndLadders[currentPos]; // Naik tangga jika benar
        }
        return newPositions;
      });
    }
  
    // Lanjutkan ke pemain berikutnya, baik jawaban benar atau salah
    setTimeout(() => {
      setShowQuestion(false); // Sembunyikan pertanyaan setelah jawaban diberikan
      setWaitingForAnswer(false); // Izinkan pion untuk bergerak lagi setelah menjawab
  
      // Pindahkan giliran ke pemain berikutnya
      setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
  
      // Naikkan index pertanyaan
      setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
    }, 2000);
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
            pionPositionIndex={pionPositions}
            setPionPositionIndex={setPionPositions}
            snakesAndLadders={snakesAndLadders}
            waitingForAnswer={waitingForAnswer}
            isCorrect={isCorrect}
            setIsCorrect={setIsCorrect} // Tambahkan ini
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
            disabled={isPionMoving || waitingForAnswer} // Cegah dadu bergulir jika menunggu jawaban
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
    </Container>
  );
}

export default UlarTangga;
