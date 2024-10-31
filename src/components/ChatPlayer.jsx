import { useState, useRef, useEffect, useCallback } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { SendHorizontal, MessageSquareText } from "lucide-react";
import { gsap } from "gsap";
import {
  sendMessageToChat,
  listenToChatMessages,
} from "../services/roomDataServices";
import "../style/components/ChatPlayer.css";

const ChatPlayer = ({
  user,
  userPhoto,
  handlePhotoError,
  topicID,
  gameID,
  roomID,
  lastMessage,
  setLastMessage,
}) => {
  const [chat, setChat] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatInputRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Ref to keep track of isChatOpen state
  const isChatOpenRef = useRef(isChatOpen);

  // Update the ref whenever isChatOpen changes
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  const openChatBox = useCallback(() => {
    setIsChatOpen(true);
    gsap.fromTo(
      chatBoxRef.current,
      { opacity: 0, y: 50, display: "block" },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.inOut" }
    );
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatBoxRef.current)
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, []);

  useEffect(() => {
    const unsubscribe = listenToChatMessages(
      topicID,
      gameID,
      roomID,
      (messageData) => {
        setChat((prevChat) => [...prevChat, messageData]);
        setLastMessage(`${messageData.user}: ${messageData.message}`);

        // Use the ref to get the latest value of isChatOpen
        if (messageData.user === user.displayName && !isChatOpenRef.current) {
          openChatBox();
        }

        setTimeout(() => scrollToBottom(), 50);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [
    topicID,
    gameID,
    roomID,
    user.displayName,
    openChatBox,
    scrollToBottom,
    setLastMessage,
  ]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== "") {
      const newMessage = {
        user: user.displayName,
        userPhoto: userPhoto, 
        message: currentMessage,
        timestamp: Date.now(),
      };

      try {
        await sendMessageToChat(topicID, gameID, roomID, newMessage);
        setCurrentMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const closeChatBox = useCallback(() => {
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
  }, []);

  const toggleChat = () => {
    if (isChatOpen) closeChatBox();
    else openChatBox();
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
  }, [isChatOpen, closeChatBox]);

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
                <img
                  src={chatMessage.userPhoto} // Use the userPhoto from each message
                  onError={handlePhotoError}
                  alt={`${chatMessage.user}`}
                  className="img-profile-chat"
                />
                : {chatMessage.message}
              </div>
            ))}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default ChatPlayer;
