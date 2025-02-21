import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Footer({ textColor }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/credit'); 
  };

  return (
    <Row>
      <Col
        md={12}
        className="text-center d-flex justify-content-center align-items-center mt-3"
      >
        <p
          style={{ color: textColor, cursor: "pointer", textDecoration: "underline" }}
          onClick={handleClick} 
        >
          &copy; 2024 System Information Division of UPJ. All rights reserved.
        </p>
      </Col>
    </Row>
  );
}

export default Footer;
