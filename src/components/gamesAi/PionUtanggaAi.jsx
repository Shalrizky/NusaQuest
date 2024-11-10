import React, { useEffect, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import gsap from "gsap";

function Pion({
  desiredIndex,
  cellSize,
  getPosition,
  image,
  index,
  onAnimationComplete,
  tanggaUp,
  snakesDown,
  isCorrect,
  isBot,
}) {
  const imageRef = useRef(null);
  const [positionIndex, setPositionIndex] = useState(desiredIndex);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!imageRef.current) return;

    const node = imageRef.current;

    if (positionIndex === desiredIndex || isAnimating.current) return;

    gsap.killTweensOf(node);
    isAnimating.current = true;

    const moveToIndex = (targetIndex) => {
      const targetPos = getPosition(targetIndex);

      gsap.to(node, {
        x: targetPos.x,
        y: targetPos.y,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          setPositionIndex(targetIndex);
          isAnimating.current = false;

          if (onAnimationComplete) {
            onAnimationComplete(index, targetIndex);
          }
        },
      });
    };

    // Logika khusus untuk bot
    if (isBot) {
      const diceRoll = Math.floor(Math.random() * 6) + 1; // Roll dadu acak untuk bot
      let newPosition = positionIndex + diceRoll;

      if (newPosition >= 99) {
        moveToIndex(99); // Jika bot mencapai atau melewati posisi 99
      } else if (tanggaUp[newPosition]) {
        moveToIndex(tanggaUp[newPosition]); // Jika mendarat di tangga
      } else if (snakesDown[newPosition]) {
        moveToIndex(snakesDown[newPosition]); // Jika mendarat di ular
      } else {
        moveToIndex(newPosition); // Bergerak sesuai hasil roll dadu
      }
    } else {
      // Logika untuk pemain manusia
      const steps = Math.abs(desiredIndex - positionIndex);
      const direction = desiredIndex > positionIndex ? 1 : -1;

      const animateStep = (step) => {
        if (step > steps) {
          setPositionIndex(desiredIndex);
          isAnimating.current = false;

          if (onAnimationComplete) {
            onAnimationComplete(index, desiredIndex);
          }
          return;
        }

        const intermediateIndex = positionIndex + step * direction;
        const targetPos = getPosition(intermediateIndex);

        // Efek animasi berjalan dengan lompatan kecil
        gsap.to(node, {
          y: targetPos.y - 20, // Efek lompatan
          duration: 0.2,
          onComplete: () => {
            gsap.to(node, {
              x: targetPos.x,
              y: targetPos.y,
              duration: 0.2,
              ease: "power2.out",
              onComplete: () => {
                setPositionIndex(intermediateIndex);
                animateStep(step + 1);
              },
            });
          },
        });
      };

      animateStep(1);
    }
  }, [desiredIndex, getPosition, index, onAnimationComplete, positionIndex, tanggaUp, isCorrect, snakesDown, isBot]);

  return (
    <KonvaImage
      ref={imageRef}
      x={getPosition(positionIndex).x}
      y={getPosition(positionIndex).y}
      width={cellSize - 10}
      height={cellSize - 10}
      image={image}
      draggable={false}
    />
  );
}

export default Pion;
