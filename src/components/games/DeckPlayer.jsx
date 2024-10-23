  import React from 'react';
  import { Image } from 'react-bootstrap';
  import backCard from '../../assets/common/backCard.png';
  import '../../style/components/games/DeckPlayer.css';

  const DeckPlayer = () => {
    const stacks = Array(4).fill(0); // Membuat 4 tumpukan

    return (
      <div className="deck-container">
        {stacks.map((_, index) => (
          <div key={index} className="card-stack">
            <Image src={backCard} alt="Back Card" />
          </div>
        ))}
      </div>
    );
  };

  export default DeckPlayer;
