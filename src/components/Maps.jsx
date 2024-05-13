import React, { useState, useEffect } from "react";
import { Stage, Layer, Image, Text } from "react-konva";
import { Row, Col } from "react-bootstrap";
import MapsBackground from "../assets/maps-bg.png";
import WilayahDarat from "../assets/darat.svg";
import WilayahDaerah from "../assets/daerah.svg";
import WilayahBahari from "../assets/bahari.svg";
import WilayahPermainan from "../assets/permainan.svg";
import WilayahKuliner from "../assets/kuliner.svg";
import WilayahInformasi from "../assets/informasi.svg";

function Maps() {
  const [images, setImages] = useState({});
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [stageHeight, setStageHeight] = useState(window.innerHeight * 0.75);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const imagesToLoad = [
      WilayahDarat,
      WilayahDaerah,
      WilayahBahari,
      WilayahPermainan,
      WilayahKuliner,
      WilayahInformasi,
    ];

    const loadImages = () => {
      const imagesLoaded = {};
      imagesToLoad.forEach((imageSrc, index) => {
        const img = new window.Image();
        img.onload = () => {
          imagesLoaded[`image${index}`] = img;
          setImages(imagesLoaded);
        };
        img.src = imageSrc;
      });
    };

    loadImages();

    const handleResize = () => {
      setStageWidth(window.innerWidth);
      setStageHeight(window.innerHeight * 0.75);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const imageSizes = [
    { width: stageWidth * 0.1, height: stageHeight * 0.6 },
    { width: stageWidth * 0.1, height: stageHeight * 0.5 },
    { width: stageWidth * 0.14, height: stageHeight * 0.7 },
    { width: stageWidth * 0.06, height: stageHeight * 0.13 },
    { width: stageWidth * 0.13, height: stageHeight * 0.6 },
    { width: stageWidth * 0.13, height: stageHeight * 0.33 },
  ];

  const imagePositions = [
    { x: stageWidth * -0.005, y: stageHeight * -0.01 },
    { x: 0, y: stageHeight * 0.44 },
    {
      x: (stageWidth - stageWidth * 0.3) / 2,
      y: (stageHeight - stageHeight * 0.7) / 2,
    },
    { x: stageWidth * 0.3, y: stageHeight * 0.69 },
    { x: stageWidth * 0.7, y: stageHeight * 0.001 },
    { x: stageWidth * 0.7, y: stageHeight - stageHeight * 0.42 },
  ];

  const handleMouseEnter = (index, e) => {
    const originalScaleX = e.target.scaleX();
    const originalScaleY = e.target.scaleY();
    let newX = imagePositions[index].x;
    let newY = imagePositions[index].y;
    let newScaleX = originalScaleX;
    let newScaleY = originalScaleY;

    setHoveredIndex(index);

    switch (index) {
      case 0:
        newX += stageWidth * 0;
        newY += stageHeight * 0;
        newScaleX *= 1.08;
        newScaleY *= 1.08;
        break;
      case 1:
        newX += stageWidth * 0.001;
        newY += stageHeight * -0.05;
        newScaleX *= 1.08;
        newScaleY *= 1.08;
        break;
      case 2:
        newX += stageWidth * -0.01;
        newY -= stageHeight * 0.02;
        newScaleX *= 1.08;
        newScaleY *= 1.08;
        break;
      case 3:
        newX += stageWidth * -0.01;
        newY -= stageHeight * 0.02;
        newScaleX *= 1.08;
        newScaleY *= 1.08;
        break;
      case 4:
        newX += stageWidth * -0.02;
        newY -= stageHeight * -0.001;
        newScaleX *= 1.08;
        newScaleY *= 1.08;
        break;
      case 5:
        newX += stageWidth * -0.02;
        newY -= stageHeight * 0.04;
        newScaleX *= 1.08;
        newScaleY *= 1.08;
        break;
      default:
        newScaleX *= 1.05;
        newScaleY *= 1.05;
        break;
    }

    e.target.to({
      scaleX: newScaleX,
      scaleY: newScaleY,
      duration: 0.5,
      x: newX,
      y: newY,
    });
  };

  const handleMouseLeave = (index, e) => {
    e.target.to({
      x: imagePositions[index].x,
      y: imagePositions[index].y,
      width: imageSizes[index].width,
      height: imageSizes[index].height,
      scaleX: stageWidth / images[`image${index}`].width,
      scaleY: stageHeight / images[`image${index}`].height,
      duration: 0.5,
    });

    setHoveredIndex(null);
  };

  return (
    <Row>
      <Col className="pb-5">
        <Stage
          width={stageWidth}
          height={stageHeight}
          style={{
            borderRadius: "20px",
            backgroundImage: `url(${MapsBackground})`,
            overflow: "hidden",
          }}
        >
          <Layer>
            {Object.keys(images).map((key, index) => (
              <React.Fragment key={index}>
                <Image
                  image={images[key]}
                  x={imagePositions[index].x}
                  y={imagePositions[index].y}
                  width={imageSizes[index].width}
                  height={imageSizes[index].height}
                  scaleX={stageWidth / images[key].width}
                  scaleY={stageHeight / images[key].height}
                  onMouseEnter={(e) => handleMouseEnter(index, e)}
                  onMouseLeave={(e) => handleMouseLeave(index, e)}
                />
                {hoveredIndex === 0 && index === 0 && ( // Hanya pada gambar pertama dan ketika dihover
                  <Text
                    text="Makanan"
                  
                    fontSize={30} // Ukuran teks
                    fill="white"
                    align="center" 
                  />
                )}
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </Col>
    </Row>
  );
}

export default Maps;
