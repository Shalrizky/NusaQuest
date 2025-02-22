import React from "react";
import { Card } from "react-bootstrap";
import "../../../style/components/games/nuca/PlayingStackCard.css";

const PlayingStackCard = ({ cards }) => {
  const totalCards = cards.length; 

  return (
    <div className="playing-stack-container position-relative text-center">
      <div className="card-stack position-relative d-flex text-center justify-content-center align-items-center" style={{ "--total-cards": totalCards }}>
        {cards.map((card, index) => (
          <Card
            key={index} 
            className="stacked-card"
            style={{ "--index": index }} 
          >
            <Card.Body className="d-flex justify-content-center align-items-center">
              <Card.Text>
                Q:  {card.question}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default PlayingStackCard;