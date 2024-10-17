import React, { useState, useEffect } from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';
import DeckPlayer from '../components/games/DeckPlayer';
import BottomDeckCard from '../components/games/BottomDeckCard';
import HeaderNuca from '../components/games/HeaderGame';
import PertanyaanNuca from '../components/games/PertanyaanNuca';
import backgroundImage from '../assets/common/background.png';
import shuffleIcon from '../assets/common/shuffle.png';
import '../style/routes/GameplayCard.css';
import playerProfile from '../assets/common/imageOne.png';

function GameplayCard() {
  const [isShuffling, setIsShuffling] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // Pop-up dimulai dengan tidak terlihat
  const [isExitingPopup, setIsExitingPopup] = useState(false); // State untuk efek hilang

  useEffect(() => {
    // Mengatur timer untuk menampilkan pop-up setelah 2 detik
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 2000); // Tunggu 2 detik

    return () => clearTimeout(timer); // Membersihkan timer saat komponen unmount
  }, []); // Efek ini hanya dijalankan sekali saat komponen dimuat

  const handleShuffle = () => {
    setTimeout(() => {
      setIsShuffling(true);
      setTimeout(() => {
        setIsShuffling(false);
      }, 2000); // Rotate for 2 seconds
    }, 500); // Delay of 0.5 seconds before starting rotation
  };

  const handleBottomCardClick = (index) => {
    console.log(`Bottom card ${index} clicked`);
    // Add your logic for handling bottom card clicks here
  };

  const handleAnswerSelect = (answer) => {
    console.log(`Selected answer: ${answer}`);
    
    // Mulai proses keluar pop-up
    setIsExitingPopup(true);

    // Tunggu animasi hilang selesai sebelum menyembunyikan pop-up
    setTimeout(() => {
      setShowPopup(false);
      setIsExitingPopup(false); // Reset state untuk pop-up berikutnya
      handleShuffle();
    }, 1000); // Sesuaikan dengan durasi animasi hilang
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

      <Container fluid className="gameplay-container" style={{ height: '100vh' }}>
          {/* Left Player Deck */}
          <Row className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Col xs="auto" className="d-flex flex-column justify-content-center align-items-center">
        <Image
          src="playerProfile.jpg" // Ganti dengan path gambar profil
          roundedCircle
          className="player-image mb-3 img-fluid"
          style={{ width: "100px", height: "100px" }}
        />
        <DeckPlayer position="left" cards={[1, 2, 3, 4, 5]} />
      </Col>
    </Row>


          {/* Center Column for Shuffle Icon and Deck Player */}
          <Col md="auto" className="text-center position-relative">
            
            {/* Shuffle Icon */}
            <div
              className="shuffle-icon-container"
              style={{
                position: 'absolute',
                top: '0', // Ensure it's at the top of the container
                left: '50%', // Center horizontally
                transform: 'translateX(-50%)', // Correct the centering (shift it back by 50% of its width)
              }}
            >
              <img
                src={shuffleIcon}
                alt="Shuffle"
                className="shuffle-icon"
                style={{ width: '40px', height: '40px' }}
              />
            </div>
            
            {/* Deck Player Center */}
            <DeckPlayer position="center" cards={[1, 2, 3, 4, 5]} />
          </Col>

          {/* Right Player Deck */}
          <Col xs={3} className="text-center">
            <DeckPlayer position="right" cards={[1, 2, 3, 4, 5]} />
            <Image
              src={playerProfile}
              roundedCircle
              className="player-image mt-3 img-fluid"
              style={{ width: "100px", height: "100px" }}
            />
          </Col>

        {/* Bottom Player Deck */}
        <div className="deck-wrapper bottom stackable-cards text-center">
          <BottomDeckCard onCardClick={handleBottomCardClick} canClick={true} />
          <Image
            src={playerProfile}
            roundedCircle
            className="player-image mt-3 img-fluid"
            style={{ width: "100px", height: "100px" }}
          />
        </div>
      </Container>

      {/* Pop-up Question */}
      {showPopup && (
        <PertanyaanNuca 
          onAnswerSelect={handleAnswerSelect} 
          isExiting={isExitingPopup} 
          isVisible={showPopup} // Mengatur visibilitas
        />
      )}
    </div>
  );
}

export default GameplayCard;
