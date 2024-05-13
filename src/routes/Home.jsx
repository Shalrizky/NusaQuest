/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import Init from "../firebase-init";
import { getDatabase, ref, onValue } from "firebase/database";
import "../style/Home.css";
import { Container, Row, Col } from "react-bootstrap";
import Header from "../components/Header";
import Maps from "../components/Maps";
import NusaQuestLogoHome from "../assets/nusaQuest-logo-home.png";

function Home() {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Mengatur state saat gambar NusaQuest logo telah dimuat
    const img = new window.Image();
    img.onload = () => {
      setLogoLoaded(true);
    };
    img.src = NusaQuestLogoHome;
  }, []);

  return (
    <Container fluid id="home-container">
      <Header />
      <Row>
        <Col md={12}>
          {logoLoaded && (
            <img
              src={NusaQuestLogoHome}
              alt="NusaQuest Logo"
              id="nusaquest-logo"
              width={450}
            />
          )}
        </Col>
      </Row>

      <Maps />
    </Container>
  );
}

export default Home;
