import React, { useState, useEffect } from "react";
import { Image } from "react-bootstrap";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import "../../../style/components/games/nuca/PlayerProfileNuca.css";

const PlayerProfileNuca = ({ userProfile, position, totalCards, radius = 30, timerDuration = 30 }) => {
  const profileImage = userProfile?.image || DefaultProfileImage;
  const positionClass = `player-profile-${position}`;
  const cssVars = { "--total-player-cards": totalCards };

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    if (!isTimerActive || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setIsTimerActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerActive]);

  const getStrokeColor = () => {
    const percentage = (timeLeft / timerDuration) * 100;
    if (percentage > 55) return "#06923E";
    if (percentage > 25) return "#FFC107";
    if (percentage > 0) return "#B22222";
    return "transparent";
  };

  const svgSize = (radius + 10) * 2;
  const center = svgSize / 2;
  const circleLength = 2 * Math.PI * radius;

  return (
    <div
      className={`player-profile-container ${positionClass}`}
      style={cssVars}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="profile-border-svg"
      >
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circleLength}
          strokeDashoffset={circleLength * (1 - timeLeft / timerDuration)}
          strokeLinecap="round"
        />
      </svg>

      <Image
        src={profileImage}
        roundedCircle
        className="user-profile-image"
        alt="User Profile"
      />
    </div>
  );
};

export default PlayerProfileNuca;