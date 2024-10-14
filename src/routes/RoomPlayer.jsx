import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image, Form } from "react-bootstrap";
import Header from "../components/Header";
import { SendHorizontal } from "lucide-react";
import PlayGameIcon from "../assets/common/play-game-icon.svg";
import ChatIcon from "../assets/common/chat-icon.svg";
import CardPlayer from "../components/CardPlayer";
import "../style/routes/RoomPlayer.css";

function RoomPlayer() {
  const [chat, setChat] = useState([]); 
  const [currentMessage, setCurrentMessage] = useState("")
  const [lastMessage, setLastMessage] = useState(""); // Untuk placeholder pesan terakhir
  
  // Update placeholder dengan pesan terakhir
  useEffect(() => {
    if (chat.length > 0) {
      const lastChat = chat[chat.length - 1];
      setLastMessage(`${lastChat.user}: ${lastChat.message}`); 
    } else {
      setLastMessage("Chat With Others");
    }
  }, [chat]);

  // Fungsi untuk mengirim pesan
  const sendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== "") {
      setChat([...chat, { user: "Abrar", message: currentMessage }]);
      setCurrentMessage("");
    }
  };

  // Fungsi untuk mengirim pesan dengan tombol Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage(e);
    }
  };

  return (
    <Container fluid className="lobbyroom-container d-flex flex-column">
      <Header
        showLogoIcon={false}
        showIcons={true}
        showTextHeader="ROOM 1"
        showBackIcon={true}
      />

      <Row className="d-flex flex-column justify-content-center align-items-center text-center mt-3">
        <Col
          md={12}
          className="d-flex justify-content-center mt-lg-3 mb-lg-5 mb-4"
        >
          <CardPlayer />
        </Col>
        <Col
          md={12}
          className="d-flex justify-content-center align-items-center mb-4"
        >
          <button className="btn-start-game d-flex align-items-center justify-content-center">
            <Image className="icon-start me-2" src={PlayGameIcon} />
            Start Game
          </button>
        </Col>
      </Row>

      {/* Chat input row pinned to the left and responsive */}
      <Row className="chat-wrapper align-items-center mt-auto">
        <Col xs={8} sm={6} md={5} lg={4}>
          <div className="chat-input-form d-flex align-items-center justify-content-center">
            <Image src={ChatIcon} className="input-icon-left" alt="Chat Icon" />
            <Form.Control
              className="chat-input"
              aria-label="Type your message"
              placeholder={lastMessage} 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="btn-send-chat input-icon-right"
              onClick={sendMessage}
            >
              <SendHorizontal />
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default RoomPlayer;
