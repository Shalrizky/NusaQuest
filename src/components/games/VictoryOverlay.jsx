import React from "react";
import victoryImage from "../../assets/games/victory.png";
import Achievement from "../../assets/games/achievement1.png";
import Achievement2 from "../../assets/games/achievement2.png";
import potionImage from "../../assets/games/potion.png";
import "../../style/components/games/victoryOverlay.css";

function VictoryOverlay({ winner, onClose }) {
  return (
    <div className="victory-overlay" onClick={onClose}>
      <img src={victoryImage} alt="Victory Logo" className="victory-logo" />
      <h2>{winner} Wins!</h2>
      <p>Kamu mendapatkan:</p>
      <div className="rewards">
        <img src={Achievement} alt="achievement" className="Achievement1-logo" />
        <img src={Achievement2} alt="achievement2" className="Achievement2-logo" />
        <div className="potion-reward">
          <img src={potionImage} alt="potion" className="potion-logo" />
          {/* <span className="potion-count">+2</span> */}
        </div>
      </div>
      <p>Sentuh dimana saja untuk keluar.</p>
    </div>
  );
}

export default VictoryOverlay;