import React, { useEffect, useRef } from "react";
import { Card, Row, Col } from "react-bootstrap";
import Image from "../assets/common/image-player-1.png";
import badge1 from "../assets/common/badge.png";
import vector from "../assets/common/Vector.png";
import "../style/components/CardPlayer.css";

const CardPlayer = () => {

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
