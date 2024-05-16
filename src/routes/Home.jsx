import { useState, useEffect } from "react";
import Init from "../firebase-init";
import { getDatabase, ref, onValue } from "firebase/database";
import "../style/Home.css";
import { Container, Row, Col } from "react-bootstrap";
import Batu from "../assets/general/batu.png";
import NusaQuestLogo from "../assets/general/nusaQuest-logo.png"; // Import gambar NusaQuest Logo
import Header from "../components/Header";
import NusaMaps from "../components/Maps";
import Footer from "../components/Footer";

function Home() {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setLogoLoaded(true);
    };
    img.src = Batu;
  }, []);

  return (
    <Container fluid id="home-container">
      <Header />
      <Row>
        <Col lg={12}>
          {logoLoaded && (
            <img
              src={Batu}
              alt="Batu Logo"
              id="batu"
            />
          )}
          <img
            src={NusaQuestLogo}
            alt="NusaQuest Logo"
            id="nusa-quest-logo"
          />
        </Col>
      </Row>
      <NusaMaps />
      <Footer />
    </Container>
  );
}

export default Home;
