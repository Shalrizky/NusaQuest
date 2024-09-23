import React, { useState } from 'react';
import { Container, Row, Col, Image, Form } from 'react-bootstrap';
import HeaderUtangga from '../components/HeaderUtangga';
import KonvaUlar from '../components/React-KonvaUlar';
import Dice from '../components/Dice';
import '../style/routes/UlarTangga.css';
import bgUlarTangga from '../assets/common/bg-ular.png';

const players = [
  { id: 1, name: 'Anak Bego(AB)', photo: require('../assets/games/Utangga/narutoa.png') },
  { id: 2, name: 'Sahel Bau', photo: require('../assets/games/Utangga/narutoa.png') },
  { id: 3, name: 'RanggaSpinner', photo: require('../assets/games/Utangga/narutoa.png') },
  { id: 4, name: 'natahAFK', photo: require('../assets/games/Utangga/narutoa.png') },
];

const questions = [
  {
    id: 1,
    question: 'Makanan paling enak apa di Jawa?',
    options: ['Soto Betawi', 'Gudeg', 'Batagor', 'Rendang'],
    correctAnswer: 'Gudeg'
  }
];

function UlarTangga() {
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0); // Track pemain aktif

  // Fungsi yang akan dipanggil setelah lemparan dadu selesai
  const handleDiceRollComplete = () => {
    setShowQuestion(true);  // Tampilkan pertanyaan setelah dadu dilempar
    setSubmitted(false);
    setIsCorrect(null);
  };

  // Fungsi untuk memeriksa jawaban dan pindah giliran setelah dijawab
  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setSelectedAnswer(answer);

    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    if (answer === correctAnswer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }

    setSubmitted(true);

    // Setelah pemain menjawab, pindahkan giliran ke pemain berikutnya
    setTimeout(() => {
      // Setelah pertanyaan dijawab, pindah ke pemain berikutnya
      setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
      setShowQuestion(false);  // Sembunyikan pertanyaan setelah pemain menjawab
    }, 2000); // Bisa disesuaikan waktunya jika ingin penundaan setelah menjawab
  };

  return (
    <Container fluid className="utangga-container" style={{ backgroundImage: `url(${bgUlarTangga})` }}>
      <HeaderUtangga layout="home" />
      <Row className="utu-container-left">
        <Col xs={12} md={6} className="utu-konva">
          <KonvaUlar />
        </Col>

        <Col xs={12} md={6} className="d-flex flex-column align-items-center justify-content-start">
          <div className="player-turn-box">
            <h3>{players[currentPlayerIndex].name}'s Turn</h3>
            {showQuestion && (
              <Form>
                <Form.Group>
                  <Form.Label>{questions[currentQuestionIndex].question}</Form.Label>
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <div
                      key={index}
                      className={`form-check ${submitted ? (option === questions[currentQuestionIndex].correctAnswer ? 'correct-answer' : 'wrong-answer') : ''}`}
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
                      <label htmlFor={`foodChoice${index}`} className="form-check-label">
                        {option}
                      </label>
                    </div>
                  ))}
                </Form.Group>
              </Form>
            )}
          </div>

          {/* Dice component */}
          <Dice onRollComplete={handleDiceRollComplete} />

          {/* Player list */}
          <div className="player-list mt-3">
            {players.map((player, index) => (
              <div key={player.id} className={`player-item d-flex align-items-center ${currentPlayerIndex === index ? 'active-player' : ''}`}>
                <Image src={player.photo || 'path/to/placeholder.jpg'} roundedCircle width={40} height={40} />

                {/* Only show name if the player is active */}
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
