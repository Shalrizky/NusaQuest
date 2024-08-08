import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Stage, Layer, Image, Text } from "react-konva";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import gsap from "gsap";
import Konva from "konva";
import useAuth from "../hooks/useAuth";
import WilayahDarat from "../assets/nusaMaps/darat.png";
import WilayahDaerah from "../assets/nusaMaps/daerah.png";
import WilayahBahari from "../assets/nusaMaps/bahari.png";
import WilayahPermainan from "../assets/nusaMaps/permainan.png";
import WilayahKuliner from "../assets/nusaMaps/kuliner.png";
import WilayahInformasi from "../assets/nusaMaps/informasi.png";
import "../style/components/NusaMaps.css";
import { throttle } from 'lodash';

// Image sources and metadata
const IMAGE_SOURCES = [
  WilayahDarat,
  WilayahDaerah,
  WilayahBahari,
  WilayahPermainan,
  WilayahKuliner,
  WilayahInformasi,
];

const IMAGE_SIZES = [
  { width: 300, height: 280 },
  { width: 300, height: 260 },
  { width: 330, height: 240 },
  { width: 270, height: 150 },
  { width: 432, height: 302 },
  { width: 380, height: 219 },
];

const TEXT_CONTENT = [
  "Pariwisata Darat",
  "Daerah Jawa Barat",
  "Pariwisata Bahari",
  "Permainan Daerah",
  "Kuliner Jawa Barat",
  "Informasi",
];

const TEXT_POSITIONS = [
  { x: -100, y: -30 },
  { x: -100, y: 10 },
  { x: -90, y: -20 },
  { x: -90, y: 10 },
  { x: -50, y: -20 },
  { x: 50, y: 10 },
];

/**
 * NusaMaps component to display game maps component at home.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.setShowModal - control the visibility of the Modal choice game.
 */
function NusaMaps({ setShowModal }) {
  const { isLoggedIn } = useAuth();
  const imageRefs = useRef([]);
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [stageHeight, setStageHeight] = useState(window.innerHeight * 0.75);
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animationIn, setAnimationIn] = useState(false);

  // Handle click events on images
  const handleImageClick = (index) => {
    if (index === 5) {
      navigate("/information");
    } else {
      isLoggedIn ? setShowModal(true) : navigate("/login");
    }
  };

  const imagePositions = useMemo(
    () => [
      { x: 0, y: 0 },
      { x: 0, y: stageHeight - 260 },
      { x: (stageWidth - 300) / 2, y: (stageHeight - 250) / 2 },
      { x: (stageWidth - 300) / 3, y: stageHeight - 150 },
      { x: stageWidth - 411, y: -32 },
      { x: stageWidth - 405, y: stageHeight - 220 },
    ],
    [stageHeight, stageWidth]
  );

  useEffect(() => {
    // Load images
    const loadImages = () => {
      const loadedImages = IMAGE_SOURCES.map((src, index) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => {
          if (index === IMAGE_SOURCES.length - 1) {
            setAllImagesLoaded(true);
          }
        };
        return img;
      });
      setImages(loadedImages);
    };

    loadImages();
  }, []);

  const animateImages = useCallback(() => {
    gsap.fromTo(
      [imageRefs.current[0], imageRefs.current[1]],
      { x: -stageWidth },
      { x: imagePositions[0].x, duration: 1, ease: "power3.out", stagger: 0.2 }
    );

    gsap.fromTo(
      imageRefs.current[2],
      { y: -stageHeight },
      { y: imagePositions[2].y, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(
      imageRefs.current[3],
      { y: stageHeight },
      { y: imagePositions[3].y, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(
      imageRefs.current[4],
      { x: stageWidth },
      { x: imagePositions[4].x, duration: 1, ease: "power3.out" }
    );

    gsap
      .fromTo(
        imageRefs.current[5],
        { x: stageWidth },
        { x: imagePositions[5].x, duration: 1, ease: "power3.out" }
      )
      .delay(0.2);
  }, [imagePositions, stageHeight, stageWidth]);

  useEffect(() => {
    if (allImagesLoaded && !animationIn) {
      animateImages();
      setAnimationIn(true);
    }
  }, [allImagesLoaded, animationIn, animateImages]);

  useEffect(() => {
    const updateStageSize = () => {
      setStageWidth(window.innerWidth);
      setStageHeight(window.innerHeight * 0.75);
    };

    window.addEventListener("resize", updateStageSize);
    return () => window.removeEventListener("resize", updateStageSize);
  }, []);

  const handleMouseEnter = throttle((index) => {
    setHoveredIndex(index);
    const targetImage = imageRefs.current[index];
    if (targetImage) {
      targetImage.cache();
      targetImage.filters([Konva.Filters.Brighten]);
      targetImage.brightness(-0.2);
      targetImage.getLayer().batchDraw();

      gsap.to(targetImage, {
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 0.5,
        ease: "power1.inOut",
      });
    }
  }, 100);

  const handleMouseLeave = throttle(() => {
    const hoveredImage = imageRefs.current[hoveredIndex];
    if (hoveredImage) {
      gsap.to(hoveredImage, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.5,
        ease: "power1.inOut",
      });
    }

    imageRefs.current.forEach((imageRef) => {
      if (imageRef) {
        imageRef.filters([]);
        imageRef.cache();
      }
    });

    const layer = imageRefs.current[0]?.getLayer();
    if (layer) {
      layer.batchDraw();
    }

    setHoveredIndex(null);
  }, 100);

  const renderImages = () =>
    images.map((image, index) => (
      <Image
        key={`image-${index}`}
        image={image}
        x={imagePositions[index].x}
        y={imagePositions[index].y}
        width={IMAGE_SIZES[index].width}
        height={IMAGE_SIZES[index].height}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        ref={(ref) => (imageRefs.current[index] = ref)}
        onClick={() => handleImageClick(index)}
      />
    ));

  const renderTexts = () =>
    hoveredIndex !== null && (
      <Text
        key={`text-${hoveredIndex}`}
        text={TEXT_CONTENT[hoveredIndex]}
        x={
          imagePositions[hoveredIndex].x +
          IMAGE_SIZES[hoveredIndex].width / 2 +
          TEXT_POSITIONS[hoveredIndex].x
        }
        y={
          imagePositions[hoveredIndex].y +
          IMAGE_SIZES[hoveredIndex].height / 2 +
          TEXT_POSITIONS[hoveredIndex].y
        }
        onMouseEnter={() => handleMouseEnter(hoveredIndex)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleImageClick(hoveredIndex)}
        fontSize={20}
        fill="#fff"
        align="center"
        fontStyle="bold"
        fontFamily="'Potta One', sans-serif"
        shadowColor="#000000"
        shadowBlur={10}
        shadowOffsetX={8}
        shadowOffsetY={8}
      />
    );

  return (
    <Row>
      <Col id="canvas-container">
        <Stage id="stage-canvas" width={stageWidth} height={stageHeight}>
          <Layer>
            {renderImages()}
            {renderTexts()}
          </Layer>
        </Stage>
      </Col>
    </Row>
  );
}

export default NusaMaps;
