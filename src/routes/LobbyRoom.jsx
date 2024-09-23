import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image, Button, Card } from "react-bootstrap";
import Header from "../components/Header";
import ChatClose from "../assets/common/chat-close.png";
import ChatOpen from "../assets/common/chat-open.png";
import "../style/routes/LobbyRoom.css";
import CardLobbyRoom from "../components/RoomCardPlayer";

function LobbyRoom() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const chatBoxStyle = {
    transform: "scale(0.6)",
    transformOrigin: "bottom left",
    transition: "all 0.3s ease-in-out",
    width: isChatOpen ? "574px" : "574px",
    height: isChatOpen ? "320px" : "61px",
  };

  return (
    <Container fluid className="lobbyroom-container">
      <Header
        showLogoIcon={false}
        showIcons={true}
        showTextHeader="ROOM 1 "
        showBackIcon={true}
      />
      
      <CardLobbyRoom />
      <Row>
        <Col md={12} className="lobby-details">
          <div
            className="start-button-container"
          >
            <Button
              variant="primary"
              className="start-button"
            >
              START
            </Button>

            
          </div>
          <div className="chatbox-container" style={{ marginTop: "20px" }}>
            <Button
              onClick={toggleChat}
              style={{ padding: 0, border: "none", background: "none" }}
            >
              <div style={chatBoxStyle}>
                <Image
                  src={isChatOpen ? ChatOpen : ChatClose}
                  alt={isChatOpen ? "Chat Open" : "Chat Closed"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
