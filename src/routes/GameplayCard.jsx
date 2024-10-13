import React, { useState } from 'react';
import DeckPlayer from '../components/games/DeckPlayer';
import BottomDeckCard from '../components/games/BottomDeckCard';
import HeaderNuca from '../components/games/HeaderGame';
import backgroundImage from '../assets/common/background.png';
import '../style/routes/GameplayCard.css';

function GameplayCard() {
  const [isShuffling, setIsShuffling] = useState(false);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
    }, 3000);
  };

  const handleBottomCardClick = (index) => {
    console.log(`Bottom card ${index} clicked`);
    // Add your logic for handling bottom card clicks here
  };

  return (
    <div className="nuca-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <HeaderNuca />
      <div className="gameplay-container">
        {/* Left Player Deck */}
        <div className="deck-wrapper left">
          <DeckPlayer
            position="left"
            cards={[]}
            onShuffle={handleShuffle}
            isShuffling={isShuffling}
          />
        </div>
        {/* Center Player Deck */}
        <div className="deck-wrapper center">
          <DeckPlayer
            position="center"
            cards={[]}
            onShuffle={handleShuffle}
            isShuffling={isShuffling}
          />
        </div>
        {/* Right Player Deck */}
        <div className="deck-wrapper right">
          <DeckPlayer
            position="right"
            cards={[]}
            onShuffle={handleShuffle}
            isShuffling={isShuffling}
          />
        </div>
        {/* Bottom Player Deck */}
        <div className="deck-wrapper bottom">
          <BottomDeckCard 
            onCardClick={handleBottomCardClick}
            canClick={true}
          />
        </div>
      </div>
    </div>
  );
}

export default GameplayCard;