import { useState } from "react";
import { Card } from "react-bootstrap";
import "../../../style/components/games/nuca/PlayingStackCard.css";

function PlayingStackCard({ cards, onCardClick }) {
  const totalCards = cards.length;

  // Komponen internal untuk setiap kartu
  const CardItem = ({
    card,
    index,
    totalCardsInStack,
    onCardClickedFromP1,
  }) => {
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
        key={index}
        style={{
          "--index": index,
          "--total-cards": totalCardsInStack,
        }}
        onClick={handleClick}
        className={`${isAnimatingOut ? "throwing" : ""}`}
      >
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Card.Text>{card.question}</Card.Text>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div
      className="card-stack position-relative d-flex text-center justify-content-center align-items-center"
      style={{ "--total-cards": totalCards }} 
    >
      {cards.map((card, index) => (
        <CardItem
          key={index}
          card={card}
          index={index}
          totalCardsInStack={totalCards} 
          onCardClickedFromP1={onCardClick} 
        />
      ))}
    </div>
  );
}

export default PlayingStackCard;
