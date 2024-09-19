import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import pionImageSrc from '../assets/games/Utangga/Pions 1.png';
import snakeImageSrc from '../assets/games/Utangga/Uler-tangga1.png';
import snake2ImageSrc from '../assets/games/Utangga/uler-tangga2.png';
import snake3ImageSrc from '../assets/games/Utangga/uler-tangga3.png';
import snake4ImageSrc from '../assets/games/Utangga/uler-tangga4.png';
import snake5ImageSrc from '../assets/games/Utangga/uler-tangga5.png';
import snake6ImageSrc from '../assets/games/Utangga/uler-tangga6.png';
import tanggaImageSrc from '../assets/games/Utangga/tangga1.png';
import tangga2ImageSrc from '../assets/games/Utangga/tangga2.png';
import tangga3ImageSrc from '../assets/games/Utangga/tangga3.png';
import tangga4ImageSrc from '../assets/games/Utangga/tangga4.png';
import tangga5ImageSrc from '../assets/games/Utangga/tangga5.png';
import tangga6ImageSrc from '../assets/games/Utangga/tangga6.png';
import tangga7ImageSrc from '../assets/games/Utangga/tangga7.png';
import tangga8ImageSrc from '../assets/games/Utangga/tangga8.png';

function Board() {
  const numRowsCols = 10;
  const [stageSize, setStageSize] = useState({ width: 900, height: 900 });
  const [cellSize, setCellSize] = useState(80); // Dynamically adjust cell size
  const [pionImage, setPionImage] = useState(null);
  const [snakeImage, setSnakeImage] = useState(null);
  const [snake2Image, setSnake2Image] = useState(null);
  const [snake3Image, setSnake3Image] = useState(null);
  const [snake4Image, setSnake4Image] = useState(null);
  const [snake5Image, setSnake5Image] = useState(null);
  const [snake6Image, setSnake6Image] = useState(null);
  const [tanggaImage, setTanggaImage] = useState(null);
  const [tangga2Image, setTangga2Image] = useState(null);
  const [tangga3Image, setTangga3Image] = useState(null);
  const [tangga4Image, setTangga4Image] = useState(null);
  const [tangga5Image, setTangga5Image] = useState(null);
  const [tangga6Image, setTangga6Image] = useState(null);
  const [tangga7Image, setTangga7Image] = useState(null);
  const [tangga8Image, setTangga8Image] = useState(null);

  const stageRef = useRef();

  // Responsive resizing logic
  useEffect(() => {
    const updateSize = () => {
      if (stageRef.current) {
        const containerWidth = stageRef.current.parentElement.offsetWidth;
        const containerHeight = stageRef.current.parentElement.offsetHeight;

        // Set the board to be square and scale down based on available width
        const newStageSize = Math.min(containerWidth, containerHeight);
        setStageSize({ width: newStageSize, height: newStageSize });

        // Adjust the cell size dynamically
        const newCellSize = newStageSize / numRowsCols;
        setCellSize(newCellSize);
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Load pion image
  useEffect(() => {
    const img = new window.Image();
    img.src = pionImageSrc;
    img.onload = () => setPionImage(img);
  }, []);

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
    loadImage(tanggaImageSrc, setTanggaImage);
    loadImage(tangga2ImageSrc, setTangga2Image);
    loadImage(tangga3ImageSrc, setTangga3Image);
    loadImage(tangga4ImageSrc, setTangga4Image);
    loadImage(tangga5ImageSrc, setTangga5Image);
    loadImage(tangga6ImageSrc, setTangga6Image);
    loadImage(tangga7ImageSrc, setTangga7Image);
    loadImage(tangga8ImageSrc, setTangga8Image);
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

      for (let j = startCol; direction === 1 ? j <= endCol : j >= endCol; j += direction) {
        let color = (i + j) % 2 === 0 ? '#FD9502' : '#CDCDAB'; // Alternate colors
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
            fontSize={Math.max(cellSize / 5, 10)} // Scale the font size dynamically
            fill='black'
            align='center'
            verticalAlign='middle'
            offsetX={cellSize / 3}
            offsetY={cellSize / 3}
          />
        );
        number++;
      }
    }
    return squares;
  };

  // Calculate pion position
  const getPionPosition = () => {
    const x = 0;
    const y = (numRowsCols - 1) * cellSize;
    return { x, y };
  };

  const pionPosition = getPionPosition();

  return (
    <div style={{ width: '100%', height: '100%' }} ref={stageRef}>
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>
          {drawBoard()}

          {/* Add pion image */}
          {pionImage && (
            <KonvaImage
              x={pionPosition.x + 5}
              y={pionPosition.y + 5}
              width={cellSize - 10}
              height={cellSize - 10}
              image={pionImage}
            />
          )}

          {/* Add snake images */}
          {snakeImage && <KonvaImage x={cellSize * 3} y={cellSize} width={4 * cellSize} height={6 * cellSize} image={snakeImage} />}
          {snake2Image && <KonvaImage x={0} y={cellSize * 5} width={4 * cellSize} height={4 * cellSize} image={snake2Image} />}
          {snake3Image && <KonvaImage x={cellSize * 3.5} y={cellSize * 5.5} width={5 * cellSize} height={3.1 * cellSize} image={snake3Image} />}
          {snake4Image && <KonvaImage x={0} y={cellSize * 1.7} width={4 * cellSize} height={3.5 * cellSize} image={snake4Image} />}
          {snake5Image && <KonvaImage x={cellSize * 1.5} y={cellSize * 0.2} width={5 * cellSize} height={4.5 * cellSize} image={snake5Image} />}
          {snake6Image && <KonvaImage x={cellSize * 6} y={0} width={4 * cellSize} height={3.4 * cellSize} image={snake6Image} />}

          {/* Add ladder images */}
          {tanggaImage && <KonvaImage x={cellSize} y={cellSize * 8} width={4 * cellSize} height={2 * cellSize} image={tanggaImage} />}
          {tangga2Image && <KonvaImage x={cellSize * 4.7} y={cellSize * 6.5} width={4.5 * cellSize} height={3.5 * cellSize} image={tangga2Image} />}
          {tangga3Image && <KonvaImage x={cellSize * 3} y={cellSize * 6} width={2 * cellSize} height={3 * cellSize} image={tangga3Image} />}
          {tangga4Image && <KonvaImage x={cellSize * 7.4} y={cellSize * 5} width={1.5 * cellSize} height={2 * cellSize} image={tangga4Image} />}
          {tangga5Image && <KonvaImage x={cellSize * 1.2} y={cellSize * 3.5} width={1.5 * cellSize} height={3 * cellSize} image={tangga5Image} />}
          {tangga6Image && <KonvaImage x={cellSize * 7.2} y={cellSize * 1.5} width={1.5 * cellSize} height={3 * cellSize} image={tangga6Image} />}
          {tangga7Image && <KonvaImage x={cellSize * 0.5} y={0} width={4 * cellSize} height={4 * cellSize} image={tangga7Image} />}
          {tangga8Image && <KonvaImage x={cellSize * 5} y={0} width={4 * cellSize} height={3 * cellSize} image={tangga8Image} />}
        </Layer>
      </Stage>
    </div>
  );
}

export default Board;
