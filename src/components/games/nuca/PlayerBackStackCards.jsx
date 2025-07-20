import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { Image } from "react-bootstrap";
import BackCard from "../../../assets/games/nuca/backCard.png";
import ShuffleImage from "../../../assets/games/nuca/shuffle.png";
import "../../../style/components/games/nuca/PlayerBackStackCards.css";

// Constants
const ANIMATION_CLASS = "rotate-once";
const ANIMATION_EVENT = "animationend";

function PlayerBackStackCards({
  totalCards,
  position,
  showShuffle = false,
  showNotAvail = false,
  notAvailImage,
  triggerShuffleAnimation = false,
}) {
  const shuffleImageRef = useRef(null);

  // Memoized styles to prevent recreation
  const containerStyles = useMemo(
    () => ({
      "--total-cards": totalCards,
    }),
    [totalCards]
  );

  // Memoized animation end handler
  const animationEndHandler = useCallback(() => {
    if (shuffleImageRef.current) {
      shuffleImageRef.current.classList.remove(ANIMATION_CLASS);
      shuffleImageRef.current.removeEventListener(
        ANIMATION_EVENT,
        animationEndHandler
      );
    }
  }, []);

  // Animation effect
  useEffect(() => {
    if (triggerShuffleAnimation && shuffleImageRef.current) {
      console.log(
        "PlayerBackStackCards: triggerShuffleAnimation changed to",
        triggerShuffleAnimation
      );

      // Add animation class
      shuffleImageRef.current.classList.add(ANIMATION_CLASS);

      // Add event listener for animation completion
      shuffleImageRef.current.addEventListener(
        ANIMATION_EVENT,
        animationEndHandler
      );
    }
  }, [triggerShuffleAnimation, animationEndHandler]);

  // Memoized card stack generation
  const cardStack = useMemo(() => {
    if (showNotAvail) {
      return (
        <div className={`not-avail-card-item ${position}`}>
          <Image
            src={notAvailImage}
            alt="Player Not Available"
            className="not-avail-player"
          />
        </div>
      );
    }

    return Array.from({ length: totalCards }, (_, index) => (
      <div
        key={`card-${index}`}
        className={`back-card-item ${position}`}
        style={{
          "--index": index,
          zIndex: totalCards - index,
        }}
      >
        <Image src={BackCard} alt={`Back Card ${index + 1}`} />
      </div>
    ));
  }, [totalCards, position, showNotAvail, notAvailImage]);

  // Memoized shuffle image
  const shuffleElement = useMemo(() => {
    if (!showShuffle) return null;

    return (
      <div className="d-flex justify-content-center align-items-center">
        <Image
          ref={shuffleImageRef}
          src={ShuffleImage}
          alt="Shuffle"
          className="shuffle-image"
        />
      </div>
    );
  }, [showShuffle]);

  return (
    <div
      className="stack-container position-relative d-flex justify-content-center align-items-center"
      style={containerStyles}
    >
      {cardStack}
      {shuffleElement}
    </div>
  );
}

export default React.memo(PlayerBackStackCards);
