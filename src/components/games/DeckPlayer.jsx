import React from 'react';
import { Image } from 'react-bootstrap';
import backCard from '../../assets/common/backCard.png';
import '../../style/components/games/DeckPlayer.css';

const DeckPlayer = () => {
  // Render 5 back cards stacked horizontally to the right
  return (
    <div className="deck-player">
      {[...Array(5)].map((_, index) => (
        <Image
          key={index}
          src={backCard}
          alt="Back of card"
          className="stacked-card"
          style={{ right: `${index * 20}px` }} // Adjust the left position to stack cards horizontally
        />
      ))}
    </div>
  );
};

export default DeckPlayer;
