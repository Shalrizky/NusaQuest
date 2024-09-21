import React, { useState } from 'react';
import { Container, Row, Col, Image, Button, Form } from 'react-bootstrap';
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

function UlarTangga() {
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleDiceRollComplete = () => {
    setShowQuestion(true);
    setSubmitted(false);
  };

  const handleAnswerChange = (e) => {
    setSelectedAnswer(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    console.log(`Selected answer: ${selectedAnswer}`);
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
            {showQuestion && !submitted && (
              <Form>
                <Form.Group>
                  <Form.Label>Makanan Paling enak apa di Jawa?</Form.Label>
                  {['Soto Betawi', 'Gudeg', 'Batagor', 'Rendang'].map((food, index) => (
                    <div key={index} className="form-check">
                      <input
                        type="radio"
                        name="foodChoice"
                        id={`foodChoice${index}`}
                        value={food}
                        onChange={(e) => {
                          handleAnswerChange(e); // Simpan pilihan jawaban
                          handleSubmit(); // Kirim otomatis jawaban
                        }}
                        checked={selectedAnswer === food}
                        className="d-none"
                      />
                      <label htmlFor={`foodChoice${index}`} className="form-check-label">
                        {food}
                      </label>
                    </div>
                  ))}
                </Form.Group>
              </Form>
            )}
            {submitted && <p>Your answer has been submitted: {selectedAnswer}</p>}
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
    </Container >
  );
}

export default UlarTangga;