import React from "react";
import { Card } from "react-bootstrap";
import "../../../style/components/games/nuca/PlayingStackCard.css";

function PlayingStackCard({ cards, onCardClick, throwingCardIndex }) {
  const totalCards = cards.length;

  return (
    <div 
      className="card-stack position-relative d-flex text-center justify-content-center align-items-center" 
      style={{ "--total-cards": totalCards }}
    >
      {cards.map((card, index) => (
        <Card
          key={index} 
          style={{ "--index": index }} 
          onClick={() => onCardClick(index)} 
          className={`${throwingCardIndex === index ? "throwing" : ""} ${card.thrown ? "no-hover" : ""}`} thrown
        >
          <Card.Body className="d-flex justify-content-center align-items-center">
            <Card.Text>
              Q: {card.question}
            </Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default PlayingStackCard;