import React from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import '../style/routes/LobbyRoom.css'; 
import bgLobbyRoom from '../assets/common/background.png'; 
import framePlayer from '../assets/common/FramePlayer.png'; 
import EmptySlot from '../assets/common/EmptyPlayer.png';
import ButtonStart from '../assets/common/btnStart.png';
import ChatBox from '../assets/common/ChatBox.png';

function LobbyRoom() {
    return (
        <Container fluid className="lobbyroom-container" style={{ backgroundImage: `url(${bgLobbyRoom})`, backgroundSize: 'cover' }}>
            <h1>ROOM 1</h1>
            <Row className="lobby-container">
                <Col md={6} className="lobby-details">
                    <div className="player-slots">
                        <Image src={framePlayer} alt="Frame Player" className="player-slot" />
                        <Image src={EmptySlot} alt="Player Kosong" className="player-slot" />
                        <Image src={EmptySlot} alt="Player Kosong" className="player-slot" />
                        <Image src={EmptySlot} alt="Player Kosong" className="player-slot" />
                    </div>
                    <div className="start-button-container" style={{ marginTop: '20px', textAlign: 'center' }}>
                        <Button variant="primary" className="start-button" style={{ padding: 0, border: 'none', background: 'none' }}>
                            <Image src={ButtonStart} alt="Button Start" />
                        </Button>
                    </div>
                    {/* Tambahkan ChatBox di sini */}
                    <div className="chatbox-container" style={{ marginTop: '20px' }}>
                        <Image src={ChatBox} alt="Chat Box" className="chat-box" />
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default LobbyRoom;
