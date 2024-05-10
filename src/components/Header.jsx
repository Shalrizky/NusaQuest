import { Container, Row, Col } from "react-bootstrap";
import SifLogo from "../assets/sif-logo.png";
import UpjLogo from "../assets/upj-logo.png";
import NusaQuestLogoHome from "../assets/nusaQuest-logo-home.png";

function Header() {
  return (
    <Container fluid>
      <Row className="py-4 d-flex align-items-center">
        <Col lg={4} className="text-start ">
          <img src={UpjLogo} alt="SIF Logo" className="me-4" />
          <img src={SifLogo} alt="SIF Logo" />
        </Col>
        <Col lg={4} className="text-center d-flex justify-content-center">
          <img src={NusaQuestLogoHome} alt="Nusa Quest Logo" width={400} />
        </Col>
        <Col lg={4} className="text-end">
          <img src={UpjLogo} alt="SIF Logo" />
          <img src={SifLogo} alt="SIF Logo" className="ms-4" />
        </Col>
      </Row>
    </Container>
  );
}

export default Header;
