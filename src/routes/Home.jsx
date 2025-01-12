import { useState } from "react";
import { Helmet } from "react-helmet";
import { Container, Row, Col } from "react-bootstrap";
import Header from "../components/Header";
import NusaMaps from "../components/NusaMaps";
import Footer from "../components/Footer";
import ModalGame from "../components/ModalGame";
import NusaQuestLogo from "../assets/common/nusaQuest-logo.webp";
import Batu from "../assets/common/batu.webp";
import "../style/routes/Home.css";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <>
      {/* Helmet untuk konfigurasi SEO */}
      <Helmet>
        <title>NusaQuest - Explore Indonesia</title>
        <meta
          name="description"
          content="Ayo Bermain dan Jelajahi Indonesia Bersama NusaQuest"
        />
        <meta
          name="keywords"
          content="nusaquest, indonesia, gamifikasi, game, game ular tangga, game gamifikasi, NusaQuest"
        />
        <link rel="canonical" href="https://nusaquest.com/" />

        {/* Open Graph Tags (untuk media sosial secara umum) */}
        <meta property="og:title" content="NusaQuest - Explore Indonesia" />
        <meta
          property="og:description"
          content="Ayo Bermain dan Jelajahi Indonesia Bersama NusaQuest"
        />
        <meta
          property="og:image"
          content="https://nusaquest.com/assets/og-image.jpg"
        />
        <meta property="og:url" content="https://nusaquest.com/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Container fluid className="home-container">
        <Header layout="home" showBackIcon={false} />
        <Row>
          <Col lg={12} className="text-center">
            <img
              src={Batu}
              alt="Logo Batu Ikonik NusaQuest"
              className="img-fluid"
            />
            <img
              src={NusaQuestLogo}
              alt="Logo NusaQuest"
              className="img-fluid"
            />
          </Col>
        </Row>
        <NusaMaps
          setShowModal={setShowModal}
          setSelectedTopic={setSelectedTopic}
        />
        <ModalGame
          show={showModal}
          onHide={() => setShowModal(false)}
          selectedTopic={selectedTopic || "Default Topic"}
        />
        <Footer textColor="#222" />
      </Container>
    </>
  );
}

export default Home;
