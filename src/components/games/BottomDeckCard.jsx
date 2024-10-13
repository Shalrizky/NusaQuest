import React from "react";
import { Image } from "react-bootstrap";
import deckCard from "../../assets/common/deckCard.png";
import "../../style/components/games/BottomDeckCard.css";

const BottomDeckCard = ({ onCardClick, canClick }) => {
  // Create an array of 5 elements to represent the stack
  const cardStack = Array(5).fill(null);

  return (
    <div className="bottom-card-deck">
      {cardStack.map((_, index) => (
        <Image
          key={index}
          src={deckCard}
          alt={`Kartu ${index + 1}`}
          className={`stacked-card stacked-card-${index}`}
          style={{
            cursor: canClick ? "pointer" : "default",
            '--card-index': index,
          }}
          onClick={() => canClick && onCardClick(index)}
        />
      ))}
    </div>
  );
};

export default BottomDeckCard;