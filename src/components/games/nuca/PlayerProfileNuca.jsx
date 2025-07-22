import { memo, useMemo, useState, useEffect } from "react";
import { Image } from "react-bootstrap";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import CheckIcon from "../../../assets/games/nuca/checklist.png";
import CrossIcon from "../../../assets/games/nuca/cross.png";
import "../../../style/components/games/nuca/PlayerProfileNuca.css";

// Constants 
const DEFAULT_RADIUS = 29;
const STROKE_WIDTH = 6;
const TIME_THRESHOLDS = {
  HIGH: 55,
  MEDIUM: 25,
  LOW: 0,
};
const STROKE_COLORS = {
  HIGH: "#06923E",
  MEDIUM: "#FFC107",
  LOW: "#B22222",
  TRANSPARENT: "transparent",
};

const PlayerProfileNuca = memo(
  ({
    userProfile = {},
    position,
    totalCards,
    radius = DEFAULT_RADIUS,
    isActive = false,
    timeLeft = 0,
    maxTime = 0,
    answerFeedback = null,
    currentTurnPhase = null,
    isCurrentPlayer = false,
    playerData = null, // ADDED: untuk mengakses data player
  }) => {
    // FIXED: Gunakan photoURL dari playerData jika tersedia
    const profileImage = useMemo(() => {
      if (playerData?.photoURL) {
        return playerData.photoURL;
      }
      if (playerData?.profileImageUrl) {
        return playerData.profileImageUrl;
      }
      return userProfile?.image || DefaultProfileImage;
    }, [userProfile?.image, playerData?.photoURL, playerData?.profileImageUrl]);

    // State untuk mengontrol jumlah titik (elipsis)
    const [dots, setDots] = useState("");

    const baseStatusText = useMemo(() => {
      if (!isActive) return null;

      // FIXED: Show status for all active players, not just current player
      return currentTurnPhase === "throwing" ? "Memilih" : "Menjawab";
    }, [isActive, currentTurnPhase]);

    // Effect untuk animasi titik berjalan
    useEffect(() => {
      let intervalId;
      if (baseStatusText) {
        setDots("");
        intervalId = setInterval(() => {
          setDots((prevDots) => {
            if (prevDots.length < 3) {
              return prevDots + ".";
            }
            return "";
          });
        }, 600);
      }

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [baseStatusText]);

    // Teks status akhir yang dianimasikan (dengan titik)
    const animatedStatusText = useMemo(() => {
      return baseStatusText ? `${baseStatusText}${dots}` : null;
    }, [baseStatusText, dots]);

    const feedbackIcon = useMemo(() => {
      if (!answerFeedback) return null;
      const iconSrc = answerFeedback === "correct" ? CheckIcon : CrossIcon;
      const iconAlt =
        answerFeedback === "correct" ? "Correct Answer" : "Incorrect Answer";
      return (
        <div className="answer-feedback-overlay">
          <Image
            src={iconSrc}
            alt={iconAlt}
            className={`feedback-icon feedback-${answerFeedback}`}
          />
        </div>
      );
    }, [answerFeedback]);

    // LOGIKA UNTUK MENENTUKAN KELAS POSISI TEKS STATUS
    const statusTextPositionClass = useMemo(() => {
      switch (position) {
        case "top-left":
           return "player-status-text-bottom";
        case "left":
          return "player-status-text-bottom";
        case "right":
        case "bottom-right":
        default:
          return "player-status-text-top";
      }
    }, [position]);

    // Memoized CSS classes dan custom properties
    const styling = useMemo(
      () => ({
        className: `player-profile-container player-profile-${position} ${statusTextPositionClass}`,
        customCssVars: { "--total-player-cards": totalCards },
      }),
      [position, totalCards, statusTextPositionClass] 
    );

    const svgCalculations = useMemo(() => {
      const svgDisplaySize = radius * 2 + STROKE_WIDTH * 2;
      const circleCenterCoordinate = svgDisplaySize / 2;
      const circleCircumference = 2 * Math.PI * radius;
      return {
        svgDisplaySize,
        circleCenterCoordinate,
        circleCircumference,
        viewBox: `0 0 ${svgDisplaySize} ${svgDisplaySize}`,
      };
    }, [radius]);

    const timerData = useMemo(() => {
      if (maxTime === 0) {
        return {
          strokeDashoffset: svgCalculations.circleCircumference,
          strokeColor: STROKE_COLORS.TRANSPARENT,
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
        strokeDashoffset:
          svgCalculations.circleCircumference * (1 - progressPercentage),
        strokeColor,
      };
    }, [timeLeft, maxTime, svgCalculations.circleCircumference]);

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
      <div className={styling.className} style={styling.customCssVars}>
        {/* Render animatedStatusText */}
        {animatedStatusText && (
          <div className="player-status-text">{animatedStatusText}</div>
        )}

        {timerSvg}
        <Image
          src={profileImage}
          roundedCircle
          className="user-profile-image"
          alt="User Profile"
          onError={(e) => {
            e.target.src = DefaultProfileImage;
          }}
        />
        {feedbackIcon}
      </div>
    );
  }
);

export default PlayerProfileNuca;