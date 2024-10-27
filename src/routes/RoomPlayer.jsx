import React, { useState, useEffect, useRef } from "react";
import { database, onValue, ref, get, set, remove } from "../firebaseConfig";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Image, Spinner } from "react-bootstrap";
import { fetchRooms } from "../services/roomsDataServices";
import { getUserAchievements } from "../services/achievementDataServices";
import {
  roomsParticipation,
  syncCurrentPlayers,
} from "../services/roomsParticipation";
import useAuth from "../hooks/useAuth";
import useUserPhoto from "../hooks/useUserPhoto";
import Header from "../components/Header";
import CardPlayer from "../components/CardPlayer";
import CardVsAi from "../components/CardVsAi";
import ChatPlayer from "../components/ChatPlayer";
import PlayGameIcon from "../assets/common/play-game-icon.svg";
import "../style/routes/RoomPlayer.css";

function RoomPlayer() {
  const { gameID, topicID, roomID } = useParams();
  const { user, isLoggedIn } = useAuth();
  const [userPhoto, handlePhotoError] = useUserPhoto(user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [roomCapacity, setRoomCapacity] = useState(4);
  const [chat, setChat] = useState([]);
  const [lastMessage, setLastMessage] = useState("Chat With Others");
  const [players, setPlayers] = useState([]);
  const [newPlayerUid, setNewPlayerUid] = useState(null);
  const prevPlayers = useRef([]);

  // Effect untuk handle session expired/logout
  useEffect(() => {
    const handleSessionExpired = async () => {
      if (!isLoggedIn) {
        const playersRef = ref(
          database,
          `rooms/${topicID}/${gameID}/${roomID}/players`
        );
        const playersSnapshot = await get(playersRef);
        const currentPlayers = playersSnapshot.val() || {};

        if (user?.uid && currentPlayers[user.uid]) {
          const currentCount = Object.keys(currentPlayers).length;
          await set(
            ref(
              database,
              `rooms/${topicID}/${gameID}/${roomID}/currentPlayers`
            ),
            Math.max(0, currentCount - 1)
          );
          await remove(
            ref(
              database,
              `rooms/${topicID}/${gameID}/${roomID}/players/${user.uid}`
            )
          );
        }
        navigate("/login");
      }
    };

    handleSessionExpired();
  }, [isLoggedIn, user, topicID, gameID, roomID, navigate]);

  useEffect(() => {
    const initializeRoom = async () => {
      await syncCurrentPlayers(topicID, gameID, roomID);
      const existingPlayers = await get(
        ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`)
      );

      if (!existingPlayers.val() || !existingPlayers.val()[user.uid]) {
        await roomsParticipation(
          topicID,
          gameID,
          roomID,
          user,
          true,
          userPhoto
        );
      }
    };

    const handleLeaveRoom = async () => {
      if (user?.uid) {
        await roomsParticipation(topicID, gameID, roomID, user, false);
      }
    };

    initializeRoom();

    window.addEventListener("beforeunload", handleLeaveRoom);
    return () => {
      window.removeEventListener("beforeunload", handleLeaveRoom);
      handleLeaveRoom();
    };
  }, [user, topicID, gameID, roomID, userPhoto, navigate]);

  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true);
      try {
        fetchRooms(topicID, gameID, (rooms) => {
          if (rooms && rooms[roomID]) {
            setRoomData(rooms[roomID]);
            setRoomCapacity(rooms[roomID].capacity || 4);
          } else {
            setRoomData(null);
          }
        });
      } catch (error) {
        console.error("Error fetching room or user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [gameID, topicID, roomID]);

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
        .slice(0, roomCapacity);

      const latestPlayer = playersArray.find(
        (p) =>
          !prevPlayers.current.some((prevPlayer) => prevPlayer?.uid === p.uid)
      );
      setNewPlayerUid(latestPlayer?.uid || null);

      prevPlayers.current = playersArray;
      setPlayers(playersArray);

      await syncCurrentPlayers(topicID, gameID, roomID);
    };

    const unsubscribe = onValue(playersRef, handlePlayersUpdate);
    return () => unsubscribe();
  }, [topicID, gameID, roomID, roomCapacity]);

  if (loading || !roomData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const totalSlots = roomCapacity;
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
      .slice(0, totalSlots)
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
            isFirstPlayer={index === 0 && players.length === 1}
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
