import React, { useEffect, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import gsap from "gsap";

function Pion({ desiredIndex, cellSize, getPosition, image, index, onAnimationComplete, tanggaUp, snakesDown, isCorrect }) {
  const imageRef = useRef(null);
  const [positionIndex, setPositionIndex] = useState(desiredIndex);
  const isAnimating = useRef(false); // Track animation status for this specific pion

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


    if (tanggaUp[positionIndex] && isCorrect) {

      const targetIndex = tanggaUp[positionIndex];
      moveToIndex(targetIndex);
    } else if (snakesDown[positionIndex]) {
      const targetIndex = snakesDown[positionIndex];
      setTimeout(() => {
        moveToIndex(targetIndex);
      });
    } else {
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

        // Intermediate step animation for walking effect
        gsap.to(node, {
          y: targetPos.y - 20, // Jump effect
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
  }, [desiredIndex, getPosition, index, onAnimationComplete, positionIndex, tanggaUp, isCorrect, snakesDown]);

  return (
    <KonvaImage
      ref={imageRef}
      x={getPosition(positionIndex).x} // Set position using current index
      y={getPosition(positionIndex).y} // Set position using current index
      width={cellSize - 10}
      height={cellSize - 10}
      image={image}
      draggable={false}
    />
  );
}

export default Pion;
