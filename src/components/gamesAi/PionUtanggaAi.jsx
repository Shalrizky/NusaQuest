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
  
    gsap.killTweensOf(node); // Pastikan animasi sebelumnya dihentikan
    isAnimating.current = true;
  
    // Fungsi untuk memindahkan pion ke indeks target
    const moveToIndex = (targetIndex) => {
      const targetPos = getPosition(targetIndex);
  
      gsap.to(node, {
        x: targetPos.x,
        y: targetPos.y,
        duration: 0.3, // Durasi setiap langkah animasi
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
  
    // Animasi langkah demi langkah
    const steps = Math.abs(desiredIndex - positionIndex);
    const direction = desiredIndex > positionIndex ? 1 : -1;
  
    const animateStep = (step) => {
      if (step > steps) {
        // Jika semua langkah selesai
        setPositionIndex(desiredIndex);
        isAnimating.current = false;
  
        if (onAnimationComplete) {
          onAnimationComplete(index, desiredIndex);
        }
        return;
      }
  
      const intermediateIndex = positionIndex + step * direction; // Tentukan indeks sementara
      const targetPos = getPosition(intermediateIndex);
  
      // Efek animasi lompatan kecil
      gsap.to(node, {
        y: targetPos.y - 20, // Lompatan ke atas
        duration: 0.2,
        ease: "power1.in",
        onComplete: () => {
          gsap.to(node, {
            x: targetPos.x,
            y: targetPos.y, // Kembali ke posisi target
            duration: 0.2,
            ease: "power1.out",
            onComplete: () => {
              setPositionIndex(intermediateIndex); // Perbarui posisi setelah setiap langkah
              animateStep(step + 1); // Panggil langkah berikutnya
            },
          });
        },
      });
    };
  
    // Mulai animasi langkah pertama
    animateStep(1);
  }, [desiredIndex, getPosition, index, onAnimationComplete, positionIndex]);
  

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
