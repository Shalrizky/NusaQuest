import React, { useEffect } from "react";
import defeatImage from "../../assets/games/defeat.png";
import "../../style/components/games/loseOverlay.css";

function LoseOverlay({ loser, onClose }) {
  // Tutup overlay secara otomatis setelah 10 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="lose-overlay" onClick={onClose}>
      <div className="lose-content" onClick={(e) => e.stopPropagation()}>
        <img src={defeatImage} alt="Defeat Logo" className="lose-logo" />
        <h2>{loser} Defeat!</h2>
        <p>Semangat, semoga beruntug di lain waktu</p>
        <p>Sentuh di mana saja untuk keluar /</p>
        <p className="auto-redirect-info">
          Anda akan diarahkan keluar dalam waktu 10 detik...
        </p>
      </div>
    </div>
  );
}

export default LoseOverlay;
