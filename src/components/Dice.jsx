import React, { useState, useRef } from "react";
import gsap from "gsap";
import "../style/components/Dice.css";

function Dice({ onRollComplete }) {
  const [rolling, setRolling] = useState(false);
  const diceRef = useRef(null);

  const rollDice = () => {
    const dice = diceRef.current;
  
    if (!dice) return;
  
    setRolling(true);
  
    // Always set finalNumber to 6 for testing
    const finalNumber = 5;
  
    // Rotasi tetap untuk angka 6
    const rotations = {
      1: { x: 0, y: 0 }, // Angka 1 di depan
      2: { x: -90, y: 0 }, // Angka 2 di bawah
      3: { x: 0, y: -90 }, // Angka 3 di kiri
      4: { x: 0, y: 90 }, // Angka 4 di kanan
      5: { x: 90, y: 0 }, // Angka 5 di atas
      6: { x: 180, y: 0 }, // Angka 6 di belakang
    };
  
    const { x, y } = rotations[finalNumber];
  
    // Rotasi tambahan untuk efek acak
    const randomRotationX = Math.floor(Math.random() * 4) * 360;
    const randomRotationY = Math.floor(Math.random() * 4) * 360;
  
    // Menggunakan GSAP untuk animasi rotasi dadu
    gsap.to(dice, {
      duration: 1,
      rotationX: randomRotationX + x,
      rotationY: randomRotationY + y,
      ease: "power2.out",
      onComplete: () => {
        setRolling(false);
        onRollComplete(finalNumber); // Kirim hasil lemparan ke komponen parent
      },
    });
  };

  // Menampilkan titik-titik dadu untuk setiap wajah
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
        {/* Tetapkan angka statis untuk setiap sisi */}
        <div className="face front">{renderFace(1)}</div> {/* Angka 1 */}
        <div className="face back">{renderFace(6)}</div> {/* Angka 6 */}
        <div className="face left">{renderFace(4)}</div> {/* Angka 3 */}
        <div className="face right">{renderFace(3)}</div> {/* Angka 4 */}
        <div className="face top">{renderFace(2)}</div> {/* Angka 5 */}
        <div className="face bottom">{renderFace(5)}</div> {/* Angka 2 */}
      </div>
      <button
        className="roll-button btn btn-primary mt-4"
        onClick={rollDice}
        disabled={rolling}
      >
        {rolling ? "Rolling..." : "Roll"}
      </button>
    </div>
  );
}

export default Dice;
