import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import '../style/routes/LobbyRoom.css'; 
import bgLobbyRoom from '../assets/common/background.png'; 
import ButtonStart from '../assets/common/btnStart.png';
import ChatClose from '../assets/common/chat-close.png';
import ChatOpen from '../assets/common/chat-open.png';
import Header from '../components/Header';
import PlayerSlot from '../components/PlayerSlot';
import useAuth from "../hooks/useAuth";

function LobbyRoom() {
    const { user } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [players, setPlayers] = useState([
        null,
        null,
        null,
        null
    ]);

    useEffect(() => {
        if (user) {
            setPlayers(prevPlayers => [
                { id: 1, name: user.displayName || 'Player 1' },
                ...prevPlayers.slice(1)
            ]);
        }
    }, [user]);

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
                        {players.map((player, index) => (
                            <PlayerSlot key={index} player={player} />
                        ))}
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