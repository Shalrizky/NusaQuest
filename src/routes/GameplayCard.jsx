import React, { useState, useEffect, useRef } from 'react';
import { Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import '../style/routes/GameplayCard.css';
import DeckPlayer from '../components/games/DeckPlayer';
import BottomDeckCard from '../components/games/BottomDeckCard';
import HeaderNuca from '../components/games/HeaderGame';
import PertanyaanNuca from '../components/games/PertanyaanNuca';
import backgroundImage from '../assets/common/background.png';
import playerProfile from '../assets/common/imageOne.png';
import shuffleIcon from '../assets/common/shuffle.png';
import checkIcon from '../assets/common/checklist.png';
import crossIcon from '../assets/common/cross.png';

// Mengambil pertanyaan acak dari file NucaQuestions
import { getRandomQuestion } from '../components/games/NucaQuestions'; 
import { getRandomQuestion as getWestJavaQuestion } from '../components/games/NucaQuestions';

function GameplayCard() {
  const [isShuffling, setIsShuffling] = useState(false); // Kontrol animasi shuffle
  const [showPopup, setShowPopup] = useState(false);
  const [isExitingPopup, setIsExitingPopup] = useState(false);
  const [activeCard, setActiveCard] = useState(null); // State untuk menyimpan kartu yang diklik
  const [cards, setCards] = useState([]); // State untuk kartu BottomDeckCard
  const [cardCount, setCardCount] = useState(4); 
  const [leftDeckCount, setLeftDeckCount] = useState(4);
  const [rightDeckCount, setRightDeckCount] = useState(4);
  const [topDeckCount, setTopDeckCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const [showPotion, setShowPotion] = useState(false);
  const [isPotionActive, setIsPotionActive] = useState(false);
  const [topDeckAnswer, setTopDeckAnswer] = useState(null);
  const [leftDeckAnswer, setLeftDeckAnswer] = useState(null);
  const [isLoadingTopDeck, setIsLoadingTopDeck] = useState(false);
  const [isLoadingLeftDeck, setIsLoadingLeftDeck] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const timerRef = useRef(null);

  // State untuk menyimpan pertanyaan acak
  useEffect(() => {
    const generateCards = () => {
      const newCards = Array.from({ length: cardCount }, () => getRandomQuestion());
      setCards(newCards);
    };
    generateCards();
  }, [cardCount]);

  // Fungsi untuk menangani saat kartu di BottomDeckCard diklik
  const handleBottomCardClick = (card, index) => {
    setActiveCard(card);  // Simpan data kartu yang diklik ke state activeCard
    setShowPopup(true);   // Tampilkan popup pertanyaan
    removeCardFromDeck(index); // Menghapus kartu yang dilempar dari dek
    setIsLoading('right'); // Set animasi loading hanya untuk deck kanan saat pertanyaan muncul
  };

  const removeCardFromDeck = (index) => {
    setCards((prevCards) => prevCards.filter((_, cardIndex) => cardIndex !== index));
  };

  const handleAnswerSelect = (isCorrect) => {
    setIsLoading(null);
    setIsCorrectAnswer(isCorrect); // Set jawaban benar atau salah

    setTimeout(() => {
      setIsCorrectAnswer(null); // Menghilangkan indikator checklist atau cross setelah selesai
      setIsShuffling(true); // Mengaktifkan animasi shuffle setelah indikator menghilang

      setTimeout(() => {
        setIsShuffling(false); // Menghentikan animasi shuffle setelah beberapa waktu
      }, 3000); // Durasi animasi shuffle setelah menghilangkan indikator
    }, 3000); // Mengatur durasi menjadi 3 detik

    if (!isCorrect) {
      setRightDeckCount((prevCount) => prevCount + 1);
    }
    clearTimeout(timerRef.current);
    setActiveCard(null); // Reset kartu aktif setelah menjawab
    setIsExitingPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsExitingPopup(false);
    }, 2000);
  };

  // Fungsi untuk menangani klik pada deck (Atas, Kanan, Kiri)
  const handleDeckCardClick = (deck) => {
    if (!showPopup) { // Pastikan tidak ada popup yang sedang ditampilkan
      switch (deck) {
        case 'top':
          if (topDeckCount > 0) {
            setTopDeckCount((prevCount) => prevCount - 1);
            setIsLoadingLeftDeck(true); // Set animasi loading untuk deck kiri ketika deck atas diklik
            setTimeout(() => {
              setIsLoadingLeftDeck(false);
              const randomAnswer = Math.random() < 0.5;
              setLeftDeckAnswer(randomAnswer);
              setTimeout(() => {
                setLeftDeckAnswer(null);
              }, 2000);
            }, 2000);
          }
          break;
        case 'left':
          if (leftDeckCount > 0) {
            setLeftDeckCount((prevCount) => prevCount - 1);
            const newQuestion = getWestJavaQuestion(); // Mendapatkan pertanyaan dari West Java Questions
            setActiveCard(newQuestion);  // Simpan data pertanyaan ke state activeCard
            setShowPopup(true);   // Tampilkan popup pertanyaan tanpa memindahkan kartu ke depan
          }
          break;
        case 'right':
          if (rightDeckCount > 0) {
            setRightDeckCount((prevCount) => prevCount - 1);
            setIsLoadingTopDeck(true); // Set animasi loading hanya untuk deck atas saat deck kanan diklik
            setTimeout(() => {
              setIsLoadingTopDeck(false);
              const randomAnswer = Math.random() < 0.2;
              setTopDeckAnswer(randomAnswer);
              setTimeout(() => {
                setTopDeckAnswer(null);
                setIsShuffling(true); // Mengaktifkan animasi shuffle setelah indikator menghilang
                setTimeout(() => {
                  setIsShuffling(false); // Menghentikan animasi shuffle setelah beberapa waktu
                }, 3000); // Durasi animasi shuffle setelah menghilangkan indikator
              }, 2000);
            }, 2000);
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="nuca-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <HeaderNuca layout="home" />

      <Container fluid className="h-100 text-center mt-5">
        <Row className="h-75 d-flex align-items-center justify-content-center position-relative">
          {/* Deck atas */}
          <Col xs={12} className="d-flex justify-content-center align-items-center position-absolute" style={{ top: '-100px', zIndex: '15', transform: 'scale(0.8)' }}>
            <div style={{ position: 'relative' }} onClick={() => handleDeckCardClick('top')}>
              {isLoadingTopDeck && (
                <div className="loading-spinner" style={{ position: 'absolute', top: '120px', left: '150%', transform: 'translate(-50%, -50%)', zIndex: '50' }}>
                  <Spinner animation="border" role="status" variant="light" style={{ width: '5rem', height: '5rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              )}
              <DeckPlayer cardCount={topDeckCount} />
              <Image
                src={playerProfile}
                roundedCircle
                className="player-image mt-3 img-fluid"
                style={{ width: "120px", height: "120px", position: 'absolute', right: '-140px', top: '50%', transform: 'translateY(-50%)', marginLeft: '20px', zIndex: '20' }}              
              />
              {topDeckAnswer !== null && (
                <div style={{ position: 'absolute', top: '50%', left: '150%', transform: 'translate(-50%, -50%)', zIndex: '20' }}>
                  <img 
                    src={topDeckAnswer ? checkIcon : crossIcon} 
                    alt={topDeckAnswer ? "Check Icon" : "Cross Icon"} 
                    style={{ width: '60px', height: '60px' }} 
                  />
                </div>
              )}
            </div>
          </Col>

          {/* Deck kiri */}
          <Col xs={4} className="d-flex justify-content-center align-items-center position-relative">
            <div className="deck-wrapper-left mt-5" style={{ transform: 'rotate(90deg) scale(0.8)', marginBottom: '-50px' }} onClick={() => handleDeckCardClick('left')}>
              <Image
                src={playerProfile}
                roundedCircle
                className="player-image mt-3 img-fluid"
                style={{ width: "120px", height: "120px", position: 'absolute', left: '-190px', top: '20%', transform: 'translateY(-50%)', marginBottom: '15px', rotate: '270deg' }}
              />
              <DeckPlayer cardCount={leftDeckCount} />
              {isLoadingLeftDeck && (
                <div className="loading-spinner" style={{ position: 'absolute', top: '125px', left: '-125%', transform: 'translate(-50%, -50%)' }}>
                  <Spinner animation="border" role="status" variant="light" style={{ width: '5rem', height: '5rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              )}
              {leftDeckAnswer !== null && (
                <div style={{ position: 'absolute', top: '120px', left: '-150%', transform: 'translateY(-50% )' }}>
                  <img 
                    src={leftDeckAnswer ? checkIcon : crossIcon} 
                    alt={leftDeckAnswer ? "Check Icon" : "Cross Icon"} 
                    style={{ width: '60px', height: '60px', transform: 'rotate(-90deg)' }} 
                  />
                </div>
              )}
            </div>
          </Col>

          {/* Deck tengah */}
          <Col xs={4} className="d-flex justify-content-center align-items-center position-relative">
            <div className="deck-wrapper-middle" style={{ transform: 'scale(0.6)', position: 'relative' }}>
              <DeckPlayer cardCount={5} />
              <img
                src={shuffleIcon}
                alt="Shuffle Icon"
                className={`shuffle-icon ${isShuffling ? 'rotating-once' : ''}`} // Menambahkan kelas jika sedang shuffling
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

          {/* Deck kanan */}
          <Col xs={4} className="d-flex justify-content-center align-items-center position-relative">
            <div className="deck-wrapper-right" style={{ transform: 'rotate(270deg) scale(0.8)' }} onClick={() => handleDeckCardClick('right')}>
              <DeckPlayer cardCount={rightDeckCount} />
            </div>
            <Image
                src={playerProfile}
                roundedCircle
                className="player-image mt-3 img-fluid"
                style={{ width: "100px", height: "100px", position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', marginBottom: '20px' }}
              />
            {isLoading === 'right' && (
                <div className="loading-spinner" style={{ position: 'absolute', top: '-90px', left: '50%', transform: 'translateX(-50%)' }}>
                  <Spinner animation="border" role="status" variant="light" style={{ width: '4rem', height: '4rem' }}>
                  </Spinner>
                </div>
              )}
            {isCorrectAnswer !== null && (
              <div style={{ position: 'absolute', top: '-70px', left: '50%', transform: 'translateX(-50%)' }}>
                <img 
                  src={isCorrectAnswer ? checkIcon : crossIcon} 
                  alt={isCorrectAnswer ? "Check Icon" : "Cross Icon"} 
                  style={{ position: 'absolute', width: '60px', height: '60px', top: '-20px', right: '0px', left: '-30px' }} 
                />
              </div>
            )}
          </Col>
        </Row>

        {/* Deck bawah */}
        <Row className="align-items-center text-center">
          <Col xs={12} className="d-flex justify-content-center">
            <div className="stackable-cards">
              {/* BottomDeckCard yang berisi kartu pertanyaan */}
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

      {/* Render Popup Pertanyaan dengan data pertanyaan yang dipilih */}
      {showPopup && activeCard && (
        <div style={{ position: 'relative', zIndex: '2200' }}>
          <PertanyaanNuca
            question={activeCard.question} // Ambil pertanyaan dari kartu yang diklik
            options={activeCard.options} // Ambil opsi dari kartu yang diklik
            correctAnswer={activeCard.correctAnswer} // Ambil jawaban benar dari kartu yang diklik
            onAnswerSelect={handleAnswerSelect} // Callback untuk saat jawaban dipilih
            isExiting={isExitingPopup}
          />
        </div>
      )}
    </div>
  );
}

export default GameplayCard;
