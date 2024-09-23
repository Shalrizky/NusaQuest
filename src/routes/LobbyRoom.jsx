import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Header from "../components/Header";  
import "../style/routes/LobbyRoom.css";
import CardLobbyRoom from "../components/RoomCardPlayer";

function LobbyRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: 'User' }]);
      setNewMessage('');
    }
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
        <Col md={2} className="chat-column">
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className="message">
                  <strong>{msg.sender}: </strong>{msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="chat-input"
              />
              <Button type="submit" variant="primary" className="send-button">Send</Button>
            </form>
          </div>
        </Col>
        <Col md={8} className="lobby-details">
          <div className="start-button-container">
            <Button variant="primary" className="start-button">
              START
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default LobbyRoom;