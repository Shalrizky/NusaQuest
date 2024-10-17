import React, { useState, useEffect } from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';
import '../style/routes/GameplayCard.css';
import DeckPlayer from '../components/games/DeckPlayer';
import BottomDeckCard from '../components/games/BottomDeckCard';
import HeaderNuca from '../components/games/HeaderGame';
import PertanyaanNuca from '../components/games/PertanyaanNuca';
import backgroundImage from '../assets/common/background.png';
import shuffleIcon from '../assets/common/shuffle.png';
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

      {/* Shuffle Icon */}
      <div className="shuffle-icon-container">
        <img
          src={shuffleIcon}
          alt="Shuffle"
          className={`shuffle-icon ${isShuffling ? 'rotating' : ''}`}
        />
      </div>

      <Container fluid className="h-100 text-center mt-2">
        <Row className="h-100">
        <Col xs={10} md={1} className="h-100"></Col>
          {/* Player's Deck (Left Side, Vertically Centered) */}
          <Col 
            xs={10} 
            md={2} 
            className="d-flex justify-content-center align-items-center"
            style={{ height: '100%' }} 
          >
            <div className="deck-wrapper-left text-center" style={{ transform: "rotate(90deg)", transformOrigin: "left center" }}>
              <DeckPlayer />
            </div>
          </Col>
        </Row>
      </Container>

      <Container fluid className="h-50 text-center mt-2">
        <Row className="h-50">
          {/* Dummy Col to occupy space on the left */}
          <Col xs={12} md={9} className="h-50"></Col>
          {/* Player's Deck (Right Side, Vertically Centered) */}
          <Col 
            xs={10} 
            md={1} 
            className="d-flex justify-content-center align-items-center" 
            style={{ height: '100%' }} 
          >
            <div className="deck-wrapper-left text-center" style={{ transform: "rotate(-90deg)", transformOrigin: "right center" }}>
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
