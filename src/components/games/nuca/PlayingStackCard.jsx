import React, { useState, memo } from "react";
import { Card } from "react-bootstrap";
import "../../../style/components/games/nuca/PlayingStackCard.css";

// Memoisasi CardItem untuk mencegah re-render yang tidak perlu
const CardItem = memo(({ card, index, totalCardsInStack, onCardClickedFromP1 }) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClick = () => {
    if (isAnimatingOut) return;
    setIsAnimatingOut(true);
    setTimeout(() => {
      onCardClickedFromP1(card, index);
    }, 500);
  };

  return (
    <Card
      key={card.id} // Gunakan card.id sebagai key yang stabil
      style={{
        "--index": index,
        "--total-cards": totalCardsInStack,
      }}
      onClick={handleClick}
      className={`${isAnimatingOut ? "throwing" : ""}`}
    >
      <Card.Body className="d-flex justify-content-center align-items-center">
        <Card.Text>{card.question_text}</Card.Text>
      </Card.Body>
    </Card>
  );
});

// Set display name untuk debugging
CardItem.displayName = "CardItem";

// Memoisasi PlayingStackCard untuk mencegah re-render ketika props tidak berubah
const PlayingStackCard = memo(({ cards, onCardClick }) => {
  const totalCards = cards.length;

  return (
    <div
      className="card-stack position-relative d-flex text-center justify-content-center align-items-center"
      style={{ "--total-cards": totalCards }}
    >
      {cards.map((card, index) => (
        <CardItem
          key={card.id} // Gunakan card.id sebagai key yang stabil
          card={card}
          index={index}
          totalCardsInStack={totalCards}
          onCardClickedFromP1={onCardClick}
        />
      ))}
    </div>
  );
});

// Set display name untuk debugging
PlayingStackCard.displayName = "PlayingStackCard";

export default PlayingStackCard;