import React, { useEffect, useRef } from "react";
import { Card, Row, Col } from "react-bootstrap";
import Image from "../assets/common/image-player-1.png";
import badge1 from "../assets/common/badge.png";
import vector from "../assets/common/Vector.png";
import { gsap } from "gsap";
import "../style/components/CardPlayer.css";

const CardPlayer = () => {
  const cardRefs = useRef([]);

  useEffect(() => {
    // Animasi GSAP ketika ukuran layar berubah
    const updateCardSize = () => {
      const screenWidth = window.innerWidth;

      // Mengecilkan kartu secara bertahap berdasarkan ukuran layar
      if (screenWidth < 576) {
        gsap.to(cardRefs.current, { width: "140px", height: "360px", duration: 0.5 });
      } else if (screenWidth < 768) {
        gsap.to(cardRefs.current, { width: "180px", height: "400px", duration: 0.5 });
      } else if (screenWidth < 992) {
        gsap.to(cardRefs.current, { width: "200px", height: "450px", duration: 0.5 });
      } else if (screenWidth < 1200) {
        gsap.to(cardRefs.current, { width: "220px", height: "500px", duration: 0.5 });
      } else {
        gsap.to(cardRefs.current, { width: "250px", height: "555px", duration: 0.5 });
      }
    };

    // Update ukuran kartu saat pertama kali render dan ketika layar berubah ukuran
    window.addEventListener("resize", updateCardSize);
    updateCardSize();

    return () => {
      window.removeEventListener("resize", updateCardSize);
    };
  }, []);

  return (
    <Row className="card-player-container justify-content-center align-items-center mt-4 ">
      <Col
        className="card-box  d-flex  justify-content-center align-items-center gap-5 "
        // ref={(el) => (cardRefs.current[0] = el)} // Assign ref ke array
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
        <div className="player-not-available">
          <Card className="player-not-available">
            <Card.Img variant="top" src={vector} className="vector-player img-fluid" />
            <Card.Body>
              <Card.Text className="text-4">
                <p>Menunggu Pemain Lain Untuk Masuk</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default CardPlayer;
