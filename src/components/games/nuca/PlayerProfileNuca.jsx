import React, { memo, useMemo } from "react";
import { Image } from "react-bootstrap";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import "../../../style/components/games/nuca/PlayerProfileNuca.css";

// Constants
const DEFAULT_RADIUS = 29;
const STROKE_WIDTH = 6;
const TIME_THRESHOLDS = {
  HIGH: 55,
  MEDIUM: 25,
  LOW: 0
};
const STROKE_COLORS = {
  HIGH: "#06923E",      // Green
  MEDIUM: "#FFC107",    // Yellow
  LOW: "#B22222",       // Red
  TRANSPARENT: "transparent"
};

const PlayerProfileNuca = memo(({
  userProfile = {},
  position,
  totalCards,
  radius = DEFAULT_RADIUS,
  isActive = false,
  timeLeft = 0,
  maxTime = 0
}) => {
  // Memoized profile image
  const profileImage = useMemo(() => 
    userProfile?.image || DefaultProfileImage, [userProfile?.image]);

  // Memoized CSS classes and custom properties
  const styling = useMemo(() => ({
    className: `player-profile-container player-profile-${position}`,
    customCssVars: { "--total-player-cards": totalCards }
  }), [position, totalCards]);

  // Memoized SVG calculations
  const svgCalculations = useMemo(() => {
    const svgDisplaySize = (radius * 2) + (STROKE_WIDTH * 2);
    const circleCenterCoordinate = svgDisplaySize / 2;
    const circleCircumference = 2 * Math.PI * radius;

    return {
      svgDisplaySize,
      circleCenterCoordinate,
      circleCircumference,
      viewBox: `0 0 ${svgDisplaySize} ${svgDisplaySize}`
    };
  }, [radius]);

  // Memoized timer calculations
  const timerData = useMemo(() => {
    if (maxTime === 0) {
      return {
        strokeDashoffset: svgCalculations.circleCircumference,
        strokeColor: STROKE_COLORS.TRANSPARENT
      };
    }

    const clampedTimeLeft = Math.max(0, Math.min(maxTime, timeLeft));
    const progressPercentage = clampedTimeLeft / maxTime;
    const timePercentage = progressPercentage * 100;
    
    // Determine stroke color based on time percentage
    let strokeColor = STROKE_COLORS.TRANSPARENT;
    if (timePercentage > TIME_THRESHOLDS.HIGH) {
      strokeColor = STROKE_COLORS.HIGH;
    } else if (timePercentage > TIME_THRESHOLDS.MEDIUM) {
      strokeColor = STROKE_COLORS.MEDIUM;
    } else if (timePercentage > TIME_THRESHOLDS.LOW) {
      strokeColor = STROKE_COLORS.LOW;
    }

    return {
      strokeDashoffset: svgCalculations.circleCircumference * (1 - progressPercentage),
      strokeColor
    };
  }, [timeLeft, maxTime, svgCalculations.circleCircumference]);

  // Memoized timer SVG element
  const timerSvg = useMemo(() => {
    if (!isActive) return null;

    return (
      <svg
        width={svgCalculations.svgDisplaySize}
        height={svgCalculations.svgDisplaySize}
        viewBox={svgCalculations.viewBox}
        className="profile-border-svg"
      >
        <circle
          cx={svgCalculations.circleCenterCoordinate}
          cy={svgCalculations.circleCenterCoordinate}
          r={radius}
          stroke={timerData.strokeColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={svgCalculations.circleCircumference}
          strokeDashoffset={timerData.strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
    );
  }, [isActive, svgCalculations, radius, timerData]);

  return (
    <div
      className={styling.className}
      style={styling.customCssVars}
    >
      {timerSvg}
      <Image
        src={profileImage}
        roundedCircle
        className="user-profile-image"
        alt="User Profile"
      />
    </div>
  );
});

export default PlayerProfileNuca;