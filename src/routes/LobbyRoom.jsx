import React, { useState } from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import '../style/routes/LobbyRoom.css'; 
import bgLobbyRoom from '../assets/common/background.png'; 
import framePlayer from '../assets/common/FramePlayer.png'; 
import EmptySlot from '../assets/common/EmptyPlayer.png';
import ButtonStart from '../assets/common/btnStart.png';
import ChatClose from '../assets/common/chat-close.png';
import ChatOpen from '../assets/common/chat-open.png';
import Header from '../components/Header';

function LobbyRoom() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const chatBoxStyle = {
        transform: 'scale(0.6)',
        transformOrigin: 'bottom left',
        transition: 'all 0.3s ease-in-out',
        width: isChatOpen ? '574px' : '574px',
        height: isChatOpen ? '320px' : '61px',
    };

    return (
        <Container fluid className="lobbyroom-container" style={{ backgroundImage: `url(${bgLobbyRoom})`, backgroundSize: 'cover' }}>
            <Header showLogoIcon={false} showIcons={false} showBackIcon={true} />
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
                    <div className="chatbox-container" style={{ marginTop: '20px' }}>
                        <Button onClick={toggleChat} style={{ padding: 0, border: 'none', background: 'none' }}>
                            <div style={chatBoxStyle}>
                                <Image 
                                    src={isChatOpen ? ChatOpen : ChatClose} 
                                    alt={isChatOpen ? "Chat Open" : "Chat Closed"} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default LobbyRoom;