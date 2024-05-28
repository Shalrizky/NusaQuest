import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Header from "../components/common/Header";
import NusaMaps from "../components/common/NusaMaps";
import Footer from "../components/common/Footer";
import ModalGame from "../components/common/ModalGame";
import NusaQuestLogo from "../assets/common/nusaQuest-logo.png";
import Batu from "../assets/common/batu.png";
import "../style/routes/Home.css";

function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Container fluid id="home-container">
      <Header layout="home" />
      <Row>
        <Col lg={12}>
          <img src={Batu} alt="Batu Logo" id="batu" />
          <img src={NusaQuestLogo} alt="NusaQuest Logo" id="nusa-quest-logo" />
        </Col>
      </Row>
      <NusaMaps setShowModal={setShowModal} />
      <ModalGame show={showModal} onHide={() => setShowModal(false)} />
      <Footer textColor={"#222"} />
    </Container>
  );
}

export default Home;
