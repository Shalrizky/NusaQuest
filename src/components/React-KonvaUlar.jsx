import React, { useEffect, useState, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage } from "react-konva";
import pionImageSrc from "../assets/games/Utangga/Pions 1.png";
import pion2ImageSrc from "../assets/games/Utangga/Pions 2.png";
import pion3ImageSrc from "../assets/games/Utangga/Pions 3.png";
import pion4ImageSrc from "../assets/games/Utangga/Pions 4.png";
import snakeImageSrc from "../assets/games/Utangga/Uler-tangga1.png";
import snake2ImageSrc from "../assets/games/Utangga/uler-tangga2.png";
import snake3ImageSrc from "../assets/games/Utangga/uler-tangga3.png";
import snake4ImageSrc from "../assets/games/Utangga/uler-tangga4.png";
import snake5ImageSrc from "../assets/games/Utangga/uler-tangga5.png";
import snake6ImageSrc from "../assets/games/Utangga/uler-tangga6.png";
import snake7ImageSrc from "../assets/games/Utangga/uler-tangga7.png";
import snake8ImageSrc from "../assets/games/Utangga/uler-tangga8.png";
import tanggaImageSrc from "../assets/games/Utangga/tangga1.png";
import tangga2ImageSrc from "../assets/games/Utangga/tangga2.png";
import tangga3ImageSrc from "../assets/games/Utangga/tangga3.png";
import tangga4ImageSrc from "../assets/games/Utangga/tangga4.png";
import tangga5ImageSrc from "../assets/games/Utangga/tangga5.png";
import tangga6ImageSrc from "../assets/games/Utangga/tangga6.png";
import tangga7ImageSrc from "../assets/games/Utangga/tangga7.png";
import tangga8ImageSrc from "../assets/games/Utangga/tangga8.png";
import tangga9ImageSrc from "../assets/games/Utangga/tangga9.png";
import gsap from "gsap";  

function Board({ pionPositionIndex }) {
  const numRowsCols = 10;
  const [stageSize, setStageSize] = useState({ width: 900, height: 900 });
  const [cellSize, setCellSize] = useState(80);
  // Gambar Asset Ular dan tangga
  const [snakeImage, setSnakeImage] = useState(null);
  const [snake2Image, setSnake2Image] = useState(null);
  const [snake3Image, setSnake3Image] = useState(null);
  const [snake4Image, setSnake4Image] = useState(null);
  const [snake5Image, setSnake5Image] = useState(null);
  const [snake6Image, setSnake6Image] = useState(null);
  const [snake7Image, setSnake7Image] = useState(null);
  const [snake8Image, setSnake8Image] = useState(null);
  const [tanggaImage, setTanggaImage] = useState(null);
  const [tangga2Image, setTangga2Image] = useState(null);
  const [tangga3Image, setTangga3Image] = useState(null);
  const [tangga4Image, setTangga4Image] = useState(null);
  const [tangga5Image, setTangga5Image] = useState(null);
  const [tangga6Image, setTangga6Image] = useState(null);
  const [tangga7Image, setTangga7Image] = useState(null);
  const [tangga8Image, setTangga8Image] = useState(null);
  const [tangga9Image, setTangga9Image] = useState(null);
  // Asset pion
  const [pionImage, setPionImage] = useState(null);
  const [pion2Image, setPion2Image] = useState(null);
const [pion3Image, setPion3Image] = useState(null);
const [pion4Image, setPion4Image] = useState(null);


  const stageRef = useRef();
  const pionImageRef = useRef();


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
            x={j * cellSize + cellSize / 1}
            y={i * cellSize + cellSize / 2}
            text={number}
            fontSize={Math.max(cellSize / 5, 10)}
            fill="black"
            align="center"
            verticalAlign="middle"
            offsetX={cellSize / 3}
            offsetY={cellSize / 3}
          />
        );
        number++;
      }
    }
    return squares;
  };

  useEffect(() => {
    const loadImage = (src, setter) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => setter(img);
    };
    loadImage(snakeImageSrc, setSnakeImage);
    loadImage(snake2ImageSrc, setSnake2Image);
    loadImage(snake3ImageSrc, setSnake3Image);
    loadImage(snake4ImageSrc, setSnake4Image);
    loadImage(snake5ImageSrc, setSnake5Image);
    loadImage(snake6ImageSrc, setSnake6Image);
    loadImage(snake7ImageSrc, setSnake7Image);
    loadImage(snake8ImageSrc, setSnake8Image);
    loadImage(tanggaImageSrc, setTanggaImage);
    loadImage(tangga2ImageSrc, setTangga2Image);
    loadImage(tangga3ImageSrc, setTangga3Image);
    loadImage(tangga4ImageSrc, setTangga4Image);
    loadImage(tangga5ImageSrc, setTangga5Image);
    loadImage(tangga6ImageSrc, setTangga6Image);
    loadImage(tangga7ImageSrc, setTangga7Image);
    loadImage(tangga8ImageSrc, setTangga8Image);
    loadImage(tangga9ImageSrc, setTangga9Image);
  }, []);

  // Load pion image
  useEffect(() => {
    const loadPionImage = (src, setter) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => setter(img);
    };
    
    loadPionImage(pionImageSrc, setPionImage);
    loadPionImage(pion2ImageSrc, setPion2Image);
    loadPionImage(pion3ImageSrc, setPion3Image);
    loadPionImage(pion4ImageSrc, setPion4Image);
  }, []);
  

  // Calculate pion position based on index (adjusted to start from 1)
  const getPionPosition = useCallback(
    (index) => {
      const row = Math.floor(index / numRowsCols);
      let col;

      // For even rows, the column is left to right
      // For odd rows, the column is right to left (reversed)
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

  //CODE UNTUK NAIK TANGGA
 useEffect(() => {
  // Logic for when pionPositionIndex changes...
  if (pionPositionIndex !== null && pionImageRef.current) {
    const timeline = gsap.timeline();
    let currentIndex = 0;
    const pionAttrs = pionImageRef.current.attrs;
    const currentX = pionAttrs.x;
    const currentY = pionAttrs.y;

    // Calculate the current index based on current X and Y
    for (let i = 0; i <= numRowsCols * numRowsCols; i++) {
      const { x, y } = getPionPosition(i);
      if (
        Math.abs(x - currentX) < cellSize / 2 &&
        Math.abs(y - currentY) < cellSize / 2
      ) {
        currentIndex = i;
        break;
      }
    }

    console.log(`Pion starting at index: ${currentIndex}`);

    // Check if pion is at index 6 and needs to "naik tangga" to index 24
    if (currentIndex === 6) {
      console.log("Pion reached column 6, moving to index 24");

      // Naik tangga to index 24
      const naikPosition = getPionPosition(24);
      
      timeline
        .to(pionImageRef.current, {
          x: naikPosition.x,
          y: naikPosition.y - 30, // Lift pion slightly
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => console.log("Pion naik animasi selesai"),
        })
        .to(pionImageRef.current, {
          y: naikPosition.y, // Set pion back to normal position
          duration: 0.2,
          ease: "power2.out",
        });

      timeline.play();

      // Update currentIndex to 24 after naik tangga
      currentIndex = 24;

      // Stop further movement by returning from the effect
      return;
    }

    // Continue moving the pion based on the remaining diceNumber
    while (currentIndex < pionPositionIndex) {
      currentIndex += 1;

      const nextPosition = getPionPosition(currentIndex);

      console.log(`Pion moving to index: ${currentIndex}`);

      timeline
        .to(pionImageRef.current, {
          x: nextPosition.x,
          y: nextPosition.y - 20, // Small lift while moving
          duration: 0.2,
          ease: "sine.out",
        })
        .to(pionImageRef.current, {
          y: nextPosition.y, // Bring pion back to normal y position
          duration: 0.2,
          ease: "sine.out",
        });
    }

    console.log(`Pion final index: ${currentIndex}`);
    timeline.play();
  }
}, [pionPositionIndex, cellSize, stageSize, getPionPosition]);

  
  
  
  
  return (
    <div style={{ width: "100%", height: "100%" }} ref={stageRef}>
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          {drawBoard()}

          {/* Add pion image */}
          {pionImage && (
            <KonvaImage
              ref={pionImageRef} // Reference to animate the pion
              x={0} // Starting X position
              y={stageSize.height - cellSize + 5} // Start pion at bottom-left
              width={cellSize - 10}
              height={cellSize - 10}
              image={pionImage}
            />
          )}
          {pion2Image && (
            <KonvaImage
              ref={pionImageRef} // Reference to animate the pion
              x={1} // Starting X position
              y={stageSize.height - cellSize + 5} // Start pion at bottom-left
              width={cellSize - 10}
              height={cellSize - 10}
              image={pion2Image}
            />
          )}
          {pion3Image && (
            <KonvaImage
              ref={pionImageRef} // Reference to animate the pion
              x={2} // Starting X position
              y={stageSize.height - cellSize + 5} // Start pion at bottom-left
              width={cellSize - 10}
              height={cellSize - 10}
              image={pion3Image}
            />
          )}
          {pion4Image && (
            <KonvaImage
              ref={pionImageRef} // Reference to animate the pion
              x={4} // Starting X position
              y={stageSize.height - cellSize + 5} // Start pion at bottom-left
              width={cellSize - 10}
              height={cellSize - 10}
              image={pion4Image}
            />
          )}
          {/* Add snake images */}
          {snakeImage && (
            <KonvaImage
              x={cellSize * 1}
              y={cellSize * 6}
              width={2 * cellSize}
              height={4 * cellSize}
              image={snakeImage}
            />
          )}
          {snake2Image && (
            <KonvaImage
              x={cellSize * 8.3}
              y={cellSize * 7.2}
              width={1.5 * cellSize}
              height={2.6 * cellSize}
              image={snake2Image}
            />
          )}
          {snake3Image && (
            <KonvaImage
              x={cellSize * 5.2}
              y={cellSize * 2.3}
              width={3 * cellSize}
              height={7 * cellSize}
              image={snake3Image}
            />
          )}
          {snake4Image && (
            <KonvaImage
              x={cellSize * 1.5}
              y={cellSize * 4.1}
              width={1.5 * cellSize}
              height={2.5 * cellSize}
              image={snake4Image}
            />
          )}
          {snake5Image && (
            <KonvaImage
              x={cellSize * 3}
              y={cellSize * 2.5}
              width={3 * cellSize}
              height={4 * cellSize}
              image={snake5Image}
            />
          )}
          {snake6Image && (
            <KonvaImage
              x={cellSize * 7.3}
              y={cellSize * 0}
              width={2.5 * cellSize}
              height={6 * cellSize}
              image={snake6Image}
            />
          )}
          {snake7Image && (
            <KonvaImage
              x={cellSize * 5.5}
              y={cellSize * 0.3}
              width={1.5 * cellSize}
              height={3 * cellSize}
              image={snake7Image}
            />
          )}
          {snake8Image && (
            <KonvaImage
              x={cellSize * 1.5}
              y={cellSize * 0}
              width={2 * cellSize}
              height={3 * cellSize}
              image={snake8Image}
            />
          )}

          {/* Add ladder images */}
          {tanggaImage && (
            <KonvaImage
              x={cellSize * 0}
              y={cellSize * 4.1}
              width={1 * cellSize}
              height={5 * cellSize}
              image={tanggaImage}
            />
          )}
          {tangga2Image && (
            <KonvaImage
              x={cellSize * 4.3}
              y={cellSize * 7.2}
              width={1.5 * cellSize}
              height={2.5 * cellSize}
              image={tangga2Image}
            />
          )}
          {tangga3Image && (
            <KonvaImage
              x={cellSize * 5.5}
              y={cellSize * 4}
              width={4 * cellSize}
              height={5 * cellSize}
              image={tangga3Image}
            />
          )}
          {tangga4Image && (
            <KonvaImage
              x={cellSize * 3}
              y={cellSize * 3}
              width={4 * cellSize}
              height={6 * cellSize}
              image={tangga4Image}
            />
          )}
          {tangga5Image && (
            <KonvaImage
              x={cellSize * 9.1}
              y={cellSize * 3.2}
              width={1 * cellSize}
              height={3 * cellSize}
              image={tangga5Image}
            />
          )}
          {tangga6Image && (
            <KonvaImage
              x={cellSize * 4.1}
              y={cellSize * 2}
              width={0.8 * cellSize}
              height={2 * cellSize}
              image={tangga6Image}
            />
          )}
          {tangga7Image && (
            <KonvaImage
              x={cellSize * 0}
              y={cellSize * 1.1}
              width={2 * cellSize}
              height={3 * cellSize}
              image={tangga7Image}
            />
          )}
          {tangga8Image && (
            <KonvaImage
              x={cellSize * 5.5}
              y={cellSize * 0}
              width={5 * cellSize}
              height={4 * cellSize}
              image={tangga8Image}
            />
          )}
          {tangga9Image && (
            <KonvaImage
              x={cellSize * 3}
              y={cellSize * 0}
              width={5 * cellSize}
              height={3 * cellSize}
              image={tangga9Image}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default Board;