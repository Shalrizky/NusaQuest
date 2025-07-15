import React, { memo } from "react";
import { Image } from "react-bootstrap";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import "../../../style/components/games/nuca/PlayerProfileNuca.css";

// Memoisasi PlayerProfileNuca untuk mencegah re-render yang tidak perlu
const PlayerProfileNuca = memo(({ 
  userProfile, 
  position, 
  totalCards, 
  radius = 29, 
  isActive, 
  timeLeft, 
  maxTime 
}) => {
  const profileImage = userProfile?.image || DefaultProfileImage;
  const positionClass = `player-profile-${position}`;
  const cssVars = { "--total-player-cards": totalCards };

  // Perhitungan ukuran SVG dan pusat
  const strokeWidth = 6;
  const svgSize = (radius * 2) + (strokeWidth * 2);
  const center = svgSize / 2;
  const circleLength = 2 * Math.PI * radius;

  // Mendapatkan offset untuk animasi progress bar
  const getStrokeDashoffset = () => {
    if (maxTime === 0) return circleLength;
    const clampedTimeLeft = Math.max(0, Math.min(maxTime, timeLeft));
    const progress = clampedTimeLeft / maxTime;
    return circleLength * (1 - progress);
  };

  // Menentukan warna stroke berdasarkan persentase waktu
  const getStrokeColor = () => {
    if (maxTime === 0) return "transparent";
    const percentage = (timeLeft / maxTime) * 100;
    if (percentage > 55) return "#06923E";
    if (percentage > 25) return "#FFC107";
    if (percentage > 0) return "#B22222";
    return "transparent";
  };

  return (
    <div
      className={`player-profile-container ${positionClass}`}
      style={cssVars}
    >
      {/* Tampilkan SVG timer HANYA jika ini giliran pemain aktif */}
      {isActive && (
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="profile-border-svg"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circleLength}
            strokeDashoffset={getStrokeDashoffset()}
            strokeLinecap="round"
          />
        </svg>
      )}

      <Image
        src={profileImage}
        roundedCircle
        className="user-profile-image"
        alt="User Profile"
      />
    </div>
  );
});

// Set display name untuk debugging
PlayerProfileNuca.displayName = "PlayerProfileNuca";

export default PlayerProfileNuca;