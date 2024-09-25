import React, { useState, useRef } from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import "../style/routes/GameplayCard.css";
import backIcon from '../assets/icons/btnBack.png';
import musicOnIcon from '../assets/icons/musicTrue.png';
import musicOffIcon from '../assets/icons/musicFalse.png';
import soundOnIcon from '../assets/icons/soundTrue.png';
import soundOffIcon from '../assets/icons/soundFalse.png';
import backgroundMusic from '../assets/musicSound/music.mp3';
import soundEffect from '../assets/musicSound/sound.mp3';
import deckCard from '../assets/common/deckCard.png';  // Kartu kuning
import backCard from '../assets/common/backCard.png';  // Kartu belakang
import rightCard from '../assets/common/rightCard.png';  // Kartu kanan
import leftCard from '../assets/common/leftCard.png';   // Kartu kiri
import shuffleIcon from '../assets/icons/shuffle.png';  // Icon for the four arrows
import logoPerson from '../assets/common/logo-person.png';

function GameplayCard() {
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [cards, setCards] = useState([1, 2, 3, 4, 5]);  // Max 5 kartu
  const [rotation, setRotation] = useState(0); // State for rotation degree
  const [showOverlay, setShowOverlay] = useState(false);  // State untuk overlay

  const navigate = useNavigate();
  const musicRef = useRef(null);
  const soundRef = useRef(null);

  const toggleMusic = () => {
    setIsMusicOn(!isMusicOn);
    if (!isMusicOn) {
      musicRef.current.play();
    } else {
      musicRef.current.pause();
    }
  };

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
    if (!isSoundOn) {
      soundRef.current.play();
    } else {
      soundRef.current.pause();
    }
  };

  const handleBackClick = () => {
    setShowOverlay(!showOverlay);  // Toggle untuk membuka/menutup overlay
  };

  const handleShuffleClick = () => {
    setRotation((prevRotation) => prevRotation + 720); // Add 720 degrees for 2 full rotations
  };

  return (
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
  
      {/* Elemen audio untuk musik latar */}
      <audio ref={musicRef} loop>
        <source src={backgroundMusic} type="audio/mpeg" />
        Browser Anda tidak mendukung elemen audio.
      </audio>
  
      {/* Elemen audio untuk efek suara */}
      <audio ref={soundRef}>
        <source src={soundEffect} type="audio/mpeg" />
        Browser Anda tidak mendukung elemen audio.
      </audio>
  
      {/* Tambahkan logo di bagian atas layar */}
      <Image
        src={logoPerson}
        alt="Logo Person"
        className="logo-person"
      />
  
      {/* Bagian atas dengan ikon kembali dan ikon musik/suara */}
      <Row className="top-icons justify-content-between align-items-center">
        <Col xs={1} className="d-flex justify-content-start">
          <Image
            src={backIcon}
            alt="Kembali"
            className="top-icon"
            style={{ cursor: 'pointer' }}
            onClick={handleBackClick}  // Mengaktifkan overlay saat diklik
          />
        </Col>
        <Col xs={10}></Col>
        <Col xs={1} className="d-flex justify-content-end">
          <Image
            src={isMusicOn ? musicOnIcon : musicOffIcon}
            alt="Musik"
            className="top-icon"
            onClick={toggleMusic}
            style={{ cursor: 'pointer' }}
          />
          <Image
            src={isSoundOn ? soundOnIcon : soundOffIcon}
            alt="Suara"
            className="top-icon ml-3"
            onClick={toggleSound}
            style={{ cursor: 'pointer' }}
          />
        </Col>
      </Row>
  
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
  );
  
  
}

export default GameplayCard;