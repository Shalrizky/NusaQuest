import React, { useState } from "react";
import { Container, Row, Col, Image, Modal, Button } from "react-bootstrap";
import "../style/routes/GameplayCard.css";
import deckCard from '../assets/common/deckCard.png';  // Kartu kuning
import backCard from '../assets/common/backCard.png';  // Kartu belakang
import rightCard from '../assets/common/rightCard.png';  // Kartu kanan
import leftCard from '../assets/common/leftCard.png';   // Kartu kiri
import shuffleIcon from '../assets/icons/shuffle.png';  // Icon untuk shuffle
import logoPerson from '../assets/common/logo-person.png';
import btnTemp from '../assets/common/btnTemp.png';  // Tambahkan icon btnTemp
import HeaderNuca from '../components/HeaderNuca';
import playerProfile from '../assets/common/imageOne.png'; // Foto profil pemain

function GameplayCard() {
  const [cards, setCards] = useState([1, 2, 3, 4, 5]);  // Maksimal 5 kartu
  const [rotation, setRotation] = useState(0);  // Derajat rotasi untuk shuffle icon
  const [showOverlay, setShowOverlay] = useState(false);  // State untuk overlay
  const [showModal, setShowModal] = useState(false);  // State untuk modal pop-up

  const handleBackClick = () => {
    setShowOverlay(!showOverlay);  // Toggle untuk membuka/menutup overlay
  };

  const handleShuffleClick = () => {
    setRotation((prevRotation) => prevRotation + 720); // Tambah 720 derajat untuk 2 kali rotasi penuh
  };

  const handleCardClick = () => {
    // Ketika kartu tengah diklik, tampilkan modal
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);  // Tutup modal
  };

  return (
    <>
      <HeaderNuca />
      <Container fluid className="room-ruca-container">
        {/* Tambahkan tombol btnTemp di bagian atas kanan */}
        <div className="btn-temp-container">
          <Image
            src={btnTemp}
            alt="Tombol Suhu"
            className="btn-temp"
          />
        </div>

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

        {/* Profil pemain di kiri, kanan, dan bawah */}
        <div className="player-profile-container">
          <Image
            src={playerProfile}
            alt="Profil Pemain 1"
            className="player-profile player-profile-left"
          />
          <Image
            src={playerProfile}
            alt="Profil Pemain 2"
            className="player-profile player-profile-right"
          />
          <Image
            src={playerProfile}
            alt="Profil Pemain 3"
            className="player-profile player-profile-bottom"
          />
        </div>

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

        {/* Tumpukan Kartu di Sebelah Kanan (Vertikal) */}
        <Row className="card-right-section">
          <Col className="d-flex justify-content-center card-right-stack">
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
        <Row className="card-left-section">
          <Col className="d-flex justify-content-center card-left-stack">
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

        {/* Tumpukan Kartu Kuning dengan Shuffle Icon */}
        <Row className="justify-content-center align-items-center card-stack-section">
          <Col xs={12} className="d-flex justify-content-center card-stack position-relative">
            {cards.map((card, index) => (
              <Image
                key={index}
                src={deckCard}
                alt={`Kartu ${index + 1}`}
                className={`stacked-card stacked-card-${index}`}
                onClick={handleCardClick}
              />
            ))}
            {/* Shuffle Icon di tengah dengan rotasi */}
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

        {/* Modal pop-up sederhana saat kartu tengah diklik */}
        <Modal show={showModal} onHide={handleCloseModal} centered className="transparent-modal">
          <Modal.Header closeButton>
            <Modal.Title>Nusa Quest</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-content-body">
            <div className="modal-icon">
              <Image src={deckCard} alt="Icon Kartu" className="modal-deck-icon" />
            </div>
            <h5 className="modal-text">Anda telah memilih kartu dari Nusa Quest!</h5>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Tutup
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default GameplayCard;
