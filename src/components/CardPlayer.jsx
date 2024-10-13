import React, { useEffect, useRef } from "react";
import { Card, Row, Col, Image } from "react-bootstrap";
import ImagePlayer from "../assets/common/image-player-1.png";
import badge1 from "../assets/common/badge.png";
import vector from "../assets/common/Vector.png";
import "../style/components/CardPlayer.css";

const CardPlayer = () => {
  return (
    <Row className="card-player-container justify-content-center align-items-center px-4 mt-lg-3">
      <Col className="card-box d-flex justify-content-center align-items-center">
        <div className="card-wrapper">
          <Card className="card-player d-flex justify-content-center align-items-center">
            <Card.Img
              variant="top"
              src={ImagePlayer}
              className="img-card-player"
            />
            <Card.Body>
              <Card.Title className="title">KAMAL ABRAR</Card.Title>
              <div className="d-flex align-items-center gap-1 text-center">
                <Image
                  src={badge1}
                  alt="badge"
                  className="badge-image"
                  width={28}
                />
                <span className="badge-card-title">Master Kuliner</span>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="card-wrapper">
          <Card className="card-player d-flex justify-content-center align-items-center">
            <Card.Img
              variant="top"
              src={ImagePlayer}
              className="img-card-player"
            />
            <Card.Body>
              <Card.Title className="title">KAMAL ABRAR</Card.Title>
              <div className="d-flex align-items-center gap-1 text-center">
                <Image
                  src={badge1}
                  alt="badge"
                  className="badge-image"
                  width={28}
                />
                <span className="badge-card-title">Master Kuliner</span>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="card-wrapper">
          <Card className="card-player d-flex justify-content-center align-items-center">
            <Card.Img
              variant="top"
              src={ImagePlayer}
              className="img-card-player"
            />
            <Card.Body>
              <Card.Title className="title">KAMAL ABRAR</Card.Title>
              <div className="d-flex align-items-center gap-1 text-center">
                <Image
                  src={badge1}
                  alt="badge"
                  className="badge-image"
                  width={28}
                />
                <span className="badge-card-title">Master Kuliner</span>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="card-wrapper-notavail">
          <Card className="player-not-available">
            <Card.Body className="d-flex flex-column justify-content-top align-items-center mt-5 text-center gap-3">
              <Image
                src={vector}
                className="img-card-notavail img-fluid"
                width={80}
              />
              <Card.Text className="text-player-notavail">
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
