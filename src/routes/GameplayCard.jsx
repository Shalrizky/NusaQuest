import React, { useState, useEffect } from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';
import '../style/routes/GameplayCard.css';
import DeckPlayer from '../components/games/DeckPlayer';
import BottomDeckCard from '../components/games/BottomDeckCard';
import HeaderNuca from '../components/games/HeaderGame';
import PertanyaanNuca from '../components/games/PertanyaanNuca';
import backgroundImage from '../assets/common/background.png';
import playerProfile from '../assets/common/imageOne.png';

function GameplayCard() {
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExitingPopup, setIsExitingPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleShuffle = () => {
    setTimeout(() => {
      setIsShuffling(true);
      setTimeout(() => {
        setIsShuffling(false);
      }, 2000);
    }, 500);
  };

  const handleBottomCardClick = (index) => {
    console.log(`Bottom card ${index} clicked`);
  };

  const handleAnswerSelect = (answer) => {
    console.log(`Selected answer: ${answer}`);
    setIsExitingPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsExitingPopup(false);
      handleShuffle();
    }, 1000);
  };

  return (
    <div className="nuca-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <HeaderNuca />

      <Container fluid className="h-100 text-center mt-2">
      <Row 
        className="h-100 d-flex align-items-center justify-content-between"
        style={{ height: '100%' }}
      >
        {/* Deck 1 - Left */}
        <Col 
          xs={4} 
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100%' }}
        >
          <div 
            className="deck-wrapper-left"
            style={{ 
              transform: 'rotate(90deg)', 
              width: '150px',  // Perbesar untuk memungkinkan tampilan deck yang penuh
              height: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <DeckPlayer />
          </div>
        </Col>

        {/* Deck 2 - Center */}
        <Col 
          xs={4} 
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100%' }}
        >
          <div 
            className="deck-wrapper-middle"
            style={{ 
              width: '150px', // Pastikan ukuran ini sama dengan deck lainnya
              height: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <DeckPlayer />
          </div>
        </Col>

        {/* Deck 3 - Right */}
        <Col 
          xs={4} 
          className="d-flex justify-content-center align-items-center"
          style={{ height: '100%' }}
        >
          <div 
            className="deck-wrapper-right"
            style={{ 
              transform: 'rotate(90deg)', 
              width: '150px',  // Ukuran konsisten di semua deck
              height: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <DeckPlayer />
          </div>
        </Col>
      </Row>
    </Container>


      <Container fluid className="h-100 text-center mt-2">
        <Row className="h-100 align-items-end" style={{ height: 'calc(100vh - 100px)' }}> {/* Ensure it takes the full height */}
          {/* Bottom Player Deck (Center, Bottom-Aligned) */}
          <Col 
            xs={12} 
            md={12} 
            className="d-flex justify-content-center" 
          >
            <div className="stackable-cards text-center">
              <BottomDeckCard onCardClick={handleBottomCardClick} canClick={true} />
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

      {/* Pop-up Question */}
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
