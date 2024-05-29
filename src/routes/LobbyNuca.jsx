import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import NucaLobbyLogo from "../assets/common/nuca-lobby-logo.png";
import "../style/routes/LobbyNuca.css";
import Header from '../components/common/Header';

function LobbyNuca() {
  return (
    <Container fluid className="room-utangga-container">
      <Header layout="profile" showLogos={false} showIcons={false} showBackIcon={true} />
      <Row>
        <Col md={12} className="text-white ps-5 pt-2">
          <h1 className="fw-bold display-5 display-md-3 display-sm-2" id="heading-utangga">
            PERMAINAN NUCA (NUSA CARD)
          </h1>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="d-flex flex-column justify-content-start text-white p-5">
          <h5 className="mb-4">Cara Bermain :</h5>
          <ol className="fs-6 text-start">
            <li className="mb-3">
              Pilih salah satu dari lima room yang tersedia, mulai dari Room 1 hingga Room 5.
            </li>
            <li className="mb-3">
              Tunggu hingga pemain lain bergabung di room yang sama dengan minimal 2 pemain dan maksimal 4 pemain.
            </li>
            <li className="mb-3">
              Permainan dimulai dengan setiap pemain secara bergantian melempar pertanyaan pilihan ganda yang telah disediakan terkait topik pada dek kartu, dengan masing-masing pemain mendapatkan lima kartu pertanyaan.
            </li>
          </ol>
          <Button className="btn-lobby-uTangga">Select Room</Button>
        </Col>
        <Col md={6} className="d-flex justify-content-center align-items-md-center align-items-sm-center">
          <img
            src={NucaLobbyLogo}
            alt="Nusa Quest Logo"
            className="img-fluid d-none d-sm-block"
            width={545}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default LobbyNuca;
