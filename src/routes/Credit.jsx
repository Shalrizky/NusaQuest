import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import "../style/routes/Credit.css";


function Credit() {
  return (
    <Container fluid id="credit-container" >
      <Row className="d-flex align-items-center justify-content-center">
        <Col md="12" className="d-flex align-items-center justify-content-center" >
          <Card style={{ width: "18rem" }}>
            <Card.Body>
               <div></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Credit;
