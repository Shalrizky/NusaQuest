// GameplayCard.js
import React, { useState, useEffect, useRef } from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';
import '../style/routes/GameplayCard.css';
import DeckPlayer from '../components/games/DeckPlayer';
import BottomDeckCard from '../components/games/BottomDeckCard';
import HeaderNuca from '../components/games/HeaderGame';
import PertanyaanNuca from '../components/games/PertanyaanNuca';
import backgroundImage from '../assets/common/background.png';
import playerProfile from '../assets/common/imageOne.png';
import shuffleIcon from '../assets/common/shuffle.png';

function GameplayCard() {
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExitingPopup, setIsExitingPopup] = useState(false);
  const [cards, setCards] = useState([
    { title: "Makanan", text: "Sayur Asem adalah?" },
    { title: "Minuman", text: "Es Teh adalah?" },
    { title: "Buah", text: "Apel adalah?" },
    { title: "Sayuran", text: "Bayam adalah?" },
  ]);
  const [activeCard, setActiveCard] = useState(null); // Track kartu di tengah
  const timerRef = useRef(null); // Timer untuk penghapusan kartu

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 2000);
  };

  const handleBottomCardClick = (card) => {
    setActiveCard(card); // Simpan konten kartu yang dilempar ke tengah

    // Hapus kartu dari deck setelah diklik
    setCards((prevCards) => prevCards.filter((c) => c !== card));

    // Timer untuk menghilangkan kartu dari tengah setelah 10 detik
    timerRef.current = setTimeout(() => {
      setActiveCard(null); // Bersihkan kartu dari tengah
    }, 10000);
  };

  const handleAnswerSelect = (isCorrect) => {
    if (isCorrect) {
      console.log("Correct answer, removing card.");
      clearTimeout(timerRef.current); // Hentikan timer jika dijawab
      setActiveCard(null); // Hapus kartu dari tengah
    } else {
      console.log("Incorrect answer or no answer.");
    }
    setIsExitingPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsExitingPopup(false);
      handleShuffle();
    }, 1000);
  };

  return (
    <div
      className="nuca-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <HeaderNuca layout="home" />

      <Container fluid className="h-100 text-center mt-2">
        <Row className="h-75 d-flex align-items-center justify-content-center">
          <Col xs={4} className="d-flex justify-content-center align-items-center">
            <div className="deck-wrapper-left" style={{ transform: 'rotate(270deg)' }}>
              <DeckPlayer />
            </div>
          </Col>

          <Col
            xs={4}
            className="d-flex justify-content-center align-items-center position-relative"
          >
            <div
              className="deck-wrapper-middle"
              style={{ transform: 'scale(0.6)', position: 'relative' }}
            >
              <DeckPlayer />
              {activeCard && (
                <div className="moving-card">
                  <h3>{activeCard.title}</h3>
                  <p>{activeCard.text}</p>
                </div>
              )}
              <img
                src={shuffleIcon}
                alt="Shuffle Icon"
                className={`shuffle-icon ${isShuffling ? 'rotating' : ''}`}
                style={{
                  width: '350px',
                  height: 'auto',
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  left: '10px',
                  zIndex: '10',
                }}
              />
            </div>
          </Col>

          <Col xs={4} className="d-flex justify-content-center align-items-center">
            <div className="deck-wrapper-right" style={{ transform: 'rotate(270deg)' }}>
              <DeckPlayer />
            </div>
          </Col>
        </Row>
      </Container>

      <Container fluid className="h-25 text-center">
        <Row className="align-items-center">
          <Col xs={12} className="d-flex justify-content-center">
            <div className="stackable-cards text-center">
              <BottomDeckCard cards={cards} onCardClick={handleBottomCardClick} />
              <Image
                src={playerProfile}
                roundedCircle
                className="player-image mt-3 img-fluid"
                style={{ width: "100px", height: "100px", marginLeft: "20px" }}
              />
            </div>
          </Col>
        </Row>
      </Container>

      {showPopup && (
        <PertanyaanNuca
          onAnswerSelect={handleAnswerSelect}
          isExiting={isExitingPopup}
          isVisible={showPopup}
        />
      )}
    </div>
  );
}

export default GameplayCard;
