import React, { useState, useEffect } from 'react';
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
      <HeaderNuca layout="home" />

      <Container fluid className="h-100 text-center mt-2">
        <Row className="h-75 d-flex align-items-center justify-content-center">
          {/* Deck Left */}
          <Col xs={4} className="d-flex justify-content-center align-items-center">
            <div className="deck-wrapper-left" style={{ transform: 'rotate(270deg)' }}>
              <DeckPlayer />
            </div>
          </Col>

          {/* Deck Center */}
          <Col xs={4} className="d-flex justify-content-center align-items-center position-relative">
            <div className="deck-wrapper-middle" style={{ transform: 'scale(0.6)', position: 'relative' }}>
              <DeckPlayer />
              <img
                src={shuffleIcon}
                alt="Shuffle Icon"
                className={`shuffle-icon ${isShuffling ? 'rotating' : ''}`}
                style={{ width: '350px', height: 'auto', position: 'absolute', bottom: '0px', right: '0px', left: '10px',  zIndex: '10' }}
              />
            </div>
          </Col>

          {/* Deck Right */}
          <Col xs={4} className="d-flex justify-content-center align-items-center">
            <div className="deck-wrapper-right" style={{ transform: 'rotate(270deg)' }}>
              <DeckPlayer />
            </div>
          </Col>
        </Row>
      </Container>

      <Container fluid className="h-25 text-center">
        <Row className="align-items-center">
          {/* Bottom Player Deck */}
          <Col xs={12} className="d-flex justify-content-center">
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