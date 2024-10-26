import { useState, useEffect, useRef } from "react";
import { database, onValue, ref, set } from "../firebaseConfig";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Image, Spinner } from "react-bootstrap";
import { fetchRooms } from "../services/roomsDataServices";
import { getUserAchievements } from "../services/achievementDataServices";
import { roomsParticipation } from "../services/roomsParticipation";
import useAuth from "../hooks/useAuth";
import useUserPhoto from "../hooks/useUserPhoto";
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
  const [chat, setChat] = useState([]);
  const [lastMessage, setLastMessage] = useState("Chat With Others");

  const { isLoggedIn, user } = useAuth();
  const [userPhoto, handlePhotoError] = useUserPhoto(user);
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [newPlayerUid, setNewPlayerUid] = useState(null);
  const prevPlayers = useRef([]);

  useEffect(() => {
    if (isLoggedIn && user) {
      (async () => {
        const playerRef = ref(
          database,
          `rooms/${topicID}/${gameID}/${roomID}/players/${user.uid}`
        );
        await set(playerRef, {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: userPhoto,
          joinedAt: Date.now(),
        });
      })();

      const handleLeaveRoom = () => {
        roomsParticipation(topicID, gameID, roomID, user, false);
      };
      window.addEventListener("beforeunload", handleLeaveRoom);

      return () => {
        window.removeEventListener("beforeunload", handleLeaveRoom);
        handleLeaveRoom();
      };
    }
  }, [isLoggedIn, user, topicID, gameID, roomID, userPhoto]);

  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true);
      try {
        fetchRooms(topicID, gameID, (rooms) => {
          if (rooms && rooms[roomID]) {
            setRoomData(rooms[roomID]);
          } else {
            setRoomData(null);
          }
        });

        if (!isLoggedIn || !user) {
          console.warn("User is not logged in");
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Error fetching room or user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [gameID, topicID, roomID, isLoggedIn, user, navigate]);

  useEffect(() => {
    const playersRef = ref(
      database,
      `rooms/${topicID}/${gameID}/${roomID}/players`
    );

    const handlePlayersUpdate = async (snapshot) => {
      const playersData = snapshot.val() || {};
      const playerPromises = Object.values(playersData).map(async (player) => {
        const playerAchievements = await getUserAchievements(player.uid);
        const playerAchievementData = playerAchievements[gameID]?.[topicID];

        return {
          ...player,
          achievements: playerAchievementData,
          badge: playerAchievementData ? playerAchievementData.badge : null,
        };
      });

      let playersArray = await Promise.all(playerPromises);

      playersArray = playersArray
        .sort((a, b) => a.joinedAt - b.joinedAt)
        .slice(0, 4);

      const latestPlayer = playersArray.find(
        (p) => !prevPlayers.current.some((prevPlayer) => prevPlayer?.uid === p.uid)
      );
      setNewPlayerUid(latestPlayer?.uid || null);

      prevPlayers.current = playersArray;
      setPlayers(playersArray);
    };

    const unsubscribe = onValue(playersRef, handlePlayersUpdate);
    return () => unsubscribe();
  }, [topicID, gameID, roomID]);

  if (loading || !roomData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const totalSlots = 4;
  const playerBadge = players.find((player) => player.uid === user.uid)?.badge;

  const playerCards = roomData.isSinglePlayer ? (
    <CardVsAi
      key="vs-ai-card"
      username={user.displayName}
      userPhoto={userPhoto}
      handlePhotoError={handlePhotoError}
      badge={playerBadge}
      isAvailable={true}
    />
  ) : (
    [...players, ...Array(totalSlots - players.length).fill(null)]
      .slice(0, 4)
      .map((player, index) =>
        player ? (
          <CardPlayer
            key={player.uid}
            username={player.displayName}
            userPhoto={player.photoURL}
            achievements={player.achievements}
            badge={player.badge}
            handlePhotoError={handlePhotoError}
            isAvailable={true}
            isNew={player.uid === newPlayerUid}
            playerIndex={index}
          />
        ) : (
          <CardPlayer 
            key={`not-available-${index}`} 
            isAvailable={false}
            playerIndex={index}
          />
        )
      )
  );

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
          {playerCards}
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

      {!roomData.isSinglePlayer && (
        <ChatPlayer
          chat={chat}
          setChat={setChat}
          user={user}
          lastMessage={lastMessage}
          setLastMessage={setLastMessage}
        />
      )}
    </Container>
  );
}

export default RoomPlayer;