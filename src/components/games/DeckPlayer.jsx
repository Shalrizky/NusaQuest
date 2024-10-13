import React, { useRef, useState } from 'react';
import { Image } from 'react-bootstrap';
import backCard from '../../assets/common/backCard.png';
import rightCard from '../../assets/common/rightCard.png';
import leftCard from '../../assets/common/leftCard.png';


const DeckPlayer = ({
  position,
  cards = [],
  isActive,
  timer,
  onBackCardClick,
  onShuffle,
  isShuffling,
  cardsToAdd,
  size
}) => {
  const [rotation, setRotation] = useState(0);
  const shuffleIconRef = useRef(null);

  const getDeckClass = () => {
    switch (position) {
      case 'left':
        return 'card-left-section';
      case 'right':
        return 'card-right-section';
      case 'center':
        return 'card-center-section';
      default:
        return '';
    }
  };

  const getCardClass = () => {
    switch (position) {
      case 'left':
        return 'left-card';
      case 'right':
        return 'right-card';
      case 'center':
        return 'back-card';
      default:
        return '';
    }
  };

  const getCardImage = () => {
    switch (position) {
      case 'left':
        return leftCard;
      case 'right':
        return rightCard;
      case 'center':
        return backCard;
      default:
        return '';
    }
  };

  const renderCards = () => {
    const cardImage = getCardImage();
    const maxCards = 5; // Maximum cards to show in a stack
    const cardsToRender = cards.length ? cards.slice(0, maxCards) : Array(maxCards).fill({}); // Generate empty card for placeholder
  
    // Tentukan ukuran kartu yang sama untuk semua posisi
    const cardSize = {
      width: '150px',  // Atur ukuran width yang sama
      height: 'auto'  // Atur ukuran height yang sama
    };
  
    return cardsToRender.map((card, index) => (
      <Image
        key={index}
        src={cardImage}
        alt={`${position} card ${index + 1}`}
        className={`${getCardClass()} ${getCardClass()}-${index}`}
        onClick={position === 'center' ? onBackCardClick : undefined}
        style={{
          position: 'absolute',
          left: position === 'center' ? `${index * (size === 'small' ? 13 : 20)}px` : undefined,
          top: position !== 'center' ? `${index * 15}px` : undefined,
          zIndex: maxCards - index,
          width: cardSize.width,  // Gunakan ukuran yang sama di semua posisi
          height: cardSize.height, // Gunakan ukuran yang sama di semua posisi
        }}
      />
    ));
  };

  const handleShuffle = () => {
    setRotation((prevRotation) => prevRotation + 360);
    if (onShuffle) {
      onShuffle();
    }
  };

  return (
    <div className={`player-deck ${getDeckClass()} ${size === 'small' ? 'small' : ''}`}>
      <div className={`card-${position}-stack ${size === 'small' ? 'small' : ''}`}>
        {renderCards()}
      </div>
      {position === 'bottom' && cardsToAdd > 0 && (
        <div className="cards-to-add">{cardsToAdd}</div>
      )}
    </div>
  );
};

export default DeckPlayer;