import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useUserPhoto from "../hooks/useUserPhoto";
import { fetchRooms } from "../services/roomsDataServices";
import { getUserAchievements } from "../services/achievementDataServices";
import { Container, Row, Col, Image, Spinner } from "react-bootstrap";
import Header from "../components/Header";
import CardPlayer from "../components/CardPlayer";
import CardVsAi from "../components/CardVsAi";
import ChatPlayer from "../components/ChatPlayer";
import PlayGameIcon from "../assets/common/play-game-icon.svg";
import "../style/routes/RoomPlayer.css";

function RoomPlayer() {
  const [loading, setLoading] = useState(true);
  const { gameID, topicID, roomID } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [badge, setBadge] = useState(null);
  const [chat, setChat] = useState([]);
  const [lastMessage, setLastMessage] = useState("Chat With Others");

  const { isLoggedIn, user } = useAuth();
  const [userPhoto, handlePhotoError] = useUserPhoto(user);
  const navigate = useNavigate();

  // Fetch data user
  useEffect(() => {
    const fetchRoomAndAchievements = async () => {
      setLoading(true);
      try {
        fetchRooms(topicID, gameID, (rooms) => {
          if (rooms && rooms[roomID]) {
            setRoomData(rooms[roomID]);
          } else {
            setRoomData(null);
          }
        });

        if (isLoggedIn && user) {
          const userAchievements = await getUserAchievements(user.uid);
          const achievementData = userAchievements[gameID]?.[topicID];
          if (achievementData) {
            setAchievements(achievementData);
            setBadge(achievementData.badge);
          } else {
            setAchievements(null);
            setBadge(null);
          }
        } else {
          console.warn("User is not logged in");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching room or user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomAndAchievements();
  }, [gameID, topicID, roomID, isLoggedIn, user, navigate]);

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
        <Col md={12} className="desc-title">
          <p>{roomData.description}</p>
        </Col>
        <Col
          md={12}
          className="d-flex justify-content-center mt-lg-4 mb-lg-5 mb-3"
        >
          {roomData.isSinglePlayer ? (
            <CardVsAi />
          ) : (
            <CardPlayer
              username={user?.displayName}
              userPhoto={userPhoto}
              achievements={achievements} // Achievement spesifik user
              badge={badge} // Badge spesifik user
              handlePhotoError={handlePhotoError}
            />
          )}
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

      <ChatPlayer
        chat={chat}
        setChat={setChat}
        user={user}
        lastMessage={lastMessage}
        setLastMessage={setLastMessage}
      />
    </Container>
  );
}

export default RoomPlayer;
