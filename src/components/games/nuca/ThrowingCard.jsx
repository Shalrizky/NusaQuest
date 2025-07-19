import React, { memo } from 'react';
import { Card } from 'react-bootstrap';
import '../../../style/components/games/nuca/ThrowingCard.css';

const ThrowingCard = memo(({ cardData }) => {
  // Early return if no card data
  if (!cardData) {
    return null;
  }

  return (
    <Card className="sent-card">
      <Card.Body className="d-flex justify-content-center align-items-center">
        <Card.Text>
          {cardData.question_text}
        </Card.Text>
      </Card.Body>
    </Card>
  );
});

ThrowingCard.displayName = "ThrowingCard";

export default ThrowingCard;