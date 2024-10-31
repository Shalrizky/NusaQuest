import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Image, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import useUserPhoto from "../hooks/useUserPhoto";
import Header from "../components/Header";
import CardPlayer from "../components/CardPlayer";
import CardVsAi from "../components/CardVsAi";
import ChatPlayer from "../components/ChatPlayer";
import PlayGameIcon from "../assets/common/play-game-icon.svg";
import {
  fetchRooms,
  resetRoom,
  checkRoomType,
} from "../services/roomDataServices";
import {
  fetchPlayer,
  playerJoinRoom,
  syncCurrentPlayers,
  playerLeaveRoom,
  getCurrentPlayers,
} from "../services/PlayerDataServices";
import { getUserAchievements } from "../services/achievementDataServices";
import "../style/routes/RoomPlayer.css";

function RoomPlayer() {
  const { gameID, topicID, roomID } = useParams();
  const { user, isLoggedIn } = useAuth();
  const [userPhoto, handlePhotoError] = useUserPhoto(user);
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [roomCapacity, setRoomCapacity] = useState(4);
  const [players, setPlayers] = useState([]);
  const [newPlayerUid, setNewPlayerUid] = useState(null);
  const [playerProfiles, setPlayerProfiles] = useState({});
  const [userAchievements, setUserAchievements] = useState(null);
  const [userBadge, setUserBadge] = useState(null);
  const [lastMessage, setLastMessage] = useState("Chat With Others");
  const prevPlayers = useRef([]);
  const navigate = useNavigate();

  // Handle Session Expiration or User Logout
  useEffect(() => {
    if (!isLoggedIn) {
      playerLeaveRoom(topicID, gameID, roomID, user);
      navigate("/login");
    }
  }, [isLoggedIn, user, topicID, gameID, roomID, navigate]);

  // Initialize Room and handle unmount
  useEffect(() => {
    const initializeRoom = async () => {
      if (!user?.uid) return;

      try {
        const roomType = await checkRoomType(topicID, gameID, roomID);
        if (!roomType.exists || roomType.isSinglePlayer || roomID === "room5")
          return;

        await syncCurrentPlayers(topicID, gameID, roomID);

        const currentPlayers = await getCurrentPlayers(topicID, gameID, roomID);
        if (!currentPlayers.some((p) => p.uid === user.uid)) {
          await playerJoinRoom(topicID, gameID, roomID, user, true, userPhoto);
        }
      } catch (error) {
        console.error("Error initializing room:", error);
      }
    };

    initializeRoom();

    // Hapus pemain dan reset room ketika komponen unmount
    return () => {
      if (user?.uid && roomID !== "room5") {
        playerLeaveRoom(topicID, gameID, roomID, user);
        resetRoom(topicID, gameID, roomID);
      }
    };
  }, [user, topicID, gameID, roomID, userPhoto]);

  // Memoize fetchPlayerAchievements function with useCallback
  const fetchPlayerAchievements = useCallback(
    async (player) => {
      if (!playerProfiles[player.uid]) {
        // Cek cache
        const achievements = await getUserAchievements(player.uid);
        const playerProfile = {
          ...player,
          achievements: achievements[gameID]?.[topicID],
          badge: achievements[gameID]?.[topicID]?.badge || null,
        };
        setPlayerProfiles((prev) => ({
          ...prev,
          [player.uid]: playerProfile,
        }));
        return playerProfile;
      }
      return {
        ...player,
        ...playerProfiles[player.uid],
      };
    },
    [gameID, topicID, playerProfiles]
  );

  // Fetch and Update Players
  useEffect(() => {
    if (roomID === "room5" || roomData?.isSinglePlayer) return;
  
    const handlePlayersUpdate = async (playersData) => {
      try {
        const playerPromises = playersData.map(async (player) => {
          if (!player?.uid) return null;
          return fetchPlayerAchievements(player);
        });
  
        // Filter pemain null dan urutkan berdasarkan joinedAt
        const enrichedPlayers = (await Promise.all(playerPromises)).filter(
          (player) => player !== null
        );
  
        // Urutkan pemain berdasarkan joinedAt agar posisi konsisten
        const sortedPlayers = enrichedPlayers
          .sort((a, b) => a.joinedAt - b.joinedAt)
          .slice(0, roomCapacity);
  
        // Temukan pemain baru yang masuk
        const latestPlayer = sortedPlayers.find(
          (p) =>
            !prevPlayers.current.some((prevPlayer) => prevPlayer?.uid === p.uid)
        );
  
        setNewPlayerUid(latestPlayer?.uid || null);
        prevPlayers.current = sortedPlayers;
        setPlayers(sortedPlayers);
      } catch (error) {
        console.error("Error processing players data:", error);
      }
    };
  
    const unsubscribe = fetchPlayer(
      topicID,
      gameID,
      roomID,
      handlePlayersUpdate
    );
    return () => unsubscribe();
  }, [
    topicID,
    gameID,
    roomID,
    roomCapacity,
    roomData?.isSinglePlayer,
    fetchPlayerAchievements,
  ]);

  // Fetch Room Data
  useEffect(() => {
    const fetchRoomData = async () => {
      setLoading(true);
      try {
        fetchRooms(topicID, gameID, (rooms) => {
          if (rooms?.[roomID]) {
            console.log("Room data received:", rooms[roomID]);
            setRoomData(rooms[roomID]);
            setRoomCapacity(rooms[roomID].capacity || 4);
          } else {
            console.log("No room data found");
            setRoomData(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching room data:", error);
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [gameID, topicID, roomID]);

  // Fetch User Achievements
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const achievements = await getUserAchievements(user.uid);
          const achievementData = achievements?.[gameID]?.[topicID];
          setUserAchievements(achievementData);
          setUserBadge(achievementData?.badge || null);
        } catch (error) {
          console.error("Error fetching user achievements:", error);
        }
      }
    };

    fetchUserData();
  }, [user, topicID, gameID]);

  if (loading || !roomData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Render players dengan cached data
  const playerCards = roomData.isSinglePlayer ? (
    <CardVsAi
      key="vs-ai-card"
      username={user.displayName}
      userPhoto={userPhoto}
      handlePhotoError={handlePhotoError}
      badge={userBadge}
      achievements={userAchievements}
      isAvailable={true}
    />
  ) : (
    [...players, ...Array(roomCapacity - players.length).fill(null)]
      .slice(0, roomCapacity)
      .map((player, index) => {
        return player ? (
          <CardPlayer
            key={player.uid}
            username={player.displayName}
            userPhoto={player.photoURL}
            achievements={
              playerProfiles[player.uid]?.achievements || player.achievements
            }
            badge={playerProfiles[player.uid]?.badge || player.badge}
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
        );
      })
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
          <button
            className="btn-start-game d-flex align-items-center justify-content-center"
            onClick={() => navigate(`/${gameID}/${topicID}/${roomID}/play`)}
          >
            <Image className="icon-start me-2" src={PlayGameIcon} />
            Start Game
          </button>
        </Col>
      </Row>
      {!roomData.isSinglePlayer && (
        <ChatPlayer
          user={user}
          userPhoto={userPhoto}
          handlePhotoError={handlePhotoError}
          topicID={topicID}
          gameID={gameID}
          roomID={roomID}
          lastMessage={lastMessage}
          setLastMessage={setLastMessage}
        />
      )}
    </Container>
  );
}

export default RoomPlayer;
