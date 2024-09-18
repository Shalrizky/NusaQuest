import React from 'react';
import { Image } from 'react-bootstrap';
import framePlayer from '../assets/common/FramePlayer.png';
import EmptySlot from '../assets/common/EmptyPlayer.png';

function PlayerSlot({ player }) {
    return (
        <div className="player-slot-container">
            <Image 
                src={player ? framePlayer : EmptySlot} 
                alt={player ? `Player ${player.name}` : "Empty Slot"} 
                className="player-slot"
            />
            {player && (
                <div className="player-name">
                    {player.name}
                </div>
            )}
        </div>
    );
}

export default PlayerSlot;