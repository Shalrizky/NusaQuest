import React, { useState, useRef } from 'react';
import '../style/components/Dice.css'; // Pastikan path CSS sesuai

function Dice() {
    const [rolling, setRolling] = useState(false);
    const diceRef = useRef(null); // Referensi ke elemen dadu

    const rollDice = () => {
        const dice = diceRef.current;

        if (!dice) return; // Pastikan elemen dadu ada

        setRolling(true);
        dice.classList.add('rolling');

        // Remove the class after the animation completes
        setTimeout(() => {
            dice.classList.remove('rolling');
            // Set the dice to a random rotation (simulate a random roll)
            const randomX = Math.floor(Math.random() * 4) * 90;
            const randomY = Math.floor(Math.random() * 4) * 90;
            dice.style.transform = `rotateX(${randomX}deg) rotateY(${randomY}deg)`;
            setRolling(false); // Stop rolling state
        }, 1000); // 1s is the duration of the animation
    };

    return (
        <div className="dice-container">
            <div 
                className={`dice ${rolling ? 'rolling' : ''}`} 
                ref={diceRef}
            >
                <div className="face front">1</div>
                <div className="face back">6</div>
                <div className="face left">3</div>
                <div className="face right">4</div>
                <div className="face top">5</div>
                <div className="face bottom">2</div>
            </div>
            <button 
                className="roll-button btn btn-primary" 
                onClick={rollDice} 
                disabled={rolling}
            >
                {rolling ? 'Rolling...' : 'Roll'}
            </button>
        </div>
    );
}

export default Dice;
