import { Row, Col } from "react-bootstrap";
import SifLogo from "../assets/general/sif-logo.png";
import UpjLogo from "../assets/general/upj-logo.png";

function Header() {
  return (
      <Row className="py-4 d-flex align-items-center">
        <Col lg={6} md={5} className="d-flex justify-content-start ">
          <img src={UpjLogo} alt="SIF Logo" className="me-4" />
          <img src={SifLogo} alt="SIF Logo" />
        </Col>
        <Col lg={6} md={5} className="d-flex justify-content-end">
          <img src={UpjLogo} alt="SIF Logo" />
          <img src={SifLogo} alt="SIF Logo" className="ms-4" />
        </Col>
      </Row>
  
  );
}

export default Header;
