import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image, Text } from "react-konva";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import MapsBackground from "../assets/maps/maps-bg.png";
import WilayahDarat from "../assets/maps/darat.png";
import WilayahDaerah from "../assets/maps/daerah.png";
import WilayahBahari from "../assets/maps/bahari.png";
import WilayahPermainan from "../assets/maps/permainan.png";
import WilayahKuliner from "../assets/maps/kuliner.png";
import WilayahInformasi from "../assets/maps/informasi.png";
import gsap from "gsap";

function Maps() {
  const imageRefs = useRef([]);
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [stageHeight, setStageHeight] = useState(window.innerHeight * 0.75);
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
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
      const loadedImages = imagesToLoad.map((src, index) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => {
          if (index === imagesToLoad.length - 1) {
            setAllImagesLoaded(true);
          }
        };
        return img;
      });
      setImages(loadedImages);
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (allImagesLoaded) {
      console.log("Semua gambar telah dimuat!");
  
      // Animasi masuk untuk image 0 dan 1 dari kiri
      gsap.fromTo(
        [imageRefs.current[0], imageRefs.current[1]],
        { x: -stageWidth }, // Mulai dari luar layar kiri
        { x: imagePositions[0].x, duration: 1, ease: "power3.out", stagger: 0.2 } // Geser ke posisi yang ditentukan
      );
  
      // Animasi masuk untuk image 2 dari atas
      gsap.fromTo(
        imageRefs.current[2],
        { y: -stageHeight }, // Mulai dari luar layar atas
        { y: imagePositions[2].y, duration: 1, ease: "power3.out" } // Geser ke posisi yang ditentukan
      );
  
      // Animasi masuk untuk image 3 dari bawah
      gsap.fromTo(
        imageRefs.current[3],
        { y: stageHeight }, // Mulai dari luar layar bawah
        { y: imagePositions[3].y, duration: 1, ease: "power3.out" } // Geser ke posisi yang ditentukan
      );
  
      // Animasi masuk untuk image 4 dan 5 dari kanan
      gsap.fromTo(
        [imageRefs.current[4], imageRefs.current[5]],
        { x: stageWidth }, // Mulai dari luar layar kanan
        { x: imagePositions[4].x, duration: 1, ease: "power3.out", stagger: 0.2 } // Geser ke posisi yang ditentukan
      );
    }
  }, [allImagesLoaded]);
  

  useEffect(() => {
    const updateStageSize = () => {
      setStageWidth(window.innerWidth);
      setStageHeight(window.innerHeight * 0.75);
    };

    // Tambahkan event listener untuk menangani perubahan ukuran jendela
    window.addEventListener("resize", updateStageSize);

    // Hapus event listener saat komponen dibongkar
    return () => window.removeEventListener("resize", updateStageSize);
  }, []);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
    if (imageRefs.current[index]) {
      gsap.to(imageRefs.current[index], {
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 0.3,
        ease: "power3.inOut",
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    if (imageRefs.current[hoveredIndex]) {
      gsap.to(imageRefs.current[hoveredIndex], {
        scaleX: 1,
        scaleY: 1,
        duration: 0.3,
        ease: "power2.inOut",
      });
    }
  };

  const imageSizes = [
    { width: 300, height: 280 }, // Image 0
    { width: 300, height: 260 }, // Image 1
    { width: 330, height: 230 }, // Image 2
    { width: 270, height: 150 }, // Image 3
    { width: 439, height: 302 }, // Image 4
    { width: 390, height: 219 }, // Image 5
  ];

  const imagePositions = [
    { x: 0, y: 0 },
    { x: 0, y: stageHeight - 260 },
    { x: (stageWidth - 300) / 2, y: stageHeight * 0.23 },
    { x: (stageWidth - 250) / 3, y: stageHeight * 0.69 },
    { x: stageWidth - 419, y: -32 },
    { x: stageWidth - 416, y: stageHeight - 220 },
  ];

  const textOffsets = [
    { x: -100, y: -30 }, // Image 0
    { x: -100, y: 10 }, // Image 0
    { x: -90, y: -20 }, // Image 2
    { x: -120, y: 10 }, // Image 3
    { x: -50, y: -20 }, // Image 4
    { x: 0, y: 0 }, // Image 5
  ];


  const renderImages = () => {
    return images.map((image, index) => (
      <>
        <Image
          image={image}
          x={imagePositions[index].x}
          y={imagePositions[index].y}
          width={imageSizes[index].width}
          height={imageSizes[index].height}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          ref={(ref) => (imageRefs.current[index] = ref)}
          onClick={() => navigate('/login')}
        />
        {hoveredIndex === index && (
          <Text
            text={getTooltipContent(index)}
            x={
              imagePositions[index].x +
              imageSizes[index].width / 2 +
              textOffsets[index].x
            }
            y={
              imagePositions[index].y +
              imageSizes[index].height / 2 +
              textOffsets[index].y
            }
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => navigate('/login')}
            fontSize={20}
            fill="#fff"
            align="center"
            fontStyle="bold"
            fontFamily="Potta One"
            shadowColor="#000000"
            shadowBlur={10}
            shadowOffsetX={8}
            shadowOffsetY={8}
          />
        )}
      </>
    ));
  };

  const getTooltipContent = (index) => {
    switch (index) {
      case 0:
        return "Pariwisata Darat";
      case 1:
        return "Daerah Jawa Barat";
      case 2:
        return "Pariwisata Bahari";
      case 3:
        return "Permainan Jawa Barat";
      case 4:
        return "Kuliner Jawa Barat";
      case 5:
        return "Informasi";
      default:
        return "";
    }
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
          <Layer>{renderImages()}</Layer>
        </Stage>
      </Col>
    </Row>
  );
}

export default Maps;
