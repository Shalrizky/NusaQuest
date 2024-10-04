import React, { useEffect, useState, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage } from "react-konva";
import Pion from "./PionUTangga"; // Pastikan path impor benar

// Import semua gambar yang diperlukan
import pionImageSrc from "../../assets/games/Utangga/Pions 1.png";
import pion2ImageSrc from "../../assets/games/Utangga/Pions 2.png";
import pion3ImageSrc from "../../assets/games/Utangga/Pions 3.png";
import pion4ImageSrc from "../../assets/games/Utangga/Pions 4.png";
import snakeImageSrc from "../../assets/games/Utangga/Uler-tangga1.png";
import snake2ImageSrc from "../../assets/games/Utangga/uler-tangga2.png";
import snake3ImageSrc from "../../assets/games/Utangga/uler-tangga3.png";
import snake4ImageSrc from "../../assets/games/Utangga/uler-tangga4.png";
import snake5ImageSrc from "../../assets/games/Utangga/uler-tangga5.png";
import snake6ImageSrc from "../../assets/games/Utangga/uler-tangga6.png";
import snake7ImageSrc from "../../assets/games/Utangga/uler-tangga7.png";
import snake8ImageSrc from "../../assets/games/Utangga/uler-tangga8.png";
import tanggaImageSrc from "../../assets/games/Utangga/tangga1.png";
import tangga2ImageSrc from "../../assets/games/Utangga/tangga2.png";
import tangga3ImageSrc from "../../assets/games/Utangga/tangga3.png";
import tangga4ImageSrc from "../../assets/games/Utangga/tangga4.png";
import tangga5ImageSrc from "../../assets/games/Utangga/tangga5.png";
import tangga6ImageSrc from "../../assets/games/Utangga/tangga6.png";
import tangga7ImageSrc from "../../assets/games/Utangga/tangga7.png";
import tangga8ImageSrc from "../../assets/games/Utangga/tangga8.png";
import tangga9ImageSrc from "../../assets/games/Utangga/tangga9.png";

function Board({
  pionPositionIndex = [0, 0, 0, 0],
  setPionPositionIndex,
  snakesAndLadders,
  waitingForAnswer,
  currentPlayerIndex,
  tanggaUp,
  snakesDown,
  isCorrect,
  setIsCorrect,
}) {
  const numRowsCols = 10;
  const [stageSize, setStageSize] = useState({ width: 900, height: 900 });
  const [cellSize, setCellSize] = useState(80);

  // Asset Ular dan Tangga
  const [snakeImages, setSnakeImages] = useState([]);
  const [tanggaImages, setTanggaImages] = useState([]);

  // Asset Pion
  const [pionImages, setPionImages] = useState([]);

  const stageRef = useRef();

  // Responsive resizing logic
  useEffect(() => {
    const updateSize = () => {
      if (stageRef.current) {
        const containerWidth = stageRef.current.parentElement.offsetWidth;
        const containerHeight = stageRef.current.parentElement.offsetHeight;
        const newStageSize = Math.min(containerWidth, containerHeight);
        setStageSize({ width: newStageSize, height: newStageSize });
        const newCellSize = newStageSize / numRowsCols;
        setCellSize(newCellSize);
      }
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Draw the board grid
  const drawBoard = () => {
    let squares = [];
    let number = 1;
    for (let i = numRowsCols - 1; i >= 0; i--) {
      let startCol = 0;
      let endCol = numRowsCols - 1;
      let direction = 1;

      if ((numRowsCols - 1 - i) % 2 !== 0) {
        startCol = numRowsCols - 1;
        endCol = 0;
        direction = -1;
      }

      for (
        let j = startCol;
        direction === 1 ? j <= endCol : j >= endCol;
        j += direction
      ) {
        let color = (i + j) % 2 === 0 ? "#FD9502" : "#CDCDAB";
        squares.push(
          <Rect
            key={`${i}-${j}`}
            x={j * cellSize}
            y={i * cellSize}
            width={cellSize}
            height={cellSize}
            fill={color}
          />
        );
        squares.push(
          <Text
            key={`text-${i}-${j}`}
            x={j * cellSize + cellSize / 2}
            y={i * cellSize + cellSize / 2}
            text={number}
            fontSize={Math.max(cellSize / 5, 10)}
            fill="black"
            align="center"
            verticalAlign="middle"
            offsetX={cellSize / 2}
            offsetY={cellSize / 2}
          />
        );
        number++;
      }
    }
    return squares;
  };

  // Load all snake and tangga images
  useEffect(() => {
    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => resolve(img);
      });

    const loadAllImages = async () => {
      const snakeSrcs = [
        snakeImageSrc,
        snake2ImageSrc,
        snake3ImageSrc,
        snake4ImageSrc,
        snake5ImageSrc,
        snake6ImageSrc,
        snake7ImageSrc,
        snake8ImageSrc,
      ];
      const tanggaSrcs = [
        tanggaImageSrc,
        tangga2ImageSrc,
        tangga3ImageSrc,
        tangga4ImageSrc,
        tangga5ImageSrc,
        tangga6ImageSrc,
        tangga7ImageSrc,
        tangga8ImageSrc,
        tangga9ImageSrc,
      ];
      const pionSrcs = [
        pionImageSrc,
        pion2ImageSrc,
        pion3ImageSrc,
        pion4ImageSrc,
      ];

      const loadedSnakes = await Promise.all(snakeSrcs.map(loadImage));
      const loadedTanggas = await Promise.all(tanggaSrcs.map(loadImage));
      const loadedPions = await Promise.all(pionSrcs.map(loadImage));

      console.log("Snakes loaded:", loadedSnakes.length);
      console.log("Tanggas loaded:", loadedTanggas.length);
      console.log("Pions loaded:", loadedPions.length);

      setSnakeImages(loadedSnakes);
      setTanggaImages(loadedTanggas);
      setPionImages(loadedPions);
    };

    loadAllImages();
  }, []);

  // Calculate pion position based on index (0-based)
  const getPosition = useCallback(
    (index) => {
      const row = Math.floor(index / numRowsCols);
      let col;
      if (row % 2 === 0) {
        col = index % numRowsCols;
      } else {
        col = numRowsCols - 1 - (index % numRowsCols);
      }
      const x = col * cellSize;
      const y = (numRowsCols - 1 - row) * cellSize;
      return { x, y };
    },
    [numRowsCols, cellSize]
  );

  return (
    <div style={{ width: "100%", height: "100%" }} ref={stageRef}>
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          {drawBoard()}

          {/* Tambahkan gambar ular */}
          {snakeImages.map((img, index) => {
            if (!img) return null;
            // Atur posisi dan ukuran sesuai kebutuhan
            const positions = [
              {
                x: 1 * cellSize,
                y: 6 * cellSize,
                width: 2 * cellSize,
                height: 4 * cellSize,
              },
              {
                x: 8.3 * cellSize,
                y: 7.2 * cellSize,
                width: 1.5 * cellSize,
                height: 2.6 * cellSize,
              },
              {
                x: 5.2 * cellSize,
                y: 2.3 * cellSize,
                width: 3 * cellSize,
                height: 7 * cellSize,
              },
              {
                x: 1.5 * cellSize,
                y: 4.1 * cellSize,
                width: 1.5 * cellSize,
                height: 2.5 * cellSize,
              },
              {
                x: 3 * cellSize,
                y: 2.5 * cellSize,
                width: 3 * cellSize,
                height: 4 * cellSize,
              },
              {
                x: 7.3 * cellSize,
                y: 0 * cellSize,
                width: 2.5 * cellSize,
                height: 6 * cellSize,
              },
              {
                x: 5.5 * cellSize,
                y: 0.3 * cellSize,
                width: 1.5 * cellSize,
                height: 3 * cellSize,
              },
              {
                x: 1.5 * cellSize,
                y: 0 * cellSize,
                width: 2 * cellSize,
                height: 3 * cellSize,
              },
            ];

            const pos = positions[index] || {
              x: 0,
              y: 0,
              width: cellSize,
              height: cellSize,
            };

            return (
              <KonvaImage
                key={`snake-${index}`}
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
                image={img}
              />
            );
          })}

          {/* Tambahkan gambar tangga */}
          {tanggaImages.map((img, index) => {
            if (!img) return null;
            // Atur posisi dan ukuran sesuai kebutuhan
            const positions = [
              {
                x: 0 * cellSize,
                y: 4.1 * cellSize,
                width: 1 * cellSize,
                height: 5 * cellSize,
              },
              {
                x: 4.3 * cellSize,
                y: 7.2 * cellSize,
                width: 1.5 * cellSize,
                height: 2.5 * cellSize,
              },
              {
                x: 5.5 * cellSize,
                y: 4 * cellSize,
                width: 4 * cellSize,
                height: 5 * cellSize,
              },
              {
                x: 3 * cellSize,
                y: 3 * cellSize,
                width: 4 * cellSize,
                height: 6 * cellSize,
              },
              {
                x: 9.1 * cellSize,
                y: 3.2 * cellSize,
                width: 1 * cellSize,
                height: 3 * cellSize,
              },
              {
                x: 4.1 * cellSize,
                y: 2 * cellSize,
                width: 0.8 * cellSize,
                height: 2 * cellSize,
              },
              {
                x: 0 * cellSize,
                y: 1.1 * cellSize,
                width: 2 * cellSize,
                height: 3 * cellSize,
              },
              {
                x: 5.5 * cellSize,
                y: 0 * cellSize,
                width: 5 * cellSize,
                height: 4 * cellSize,
              },
              {
                x: 3 * cellSize,
                y: 0 * cellSize,
                width: 5 * cellSize,
                height: 3 * cellSize,
              },
            ];

            const pos = positions[index] || {
              x: 0,
              y: 0,
              width: cellSize,
              height: cellSize,
            };

            return (
              <KonvaImage
                key={`tangga-${index}`}
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
                image={img}
              />
            );
          })}

          {/* Tambahkan gambar pion */}
          {pionImages.map((img, index) => {
            if (!img || pionPositionIndex[index] === undefined) return null; // Ensure pion position and image are defined
            return (
              <Pion
                key={`pion-${index}`}
                desiredIndex={pionPositionIndex[index]}
                cellSize={cellSize}
                getPosition={getPosition}
                image={img}
                index={index}
                onAnimationComplete={() => {}} // Handle any callback after animation if needed
                tanggaUp={tanggaUp}
                snakesDown={snakesDown}
                isCorrect={isCorrect}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}

export default Board;
