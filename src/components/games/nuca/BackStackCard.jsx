import React from "react";
import { Image } from "react-bootstrap";
import BackCard from "../../../assets/games/nuca/backCard.png";
import ShuffleImage from "../../../assets/games/nuca/shuffle.png";
import "../../../style/components/games/nuca/BackStackCard.css";

function BackStackCard({
  totalCards,
  position,
  showShuffle,
  showNotAvail,
  notAvailImage,
}) {
  const cards = Array.from({ length: totalCards }, (_, index) => ({
    id: index,
  }));

  const thisTotalCards = cards.length;

  return (
    <div
      className="stack-container position-relative d-flex justify-content-center align-items-center text-center"
      style={{ "--total-cards": thisTotalCards }}
    >
      {showNotAvail ? (
        <div className={`not-avail-card-item ${position}`}>
          <Image
            src={notAvailImage}
            alt="Player Not Available"
            className="not-avail-player"
          />
        </div>
      ) : (
        cards.map((card, index) => (
          <div
            key={card.id}
            className={`back-card-item ${position}`}
            style={{
              "--index": index,
              zIndex: thisTotalCards - index,  
            }}
          >
            <Image src={BackCard} alt="Back Card" />
          </div>
        ))
      )}
      {showShuffle && (
        <div className="d-flex justify-content-center align-items-center">
          <Image src={ShuffleImage} alt="Shuffle" className="shuffle-image" />
        </div>
      )}
    </div>
  );
}

export default BackStackCard;
