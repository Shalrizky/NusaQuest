import React from "react";
import { Image } from "react-bootstrap";
import "../../../style/components/games/uTangga/playerList.css";

function PlayerList({ players, currentPlayerIndex }) {
  return (
    <div className="player-list d-flex flex-wrap justify-content-center align-items-center my-3">
      {players.slice(0, 4).map((player, index) => (
        <div
          key={player.uid}
          className={`player-item ${currentPlayerIndex === index ? "active-player" : ""}`}
        >
          <Image
            src={player.photoURL || "path/to/placeholder.jpg"}
            roundedCircle
            width={60}
            height={60}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "path/to/placeholder.jpg";
            }}
          />
          <div className="player-name">{player.displayName}</div>
        </div>
      ))}
    </div>
  );
}

export default PlayerList;
