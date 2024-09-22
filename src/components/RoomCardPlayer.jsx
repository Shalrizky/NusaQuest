import {Card, Row, Col } from "react-bootstrap";
import Image from "../assets/common/image-player-1.png";
import "../style/components/RoomCardPlayer.css";

const CustomCard = () => {
  return (
    <Row className="card-player-container d-flex justify-content-center align-items-center gap-5">
      <Col md={2}>
        <div className="card-wrapper">
          <Card className="card-player-1">
            <Card.Img variant="top" src={Image} className="img-card-player" />
            <Card.Body>
              <Card.Title>Abar Yo</Card.Title>
              <Card.Text>
                <p>Master Kuliner</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </Col>
      <Col md={2}>       
        <div className="card-wrapper">
          <Card className="card-player-1">
            <Card.Img variant="top" src={Image} className="img-card-player" />
            <Card.Body>
              <Card.Title>Abar Yo</Card.Title>
              <Card.Text>
                <p>Master Kuliner</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </Col>
      <Col md={2}>        
        <div className="card-wrapper">
          <Card className="card-player-1">
            <Card.Img variant="top" src={Image} className="img-card-player" />
            <Card.Body>
              <Card.Title>Abar Yo</Card.Title>
              <Card.Text>
                <p>Master Kuliner</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </Col>
      <Col md={2}>       
        <div className="card-wrapper">
          <Card className="card-player-1">
            <Card.Img variant="top" src={Image} className="img-card-player" />
            <Card.Body>
              <Card.Title>Abar Yo</Card.Title>
              <Card.Text>
                <p>Master Kuliner</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default CustomCard;
