import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Header from "../components/Header";
import CardPlayer from "../components/CardPlayer";
import "../style/routes/RoomPlayer.css";

function LobbyRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const chatContainerRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: "Abrar" }]);
      setNewMessage("");

      if (!isExpanded) {
        setIsExpanded(true);
      }
    }
  };

  const toggleChatSize = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (newExpandedState) {
      // Disable scrolling when chat is expanded
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling when chat is collapsed
      document.body.style.overflow = "auto";
    }
  };

  const handleClickOutside = (event) => {
    if (
      chatContainerRef.current &&
      !chatContainerRef.current.contains(event.target)
    ) {
      setIsExpanded(false); // Close chatbox if clicked outside
      document.body.style.overflow = "auto"; // Re-enable scrolling when chat is closed
    }
  };

  const getLastMessage = () => {
    if (messages.length > 0) {
      return messages[messages.length - 1].text;
    }
    return "";
  };

  return (
    <Container
      fluid
      className="lobbyroom-container d-flex flex-column"
    >
      <Header
        showLogoIcon={false}
        showIcons={true}
        showTextHeader="ROOM 1"
        showBackIcon={true}
      />

      {/* Wrapper untuk CardPlayer dan tombol START */}
      <Row className="flex-grow-1 d-flex flex-column justify-content-lg-center align-items-center">
        <Col md={12} className="d-flex justify-content-center">
          <CardPlayer />
        </Col>
        <Col md={12} className="d-flex justify-content-center mt-3 mb-4">
          <Button className="start-button">START</Button>
        </Col>
      </Row>

      {/* Elemen input chat */}
      <Row className="chat-row">
        <Col
          md={12}
          className="chat-column"
          onClick={(e) => {
            e.stopPropagation();
            toggleChatSize();
          }}
        >
          <div
            ref={chatContainerRef}
            className={`chat-box ${isExpanded ? "expanded" : "collapsed"}`}
          >
            <div className="chat-messages">
              {messages
                .slice(0)
                .reverse()
                .map((msg, index) => (
                  <div key={index} className="message">
                    <strong>{msg.sender}: </strong>
                    {msg.text}
                  </div>
                ))}
            </div>
          </div>
          <form
            onSubmit={handleSendMessage}
            className="chat-input-form d-flex p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                newMessage.trim() === "" && !isExpanded && getLastMessage()
                  ? `Abrar: ${getLastMessage()}`
                  : "Ketik pesan di sini"
              }
              className="chat-input"
            />
            <Button
              type="submit"
              variant="primary"
              className="send-button ms-3"
            >
              Send
            </Button>
          </form>
        </Col>
      </Row>
    </Container>
  );
}

export default LobbyRoom;
