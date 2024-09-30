import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Header from "../components/Header";  
import "../style/routes/LobbyRoom.css";
import CardLobbyRoom from "../components/RoomCardPlayer";

function LobbyRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const chatContainerRef = useRef(null); // Reference to the chat container

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: 'Abrar' }]);
      setNewMessage('');
    }
  };

  const toggleChatSize = () => {
    setIsExpanded(!isExpanded); 
  };

  // Function to handle clicking outside the chatbox
  const handleClickOutside = (event) => {
    if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
      setIsExpanded(false); // Close chatbox if clicked outside
    }
  };

  // Effect to add/remove the event listener
  useEffect(() => {
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener on component unmount or when chatbox closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const getLastMessage = () => {
    if (messages.length > 0) {
      return messages[messages.length - 1].text;
    }
    return ''; 
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
          <div 
            ref={chatContainerRef} // Assign reference to chat container
            className={`chat-container ${isExpanded ? 'expanded' : 'collapsed'}`} 
            onClick={(e) => {
              e.stopPropagation(); // Prevent toggle on chat container click
              toggleChatSize();
            }} 
          >
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className="message">
                  <strong>{msg.sender}: </strong>{msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="chat-input-form" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  newMessage.trim() === "" && !isExpanded && getLastMessage() 
                  ? `Abrar: ${getLastMessage()}` 
                  : 'Ketik pesan di sini'
                }
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
