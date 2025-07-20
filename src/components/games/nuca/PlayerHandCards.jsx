import React, { useState, memo, useCallback, useMemo } from "react";
import { Card } from "react-bootstrap";
import "../../../style/components/games/nuca/PlayerHandCards.css";

// Constants
const CARD_THROW_DELAY = 500;
const DISABLED_CLASS = "disabled-throwing";
const THROWING_CLASS = "throwing";

// Memoized individual card component
const PlayerCardItem = memo(
  ({
    card,
    index,
    totalCardsInStack,
    onCardClickedFromP1,
    isThrowingEnabled,
  }) => {
    const [isAnimatingCardOut, setIsAnimatingCardOut] = useState(false);

    // Memoized card styles
    const cardStyles = useMemo(
      () => ({
        "--index": index,
        "--total-cards": totalCardsInStack,
      }),
      [index, totalCardsInStack]
    );

    // Memoized CSS classes
    const cardClasses = useMemo(() => {
      const classes = [];
      if (isAnimatingCardOut) classes.push(THROWING_CLASS);
      if (!isThrowingEnabled) classes.push(DISABLED_CLASS);
      return classes.join(" ");
    }, [isAnimatingCardOut, isThrowingEnabled]);

    // Card click handler
    const handleCardClick = useCallback(() => {
      if (!isThrowingEnabled || isAnimatingCardOut) {
        console.log("Melempar kartu dinonaktifkan saat ini.");
        return;
      }

      setIsAnimatingCardOut(true);

      setTimeout(() => {
        onCardClickedFromP1(card, index);
        setIsAnimatingCardOut(false);
      }, CARD_THROW_DELAY);
    }, [
      isThrowingEnabled,
      isAnimatingCardOut,
      onCardClickedFromP1,
      card,
      index,
    ]);

    return (
      <Card
        style={cardStyles}
        onClick={handleCardClick}
        className={cardClasses}
      >
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Card.Text>{card.question_text}</Card.Text>
        </Card.Body>
      </Card>
    );
  }
);

PlayerCardItem.displayName = "PlayerCardItem";

// Main component
const PlayerHandCards = memo(({ cards, onCardClick, isThrowingEnabled }) => {
  const totalCards = cards.length;

  // Memoized container styles
  const containerStyles = useMemo(
    () => ({
      "--total-cards": totalCards,
    }),
    [totalCards]
  );

  // Memoized card list to prevent unnecessary re-renders
  const cardList = useMemo(
    () =>
      cards.map((card, index) => (
        <PlayerCardItem
          key={card.id}
          card={card}
          index={index}
          totalCardsInStack={totalCards}
          onCardClickedFromP1={onCardClick}
          isThrowingEnabled={isThrowingEnabled}
        />
      )),
    [cards, totalCards, onCardClick, isThrowingEnabled]
  );

  return (
    <div
      className="card-stack position-relative d-flex text-center justify-content-center align-items-center"
      style={containerStyles}
    >
      {cardList}
    </div>
  );
});

PlayerHandCards.displayName = "PlayerHandCards";

export default React.memo(PlayerHandCards);
