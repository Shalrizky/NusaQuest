import React from "react";
import { Image } from "react-bootstrap";
import DefaultProfileImage from "../../../assets/common/icon-profile.svg";
import "../../../style/components/games/nuca/PlayerProfileNuca.css";

const PlayerProfileNuca = ({ userProfile, position, totalCards }) => {
  const profileImage = userProfile?.image || DefaultProfileImage;
  const positionClass = `player-profile-${position}`;
  const cssVars = { "--total-player-cards": totalCards };

  return (
    <div className={`player-profile-container ${positionClass}`} style={cssVars}>
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