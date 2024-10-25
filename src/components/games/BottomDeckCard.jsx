import React from 'react';
import { Card } from 'react-bootstrap';
import '../../style/components/games/BottomDeckCard.css';

const BottomDeckCard = ({ cards, onCardClick }) => {
  return (
    <div className="stackable-cards">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="bg-orange text-white card-custom"
          onClick={() => onCardClick(card, index)}
        >
          <Card.Body>
            <Card.Title className="card-title-custom">{`Kategori: ${card.category}`}</Card.Title>
            <Card.Text className="card-text-custom">
              {card.question}
            </Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default BottomDeckCard;
