import React from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import '../style/routes/LobbyRoom.css'; 
import bgLobbyRoom from '../assets/common/background.png'; 
import framePlayer from '../assets/common/FramePlayer.png'; 
import EmptySlot from '../assets/common/EmptyPlayer.png';

function LobbyRoom() {
    return (
        <Container fluid className="lobbyroom-container" style={{ backgroundImage: `url(${bgLobbyRoom})`, backgroundSize: 'cover' }}>
            <Row className="lobby-container">
                <Col md={6} className="lobby-details">
                    <div className="player-slots">
                        <Image src={framePlayer} alt="Frame Player" className="player-slot" />
                        <Image src={EmptySlot} alt="Player Kosong" className="player-slot" />
                        <Image src={EmptySlot} alt="Player Kosong" className="player-slot" />
                        <Image src={EmptySlot} alt="Player Kosong" className="player-slot" />
                        
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default LobbyRoom;
