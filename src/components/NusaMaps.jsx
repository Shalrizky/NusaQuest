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
import { fetchTopics } from "../services/destinationDataServices";
import "../style/components/NusaMaps.css";
import { throttle } from "lodash";

// Array data gambar dan topik
const imageData = [
  {
    src: WilayahDarat,
    size: { width: 300, height: 280 },
    text: "Pariwisata Darat",
    textPosition: { x: -100, y: -30 },
    topicID: "pariwisata_darat",
  },
  {
    src: WilayahDaerah,
    size: { width: 300, height: 260 },
    text: "Daerah Jawa Barat",
    textPosition: { x: -100, y: 10 },
    topicID: "daerah_jawa_barat",
  },
  {
    src: WilayahBahari,
    size: { width: 330, height: 240 },
    text: "Pariwisata Bahari",
    textPosition: { x: -90, y: -20 },
    topicID: "pariwisata_bahari",
  },
  {
    src: WilayahPermainan,
    size: { width: 270, height: 150 },
    text: "Permainan Daerah",
    textPosition: { x: -90, y: 10 },
    topicID: "permainan_daerah",
  },
  {
    src: WilayahKuliner,
    size: { width: 432, height: 302 },
    text: "Kuliner Jawa Barat",
    textPosition: { x: -50, y: -20 },
    topicID: "kuliner_jawa_barat",
  },
  {
    src: WilayahInformasi,
    size: { width: 380, height: 219 },
    text: "Informasi",
    textPosition: { x: 50, y: 10 },
    topicID: null, // Untuk halaman Informasi
  },
];

function NusaMaps({ setShowModal, setSelectedTopic }) {
  const [topics, setTopics] = useState({});
  const { isLoggedIn } = useAuth();
  const imageRefs = useRef([]);
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [stageHeight, setStageHeight] = useState(window.innerHeight * 0.75);
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animationIn, setAnimationIn] = useState(false);

  useEffect(() => {
    fetchTopics((fetchedTopics) => {
      setTopics(fetchedTopics);
    });
  }, []);

  // Fungsi untuk menangani klik pada gambar
  const handleImageClick = (index) => {
    const data = imageData[index];

    if (data.topicID === null) {
      navigate("/information");
    } else {
      if (isLoggedIn) {
        const topicID = data.topicID;

        if (topicID && topics[topicID]) {
          setSelectedTopic(topicID);

          setShowModal(true);
        } else {
          console.error("Data topik tidak ditemukan untuk ID ini.");
        }
      } else {
        navigate("/login");
      }
    }
  };

  const imagePositions = useMemo(
    () => [
      { x: 0, y: 0 },
      { x: 0, y: stageHeight - imageData[1].size.height },
      {
        x: (stageWidth - imageData[2].size.width) / 2,
        y: (stageHeight - imageData[2].size.height) / 2,
      },
      {
        x: (stageWidth - imageData[3].size.width) / 3,
        y: stageHeight - imageData[3].size.height,
      },
      { x: stageWidth - imageData[4].size.width + 20, y: -32 },
      {
        x: stageWidth - imageData[5].size.width - 25,
        y: stageHeight - imageData[5].size.height,
      },
    ],
    [stageHeight, stageWidth]
  );

  useEffect(() => {
    // Memuat gambar
    const loadImages = () => {
      const loadedImages = imageData.map((data, index) => {
        const img = new window.Image();
        img.src = data.src;
        img.onload = () => {
          if (index === imageData.length - 1) {
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
      {
        x: (i) => imagePositions[i].x,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
      }
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

      // Ubah kursor menjadi pointer
      const container = targetImage.getStage().container();
      container.style.cursor = "pointer";

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

      const container = hoveredImage.getStage().container();
      container.style.cursor = "default";
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
        width={imageData[index].size.width}
        height={imageData[index].size.height}
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
        text={imageData[hoveredIndex].text}
        x={
          imagePositions[hoveredIndex].x +
          imageData[hoveredIndex].size.width / 2 +
          imageData[hoveredIndex].textPosition.x
        }
        y={
          imagePositions[hoveredIndex].y +
          imageData[hoveredIndex].size.height / 2 +
          imageData[hoveredIndex].textPosition.y
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
