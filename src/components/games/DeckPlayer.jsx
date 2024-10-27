  import React from 'react';
  import { Image } from 'react-bootstrap';
  import backCard from '../../assets/common/backCard.png';
  import '../../style/components/games/DeckPlayer.css';

  const DeckPlayer = ({ count }) => {
    const stacks = Array(count).fill(0); // Buat tumpukan sesuai jumlah kartu
  
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
