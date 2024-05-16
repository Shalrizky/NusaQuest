import { Row, Col } from "react-bootstrap";
import SifLogo from "../assets/general/sif-logo.png";
import UpjLogo from "../assets/general/upj-logo.png";
import userIcon from "../assets/general/user-icon.png";
import transleteIcon from "../assets/general/translete-icon.png";

function Header() {
  return (
    <Row className="py-4 d-flex align-items-center">
      <Col
        lg={6}
        md={6}
        sm={6}
        xs={6}
        className="d-flex justify-content-start "
      >
        <img src={UpjLogo} alt="SIF Logo" className="me-4" />
        <img src={SifLogo} alt="SIF Logo" />
      </Col>
      <Col
        lg={6}
        md={6}
        sm={6}
        xs={6}
        className="d-flex justify-content-end align-items-center"
      >
        <img src={transleteIcon} alt="SIF Logo" width={45} height={45} />
        <img
          src={userIcon}
          alt="SIF Logo"
          width={45}
          height={45}
          className="ms-4"
        />
      </Col>
    </Row>
  );
}

export default Header;
