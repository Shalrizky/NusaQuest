import React, { useState, useRef } from "react";
import gsap from "gsap";
import "../../style/components/games/Dice.css";

function Dice({ onRollComplete, disabled }) {
    const [rolling, setRolling] = useState(false);
    const diceRef = useRef(null);

    const rollDice = () => {
        if (rolling) return;

        const dice = diceRef.current;
        if (!dice) return;

        setRolling(true);

        // Generate a random number between 1 and 6
        const finalNumber = Math.ceil(Math.random() * 6);

        // Fixed rotations for each dice face
        const rotations = {
            1: { x: 0, y: 0 },
            2: { x: -90, y: 0 },
            3: { x: 0, y: -90 },
            4: { x: 0, y: 90 },
            5: { x: 90, y: 0 },
            6: { x: 180, y: 0 },
        };

        const { x, y } = rotations[finalNumber];

        // Additional random rotation effect
        const randomRotationX = Math.floor(Math.random() * 4) * 360;
        const randomRotationY = Math.floor(Math.random() * 4) * 360;

        // Use GSAP to animate the dice rotation
        gsap.to(dice, {
            duration: 1,
            rotationX: randomRotationX + x,
            rotationY: randomRotationY + y,
            ease: "power2.out",
            onComplete: () => {
                setRolling(false);
                onRollComplete(finalNumber);
            },
        });
    };

    // Render dots for each dice face
    const renderFace = (num) => {
        const dotCounts = {
            1: [[50, 50]],
            2: [
                [30, 30],
                [70, 70],
            ],
            3: [
                [30, 30],
                [50, 50],
                [70, 70],
            ],
            4: [
                [30, 30],
                [30, 70],
                [70, 30],
                [70, 70],
            ],
            5: [
                [30, 30],
                [30, 70],
                [50, 50],
                [70, 30],
                [70, 70],
            ],
            6: [
                [30, 30],
                [30, 50],
                [30, 70],
                [70, 30],
                [70, 50],
                [70, 70],
            ],
        };

        return dotCounts[num].map((position, i) => (
            <div
                key={i}
                className="dot"
                style={{ top: `${position[0]}%`, left: `${position[1]}%` }}
            />
        ));
    };

    return (
        <div className="dice-container">
            <div className="dice" ref={diceRef}>
                {/* Define each face of the dice */}
                <div className="face front">{renderFace(1)}</div>
                <div className="face back">{renderFace(6)}</div>
                <div className="face left">{renderFace(4)}</div>
                <div className="face right">{renderFace(3)}</div>
                <div className="face top">{renderFace(2)}</div>
                <div className="face bottom">{renderFace(5)}</div>
            </div>
            <button
                className="roll-button btn btn-primary mt-4"
                onClick={rollDice}
                disabled={disabled || rolling}
            >
                {rolling ? "Rolling..." : "Roll"}
            </button>
        </div>
    );
}

export default Dice;