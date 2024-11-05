import React, { useEffect } from "react";
import victoryImage from "../../assets/games/victory.png";
import Achievement from "../../assets/games/achievement1.png";
import Achievement2 from "../../assets/games/achievement2.png";
import potionImage from "../../assets/games/potion.png";
import "../../style/components/games/victoryOverlay.css";

function VictoryOverlay({ winner, onClose }) {
  // Tutup overlay secara otomatis setelah 10 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); 
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="victory-overlay" onClick={onClose}>
      <div
        className="victory-content"
        onClick={(e) => e.stopPropagation()} 
      >
        <img src={victoryImage} alt="Victory Logo" className="victory-logo" />
        <h2>{winner} Wins!</h2>
        <p>Kamu mendapatkan:</p>
        <div className="rewards">
          <img src={Achievement} alt="achievement" className="Achievement1-logo" />
          <img src={Achievement2} alt="achievement2" className="Achievement2-logo" />
          <div className="potion-reward">
            <img src={potionImage} alt="potion" className="potion-logo" />
          </div>
        </div>
        <p>Sentuh dimana saja untuk keluar.</p>
        <p className="auto-redirect-info">Anda akan diarahkan keluar dalam waktu 10 detik...</p>
      </div>
    </div>
  );
}

export default VictoryOverlay;
