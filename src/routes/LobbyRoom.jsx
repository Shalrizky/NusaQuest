import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import '../style/routes/LobbyRoom.css'; 
import bgLobbyRoom from '../assets/common/background.png'; 
import framePlayer from '../assets/common/FramePlayer.png'; 

function LobbyRoom() {
    return (
        <Container fluid className="lobbyroom-container" style={{ backgroundImage: `url(${bgLobbyRoom})`, backgroundSize: 'cover' }}>
            <Row className="lobby-container">
                <Col md={6} className="lobby-details">
                    {/* Menampilkan gambar FramePlayer */}
                    <Image src={framePlayer} alt="Frame Player" fluid /> {/* Gambar akan responsif */}
                </Col>
            </Row>
        </Container>
    );
}

export default LobbyRoom;
