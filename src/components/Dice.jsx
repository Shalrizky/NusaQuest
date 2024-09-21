import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import '../style/components/Dice.css';

function Dice({ onRollComplete }) {
    const [rolling, setRolling] = useState(false);
    const [diceNumber, setDiceNumber] = useState(1); // Initial dice face
    const diceRef = useRef(null);

    const rollDice = () => {
        const dice = diceRef.current;

        if (!dice) return;

        setRolling(true);

        // Generate a random number between 1 and 6
        const finalNumber = Math.ceil(Math.random() * 6);

        // Fixed rotations for each number
        const rotations = {
            1: { x: 0, y: 0 },          // Front face (1)
            2: { x: -90, y: 0 },        // Bottom face (2)
            3: { x: 0, y: -90 },        // Left face (3)
            4: { x: 0, y: 90 },         // Right face (4)
            5: { x: 90, y: 0 },         // Top face (5)
            6: { x: 180, y: 0 },        // Back face (6)
        };

        const { x, y } = rotations[finalNumber];

        // Additional random rotations for randomness
        const randomRotationX = Math.floor(Math.random() * 4) * 360;
        const randomRotationY = Math.floor(Math.random() * 4) * 360;

        // Use GSAP for dice rotation
        gsap.to(dice, {
            duration: 1,  // You can adjust the speed here if needed
            rotationX: randomRotationX + x, // Add extra rotations for randomness
            rotationY: randomRotationY + y,
            ease: "power2.out",
            onComplete: () => {
                setDiceNumber(finalNumber); // Set the rolled number after animation
                setRolling(false);
                onRollComplete(); // Trigger function passed from parent after roll completes
            }
        });
    };

    // Function to render dots based on the dice number
    const renderFace = (num) => {
        const dotCounts = {
            1: [[50, 50]], // Center
            2: [[30, 30], [70, 70]], // Diagonal corners
            3: [[30, 30], [50, 50], [70, 70]], // Diagonal corners + center
            4: [[30, 30], [30, 70], [70, 30], [70, 70]], // 4 corners
            5: [[30, 30], [30, 70], [50, 50], [70, 30], [70, 70]], // 4 corners + center
            6: [[30, 30], [30, 50], [30, 70], [70, 30], [70, 50], [70, 70]], // 2 vertical rows
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
                <div className="face front">{renderFace(1)}</div>  {/* Front - 1 */}
                <div className="face back">{renderFace(6)}</div>   {/* Back - 6 */}
                <div className="face left">{renderFace(3)}</div>   {/* Left - 3 */}
                <div className="face right">{renderFace(4)}</div>  {/* Right - 4 */}
                <div className="face top">{renderFace(5)}</div>    {/* Top - 5 */}
                <div className="face bottom">{renderFace(2)}</div> {/* Bottom - 2 */}
            </div>
            <button className="roll-button btn btn-primary mt-4" onClick={rollDice} disabled={rolling}>
                {rolling ? 'Rolling...' : 'Roll'}
            </button>
        </div>
    );
}

export default Dice;