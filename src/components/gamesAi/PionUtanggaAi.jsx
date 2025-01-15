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
  isAnimating,
  animationType,
  startPosition,
  endPosition,
  pendingPosition,
}) {
  const imageRef = useRef(null);
  const [positionIndex, setPositionIndex] = useState(desiredIndex);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (!imageRef.current) return;
    
    const node = imageRef.current;
    const initialPos = getPosition(positionIndex);
    
    gsap.set(node, {
      x: initialPos.x,
      y: initialPos.y,
    });
  }, [getPosition, positionIndex]);

  useEffect(() => {
    if (!imageRef.current || isAnimatingRef.current) return;

    const node = imageRef.current;
    gsap.killTweensOf(node);

    const animateMovement = (start, end, type) => {
      isAnimatingRef.current = true;
      const startPos = getPosition(start);
      const endPos = getPosition(end);

      if (type === 'ladder') {
        // Animasi naik tangga
        gsap.to(node, {
          x: startPos.x,
          y: startPos.y - cellSize, // Naik dulu
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(node, {
              x: endPos.x,
              y: endPos.y,
              duration: 0.5,
              ease: "power2.inOut",
              onComplete: () => {
                setPositionIndex(end);
                isAnimatingRef.current = false;
                if (onAnimationComplete) onAnimationComplete(index, end);
              }
            });
          }
        });
      } else if (type === 'snake') {
        // Animasi turun ular
        const midX = (startPos.x + endPos.x) / 2;
        const controlY = startPos.y + cellSize * 2;

        gsap.to(node, {
          bezier: {
            type: "soft",
            values: [
              { x: startPos.x, y: startPos.y },
              { x: midX, y: controlY },
              { x: endPos.x, y: endPos.y }
            ]
          },
          duration: 0.8,
          ease: "power1.inOut",
          onComplete: () => {
            setPositionIndex(end);
            isAnimatingRef.current = false;
            if (onAnimationComplete) onAnimationComplete(index, end);
          }
        });
      } else {
        // Animasi normal (langkah demi langkah)
        const steps = Math.abs(end - start);
        const direction = end > start ? 1 : -1;
        
        const animateStep = (currentStep = 0) => {
          if (currentStep >= steps) {
            isAnimatingRef.current = false;
            if (onAnimationComplete) onAnimationComplete(index, end);
            return;
          }

          const currentIndex = start + (currentStep * direction);
          const nextIndex = currentIndex + direction;
          const currentPos = getPosition(currentIndex);
          const nextPos = getPosition(nextIndex);

          gsap.to(node, {
            y: currentPos.y - 20,
            duration: 0.15,
            onComplete: () => {
              gsap.to(node, {
                x: nextPos.x,
                y: nextPos.y,
                duration: 0.15,
                ease: "bounce.out",
                onComplete: () => {
                  setPositionIndex(nextIndex);
                  animateStep(currentStep + 1);
                }
              });
            }
          });
        };

        animateStep();
      }
    };

    if (animationType === 'ladder' && isCorrect && pendingPosition !== null) {
      animateMovement(positionIndex, pendingPosition, 'ladder');
    } else if (animationType === 'snake' && startPosition !== null && endPosition !== null) {
      animateMovement(startPosition, endPosition, 'snake');
    } else if (desiredIndex !== positionIndex) {
      animateMovement(positionIndex, desiredIndex, 'normal');
    }

  }, [
    desiredIndex,
    getPosition,
    cellSize,
    index,
    onAnimationComplete,
    positionIndex,
    isCorrect,
    isAnimating,
    animationType,
    startPosition,
    endPosition,
    pendingPosition
  ]);

  return (
    <KonvaImage
      ref={imageRef}
      width={cellSize - 10}
      height={cellSize - 10}
      image={image}
      draggable={false}
    />
  );
}

export default Pion;