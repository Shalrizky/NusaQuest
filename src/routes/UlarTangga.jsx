import React, { useState } from 'react';
import { Container, Row, Col, Image, Form } from 'react-bootstrap';
import HeaderUtangga from '../components/HeaderUtangga';
import KonvaUlar from '../components/React-KonvaUlar';
import Dice from '../components/Dice';
import '../style/routes/UlarTangga.css';
import bgUlarTangga from '../assets/common/bg-ular.png';

const players = [
  { id: 1, name: 'Anak Bego(AB)', photo: require('../assets/games/Utangga/naruto.jpeg') },
  { id: 2, name: 'Sahel Bau', photo: require('../assets/games/Utangga/narutoa.png') },
  { id: 3, name: 'RanggaSpinner', photo: '' },
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

  const handleDiceRollComplete = () => {
    setShowQuestion(true);
    setSubmitted(false);
    setIsCorrect(null); 
  };

  const handleAnswerChange = (e) => {
    const answer = e.target.value;
    setSelectedAnswer(answer);

    // Cek apakah jawaban benar atau salah
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    if (answer === correctAnswer) {
      setIsCorrect(true); // Jika jawaban benar
    } else {
      setIsCorrect(false); // Jika jawaban salah
    }

    setSubmitted(true); // Tandai bahwa jawaban sudah disubmit
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
            <h3>Player's Turn</h3>
            {showQuestion && (
              <Form>
                <Form.Group>
                  <Form.Label>{questions[currentQuestionIndex].question}</Form.Label>
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <div
                      key={index}
                      className={`form-check ${submitted ? (option === questions[currentQuestionIndex].correctAnswer ? 'correct-answer' : 'wrong-answer') : ''}`} // Tambahkan kelas warna jika sudah submit
                    >
                      <input
                        type="radio"
                        name="foodChoice"
                        id={`foodChoice${index}`}
                        value={option}
                        onChange={handleAnswerChange} // Cek otomatis jawaban
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

          <Dice onRollComplete={handleDiceRollComplete} />
          <div className="player-list mt-3">
            {players.map((player) => (
              <div key={player.id} className="player-item d-flex align-items-center">
                <Image src={player.photo} roundedCircle width={40} height={40} />
                <span className="ml-2">{player.name}</span>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default UlarTangga;
