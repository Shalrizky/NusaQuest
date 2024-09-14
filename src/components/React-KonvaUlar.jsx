import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import pion from '../assets/common/Pions 1.png'

function Board() {
    const cellSize = 70; 
    const numRowsCols = 10; 
    const [stageSize, setStageSize] = useState({ width: 800, height: 800 });

    useEffect(() => {
        const updateSize = () => {
            setStageSize({ width: window.innerWidth / 2, height: 800 });
        };
        window.addEventListener('resize', updateSize);
        updateSize(); // Initial setup

        return () => window.removeEventListener('resize', updateSize);
    }, []);
    // Draw the board and game elements
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
                        fontSize={10}
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

    return (
        <Stage width={stageSize.width} height={stageSize.height}>
            <Layer>
                {drawBoard()}
                {/* Draw snakes and ladders here */}
            </Layer>
        </Stage>
    );
}

export default Board;
