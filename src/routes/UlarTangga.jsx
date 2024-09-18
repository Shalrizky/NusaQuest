import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import HeaderUtangga from '../components/HeaderUtangga';
import KonvaUlar from '../components/React-KonvaUlar';
import Dice from '../components/Dice'
import '../style/routes/UlarTangga.css';
import bgUlarTangga from '../assets/common/bg-ular.png';


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
                </Col>
            </Row>
        </Container>
    );
}

export default UlarTangga;
