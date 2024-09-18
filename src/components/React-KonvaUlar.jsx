import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import pionImageSrc from '../assets/common/Pions 1.png';
import snake2ImageSrc from '../assets/common/uler-tangga2.png';
import snake3ImageSrc from '../assets/common/uler-tangga3.png';
import snake4ImageSrc from '../assets/common/uler-tangga4.png';
import snake5ImageSrc from '../assets/common/uler-tangga5.png';
import snake6ImageSrc from '../assets/common/uler-tangga6.png';
import snakeImageSrc from '../assets/common/Uler-tangga1.png';
import tanggaImageSrc from '../assets/common/tangga1.png';
import tangga2ImageSrc from '../assets/common/tangga2.png';
import tangga3ImageSrc from '../assets/common/tangga3.png';
import tangga4ImageSrc from '../assets/common/tangga4.png';
import tangga5ImageSrc from '../assets/common/tangga5.png';
import tangga6ImageSrc from '../assets/common/tangga6.png';
import tangga7ImageSrc from '../assets/common/tangga7.png';
import tangga8ImageSrc from '../assets/common/tangga8.png';

function Board() {
    const cellSize = 70;
    const numRowsCols = 10;
    const [stageSize, setStageSize] = useState({ width: 800, height: 800 });
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

    //Load the snake2 image
    useEffect(() => {
        // Load the second snake image
        const img = new window.Image();
        img.src = snake2ImageSrc;
        img.onload = () => {
            setSnake2Image(img);
        };
    }, []);

    //Load the snake3 image
    useEffect(() => {
        // Load the second snake image
        const img = new window.Image();
        img.src = snake3ImageSrc;
        img.onload = () => {
            setSnake3Image(img);
        };
    }, []);

    //Load the snake4 image
    useEffect(() => {
        // Load the second snake image
        const img = new window.Image();
        img.src = snake4ImageSrc;
        img.onload = () => {
            setSnake4Image(img);
        };
    }, []);

    //Load the snake5 image
    useEffect(() => {
        // Load the second snake image
        const img = new window.Image();
        img.src = snake5ImageSrc;
        img.onload = () => {
            setSnake5Image(img);
        };
    }, []);

    //Load the snake6 image
    useEffect(() => {
        // Load the second snake image
        const img = new window.Image();
        img.src = snake6ImageSrc;
        img.onload = () => {
            setSnake6Image(img);
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

    //Load the four ladder (tangga4) image
    useEffect(() => {
        const img = new window.Image();
        img.src = tangga4ImageSrc;
        img.onload = () => {
            setTangga4Image(img);
        };
    }, []);

    //Load the five ladder (tangga5) image
    useEffect(() => {
        const img = new window.Image();
        img.src = tangga5ImageSrc;
        img.onload = () => {
            setTangga5Image(img);
        };
    }, []);

    //Load the six ladder (tangga6) image
    useEffect(() => {
        const img = new window.Image();
        img.src = tangga6ImageSrc;
        img.onload = () => {
            setTangga6Image(img);
        };
    }, []);

    //Load the seven ladder (tangga7) image
    useEffect(() => {
        const img = new window.Image();
        img.src = tangga7ImageSrc;
        img.onload = () => {
            setTangga7Image(img);
        };
    }, []);

    //Load the eight ladder (tangga8) image
    useEffect(() => {
        const img = new window.Image();
        img.src = tangga8ImageSrc;
        img.onload = () => {
            setTangga8Image(img);
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

    // Fungsi untuk menghitung posisi pion (dimulai dari sel 1)
    const getPionPosition = () => {
        const x = 0;
        const y = (numRowsCols - 1) * cellSize;
        return { x, y };
    };

    const pionPosition = getPionPosition();

    // Fungsi untuk menghitung posisi dan ukuran ular pertama
    const getSnakePosition = () => {
        const x = 3 * cellSize; // Kolom 4 (indeks 3) untuk kolom kepala di 74
        const y = 1 * cellSize; // Kepala sedikit lebih rendah di kotak 74
        const snakeWidth = 4.5 * cellSize; // Melebar sedikit ke kanan agar menyentuh lebih banyak kolom
        const snakeHeight = 6.5 * cellSize; // Menyesuaikan tinggi agar kepala pas di 74 dan ekor di 36
        return { x, y, width: snakeWidth, height: snakeHeight };
    };

    const snakePosition = getSnakePosition();

    // Fungsi untuk menghitung posisi dan ukuran ular kedua
    const getSnake2Position = () => {
        const x = 0 * cellSize; // Kolom 19 (index 18)
        const y = 5.5 * cellSize;
        const snake2Width = 4 * cellSize; // Lebar ular dari 19 ke 38 
        const snake2Height = 4 * cellSize; // Tinggi ular dari 19 ke 38 
        return { x, y, width: snake2Width, height: snake2Height };
    };

    const snake2Position = getSnake2Position();

    // Fungsi untuk menghitung posisi dan ukuran ular ketiga
    const getSnake3Position = () => {
        const x = 3.5 * cellSize; // Kolom 26 
        const y = 5.5 * cellSize;
        const snake3Width = 5 * cellSize; // Lebar ular dari 26 ke 34 
        const snake3Height = 3.1 * cellSize; // Tinggi ular dari 26 ke 34 
        return { x, y, width: snake3Width, height: snake3Height };
    };

    const snake3Position = getSnake3Position();

    // Fungsi untuk menghitung posisi dan ukuran ular ke empat
    const getSnake4Position = () => {
        const x = 0 * cellSize; // Kolom 59 
        const y = 1.7 * cellSize;
        const snake4Width = 4 * cellSize; // Lebar ular dari 59 ke 80 
        const snake4Height = 3.5 * cellSize; // Tinggi ular dari 59 ke 80 
        return { x, y, width: snake4Width, height: snake4Height };
    };

    const snake4Position = getSnake4Position();

    // Fungsi untuk menghitung posisi dan ukuran ular ke lima
    const getSnake5Position = () => {
        const x = 1.5 * cellSize; // Kolom 65 
        const y = 0.2 * cellSize;
        const snake5Width = 5 * cellSize; // Lebar ular dari 65 ke 84 
        const snake5Height = 4.5 * cellSize; // Tinggi ular dari 65 ke 84 
        return { x, y, width: snake5Width, height: snake5Height };
    };

    const snake5Position = getSnake5Position();

    // Fungsi untuk menghitung posisi dan ukuran ular ke enam
    const getSnake6Position = () => {
        const x = 6 * cellSize; // Kolom 72
        const y = 0 * cellSize;
        const snake6Width = 4 * cellSize; // Lebar ular dari 72 ke 91 
        const snake6Height = 3.4 * cellSize; // Tinggi ular dari 72 ke 91 
        return { x, y, width: snake6Width, height: snake6Height };
    };

    const snake6Position = getSnake6Position();

    // Fungsi untuk menghitung posisi dan ukuran tangga pertama (tangga)
    const getTanggaPosition = () => {
        const x = 1 * cellSize; // Kolom 3 (index 2)
        const y = 8 * cellSize;
        const tanggaWidth = 4 * cellSize; // Ukuran lebar tangga
        const tanggaHeight = 2 * cellSize; // Tangga panjang dari 3 ke 17
        return { x, y, width: tanggaWidth, height: tanggaHeight };
    };

    const tanggaPosition = getTanggaPosition();

    // Fungsi untuk menghitung posisi dan ukuran tangga kedua (tangga2)
    const getTangga2Position = () => {
        // Tangga dari cell 7 ke 28
        const x = 4.7 * cellSize; // Kolom 7 (index 6)
        const y = 6.5 * cellSize;
        const tangga2Width = 4.5 * cellSize; // Lebar tangga dari 7 ke 28
        const tangga2Height = 3.5 * cellSize; // Tinggi tangga dari 7 ke 28
        return { x, y, width: tangga2Width, height: tangga2Height };
    };

    const tangga2Position = getTangga2Position();

    // Fungsi untuk menghitung posisi dan ukuran tangga ketiga (tangga3)
    const getTangga3Position = () => {
        // Tangga dari cell 16 ke 24
        const x = 3 * cellSize; // Kolom 16 (index 15)
        const y = 6 * cellSize;
        const tangga3Width = 2 * cellSize; // Lebar tangga dari 16 ke 37 (EDIT DEWEK)
        const tangga3Height = 3.2 * cellSize; // Tinggi tangga dari 16 ke 37  (EDIT DEWEK)
        return { x, y, width: tangga3Width, height: tangga3Height };
    };

    const tangga3Position = getTangga3Position();

    // Fungsi untuk menghitung posisi dan ukuran tangga keempat (tangga4)
    const getTangga4Position = () => {
        // Tangga dari cell 32 ke 48
        const x = 7.4 * cellSize; // Kolom 32 
        const y = 5 * cellSize;
        const tangga4Width = 1.5 * cellSize; // Lebar tangga dari 32 ke 48
        const tangga4Height = 2 * cellSize; // tinggi tangga dari 32 ke 48
        return { x, y, width: tangga4Width, height: tangga4Height };
    };

    const tangga4Position = getTangga4Position();

    // Fungsi untuk menghitung posisi dan ukuran tangga kelima (tangga5)
    const getTangga5Position = () => {
        // Tangga dari cell 43 ke 59
        const x = 1.2 * cellSize; // Kolom 43
        const y = 3.5 * cellSize;
        const tangga5Width = 1.5 * cellSize; // Lebar tangga dari 43 ke 59
        const tangga5Height = 3 * cellSize; // tinggi tangga dari 43 ke 59
        return { x, y, width: tangga5Width, height: tangga5Height };
    };

    const tangga5Position = getTangga5Position();

    // Fungsi untuk menghitung posisi dan ukuran tangga keenam (tangga6)
    const getTangga6Position = () => {
        // Tangga dari cell 68 ke 72
        const x = 7.2 * cellSize; // Kolom 68
        const y = 1.5 * cellSize;
        const tangga6Width = 1.5 * cellSize; // Lebar tangga dari 68 ke 72
        const tangga6Height = 3 * cellSize; // tinggi tangga dari 68 ke 72
        return { x, y, width: tangga6Width, height: tangga6Height };
    };

    const tangga6Position = getTangga6Position();

    // Fungsi untuk menghitung posisi dan ukuran tangga ketujuh (tangga7)
    const getTangga7Position = () => {
        // Tangga dari cell 68 ke 72
        const x = 0.5 * cellSize; // Kolom 68
        const y = 0 * cellSize;
        const tangga7Width = 4 * cellSize; // Lebar tangga dari 68 ke 72
        const tangga7Height = 4 * cellSize; // tinggi tangga dari 68 ke 72
        return { x, y, width: tangga7Width, height: tangga7Height };
    };

    const tangga7Position = getTangga7Position();

    // Fungsi untuk menghitung posisi dan ukuran tangga ke lapan (tangga8)
    const getTangga8Position = () => {
        // Tangga dari cell 68 ke 72
        const x = 5 * cellSize; // Kolom 68
        const y = 0 * cellSize;
        const tangga8Width = 4.2 * cellSize; // Lebar tangga dari 68 ke 72
        const tangga8Height = 3 * cellSize; // tinggi tangga dari 68 ke 72
        return { x, y, width: tangga8Width, height: tangga8Height };
    };

    const tangga8Position = getTangga8Position();

    return (
        <Stage width={stageSize.width} height={stageSize.height}>
            <Layer>
                {drawBoard()}
                {/* gambar pion ke 1 */}
                {pionImage && (
                    <KonvaImage
                        x={pionPosition.x + 5}
                        y={pionPosition.y + 5}
                        width={cellSize - 10}
                        height={cellSize - 10}
                        image={pionImage}
                    />
                )}

                {/* gambar uler ke 1 */}
                {snakeImage && (
                    <KonvaImage
                        x={snakePosition.x}
                        y={snakePosition.y}
                        width={snakePosition.width}
                        height={snakePosition.height}
                        image={snakeImage}
                    />
                )}

                {/* gambar uler ke 2 */}
                {snake2Image && (
                    <KonvaImage
                        x={snake2Position.x}
                        y={snake2Position.y}
                        width={snake2Position.width}
                        height={snake2Position.height}
                        image={snake2Image}
                    />
                )}

                {/* gambar uler ke 3 */}
                {snake3Image && (
                    <KonvaImage
                        x={snake3Position.x}
                        y={snake3Position.y}
                        width={snake3Position.width}
                        height={snake3Position.height}
                        image={snake3Image}
                    />
                )}

                {/* gambar uler ke 4 */}
                {snake3Image && (
                    <KonvaImage
                        x={snake4Position.x}
                        y={snake4Position.y}
                        width={snake4Position.width}
                        height={snake4Position.height}
                        image={snake4Image}
                    />
                )}

                {/* gambar uler ke 5 */}
                {snake3Image && (
                    <KonvaImage
                        x={snake5Position.x}
                        y={snake5Position.y}
                        width={snake5Position.width}
                        height={snake5Position.height}
                        image={snake5Image}
                    />
                )}

                {/* gambar uler ke 6 */}
                {snake3Image && (
                    <KonvaImage
                        x={snake6Position.x}
                        y={snake6Position.y}
                        width={snake6Position.width}
                        height={snake6Position.height}
                        image={snake6Image}
                    />
                )}

                {/* gambar tangga ke 1 */}
                {tanggaImage && (
                    <KonvaImage
                        x={tanggaPosition.x}
                        y={tanggaPosition.y}
                        width={tanggaPosition.width}
                        height={tanggaPosition.height}
                        image={tanggaImage}
                    />
                )}

                {/* gambar tangga ke 2 */}
                {tangga2Image && (
                    <KonvaImage
                        x={tangga2Position.x}
                        y={tangga2Position.y}
                        width={tangga2Position.width}
                        height={tangga2Position.height}
                        image={tangga2Image}
                    />
                )}

                {/* gambar tangga ke 3 */}
                {tangga3Image && (
                    <KonvaImage
                        x={tangga3Position.x}
                        y={tangga3Position.y}
                        width={tangga3Position.width}
                        height={tangga3Position.height}
                        image={tangga3Image}
                    />
                )}
                {/* gambar tangga ke 4 */}
                {tangga4Image && (
                    <KonvaImage
                        x={tangga4Position.x}
                        y={tangga4Position.y}
                        width={tangga4Position.width}
                        height={tangga4Position.height}
                        image={tangga4Image}
                    />
                )}
                {/* gambar tangga ke 5 */}
                {tangga5Image && (
                    <KonvaImage
                        x={tangga5Position.x}
                        y={tangga5Position.y}
                        width={tangga5Position.width}
                        height={tangga5Position.height}
                        image={tangga5Image}
                    />
                )}
                {/* gambar tangga ke 6 */}
                {tangga6Image && (
                    <KonvaImage
                        x={tangga6Position.x}
                        y={tangga6Position.y}
                        width={tangga6Position.width}
                        height={tangga6Position.height}
                        image={tangga6Image}
                    />
                )}

                {/* gambar tangga ke 7 */}
                {tangga7Image && (
                    <KonvaImage
                        x={tangga7Position.x}
                        y={tangga7Position.y}
                        width={tangga7Position.width}
                        height={tangga7Position.height}
                        image={tangga7Image}
                    />
                )}

                {/* gambar tangga ke 8 */}
                {tangga8Image && (
                    <KonvaImage
                        x={tangga8Position.x}
                        y={tangga8Position.y}
                        width={tangga8Position.width}
                        height={tangga8Position.height}
                        image={tangga8Image}
                    />
                )}
            </Layer>
        </Stage>
    );
}

export default Board;
