import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import pionImageSrc from '../assets/common/Pions 1.png'; // Path to pion image
import snakeImageSrc from '../assets/common/Uler-tangga1.png'; // Path to snake image
import tanggaImageSrc from '../assets/common/tangga1.png'; // Path to tangga1 image
import tangga2ImageSrc from '../assets/common/tangga2.png'; // Path to tangga2 image
import tangga3ImageSrc from '../assets/common/tangga3.png'; // Path to tangga3 image

function Board() {
    const cellSize = 70;
    const numRowsCols = 10;
    const [stageSize, setStageSize] = useState({ width: 800, height: 800 });
    const [pionImage, setPionImage] = useState(null);
    const [snakeImage, setSnakeImage] = useState(null);
    const [tanggaImage, setTanggaImage] = useState(null); // State for ladder image 1
    const [tangga2Image, setTangga2Image] = useState(null); // State for ladder image 2
    const [tangga3Image, setTangga3Image] = useState(null); // State for ladder image 3

    useEffect(() => {
        const updateSize = () => {
            setStageSize({ width: window.innerWidth / 2, height: 800 });
        };
        window.addEventListener('resize', updateSize);
        updateSize();

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Load the pion image
    useEffect(() => {
        const img = new window.Image();
        img.src = pionImageSrc;
        img.onload = () => {
            setPionImage(img);
        };
    }, []);

    // Load the snake image
    useEffect(() => {
        const img = new window.Image();
        img.src = snakeImageSrc;
        img.onload = () => {
            setSnakeImage(img);
        };
    }, []);

    // Load the ladder (tangga1) image
    useEffect(() => {
        const img = new window.Image();
        img.src = tanggaImageSrc;
        img.onload = () => {
            setTanggaImage(img);
        };
    }, []);

    // Load the second ladder (tangga2) image
    useEffect(() => {
        const img = new window.Image();
        img.src = tangga2ImageSrc;
        img.onload = () => {
            setTangga2Image(img);
        };
    }, []);

    // Load the third ladder (tangga3) image
    useEffect(() => {
        const img = new window.Image();
        img.src = tangga3ImageSrc;
        img.onload = () => {
            setTangga3Image(img);
        };
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

    // Function to calculate pion's position (starting at cell 1)
    const getPionPosition = () => {
        const x = 0;
        const y = (numRowsCols - 1) * cellSize;
        return { x, y };
    };

    const pionPosition = getPionPosition();

    // Function to calculate the snake's position and size
    const getSnakePosition = () => {
        const x = 3 * cellSize; // Kolom 4 (indeks 3) untuk kolom kepala di 74
        const y = 1 * cellSize; // Kepala sedikit lebih rendah di kotak 74
        const snakeWidth = 4.5 * cellSize; // Melebar sedikit ke kanan agar menyentuh lebih banyak kolom
        const snakeHeight = 6.5 * cellSize; // Menyesuaikan tinggi agar kepala pas di 74 dan ekor di 36
        return { x, y, width: snakeWidth, height: snakeHeight };
    };

    const snakePosition = getSnakePosition();

    // Function to calculate ladder (tangga1) position and size
    const getTanggaPosition = () => {
        const x = 1 * cellSize; // Kolom 3 (index 2)
        const y = 8 * cellSize; // Baris dari cell 3
        const tanggaWidth = 4 * cellSize; // Ukuran lebar tangga
        const tanggaHeight = 2 * cellSize; // Tangga panjang dari 3 ke 17
        return { x, y, width: tanggaWidth, height: tanggaHeight };
    };

    const tanggaPosition = getTanggaPosition();

    // Function to calculate second ladder (tangga2) position and size
    const getTangga2Position = () => {
        // Tangga dari cell 7 ke 28
        const x = 4.7 * cellSize; // Kolom 7 (index 6)
        const y = 6.5 * cellSize; // Baris dari cell 7
        const tangga2Width = 4.5 * cellSize; // Lebar tangga dari 7 ke 28
        const tangga2Height = 3.5 * cellSize; // Tinggi tangga dari 7 ke 28
        return { x, y, width: tangga2Width, height: tangga2Height };
    };

    const tangga2Position = getTangga2Position();

    // Function to calculate third ladder (tangga3) position and size
    const getTangga3Position = () => {
        // Tangga dari cell 16 ke 24
        const x = 2 * cellSize; // Kolom 16 (index 15)
        const y = 6 * cellSize; // Baris dari cell 16
        const tangga3Width = 3.5 * cellSize; // Lebar tangga dari 16 ke 24
        const tangga3Height = 3.6 * cellSize; // Tinggi tangga dari 16 ke 24
        return { x, y, width: tangga3Width, height: tangga3Height };
    };

    const tangga3Position = getTangga3Position();

    return (
        <Stage width={stageSize.width} height={stageSize.height}>
            <Layer>
                {drawBoard()}
                {/* Draw the pion at cell 1 */}
                {pionImage && (
                    <KonvaImage
                        x={pionPosition.x + 5}
                        y={pionPosition.y + 5}
                        width={cellSize - 10}
                        height={cellSize - 10}
                        image={pionImage}
                    />
                )}
                {/* Draw the snake */}
                {snakeImage && (
                    <KonvaImage
                        x={snakePosition.x}
                        y={snakePosition.y}
                        width={snakePosition.width}
                        height={snakePosition.height}
                        image={snakeImage}
                    />
                )}
                {/* Draw the first ladder */}
                {tanggaImage && (
                    <KonvaImage
                        x={tanggaPosition.x}
                        y={tanggaPosition.y}
                        width={tanggaPosition.width}
                        height={tanggaPosition.height}
                        image={tanggaImage}
                    />
                )}
                {/* Draw the second ladder */}
                {tangga2Image && (
                    <KonvaImage
                        x={tangga2Position.x}
                        y={tangga2Position.y}
                        width={tangga2Position.width}
                        height={tangga2Position.height}
                        image={tangga2Image}
                    />
                )}
                {/* Draw the third ladder */}
                {tangga3Image && (
                    <KonvaImage
                        x={tangga3Position.x}
                        y={tangga3Position.y}
                        width={tangga3Position.width}
                        height={tangga3Position.height}
                        image={tangga3Image}
                    />
                )}
            </Layer>
        </Stage>
    );
}

export default Board;
