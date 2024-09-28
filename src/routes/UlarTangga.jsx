import React, { useState } from "react";
import { Container, Row, Col, Image, Form } from "react-bootstrap";
import HeaderUtangga from "../components/HeaderUtangga";
import Board from "../components/React-KonvaUlar";
import Dice from "../components/Dice";
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

//Misalnya, 5: 24 berarti pemain yang berada di posisi 5 akan naik ke posisi 24.
const snakesAndLadders = {
  5: 24, // Tangga dari 6 ke 25
  16: 66, // tangga dari 17 ke 67
  61: 80, // tangga dari 60 ke 80
  64: 75, // tangga dari 64 ke 75
  72: 88, // tangga dari 73 ke 89
  85: 94, // tangga dari 86 ke 95
  19: 59, // tangga dari 20 ke 60
  27: 48, // Tangga dari 28 ke 49
  49: 69, // Tangga dari 50 ke 70

  // untuk turun (ULAR)
  22: 1, // ular dari 23 ke 2
  29: 8, // ular dari 30 ke 9
  57: 38, // ular dari 58 ke 39
  65: 43, // ular dari 66 ke 44
  67: 13, // ular dari 68 ke 14
  90: 48, // ulara dari 91 ke 49
  93: 66, // ular dari 94 ke 67
  98: 76, // ular dari 99 ke 77
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

  //kolom dimana ada tangga dan akan muncul pertanyaan
  const questionColumns = [5, 16, 61, 64, 72, 85, 19, 27, 49];

  //Mengubah posisi pion berdasarkan nilai dadu
  const handleDiceRollComplete = () => {
    const diceNumber = 5;
    setIsPionMoving(true); // Pion mulai bergerak

    setPionPositions((prevPositions) => {
      const newPositions = [...prevPositions]; // Make a copy of the previous positions
      let newPosition = newPositions[currentPlayerIndex] + diceNumber;
    
      if (newPosition > 99) newPosition = 99; // Cap at 99
      if (questionColumns.includes(newPosition)) {
        setShowQuestion(true);
      } else {
        setShowQuestion(false); // Sembunyikan pertanyaan jika tidak di kolom yang ditentukan
      }

      newPositions[currentPlayerIndex] = newPosition; // Update the position of the current player
      return newPositions; // Return the updated array
    });

    setSubmitted(false);
    setIsCorrect(null);

    // Pindahkan giliran ke pemain berikutnya setelah dadu berhenti
    setTimeout(() => {
      setIsPionMoving(false);
      setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
    }, 2500);
  };

  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setSelectedAnswer(answer);

    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    setIsCorrect(answer === correctAnswer);

    setSubmitted(true);

    // Pindahkan ke pertanyaan berikutnya setelah jawaban diberikan
    setTimeout(() => {
      setShowQuestion(false); // Sembunyikan pertanyaan setelah dijawab
      setCurrentQuestionIndex(
        (prevIndex) => (prevIndex + 1) % questions.length
      );
    }, 2000); // Penundaan setelah pemain menjawab
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
            {showQuestion && (
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
                {submitted && isCorrect !== null && (
                  <div
                    className={`answer-feedback ${isCorrect ? "text-success" : "text-danger"
                      }`}
                  >
                    {isCorrect ? "Correct Answer!" : "Wrong Answer!"}
                  </div>
                )}
              </Form>
            )}
          </div>

          {/* Komponen Dadu */}
          <Dice onRollComplete={handleDiceRollComplete} disabled={isPionMoving} />

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
    </Container>
  );
}

export default UlarTangga;
