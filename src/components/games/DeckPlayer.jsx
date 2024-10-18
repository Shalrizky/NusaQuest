import React from 'react';
import { Image } from 'react-bootstrap';
import backCard from '../../assets/common/backCard.png';
import '../../style/components/games/DeckPlayer.css';

const DeckPlayer = ({ cardCount }) => {
  return (
    <div className="deck-player">
      {[...Array(cardCount)].map((_, index) => (
        <Image
          key={index}
          src={backCard}
          alt="Back of card"
          className="stacked-card"
          style={{ right: `${index * 20}px` }} // Menumpuk kartu secara horizontal
        />
      ))}
    </div>
  );
};

export default DeckPlayer;
