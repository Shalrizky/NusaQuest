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

    // Only animate if the pion has a different desired position and is not already animating
    if (positionIndex === desiredIndex || isAnimating.current) return;

    // Kill any previous animations before starting new ones
    gsap.killTweensOf(node);
    isAnimating.current = true;

    // Handle movement to desiredIndex
    const moveToIndex = (targetIndex) => {
      const targetPos = getPosition(targetIndex);

      // Slide animation to target position
      gsap.to(node, {
        x: targetPos.x,
        y: targetPos.y,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          setPositionIndex(targetIndex);
          isAnimating.current = false;

          // Trigger callback after animation completes
          if (onAnimationComplete) {
            onAnimationComplete(index, targetIndex);
          }
        },
      });
    };

    // Handle normal step-by-step movement to desiredIndex
    if (tanggaUp[positionIndex] && isCorrect) {
      // If it's a ladder and answer is correct, move directly up
      const targetIndex = tanggaUp[positionIndex];
      moveToIndex(targetIndex);
    } else if (snakesDown[positionIndex]) {
      // If it's a snake, slide down automatically
      const targetIndex = snakesDown[positionIndex];
      setTimeout(() => {
        moveToIndex(targetIndex);
      }); // Delay for snake slide effect
    } else {
      // Handle normal step-by-step movement (walking across board)
      const steps = Math.abs(desiredIndex - positionIndex);
      const direction = desiredIndex > positionIndex ? 1 : -1;

      const animateStep = (step) => {
        if (step > steps) {
          setPositionIndex(desiredIndex);
          isAnimating.current = false;

          // Trigger callback when reaching the final step
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
