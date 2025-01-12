import { useState } from "react";
import { Helmet } from "react-helmet";
import { Container, Row, Col } from "react-bootstrap";
import Header from "../components/Header";
import NusaMaps from "../components/NusaMaps";
import Footer from "../components/Footer";
import ModalGame from "../components/ModalGame";
import NusaQuestLogo from "../assets/common/nusaQuest-logo.png";
import Batu from "../assets/common/batu.png";
import "../style/routes/Home.css";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <>
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
          content="https://nusaquest.com/assets/favicon-512x512.png"
        />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:url" content="https://nusaquest.com/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Container fluid id="home-container">
        <Header layout="home" showBackIcon={false} />
        <Row>
          <Col lg={12}>
            <img src={Batu} alt="Batu Logo" id="batu" />
            <img
              src={NusaQuestLogo}
              alt="NusaQuest Logo"
              id="nusa-quest-logo"
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
          selectedTopic={selectedTopic}
        />
        <Footer textColor={"#222"} />
      </Container>
    </>
  );
}

export default Home;
