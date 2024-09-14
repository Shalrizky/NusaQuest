import React, { useState, useRef } from 'react';
import '../style/components/Dice.css';

function Dice() {
    const [rolling, setRolling] = useState(false);
    const [diceNumber, setDiceNumber] = useState(1);
    const diceRef = useRef(null);

    const rollDice = () => {
        const dice = diceRef.current;

        if (!dice) return;

        setRolling(true);
        dice.classList.add('rolling');

        // Hasilkan angka acak
        const finalNumber = Math.ceil(Math.random() * 6);


        setTimeout(() => {
            dice.classList.remove('rolling');
            const randomX = Math.floor(Math.random() * 4) * 90;
            const randomY = Math.floor(Math.random() * 4) * 90;
            dice.style.transform = `rotateX(${randomX}deg) rotateY(${randomY}deg)`;

            setDiceNumber(finalNumber);
            setRolling(false);
        }, 1000);
    };

    const renderFace = (num) => {
        const dots = [];
        const dotCounts = {
            1: [1],
            2: [1, 1],
            3: [1, 1, 1],
            4: [1, 1, 1, 1],
            5: [1, 1, 1, 1, 1],
            6: [1, 1, 1, 1, 1, 1]
        };
        const positions = {
            1: [[50, 50]],
            2: [[30, 30], [70, 70]],
            3: [[30, 30], [50, 50], [70, 70]],
            4: [[30, 30], [30, 70], [70, 30], [70, 70]],
            5: [[30, 30], [30, 70], [50, 50], [70, 30], [70, 70]],
            6: [[30, 30], [30, 50], [30, 70], [70, 30], [70, 50], [70, 70]]
        };
        dotCounts[num].forEach((_, i) => {
            dots.push(<div key={i} className="dot" style={{ top: `${positions[num][i][0]}%`, left: `${positions[num][i][1]}%` }} />);
        });
        return dots;
    };

    return (
        <div className="dice-container">
            <div
                className={`dice ${rolling ? 'rolling' : ''}`}
                ref={diceRef}
            >
                <div className="face front">{renderFace(diceNumber)}</div>
                <div className="face back">{renderFace(diceNumber)}</div>
                <div className="face left">{renderFace(diceNumber)}</div>
                <div className="face right">{renderFace(diceNumber)}</div>
                <div className="face top">{renderFace(diceNumber)}</div>
                <div className="face bottom">{renderFace(diceNumber)}</div>
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
