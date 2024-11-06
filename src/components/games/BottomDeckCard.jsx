import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import '../../style/components/games/BottomDeckCard.css';

const BottomDeckCard = ({ cards, onCardClick, showPopup, isExitingPopup }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardExiting, setIsCardExiting] = useState(false);
  const [isInteractionDisabled, setIsInteractionDisabled] = useState(false);

  const handleCardClick = (card, index) => {
    if (isInteractionDisabled) return; // Prevent clicks if interactions are disabled
    
    setSelectedCard({ ...card, index });
    setIsInteractionDisabled(true); // Disable interactions after a card is selected
    
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
        setIsInteractionDisabled(false); // Re-enable interactions after animation completes
      }, 2000); // Match the popup exit duration
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