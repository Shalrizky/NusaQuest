import React, { useState, useEffect } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
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

      <Container fluid className="gameplay-container">
      {/* Deck Player Top (Center) */}
      <div className="deck-wrapper center stackable-cards">
        <DeckPlayer position="center" cards={[1, 2, 3, 4, 5]} />
      </div>

      {/* Left Player Deck */}
      <div className="deck-wrapper left stackable-cards">
        <Image src={playerProfile} roundedCircle className="player-image mb-3 img-fluid" style={{ width: "100px", height: "100px" }} />
        <DeckPlayer position="left" cards={[1, 2, 3, 4, 5]} />
      </div>

      {/* Right Player Deck */}
      <div className="deck-wrapper right stackable-cards">
        <DeckPlayer position="right" cards={[1, 2, 3, 4, 5]} />
        <Image src={playerProfile} roundedCircle className="player-image mt-3 img-fluid" style={{ width: "100px", height: "100px" }} />
      </div>

      {/* Bottom Player Deck */}
      <div className="deck-wrapper bottom stackable-cards">
        <BottomDeckCard onCardClick={handleBottomCardClick} canClick={true} />
        <Image src={playerProfile} roundedCircle className="player-image mt-3 img-fluid" style={{ width: "100px", height: "100px" }} />
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
