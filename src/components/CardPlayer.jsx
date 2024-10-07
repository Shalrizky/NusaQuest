import React, { useEffect, useRef } from "react";
import { Card, Row, Col } from "react-bootstrap";
import Image from "../assets/common/image-player-1.png";
import badge1 from "../assets/common/badge.png";
import vector from "../assets/common/Vector.png";
import "../style/components/CardPlayer.css";
import { gsap } from "gsap";

const CardPlayer = () => {
  const cardRefs = useRef([]); // Array untuk menyimpan refs kartu

  useEffect(() => {
    // Animasi GSAP ketika komponen pertama kali muncul
    gsap.fromTo(
      cardRefs.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out" }
    );

    const updateAnimation = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 576) {
        // Animasi untuk layar kecil
        gsap.to(cardRefs.current, { y: 50, duration: 0.5 });
      } else {
        gsap.to(cardRefs.current, { y: 0, duration: 0.5 });
      }
    };

    window.addEventListener("resize", updateAnimation);

    return () => {
      window.removeEventListener("resize", updateAnimation);
    };
  }, []);

  return (
    <Row className="card-player-container d-flex justify-content-center align-items-center flex-nowrap">
      {/* Kartu pertama */}
      <Col
        xs={12}
        sm={6}
        lg={3}
        className="d-flex justify-content-center mx-lg-3 mx-2 mb-4"
        ref={(el) => (cardRefs.current[0] = el)} // Assign ref ke array
      >
        <div className="card-wrapper">
          <Card className="card-player">
            <Card.Img variant="top" src={Image} className="img-card-player" />
            <Card.Body>
              <Card.Title className="title">KAMAL ABRAR</Card.Title>
              <div className="card-image-container d-flex align-items-center">
                <Card.Img src={badge1} alt="Player" className="badge-image" />
                <span className="badge-card-title">Master Kuliner</span>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Col>

      {/* Kartu kedua */}
      <Col
        xs={12}
        sm={6}
        lg={3}
        className="d-flex justify-content-center mx-lg-3 mx-2 mb-4"
        ref={(el) => (cardRefs.current[1] = el)} // Assign ref ke array
      >
        <div className="card-wrapper">
          <Card className="card-player">
            <Card.Img variant="top" src={Image} className="img-card-player" />
            <Card.Body>
              <Card.Title className="title">KAMAL ABRAR</Card.Title>
              <div className="card-image-container d-flex align-items-center">
                <Card.Img src={badge1} alt="Player" className="badge-image" />
                <span className="badge-card-title">Master Kuliner</span>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Col>

      {/* Kartu ketiga */}
      <Col
        xs={12}
        sm={6}
        lg={3}
        className="d-flex justify-content-center mx-lg-3 mx-2 mb-4"
        ref={(el) => (cardRefs.current[2] = el)} // Assign ref ke array
      >
        <div className="card-wrapper">
          <Card className="card-player">
            <Card.Img variant="top" src={Image} className="img-card-player" />
            <Card.Body>
              <Card.Title className="title">KAMAL ABRAR</Card.Title>
              <div className="card-image-container d-flex align-items-center">
                <Card.Img src={badge1} alt="Player" className="badge-image" />
                <span className="badge-card-title">Master Kuliner</span>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Col>

      {/* Kartu keempat */}
      <Col
        xs={12}
        sm={6}
        lg={3}
        className="d-flex justify-content-center mx-lg-3 mx-2 mb-4"
        ref={(el) => (cardRefs.current[3] = el)} // Assign ref ke array
      >
        <Card className="player-not-available">
          <Card.Img variant="top" src={vector} className="vector-player" />
          <Card.Body>
            <Card.Text className="text-4">
              <p>Menunggu Pemain Lain Untuk Masuk</p>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CardPlayer;
