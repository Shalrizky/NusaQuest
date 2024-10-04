import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Header from "../components/Header";  
import "../style/routes/LobbyRoom.css";
import CardPlayer from "../components/CardPlayer";

function LobbyRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State for loading spinner
  const chatContainerRef = useRef(null);

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

  const handleClickOutside = (event) => {
    if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
      setIsExpanded(false); // Close chatbox if clicked outside
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Simulate loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false); // Set loading to false after 2 seconds
    }, 2000);

    return () => {
      clearTimeout(timer);
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

      {/* Menampilkan loading untuk mount card playernya */}
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" variant="light" /> 
        </div>
      ) : (
        <CardPlayer /> // Tampilkan CardPlayer setelah loading selesai
      )}

      <Row>
        <Col md={2} className="chat-column">
          <div 
            ref={chatContainerRef}
            className={`chat-container ${isExpanded ? 'expanded' : 'collapsed'}`} 
            onClick={(e) => {
              e.stopPropagation(); 
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
              <Row>
                <Col xs={8}>
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
                </Col>
                <Col xs={4}>
                  <Button type="submit" variant="primary" className="send-button">Send</Button>
                </Col>
              </Row>
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
