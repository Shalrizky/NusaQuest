import React, { useState, useEffect, useRef } from 'react';
import { Col, Container, Row, Image } from 'react-bootstrap';
import '../style/routes/GameplayCard.css';
import DeckPlayer from '../components/games/DeckPlayer';
import BottomDeckCard from '../components/games/BottomDeckCard';
import HeaderNuca from '../components/games/HeaderGame';
import PertanyaanNuca, { ListPertanyaanNuca } from '../components/games/PertanyaanNuca';
import Potion from "../components/games/potion"; // Pastikan komponen Potion diimport
import shuffleIcon from '../assets/common/shuffle.png';
import PlayerOne from '../assets/common/imageOne.png';

const getRandomQuestion = () => {
  const randomCategory = ListPertanyaanNuca[Math.floor(Math.random() * ListPertanyaanNuca.length)];
  const randomQuestion = randomCategory.questions[Math.floor(Math.random() * randomCategory.questions.length)];
  return {
    category: randomCategory.category,
    question: randomQuestion.question,
    options: randomQuestion.options,
    correctAnswer: randomQuestion.correctAnswer,
  };
};

function GameplayCard() {
  const [deckCounts, setDeckCounts] = useState({
    top: 4,
    left: 4,
    right: 4,
  });

  const [lastActiveDeck, setLastActiveDeck] = useState(null);
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

  const handleDeckCardClick = (deck) => {
    if (deckCounts[deck] > 0) {
      setDeckCounts((prevCounts) => ({
        ...prevCounts,
        [deck]: prevCounts[deck] - 1,
      }));
      setLastActiveDeck(deck);
      const newQuestion = getRandomQuestion();
      setActiveCard(newQuestion);
      setShowPopup(true);
    }
  };

  const handleBottomCardClick = (card, index) => {
    console.log(card);
    setActiveCard(card);
    setShowPopup(true);
    setLastActiveDeck('bottom');
    removeCardFromDeck(index);
    setIsLoading('right');
  };

  const removeCardFromDeck = (index) => {
    setCards((prevCards) => prevCards.filter((_, cardIndex) => cardIndex !== index));
  };

  const incrementDeckCount = (deck) => {
    setDeckCounts((prevCounts) => ({
      ...prevCounts,
      [deck]: prevCounts[deck] + 1,
    }));
  };

  const addNewCardToDeck = () => {
    const newQuestion = getRandomQuestion();
    setCards((prevCards) => [
      ...prevCards,
      { ...newQuestion, isNew: true } // Tandai kartu baru
    ]);
  };

  const handleAnswerSelect = (isCorrect) => {
    setIsLoading(null);
    setIsCorrectAnswer(isCorrect);

    if (!isCorrect) {
      switch (lastActiveDeck) {
        case 'bottom':
          incrementDeckCount('right');
          break;
        case 'right':
          incrementDeckCount('top');
          break;
        case 'top':
          incrementDeckCount('left');
          break;
        case 'left':
          addNewCardToDeck(); // Tambah kartu baru dengan animasi
          break;
        default:
          break;
      }
    }

    setTimeout(() => {
      setIsCorrectAnswer(null);
      setIsShuffling(true);

      setTimeout(() => {
        setIsShuffling(false);
      }, 2000);
    }, 3000);

    clearTimeout(timerRef.current);
    setActiveCard(null);
    setIsExitingPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsExitingPopup(false);
    }, 2000);
  };

  return (
    <Container fluid className="nuca-container d-flex justify-content-around flex-column">
      <HeaderNuca layout="home" />

      <Row className="mb-5 ms-5 justify-content-center flex-grow-1 align-items-center">
        <Col md={1} xs={12} className="text-center ms-5">
          <div onClick={() => handleDeckCardClick('top')}>
            <DeckPlayer count={deckCounts.top} isNew={deckCounts.top === 0} /> {/* Tambahkan isNew */}
          </div>
        </Col>
      </Row>

      <Row className="mb-3 mt-1 justify-content-center flex-grow-1 align-items-center">
        <Col md={9} xs={12} className="d-flex justify-content-between align-items-start">
          {/* Deck Kiri dengan Gambar PlayerOne */}
          <div className="d-flex flex-column align-items-center mt-n4">
            <Image
              src={PlayerOne}
              alt="Player One"
              style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '50px' }}
            />
            <div className="deck-kiri-rotate" onClick={() => handleDeckCardClick('left')}>
              <DeckPlayer count={deckCounts.left} isNew={deckCounts.left === 0} style={{ transform: 'rotate(90deg)' }} /> {/* Tambahkan isNew */}
            </div>
          </div>

          {/* Deck Tengah dengan Shuffle Icon */}
          <div className="deck-tengah position-relative d-flex justify-content-center align-items-center">
            <DeckPlayer count={4} isNew={false} /> {/* Tidak ada animasi untuk deck tengah */}
            <div
              className={`position-absolute d-flex justify-content-center align-items-center ${isShuffling ? 'shuffle-rotate' : ''}`}
              style={{ width: '250px', height: '250px', zIndex: 1 }}
            >
              <Image
                src={shuffleIcon}
                alt="Shuffle Icon"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>

          {/* Deck Kanan dengan Gambar PlayerOne */}
          <div className="d-flex flex-column align-items-center mt-n4">
            <Image
              src={PlayerOne}
              alt="Player One"
              style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '50px' }}
            />
            <div className="deck-kanan-rotate" onClick={() => handleDeckCardClick('right')}>
              <DeckPlayer count={deckCounts.right} isNew={deckCounts.right === 0} /> {/* Tambahkan isNew */}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="align-items-center justify-content-center">
        {/* Bottom Deck Card */}
        <Col xs={"auto"} className="text-center ml-5 ms-5">
          <BottomDeckCard cards={cards} onCardClick={handleBottomCardClick} />
        </Col>

        {/* Player One Image di Samping Kanan */}
        <Col xs="auto" className="d-flex align-items-center p-3">
          <Image
            src={PlayerOne}
            alt="Player One"
            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
          />
        </Col>
      </Row>

      {showPopup && activeCard && (
        <div style={{ position: 'relative', zIndex: '2200' }}>
          <PertanyaanNuca
            question={activeCard.question}
            options={activeCard.options}
            correctAnswer={activeCard.correctAnswer}
            onAnswerSelect={handleAnswerSelect}
            isExiting={isExitingPopup}
          />
          <Potion style={{ zIndex: "5000" }} /> {/* Menambahkan komponen Potion di sini */}
        </div>
      )}
    </Container>
  );
}

export default GameplayCard;
