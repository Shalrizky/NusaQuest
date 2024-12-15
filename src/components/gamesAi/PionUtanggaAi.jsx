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
}) {
  const imageRef = useRef(null);
  const [positionIndex, setPositionIndex] = useState(desiredIndex);
  const isAnimating = useRef(false);

  // Inisialisasi posisi awal pion menggunakan GSAP saat komponen di-mount
  useEffect(() => {
    if (!imageRef.current) return;
    
    const node = imageRef.current;
    const initialPos = getPosition(positionIndex);
    
    gsap.set(node, {
      x: initialPos.x,
      y: initialPos.y,
    });

    console.log(`Pion ${index} diinisialisasi di index ${positionIndex} (x: ${initialPos.x}, y: ${initialPos.y})`);
  }, [getPosition, positionIndex, index]);

  useEffect(() => {
    if (!imageRef.current) return;

    const node = imageRef.current;

    // Jangan lakukan apa-apa jika posisi sudah sesuai atau sedang animasi
    if (positionIndex === desiredIndex || isAnimating.current) return;

    // Hentikan animasi yang sedang berjalan
    gsap.killTweensOf(node);
    isAnimating.current = true;

    const moveToIndex = (targetIndex) => {
      const targetPos = getPosition(targetIndex);
      console.log(`Pion ${index} bergerak ke index ${targetIndex} dengan posisi x: ${targetPos.x}, y: ${targetPos.y}`);

      const isAscending = targetIndex > positionIndex;
      const isDescending = targetIndex < positionIndex;

      if (isAscending && isCorrect) { // Pastikan hanya naik tangga jika isCorrect
        // Animasi naik tangga
        gsap.to(node, {
          x: targetPos.x,
          y: targetPos.y,
          duration: 0.5,
          ease: "power1.out",
          onComplete: () => {
            setPositionIndex(targetIndex);
            console.log(`Pion ${index} telah naik tangga ke index ${targetIndex}`);
            isAnimating.current = false;
            if (onAnimationComplete) {
              onAnimationComplete(index, targetIndex);
            }
          },
        });
      } else if (isDescending) {
        // Animasi turun ular
        gsap.to(node, {
          x: targetPos.x,
          y: targetPos.y,
          duration: 0.5,
          ease: "power1.in", // Easing berbeda untuk efek penurunan yang lebih realistis
          onComplete: () => {
            setPositionIndex(targetIndex);
            console.log(`Pion ${index} telah turun dari ular ke index ${targetIndex}`);
            isAnimating.current = false;
            if (onAnimationComplete) {
              onAnimationComplete(index, targetIndex);
            }
          },
        });
      } else {
        // Animasi langkah demi langkah jika tidak menemui tangga atau ular
        const steps = Math.abs(desiredIndex - positionIndex);
        const direction = desiredIndex > positionIndex ? 1 : -1;

        const animateStep = (step) => {
          if (step > steps) {
            setPositionIndex(desiredIndex);
            console.log(`Pion ${index} telah mencapai index ${desiredIndex} secara normal`);
            isAnimating.current = false;
            if (onAnimationComplete) {
              onAnimationComplete(index, desiredIndex);
            }
            return;
          }

          const intermediateIndex = positionIndex + step * direction;
          const intermediatePos = getPosition(intermediateIndex);

          gsap.to(node, {
            y: intermediatePos.y - 20, // Efek melompat sedikit sebelum bergerak
            duration: 0.22,
            onComplete: () => {
              gsap.to(node, {
                x: intermediatePos.x,
                y: intermediatePos.y,
                duration: 0.15,
                ease: "power1.out",
                onComplete: () => {
                  setPositionIndex(intermediateIndex);
                  console.log(`Pion ${index} bergerak ke intermediate index ${intermediateIndex}`);
                  animateStep(step + 1);
                },
              });
            },
          });
        };

        animateStep(1);
      }
    };

    // Logika pergerakan
    if (tanggaUp[positionIndex] && isCorrect) {
      moveToIndex(tanggaUp[positionIndex]);
    } else if (snakesDown[positionIndex]) {
      moveToIndex(snakesDown[positionIndex]);
    } else {
      moveToIndex(desiredIndex);
    }
  }, [
    desiredIndex,
    getPosition,
    index,
    onAnimationComplete,
    positionIndex,
    tanggaUp,
    snakesDown,
    isCorrect,
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
