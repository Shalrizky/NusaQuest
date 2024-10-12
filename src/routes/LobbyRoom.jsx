import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import Header from "../components/Header";
import "../style/routes/LobbyRoom.css";
import CardPlayer from "../components/CardPlayer";

function LobbyRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State for loading spinner
  const chatContainerRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: "Abrar" }]);
      setNewMessage("");

      // Expand the chat if not already expanded
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
    return "";
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
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "100vh" }}
        >
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <CardPlayer /> // Tampilkan CardPlayer setelah loading selesai
      )}

      <Row className="mb-1 mt-5">
        <Col
          md={12}
          className="d-flex justify-content-center align-items-center"
        >
          <Button variant="primary" className="start-button">
            START
          </Button>
        </Col>
      </Row>
      <Row>
        <Col
          md={12}
          className="chat-column ms-3 mt-3 position-relative"
          onClick={(e) => {
            e.stopPropagation();
            toggleChatSize();
          }}
        >
          <div
            ref={chatContainerRef}
            className={`chat-box ${isExpanded ? "expanded" : "collapsed"}`}
            style={{ position: "absolute", bottom: isExpanded ? "100%" : "0", transition: "bottom 0.3s ease-in-out" }}
          >
            <div className="chat-messages">
              {messages.slice(0).reverse().map((msg, index) => (
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
            <Button type="submit" variant="primary" className="send-button ms-3">
              Send
            </Button>
          </form>
        </Col>
      </Row>
    </Container>
  );
}

export default LobbyRoom;
