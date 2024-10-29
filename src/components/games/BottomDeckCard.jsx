import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import '../../style/components/games/BottomDeckCard.css';

const BottomDeckCard = ({ cards, onCardClick, showPopup, isExitingPopup }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardExiting, setIsCardExiting] = useState(false);
  
  const handleCardClick = (card, index) => {
    setSelectedCard({ ...card, index });
    setTimeout(() => {
      onCardClick(card, index);
    }, 100);
  };

  // Watch for popup closing to trigger card exit animation
  React.useEffect(() => {
    if (isExitingPopup) {
      setIsCardExiting(true);
      setTimeout(() => {
        setSelectedCard(null);
        setIsCardExiting(false);
      }, 2000); // Match the popup exit duration
    }
  }, [isExitingPopup]);

  return (
    <div className="stackable-cards">
      {cards.map((card, index) => (
        <Card
          key={index}
          className={`bg-orange text-white card-custom ${card.isNew ? 'new-card' : ''}`}
          onClick={() => handleCardClick(card, index)}
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
        <div className={`moving-card ${showPopup ? 'animate' : ''} ${isCardExiting ? 'exit' : ''}`}>
          <div className="card-content">
            {selectedCard.question}
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomDeckCard;
