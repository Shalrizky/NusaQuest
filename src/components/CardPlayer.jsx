import React, { useEffect, useRef } from "react";
import { Card, Col, Image } from "react-bootstrap";
import ImagePlayer from "../assets/common/image-player-1.png";
// import badge1 from "../assets/common/badge.png";
import vector from "../assets/common/Vector.png";
import "../style/components/CardPlayer.css";

const CardPlayer = () => {
  return (
    <Col className="card-player-container d-flex justify-content-center align-items-center px-4">
      <div className="card-wrapper">
        <Card className="card-player d-flex justify-content-center align-items-center">
          <Card.Img
            variant="top"
            src={ImagePlayer}
            className="img-card-player"
          />
          <Card.Body>
            <Card.Title className="title">KAMAL ABRAR</Card.Title>
            <div className="d-flex flex-lg-row flex-column align-items-center gap-1 text-center">
              {/* <Image src={badge1} alt="badge" className="badge-image" /> */}
              <span className="badge-card-title">Master Kuliner</span>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* <div className="card-wrapper">
        <Card className="card-player d-flex justify-content-center align-items-center">
          <Card.Img
            variant="top"
            src={ImagePlayer}
            className="img-card-player"
          />
          <Card.Body>
            <Card.Title className="title">KAMAL ABRAR</Card.Title>
            <div className="d-flex flex-lg-row flex-column align-items-center gap-1 text-center">
              <Image src={badge1} alt="badge" className="badge-image" />
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
            <div className="d-flex flex-lg-row flex-column align-items-center gap-1 text-center">
              <Image src={badge1} alt="badge" className="badge-image" />
              <span className="badge-card-title">Master Kuliner</span>
            </div>
          </Card.Body>
        </Card>
      </div> */}

      <div className="card-wrapper-notavail">
        <Card className="player-not-available">
          <Card.Body className="d-flex flex-column justify-content-top align-items-center mt-5 text-center gap-3">
            <Image
              src={vector}
              className="img-card-notavail img-fluid"
              width={80}
            />
            <Card.Title className="title">Menunggu Pemain Lain Untuk Masuk</Card.Title>
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
            <Card.Title className="title">Menunggu Pemain Lain Untuk Masuk</Card.Title>
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
            <Card.Title className="title">Menunggu Pemain Lain Untuk Masuk</Card.Title>
          </Card.Body>
        </Card>
      </div>
      
      
    </Col>
  );
};

export default CardPlayer;
