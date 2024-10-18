// BottomDeckCard.js
import React from 'react';
import { Card } from 'react-bootstrap';
import '../../style/components/games/BottomDeckCard.css';

const BottomDeckCard = ({ cards, onCardClick }) => {
  return (
    <div className="card-container">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="bg-orange text-white card-custom"
          onClick={() => onCardClick(card)} // Kirim seluruh konten kartu
        >
          <Card.Body>
            <Card.Title className="card-title-custom">{`Q: ${card.title}`}</Card.Title>
            <Card.Text className="card-text-custom">
              {card.text}
            </Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default BottomDeckCard;
