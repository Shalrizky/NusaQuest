import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Header from "../components/Header";
import NusaMaps from "../components/Maps";
import Footer from "../components/Footer";
import Batu from "../assets/general/batu.png";
import ModalGame from "../components/ModalGame";
import NusaQuestLogo from "../assets/general/nusaQuest-logo.png";
import ImageLoader from "../util/ImageLoader";
import "../style/routes/Home.css";

function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Container fluid id="home-container">
      <Header layout="home" />
      <ImageLoader srcList={[Batu, NusaQuestLogo]}>
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
      </ImageLoader>
      <NusaMaps setShowModal={setShowModal} />
      <ModalGame show={showModal} onHide={() => setShowModal(false)} />
      <Footer textColor={"#222"} />
    </Container>
  );
}

export default Home;
