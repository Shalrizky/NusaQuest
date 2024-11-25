import React from "react";
import { Image } from "react-bootstrap";
import defaultPlayerPhoto from "../../../assets/games/uTangga/narutoa.png"; // Default profile photo

// PlayerProfile Component
const PlayerProfile = ({
  photoURL = defaultPlayerPhoto,
  displayName = "Player",
  position,
  currentTurn,
  answeringPlayer,
  turnTimeRemaining,
  timeRemaining,
  feedbackIcon,
  onDeckCardClick,
  deckOrder, // Pass DECK_ORDER as a prop
}) => {
  // Helper function to determine player classes
  const determinePlayerClass = () => {
    let classes = "player-profile";

    if (position === currentTurn) {
      classes += " asking-player";
    }

    if (
      position === answeringPlayer ||
      (currentTurn && position === getNextPlayer(currentTurn, deckOrder))
    ) {
      classes += " answering-player";
    }

    return classes;
  };

  // Render Feedback Icon
  const renderFeedbackIcon = () => {
    if (!feedbackIcon?.show || feedbackIcon.position !== position) return null;

    return (
      <div className="feedback-icon-container">
        <img
          src={feedbackIcon.isCorrect ? feedbackIcon.correct : feedbackIcon.incorrect}
          alt={feedbackIcon.isCorrect ? "Correct" : "Incorrect"}
          className="feedback-icon-profile"
        />
      </div>
    );
  };

  // Helper function to get next player
  const getNextPlayer = (currentDeck, deckOrder) => {
    const currentIndex = deckOrder.indexOf(currentDeck);
    const nextIndex = (currentIndex + 1) % deckOrder.length;
    return deckOrder[nextIndex];
  };
  

  return (
    <div className="d-flex flex-column align-items-center position-relative">
      <div
        onClick={() => onDeckCardClick(position)}
        className="d-flex align-items-center position-relative"
      >
        {/* Timer Overlays */}
        {currentTurn === position && turnTimeRemaining !== null && (
          <div className="timer-overlay-above">{turnTimeRemaining}</div>
        )}
        {answeringPlayer === position && timeRemaining !== null && (
          <div className="timer-overlay">{timeRemaining}</div>
        )}

        {/* Player Photo */}
        <Image
          src={photoURL || defaultPlayerPhoto}
          alt={`Player ${position}`}
          style={{ width: "80px", height: "80px", borderRadius: "50%" }}
          className={determinePlayerClass()}
        />

        {/* Feedback Icon */}
        {renderFeedbackIcon()}
      </div>

      {/* Player Name */}
      <div className="player-name mt-2">{displayName}</div>
    </div>
  );
};

export default PlayerProfile;
