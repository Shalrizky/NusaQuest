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
  return (
    <div
      className="stack-container position-relative d-flex justify-content-center align-items-center"
      style={{ "--total-cards": totalCards }}
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
        Array(totalCards).fill().map((_, index) => (
          <div
            key={index}
            className={`back-card-item ${position}`}
            style={{
              "--index": index,
              zIndex: totalCards - index,  
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