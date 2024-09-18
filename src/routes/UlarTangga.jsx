import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import HeaderUtangga from '../components/HeaderUtangga';
import KonvaUlar from '../components/React-KonvaUlar';
import Dice from '../components/Dice'
import '../style/routes/UlarTangga.css';
import bgUlarTangga from '../assets/common/bg-ular.png';

// Data pemain
const players = [
  { id: 1, name: 'Rico Rendang', photo: 'https://example.com/photo1.jpg' },
  { id: 2, name: 'Pemain 2', photo: 'https://example.com/photo2.jpg' },
  { id: 3, name: 'Pemain 3', photo: 'https://example.com/photo3.jpg' },
];

function UlarTangga() {
  return (
    <Container fluid className="utangga-container" style={{ backgroundImage: `url(${bgUlarTangga})`, backgroundSize: 'cover' }}>
      <HeaderUtangga layout="home" />
      <Row className="utu-container-left">
        <Col md={6} className="utu-konva">
          <KonvaUlar />
        </Col>
        <Col md={6} className="d-flex flex-column align-items-center justify-content-start">
          <div className="player-turn-box">
            <h3>Rico Rendang</h3>
          </div>
          <Dice /> {/* Add the Dice component here */}
          <div className="player-list mt-3">
            {players.map((player) => (
              <div key={player.id} className="player-item d-flex align-items-center">
                <Image src={player.photo} roundedCircle width={40} height={40} />
                <span className="ml-2">{player.name}</span>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default UlarTangga;