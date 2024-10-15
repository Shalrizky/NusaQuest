import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Image, Form } from "react-bootstrap";
import { SendHorizontal, MessageSquareText } from "lucide-react";
import { gsap } from "gsap";
import Header from "../components/Header";
import CardPlayer from "../components/CardPlayer";
import CardVsAi from "../components/CardVsAi";
import PlayGameIcon from "../assets/common/play-game-icon.svg";
import "../style/routes/RoomPlayer.css";

function RoomPlayer() {
  const [chat, setChat] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [lastMessage, setLastMessage] = useState("Chat With Others");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatInputRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Fungsi chatbox akan selalu kebawah scrollnya
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (chat.length > 0) {
      const lastChat = chat[chat.length - 1];
      setLastMessage(`${lastChat.user}: ${lastChat.message}`);
    }
  }, [chat]);

  // Menyembunyikan chatbox di awal menggunakan GSAP
  useEffect(() => {
    const chatBox = chatBoxRef.current;
    gsap.set(chatBox, { opacity: 0, y: 50, display: "none" });
  }, []);

  // Close Chatbox dengan klik di berbagai halaman
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target) &&
        chatInputRef.current &&
        !chatInputRef.current.contains(event.target) &&
        isChatOpen
      ) {
        closeChatBox();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== "") {
      setChat([...chat, { user: "Abrar", message: currentMessage }]);
      setCurrentMessage("");

      if (!isChatOpen) {
        openChatBox();
      }
      setTimeout(() => scrollToBottom(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage(e);
    }
  };

  const openChatBox = () => {
    const chatBox = chatBoxRef.current;
    setIsChatOpen(true);

    gsap.fromTo(
      chatBox,
      { opacity: 0, y: 50, display: "block" },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.inOut" }
    );
  };

  const closeChatBox = () => {
    const chatBox = chatBoxRef.current;

    gsap.to(chatBox, {
      opacity: 0,
      y: 50,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(chatBox, { display: "none" });
        setIsChatOpen(false);
      },
    });
  };

  const toggleChat = () => {
    if (isChatOpen) {
      closeChatBox();
    } else {
      openChatBox();
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

      <Row className="d-flex flex-column justify-content-center align-items-center text-center">
        <Col
          md={12}
          className="d-flex justify-content-center mt-lg-3 mb-lg-5 mb-3"
        >
          <CardVsAi />
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

      <Row className="chat-wrapper align-items-center mt-auto position-relative ">
        <Col xs={8} sm={6} md={5} lg={4}>
          <div className="chat-input-form d-flex align-items-center justify-content-center position-relative">
            <button className="btn-chat-box" onClick={toggleChat}>
              <MessageSquareText />
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
              className="btn-send-chat"
              onClick={sendMessage}
            >
              <SendHorizontal />
            </button>

            {/* Render chatbox */}
            <div ref={chatBoxRef} className="chat-box">
              {chat.map((chatMessage, index) => (
                <div key={index} className="chat-message">
                  <span className="sender-name">{chatMessage.user} :</span>{" "}
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
