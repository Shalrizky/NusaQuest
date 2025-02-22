import React from "react";
import { Image } from "react-bootstrap";
import BackCard from "../../../assets/games/nuca/backCard.png";
import ShuffleImage from "../../../assets/games/nuca/shuffle.png";
import "../../../style/components/games/nuca/BackStackCard.css";

function BackStackCard({ totalCards, position, showShuffle }) {
  const cards = Array.from({ length: totalCards }, (_, index) => ({
    id: index,
  }));

  return (
    <div className="stack-container d-flex justify-content-center align-items-center position-relative" style={{ "--total-cards": totalCards }}>
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={`card-item ${position}`}
          style={{ "--index": index, zIndex: totalCards - index }}
        >
          <Image src={BackCard} alt="Back Card" />
        </div>
      ))}
      {showShuffle && (
        <div className="d-flex justify-content-center align-items-center">
          <Image
            src={ShuffleImage}
            alt="Shuffle"
            className="shuffle-image"
          />
        </div>
      )}
    </div>
  );
}

export default BackStackCard;
