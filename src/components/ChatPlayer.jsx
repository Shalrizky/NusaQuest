import { useState, useRef, useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { SendHorizontal, MessageSquareText } from "lucide-react";
import { gsap } from "gsap";
import "../style/components/ChatPlayer.css";

const ChatPlayer = ({ chat, setChat, user, lastMessage, setLastMessage }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatInputRef = useRef(null);
  const chatBoxRef = useRef(null);

  const sendMessage = (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== "") {
      const newMessage = { user: user.displayName, message: currentMessage };
      setChat((prevChat) => [...prevChat, newMessage]);
      setCurrentMessage("");
      setLastMessage(`${newMessage.user}: ${newMessage.message}`);
      if (!isChatOpen) openChatBox();
      setTimeout(() => scrollToBottom(), 50);
    }
  };

  const openChatBox = () => {
    setIsChatOpen(true);
    gsap.fromTo(
      chatBoxRef.current,
      { opacity: 0, y: 50, display: "block" },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.inOut" }
    );
  };

  const closeChatBox = () => {
    gsap.to(chatBoxRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(chatBoxRef.current, { display: "none" });
        setIsChatOpen(false);
      },
    });
  };

  const toggleChat = () => {
    if (isChatOpen) closeChatBox();
    else openChatBox();
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current)
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage(e);
  };

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatOpen]);

  return (
    <Row className="chat-wrapper align-items-center mt-auto">
      <Col xs={8} sm={6} md={5} lg={4}>
        <div className="chat-input-form">
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

          <button type="submit" className="btn-send-chat" onClick={sendMessage}>
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
  );
};

export default ChatPlayer;