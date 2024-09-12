import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import HeaderUtangga from '../components/HeaderUtangga';
import KonvaUlar from '../components/React-KonvaUlar'; // Assuming this is your Board component
import '../style/routes/UlarTangga.css'; // Import CSS for styling
import bgUlarTangga from '../assets/common/bg-ular.png'; // Import background image

function UlarTangga() {
    return (
        <Container fluid className="utangga-container" style={{ backgroundImage: `url(${bgUlarTangga})`, backgroundSize: 'cover' }}>
            <HeaderUtangga layout="home" />
            <Row className="utu-container-left">
                <Col md={6} className="utu-konva">
                    <KonvaUlar />  {/* This assumes KonvaUlar is the modified Board component to fit the design */}
                </Col>
            </Row>
        </Container>
    );
}

export default UlarTangga;
