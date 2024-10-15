import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchRooms } from "../services/roomsDataServices"; 
import { Container, Row, Col, Image, Form, Spinner } from "react-bootstrap";
import { SendHorizontal, MessageSquareText } from "lucide-react";
import { gsap } from "gsap";
import Header from "../components/Header";
import CardPlayer from "../components/CardPlayer";
import CardVsAi from "../components/CardVsAi";
import PlayGameIcon from "../assets/common/play-game-icon.svg";
import "../style/routes/RoomPlayer.css";

function RoomPlayer() {
  const [loading, setLoading] = useState(true);
  const { gameID, topicID, roomID } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [chat, setChat] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [lastMessage, setLastMessage] = useState("Chat With Others");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatInputRef = useRef(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    fetchRooms(topicID, gameID, (rooms) => {
      if (rooms && rooms[roomID]) {
        setRoomData(rooms[roomID]);
      } else {
        setRoomData(null);
      }
      setLoading(false);
    });
  }, [gameID, topicID, roomID]);

  useEffect(() => {
    if (chat.length > 0) {
      const lastChat = chat[chat.length - 1];
      setLastMessage(`${lastChat.user}: ${lastChat.message}`);
    }
  }, [chat]);

  // Fungsi chatbox akan selalu kebawah scrollnya
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  // Close Chatbox dengan klik di luar elemen
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!roomData) {
    return <div>Room not found.</div>;
  }

  return (
    <Container fluid className="lobbyroom-container d-flex flex-column">
      <Header
        showLogoIcon={false}
        showIcons={true}
        showTextHeader={roomData.title}
        showBackIcon={true}
      />

      <Row className="d-flex flex-column justify-content-center align-items-center text-center">
        <Col
          md={12}
          className="d-flex justify-content-center mt-lg-3 mb-lg-5 mb-3"
        >
          {/* Cek apakah room adalah single player */}
          {roomData.isSinglePlayer ? <CardVsAi /> : <CardPlayer />}
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
