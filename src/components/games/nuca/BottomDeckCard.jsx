// BottomDeckCard.js

import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import '../../../style/components/games/nuca/BottomDeckCard.css';

const BottomDeckCard = ({ cards, onCardClick, showPopup, isExitingPopup }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isInteractionDisabled, setIsInteractionDisabled] = useState(false);

  const handleCardClick = (card, index) => {
    if (isInteractionDisabled) return;

    console.log("Card clicked in BottomDeckCard:", { card, index });
    setSelectedCard(card);
    setIsInteractionDisabled(true);

    setTimeout(() => {
      onCardClick(card, index);
    }, 100);
  };

  useEffect(() => {
    if (isExitingPopup) {
      console.log("Popup is exiting. Resetting interactions.");
      setSelectedCard(null);
      setIsInteractionDisabled(false);
    }
  }, [isExitingPopup]);

  return (
    <div className={`stackable-cards ${isInteractionDisabled ? 'interaction-disabled' : ''}`}>
      {cards.map((card, index) => (
        <Card
          key={index}
          className={`bg-orange text-white card-custom ${card.isNew ? 'new-card' : ''} ${
            isInteractionDisabled ? 'disabled' : ''
          }`}
          onClick={() => handleCardClick(card, index)}
          style={{ pointerEvents: isInteractionDisabled ? 'none' : 'auto' }}
        >
          <Card.Body>
            <Card.Text className="card-text-custom">
              {card.question}
            </Card.Text>
          </Card.Body>
        </Card>
      ))}

      {/* Moving Card Element */}
      {selectedCard && (
        <div className={`moving-card ${showPopup ? 'animate' : ''}`}>
          <div className="card-content">
            {selectedCard.question}
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomDeckCard;
