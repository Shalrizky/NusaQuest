import React, { useEffect, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import gsap from "gsap";

function Pion({ desiredIndex, cellSize, getPosition, image, index, onAnimationComplete, snakesAndLadders, isCorrect }) {
  const imageRef = useRef(null);
  const [positionIndex, setPositionIndex] = useState(desiredIndex);
  const isAnimating = useRef(false); // Track animation status for this specific pion

  useEffect(() => {
    if (!imageRef.current) return;
  
    const node = imageRef.current;
    const newPos = getPosition(desiredIndex);
  
    // Only animate if the pion has a different desired position
    if (positionIndex === desiredIndex || isAnimating.current) return;
  
    // Kill any previous animations before starting new ones
    gsap.killTweensOf(node);
  
    isAnimating.current = true;
  
    // Check for both snakes and ladders
    if (snakesAndLadders[positionIndex] && isCorrect) {
      const targetIndex = snakesAndLadders[positionIndex];
      const targetPos = getPosition(targetIndex);
  
      gsap.to(node, {
        x: targetPos.x,
        y: targetPos.y,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          setPositionIndex(targetIndex);
          isAnimating.current = false;
          if (onAnimationComplete) {
            onAnimationComplete(index, targetIndex);
          }
        },
      });
    } else {
      // Standard movement step-by-step
      const steps = Math.abs(desiredIndex - positionIndex);
      const direction = desiredIndex > positionIndex ? 1 : -1;
  
      const animateStep = (step) => {
        if (step > steps) {
          // End of steps, update state and reset animation flag
          setPositionIndex(desiredIndex);
          isAnimating.current = false;
          if (onAnimationComplete) {
            onAnimationComplete(index, desiredIndex);
          }
          return;
        }
  
        const intermediateIndex = positionIndex + step * direction;
        const targetPos = getPosition(intermediateIndex);
  
        // Jump effect
        gsap.to(node, {
          y: targetPos.y - 20, // Lift pion
          duration: 0.1,
          onComplete: () => {
            gsap.to(node, {
              x: targetPos.x,
              y: targetPos.y, // Move to next cell
              duration: 0.3,
              ease: "power1.out",
              onComplete: () => {
                setPositionIndex(intermediateIndex); // Update current position
                animateStep(step + 1); // Proceed to next step
              },
            });
          },
        });
      };
  
      animateStep(1); // Start the step-wise animation
    }
  }, [desiredIndex, getPosition, index, onAnimationComplete, positionIndex, snakesAndLadders, isCorrect]);
  

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
