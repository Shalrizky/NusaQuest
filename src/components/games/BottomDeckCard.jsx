import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import '../../style/components/games/BottomDeckCard.css';
import { getRandomQuestion } from './NucaQuestions';

const BottomDeckCard = ({ cardCount, onCardClick }) => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const newCards = Array.from({ length: cardCount }, () => getRandomQuestion());
    setCards(newCards);
  }, [cardCount]);

  return (
    <div className="card-container">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="bg-orange text-white card-custom"
          onClick={() => onCardClick(card)}
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