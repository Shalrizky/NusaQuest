import React, { useEffect, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import gsap from "gsap";

function Pion({ desiredIndex, cellSize, getPosition, image, index, onAnimationComplete, snakesAndLadders, isCorrect }) {
  const imageRef = useRef(null);
  const [positionIndex, setPositionIndex] = useState(desiredIndex);
  const isAnimating = useRef(false); // Track animasi

  useEffect(() => {
    if (!imageRef.current) return;

    const node = imageRef.current;
    const newPos = getPosition(desiredIndex);

    // Hanya jalankan animasi jika pion belum sampai di tujuan
    if (positionIndex === desiredIndex) return;

    // Jika pion sedang dianimasikan, jangan lakukan animasi baru
    if (isAnimating.current) return;

    isAnimating.current = true;

    // Jika ada tangga dan jawabannya benar, langsung menuju posisi tujuan tangga
    if (snakesAndLadders[positionIndex] && isCorrect) {
      const targetIndex = snakesAndLadders[positionIndex];
      const targetPos = getPosition(targetIndex);

      gsap.to(node, {
        x: targetPos.x,
        y: targetPos.y,
        duration: 1, // Durasi animasi slide langsung
        ease: "power2.inOut",
        onComplete: () => {
          setPositionIndex(targetIndex); // Set posisi ke posisi tujuan
          isAnimating.current = false;
          if (onAnimationComplete) {
            onAnimationComplete(index, targetIndex);
          }
        },
      });
    } else {
      // Jika tidak, lakukan animasi langkah demi langkah
      const steps = Math.abs(desiredIndex - positionIndex);
      const direction = desiredIndex > positionIndex ? 1 : -1;

      const animateStep = (step) => {
        if (step <= steps) {
          const intermediateIndex = positionIndex + step * direction;
          const targetPos = getPosition(intermediateIndex);

          // Loncat
          gsap.to(node, {
            y: targetPos.y - 20, // Naikkan pion
            duration: 0.1, // Percepat animasi
            onComplete: () => {
              gsap.to(node, {
                x: targetPos.x,
                y: targetPos.y, // Pindahkan ke posisi baru
                duration: 0.3, // Percepat animasi
                ease: "power1.out",
                onComplete: () => {
                  gsap.to(node, {
                    y: newPos.y, // Turunkan pion kembali
                    duration: 0.1,
                    onComplete: () => {
                      setPositionIndex(intermediateIndex); // Update posisi indeks
                      if (step < steps) {
                        animateStep(step + 1); // Panggil langkah berikutnya
                      } else {
                        // Set posisi akhir dan reset animasi
                        setPositionIndex(desiredIndex);
                        isAnimating.current = false;
                        if (onAnimationComplete) {
                          onAnimationComplete(index, desiredIndex);
                        }
                      }
                    },
                  });
                },
              });
            },
          });
        }
      };

      animateStep(1); // Mulai animasi dari langkah pertama
    }
  }, [desiredIndex, getPosition, index, onAnimationComplete, positionIndex, snakesAndLadders, isCorrect]);

  return (
    <KonvaImage
      ref={imageRef}
      x={getPosition(positionIndex).x} // Gunakan posisi indeks
      y={getPosition(positionIndex).y} // Gunakan posisi indeks
      width={cellSize - 10}
      height={cellSize - 10}
      image={image}
      draggable={false}
    />
  );
}

export default Pion;
