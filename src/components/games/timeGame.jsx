import React, { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap"; // Make sure you have react-bootstrap installed
import "../../style/components/games/timerGame.css"

const TimeGame = ({ onTimeOut, currentPlayerIndex, timeLimit = 10, isTurnOver }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  
  useEffect(() => {
    // Reset the timer when the player changes
    setTimeLeft(timeLimit);
  }, [currentPlayerIndex, timeLimit]);
  
  useEffect(() => {
    if (timeLeft > 0 && !isTurnOver) {
      const timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer); // Clean up the timer on unmount or reset
    } else if (timeLeft === 0) {
      onTimeOut(); // Trigger when time runs out
    }
  }, [timeLeft, onTimeOut, isTurnOver]);

  const progress = (timeLeft / timeLimit) * 100; // Calculate progress percentage

  return (
    <div className="timer-box">
      <ProgressBar
        now={progress}
        label={`${timeLeft}s`}
        animated
        striped
        variant="danger"
      />
    </div>
  );
};

export default TimeGame;
