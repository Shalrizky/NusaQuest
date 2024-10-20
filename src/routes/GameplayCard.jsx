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
import Potion from "../components/games/potion";
import checkIcon from '../assets/common/checklist.png';
import crossIcon from '../assets/common/cross.png';

function GameplayCard() {
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExitingPopup, setIsExitingPopup] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [cardCount, setCardCount] = useState(4); // New state for card count
  const [leftDeckCount, setLeftDeckCount] = useState(4);
  const [rightDeckCount, setRightDeckCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const [showPotion, setShowPotion] = useState(false);
  const [isPotionActive, setIsPotionActive] = useState(false);
  const [topDeckLoading, setTopDeckLoading] = useState(false);
  const [topDeckAnswer, setTopDeckAnswer] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const timerRef = useRef(null);

  useEffect(() => {
    if (currentPlayer === 2) {
      const timer = setTimeout(() => setShowPopup(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer]);

  useEffect(() => {
    if (showPopup) {
      setShowPotion(true);
    } else {
      setShowPotion(false);
    }
  }, [showPopup]);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
      handleTopDeckAction();
    }, 2000);
  };

  const handleTopDeckAction = () => {
    setTopDeckLoading(true);
    setTimeout(() => {
      setTopDeckLoading(false);
      const isCorrect = Math.random() < 0.5;
      setTopDeckAnswer(isCorrect);
      setTimeout(() => {
        setTopDeckAnswer(null);
        setCurrentPlayer((prevPlayer) => (prevPlayer === 4 ? 1 : prevPlayer + 1));
      }, 2000);
    }, 2000);
  };

  const handleBottomCardClick = (card) => {
    setActiveCard(card);
    setCardCount(prevCount => prevCount - 1); // Decrease card count
    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      handleRightDeckAnswer();
    }, 10000);
  };

  const handleRightDeckAnswer = () => {
    const isCorrect = Math.random() < 0.5;
    setIsCorrectAnswer(isCorrect);
    if (!isCorrect) {
      setRightDeckCount((prevCount) => prevCount + 1);
    }
    setActiveCard(null);
    clearTimeout(timerRef.current);
    setIsLoading(false);
    setTimeout(() => {
      setIsCorrectAnswer(null);
      handleShuffle();
    }, 2000);
  };

  const handleAnswerSelect = (isCorrect) => {
    if (!isCorrect) {
      setRightDeckCount((prevCount) => prevCount + 1);
    }
    clearTimeout(timerRef.current);
    setActiveCard(null);
    setIsExitingPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsExitingPopup(false);
      handleShuffle();
    }, 2000);
  };

  return (
    <div className="nuca-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <HeaderNuca layout="home" />

      <Container fluid className="h-100 text-center mt-5">
        <Row className="h-75 d-flex align-items-center justify-content-center position-relative">
          <Col xs={12} className="d-flex justify-content-center align-items-center position-absolute" style={{ top: '-100px', zIndex: '15', transform: 'scale(0.8)' }}>
            <div style={{ position: 'relative' }}>
              <DeckPlayer cardCount={5} />
              {topDeckLoading && (
                <div className="loading-spinner" style={{ position: 'absolute', top: '50%', right: '-40px', transform: 'translateY(-50%)' }}>
                  <div className="spinner"></div>
                </div>
              )}
              {topDeckAnswer !== null && (
                <div style={{ position: 'absolute', top: '50%', right: '-40px', transform: 'translateY(-50%)' }}>
                  <img 
                    src={topDeckAnswer ? checkIcon : crossIcon} 
                    alt={topDeckAnswer ? "Check Icon" : "Cross Icon"} 
                    style={{ width: '40px', height: '40px' }} 
                  />
                </div>
              )}
            </div>
          </Col>

          <Col xs={4} className="d-flex justify-content-center align-items-center">
            <div className="deck-wrapper-left mt-5" style={{ transform: 'rotate(90deg) scale(0.8)', marginBottom: '-50px' }}>
              <DeckPlayer cardCount={leftDeckCount} />
            </div>
          </Col>

          <Col xs={4} className="d-flex justify-content-center align-items-center position-relative">
            <div className="deck-wrapper-middle" style={{ transform: 'scale(0.6)', position: 'relative' }}>
              <DeckPlayer cardCount={5} />
              <img
                src={shuffleIcon}
                alt="Shuffle Icon"
                className={`shuffle-icon ${isShuffling ? 'rotating' : ''}`}
                style={{
                  width: '400px',
                  height: 'auto',
                  position: 'absolute',
                  bottom: '-100px',
                  left: '-170px',
                  zIndex: '10',
                }}
              />
              {activeCard && (
                <div className="moving-card animate">
                  <h3>{activeCard.category}</h3>
                  <p>{activeCard.question}</p>
                </div>
              )}
            </div>
          </Col>

          <Col xs={4} className="d-flex justify-content-center align-items-center position-relative">
            <div className="deck-wrapper-right" style={{ transform: 'rotate(270deg) scale(0.8)' }}>
              <DeckPlayer cardCount={rightDeckCount} />
            </div>
            <Image
                src={playerProfile}
                roundedCircle
                className="player-image mt-3 img-fluid"
                style={{ width: "100px", height: "100px", marginLeft: "20px" }}
              />
            {isLoading && (
              <div className="loading-spinner" style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)' }}>
                <div className="spinner"></div>
              </div>
            )}
            {isCorrectAnswer !== null && (
              <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', zIndex: '20' }}>
                <img 
                  src={isCorrectAnswer ? checkIcon : crossIcon} 
                  alt={isCorrectAnswer ? "Check Icon" : "Cross Icon"} 
                  style={{ width: '60px', height: '60px' }} 
                />
              </div>
            )}
          </Col>
        </Row>

        <Row className="align-items-center text-center">
          <Col xs={12} className="d-flex justify-content-center">
            <div className="stackable-cards">
              <BottomDeckCard cardCount={cardCount} onCardClick={handleBottomCardClick} />
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

      {showPotion && (
        <div style={{ position: 'absolute', bottom: '-50px', right: '30px', zIndex: '2300', pointerEvents: 'auto' }}>
          <Potion />
        </div>
      )}

      {isPotionActive && <Potion />}

      {showPopup && (
        <div style={{ position: 'relative', zIndex: '2200' }}>
          <PertanyaanNuca
            onAnswerSelect={handleAnswerSelect}
            isExiting={isExitingPopup}
            isVisible={showPopup}
          />
        </div>
      )}
    </div>
  );
}

export default GameplayCard;