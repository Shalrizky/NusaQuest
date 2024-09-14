import React, { useState } from 'react';
import '../style/components/Dice.css'; // Ensure the CSS path is correct

function Dice() {
    const [rolling, setRolling] = useState(false);
    const [diceNumber, setDiceNumber] = useState(1);

    const rollDice = () => {
        setRolling(true);
        setTimeout(() => {
            setRolling(false);
            setDiceNumber(Math.ceil(Math.random() * 6)); // Generates a number between 1 and 6
        }, 1000); // Sync with the animation duration
    };

    return (
        <div className="dice-container">
            <div className={`dice dice-${diceNumber} ${rolling ? 'rolling' : ''}`}></div>
            <button className="roll-button btn btn-primary" onClick={rollDice}>Roll</button>
        </div>
    );
}

export default Dice;
