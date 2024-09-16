import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../style/routes/LobbyRoom.css'; // Import CSS for LobbyRoom styling
import bgLobbyRoom from '../assets/common/background.png'; // Pastikan path ini benar

function LobbyRoom() {
    return (
        <Container fluid className="lobbyroom-container" style={{ backgroundImage: `url(${bgLobbyRoom})`, backgroundSize: 'cover' }}>
            <Row className="lobby-container">
                <Col md={6} className="lobby-details">
                    {/* Add content here */}
                </Col>
                <Col md={6} className="lobby-actions">
                    <h2>Waiting for Players...</h2>
                    <p>Invite your friends or wait for other players to join the room.</p>
                    <Button variant="primary">Start Game</Button> {/* Button to start the game */}
                    <Button variant="secondary">Invite Players</Button> {/* Button to invite players */}
                </Col>
            </Row>
        </Container>
    );
}

export default LobbyRoom;
