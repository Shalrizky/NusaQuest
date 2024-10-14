import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Image, Form } from "react-bootstrap";
import Header from "../components/Header";
import { SendHorizontal } from "lucide-react";
import PlayGameIcon from "../assets/common/play-game-icon.svg";
import ChatIcon from "../assets/common/chat-icon.svg";
import { gsap, Power2 } from "gsap"; // Import GSAP for animations and easing

import CardPlayer from "../components/CardPlayer";
import "../style/routes/RoomPlayer.css"; // Import file CSS

function RoomPlayer() {
  const [chat, setChat] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [lastMessage, setLastMessage] = useState("Chat With Others");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatInputRef = useRef(null);
  const chatBoxRef = useRef(null); // Ref for the chatbox

  // Function to scroll chat to the bottom
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Set chatbox to hidden (display: none) when page first loads
    if (chatBoxRef.current) {
      chatBoxRef.current.style.display = "none";
    }
  }, []);

  useEffect(() => {
    if (chat.length > 0) {
      const lastChat = chat[chat.length - 1];
      setLastMessage(`${lastChat.user} : ${lastChat.message}`);
      if (isChatOpen) {
        scrollToBottom(); // Scroll ke bawah jika ada chat baru
      }
    }
  }, [chat, isChatOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== "") {
      setChat([...chat, { user: "Abrar", message: currentMessage }]);
      setCurrentMessage("");
      setTimeout(() => scrollToBottom(), 50); // Scroll otomatis setelah kirim pesan
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage(e);
    }
  };

  const toggleChat = () => {
    const chatBox = chatBoxRef.current;

    if (isChatOpen) {
      // Animasi GSAP saat menutup chatbox dengan easing Power2
      gsap.to(chatBox, {
        y: 50, // Menggeser ke bawah
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut", 
        onComplete: () => {
          chatBox.style.display = "none"; // Sembunyikan setelah animasi selesai
        }
      });
    } else {
      chatBox.style.display = "block"; // Tampilkan sebelum animasi dimulai
      // Animasi GSAP saat membuka chatbox
      gsap.fromTo(
        chatBox,
        { y: 50, opacity: 0 }, // Mulai dari posisi di bawah dengan opacity 0
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
           ease: "power3.inOut",
        }
      );
      scrollToBottom(); // Scroll otomatis ke bawah saat chatbox dibuka
    }

    setIsChatOpen(!isChatOpen);
  };

  return (
    <Container fluid className="lobbyroom-container d-flex flex-column">
      <Header
        showLogoIcon={false}
        showIcons={true}
        showTextHeader="ROOM 1"
        showBackIcon={true}
      />

      <Row className="d-flex flex-column justify-content-center align-items-center text-center">
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

      <Row className="chat-wrapper align-items-center mt-auto position-relative">
        <Col xs={8} sm={6} md={5} lg={4}>
          <div className="chat-input-form d-flex align-items-center justify-content-center position-relative">
            <button className="btn-chat-box" onClick={toggleChat}>
              <Image
                src={ChatIcon}
                className="input-icon-left"
                alt="Chat Icon"
              />
            </button>

            <Form.Control
              ref={chatInputRef}
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

            <div ref={chatBoxRef} className="chat-box">
              {chat.map((chatMessage, index) => (
                <div key={index} className="chat-message">
                  <span className="sender-name">{chatMessage.user}</span>:{" "}
                  {chatMessage.message}
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default RoomPlayer;
