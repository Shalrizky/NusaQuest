import React, { useState } from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import "../style/routes/GameplayCard.css";
import deckCard from '../assets/common/deckCard.png';  // Kartu kuning
import backCard from '../assets/common/backCard.png';  // Kartu belakang
import rightCard from '../assets/common/rightCard.png';  // Kartu kanan
import leftCard from '../assets/common/leftCard.png';   // Kartu kiri
import shuffleIcon from '../assets/icons/shuffle.png';  // Icon for the four arrows
import logoPerson from '../assets/common/logo-person.png';
import HeaderNuca from '../components/HeaderNuca';

function GameplayCard() {
  const [cards, setCards] = useState([1, 2, 3, 4, 5]);  // Max 5 kartu
  const [rotation, setRotation] = useState(0); // State for rotation degree
  const [showOverlay, setShowOverlay] = useState(false);  // State untuk overlay

  const navigate = useNavigate();

  const handleBackClick = () => {
    setShowOverlay(!showOverlay);  // Toggle untuk membuka/menutup overlay
  };

  const handleShuffleClick = () => {
    setRotation((prevRotation) => prevRotation + 720); // Add 720 degrees for 2 full rotations
  };

  return (
    <>
      <HeaderNuca />
      <Container fluid className="room-ruca-container">
        {/* Overlay hitam setengah layar yang akan muncul ketika backIcon diklik */}
        <div className={`overlay ${showOverlay ? 'show' : ''}`}>
          <div className="overlay-content">
            <h1>Kumpulan Jawaban</h1>
            <h2>Makanan</h2>
            {/* List pertanyaan dan jawaban */}
            <ol className="question-list">
              <li>Makanan yang berasal dari Jawa Barat adalah? <strong>Gudeg</strong></li>
            </ol>
          </div>
        </div>
    
        {/* Tambahkan logo di bagian atas layar */}
        <Image
          src={logoPerson}
          alt="Logo Person"
          className="logo-person"
        />
    
        {/* Tumpukan Kartu Belakang di Tengah */}
        <Row className="justify-content-center align-items-center card-center-section">
          <Col xs={12} className="d-flex justify-content-center">
            <div className="back-card-stack">
              {cards.map((card, index) => (
                <Image
                  key={index}
                  src={backCard}
                  alt={`Kartu belakang ${index + 1}`}
                  className={`back-card back-card-${index}`}
                />
              ))}
            </div>
          </Col>
        </Row>
    
        {/* Tumpukan Kartu Kuning dengan Shuffle Icon */}
        <Row className="justify-content-center align-items-center card-stack-section">
          <Col xs={12} className="d-flex justify-content-center card-stack position-relative">
            {cards.map((card, index) => (
              <Image
                key={index}
                src={deckCard}
                alt={`Kartu ${index + 1}`}
                className={`stacked-card stacked-card-${index}`}
              />
            ))}
            {/* Shuffle Icon in the center with inline style for rotation */}
            <Image
              src={shuffleIcon}
              alt="Shuffle"
              className="shuffle-icon"
              onClick={handleShuffleClick}
              style={{ 
                cursor: 'pointer', 
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`, 
                transition: 'transform 4s ease' 
              }}
            />
          </Col>
        </Row>
    
        {/* Tumpukan Kartu di Sebelah Kanan (Vertikal) */}
        <Row className="justify-content-end align-items-center card-right-section">
          <Col xs={12} className="d-flex justify-content-end card-right-stack">
            {cards.map((card, index) => (
              <Image
                key={index}
                src={rightCard}
                alt={`Kartu kanan ${index + 1}`}
                className={`right-card right-card-${index}`}
              />
            ))}
          </Col>
        </Row>
    
        {/* Tumpukan Kartu di Sebelah Kiri (Vertikal) */}
        <Row className="justify-content-start align-items-center card-left-section">
          <Col xs={12} className="d-flex justify-content-start card-left-stack">
            {cards.map((card, index) => (
              <Image
                key={index}
                src={leftCard}
                alt={`Kartu kiri ${index + 1}`}
                className={`left-card left-card-${index}`}
              />
            ))}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default GameplayCard;