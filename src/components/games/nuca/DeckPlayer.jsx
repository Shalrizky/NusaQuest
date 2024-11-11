import React from 'react';
import { Image } from 'react-bootstrap';
import backCard from '../../../assets/games/nuca/backCard.png';
import '../../../style/components/games/nuca/DeckPlayer.css';

const DeckPlayer = ({ count, isNew }) => {
  const stacks = Array(count).fill(0); // Buat tumpukan sesuai jumlah kartu

  return (
    <div className="deck-container">
      {stacks.map((_, index) => (
        <div
          key={index}
          className={`card-stack ${isNew && index === stacks.length - 1 ? 'new-card' : ''}`} // Menambahkan class untuk kartu baru
        >
          <Image src={backCard} alt="Back Card" />
        </div>
      ))}
    </div>
  );
};

export default DeckPlayer;
