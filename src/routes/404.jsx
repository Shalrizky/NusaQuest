import { Container, Row, Col } from "react-bootstrap";
import Boat from "../assets/common/boat.png";
import "../style/routes/404.css";

function NotFoundPage() {
  return (
    <Container fluid id="container-404">
      <Row>
        <Col lg={12} className="d-grid justify-content-center align-items-center">
          <img src={Boat} alt="boat" id="boat404" width={450} />
          <h2 className="text-404">OOPS! 404 Page Not Found</h2>
        </Col>
      </Row>
    </Container>
  );
}

export default NotFoundPage;
