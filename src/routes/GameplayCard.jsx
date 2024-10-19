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
import potionImage from "../assets/games/Utangga/potion.png";

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
  const [activeCard, setActiveCard] = useState(null); // Kartu di kanan
  const [leftDeckCount, setLeftDeckCount] = useState(4); // Deck kiri
  const [rightDeckCount, setRightDeckCount] = useState(4); // Deck kanan
  const timerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 2000);
  };

  const handleBottomCardClick = (card) => {
    // Simpan kartu di kanan
    setActiveCard(card);

    // Hapus kartu dari deck bawah
    setCards((prevCards) => prevCards.filter((c) => c !== card));

    // Timer untuk menghilangkan kartu dari kanan setelah 10 detik
    timerRef.current = setTimeout(() => {
      handleRightDeckAnswer(); // Jalankan fungsi jawaban otomatis dari deck kanan
    }, 10000);
  };

  // Fungsi untuk menghasilkan jawaban dari deck kanan
  const handleRightDeckAnswer = () => {
    const isCorrect = Math.random() < 0.5; // 50% benar atau salah secara random

    if (!isCorrect) {
      console.log("Deck kanan menjawab salah, menambah kartu ke deck kanan.");
      setRightDeckCount((prevCount) => prevCount + 1); // Tambah kartu ke deck kanan jika salah
    } else {
      console.log("Deck kanan menjawab benar.");
    }

    // Bersihkan kartu aktif setelah jawaban
    setActiveCard(null);
    clearTimeout(timerRef.current); // Hentikan timer yang berjalan
  };

  const handleAnswerSelect = (isCorrect) => {
    if (!isCorrect) {
      console.log("Jawaban salah, tambah kartu ke deck lawan.");
      setRightDeckCount((prevCount) => prevCount + 1); // Tambah kartu ke deck kanan
    } else {
      console.log("Jawaban benar.");
    }
    clearTimeout(timerRef.current); // Hentikan timer
    setActiveCard(null); // Hapus kartu

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

      <Container fluid className="h-100 text-center mt-5">
        <Row className="h-75 d-flex align-items-center justify-content-center">
          <Col xs={4} className="d-flex justify-content-center align-items-center">
            <div
              className="deck-wrapper-left mt-5"
              style={{ transform: 'rotate(90deg)', marginBottom: '-50px' }}
            >
              <DeckPlayer cardCount={leftDeckCount} /> {/* Deck kiri */}
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
              <DeckPlayer cardCount={5} /> {/* Deck tengah */}
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
                  zIndex: '10'
                }}
              />

              {/* Moving card positioned to the right of shuffle icon */}
              {activeCard && (
                <div className={`moving-card animate`}>
                  <h3>{activeCard.title}</h3>
                  <p>{activeCard.text}</p>
                </div>
              )}
            </div>
          </Col>

          <Col xs={4} className="d-flex justify-content-center align-items-center position-relative">
            <div className="deck-wrapper-right" style={{ transform: 'rotate(270deg)' }}>
              <DeckPlayer cardCount={rightDeckCount} /> {/* Deck kanan */}
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
