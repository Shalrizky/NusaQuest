import React, { useState, useEffect, useRef } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import '../style/routes/GameplayCard.css';
import DeckPlayer from '../components/games/DeckPlayer';
import BottomDeckCard from '../components/games/BottomDeckCard';
import HeaderNuca from '../components/games/HeaderGame';
import PertanyaanNuca, { ListPertanyaanNuca } from '../components/games/PertanyaanNuca'; 
import shuffleIcon from '../assets/common/shuffle.png';

const getRandomQuestion = () => {
  const randomCategory = ListPertanyaanNuca[Math.floor(Math.random() * ListPertanyaanNuca.length)];
  const randomQuestion = randomCategory.questions[Math.floor(Math.random() * randomCategory.questions.length)];
  return {
    question: randomQuestion.question,
    options: randomQuestion.options,
    correctAnswer: randomQuestion.correctAnswer
  };
};

function GameplayCard() {
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isExitingPopup, setIsExitingPopup] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const generateCards = () => {
      const newCards = Array.from({ length: 4 }, () => getRandomQuestion());
      setCards(newCards);
    };
    generateCards();
  }, []);

  const handleBottomCardClick = (card, index) => {
    setActiveCard(card);
    setShowPopup(true);
    removeCardFromDeck(index);
    setIsLoading('right');
  };

  const removeCardFromDeck = (index) => {
    setCards((prevCards) => prevCards.filter((_, cardIndex) => cardIndex !== index));
  };

  const handleAnswerSelect = (isCorrect) => {
    setIsLoading(null);
    setIsCorrectAnswer(isCorrect);
    
    setTimeout(() => {
      setIsCorrectAnswer(null);
      setIsShuffling(true);
      setTimeout(() => {
        setIsShuffling(false);
      }, 3000);
    }, 3000);

    clearTimeout(timerRef.current);
    setActiveCard(null);
    setIsExitingPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsExitingPopup(false);
    }, 2000);
  };

  const handleDeckCardClick = () => {
    const newQuestion = getRandomQuestion();
    setActiveCard(newQuestion);
    setShowPopup(true);
  };

  return (
    <Container fluid className="nuca-container d-flex justify-content-around flex-column">
      <HeaderNuca layout="home" />

      {/* Row Pertama */}
      <Row className="mb-5 justify-content-center flex-grow-1 align-items-center">
        <Col md={1} xs={12} className="text-center ml-5">
          <DeckPlayer />
        </Col>
      </Row>

      {/* Row Kedua */}
      <Row className="mb-5 justify-content-center flex-grow-1 align-items-center">
        <Col md={9} xs={12} className="d-flex justify-content-between">
          <div className='deck-kiri-rotate' onClick={handleDeckCardClick}>
            <DeckPlayer style={{ transform: 'rotate(90deg)' }} />
          </div>

          <div className='deck-tengah position-relative' onClick={handleDeckCardClick}>
            <DeckPlayer />
            <img
              src={shuffleIcon}
              alt="Shuffle Icon"
              className={`shuffle-icon ${isShuffling ? 'rotating-once' : ''}`}
            />
          </div>

          <div className='deck-kanan-rotate' onClick={handleDeckCardClick}>
            <DeckPlayer style={{ transform: 'rotate(270deg)' }} />
          </div>
        </Col>
      </Row>

      {/* Row Ketiga */}
      <Row className="justify-content-center flex-grow-1 align-items-center">
        <Col md={6} xs={12} className="text-center">
          <BottomDeckCard cards={cards} onCardClick={handleBottomCardClick} />
        </Col>
      </Row>

      {/* Render Popup Pertanyaan */}
      {showPopup && activeCard && (
        <div style={{ position: 'relative', zIndex: '2200' }}>
          <PertanyaanNuca
            question={activeCard.question}
            options={activeCard.options}
            correctAnswer={activeCard.correctAnswer}
            onAnswerSelect={handleAnswerSelect}
            isExiting={isExitingPopup}
          />
        </div>
      )}
    </Container>
  );
}

export default GameplayCard;
