import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Image, Spinner } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import useUserPhoto from "../hooks/useUserPhoto";
import Header from "../components/Header";
import CardPlayer from "../components/CardPlayer";
import CardVsAi from "../components/CardVsAi";
import ChatPlayer from "../components/ChatPlayer";
import PlayGameIcon from "../assets/common/play-game-icon.svg";
import { fetchRooms, checkRoomType } from "../services/roomDataServices";
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
  const { user } = useAuth();
  const [userPhoto, handlePhotoError] = useUserPhoto(user);
  const { gameID, topicID, roomID } = useParams();
  const [loading, setLoading] = useState(true);
  const [isRoomAccessible, setIsRoomAccessible] = useState(false);
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

  // Route Url Untuk game agar dinamis
  const getGamePath = (gameID) => {
    switch (gameID) {
      case "game1":
        return "playUTangga";
      case "game2":
        return "playNuca";
      default:
        return "playUTangga";
    }
  };

  // Initialize Room and check accessibility
  useEffect(() => {
    const checkRoomAccess = async () => {
      if (!user?.uid) return;

      try {
        const roomType = await checkRoomType(topicID, gameID, roomID);
        if (!roomType.exists || roomID === "room5") {
          setIsRoomAccessible(true);
          setLoading(false);
          return;
        }

        // Check if player already in room
        const currentPlayersData = await getCurrentPlayers(
          topicID,
          gameID,
          roomID
        );
        const isPlayerInRoom = currentPlayersData.some(
          (p) => p.uid === user.uid
        );

        // Jika player sudah ada di room, tetap izinkan akses
        if (isPlayerInRoom) {
          setIsRoomAccessible(true);
          setLoading(false);
          return;
        }

        // Jika player belum ada di room, cek kapasitas
        let currentRoomData = null;
        await new Promise((resolve) => {
          fetchRooms(topicID, gameID, (rooms) => {
            if (rooms?.[roomID]) {
              currentRoomData = rooms[roomID];
            }
            resolve();
          });
        });

        if (currentRoomData) {
          const currentPlayers = currentRoomData.currentPlayers || 0;
          const capacity = currentRoomData.capacity || 4;

          if (currentPlayers < capacity) {
            setIsRoomAccessible(true);
            await playerJoinRoom(
              topicID,
              gameID,
              roomID,
              user,
              true,
              userPhoto
            );
            await syncCurrentPlayers(topicID, gameID, roomID);
          } else {
            // Room penuh dan player tidak ada di dalamnya redirect ke halaman sebelumnya
            navigate(-1);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking room access:", error);
        navigate(-1);
      }
    };

    checkRoomAccess();

    // Cleanup function hanya untuk ketika benar-benar meninggalkan room
    return () => {
      const handleRealLeave = () => {
        if (user?.uid && roomID !== "room5") {
          playerLeaveRoom(topicID, gameID, roomID, user);
          syncCurrentPlayers(topicID, gameID, roomID);
        }
      };

      // Hanya jalankan cleanup jika benar-benar meninggalkan halaman
      if (
        !window.location.pathname.includes(`/${gameID}/${topicID}/${roomID}`)
      ) {
        handleRealLeave();
      }
    };
  }, [user, topicID, gameID, roomID, userPhoto, navigate]);

  // Fetch and Update Players
  useEffect(() => {
    if (roomID === "room5") return;

    const handlePlayersUpdate = async (playersData) => {
      try {
        const playerPromises = playersData.map(async (player) => {
          if (!player?.uid) return null;

          if (!playerProfiles[player.uid]) {
            const achievements = await getUserAchievements(player.uid);
            const achievementData = achievements?.[gameID]?.[topicID] || {};
            const playerProfile = {
              ...player,
              achievements: achievementData,
              badge: achievementData?.badge || null,
            };
            setPlayerProfiles((prev) => ({
              ...prev,
              [player.uid]: playerProfile,
            }));
            return playerProfile;
          }
          return {
            ...player,
            achievements: playerProfiles[player.uid].achievements,
            badge: playerProfiles[player.uid].badge,
          };
        });

        const enrichedPlayers = (await Promise.all(playerPromises)).filter(
          (player) => player !== null
        );

        const latestPlayer = enrichedPlayers.find((p) => {
          return !prevPlayers.current.some((prevP) => prevP?.uid === p.uid);
        });

        setNewPlayerUid(latestPlayer?.uid || null);
        prevPlayers.current = enrichedPlayers;
        setPlayers(enrichedPlayers);
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
  }, [topicID, gameID, roomID, playerProfiles]);

  // Fetch Room Data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        fetchRooms(topicID, gameID, (rooms) => {
          if (rooms?.[roomID]) {
            setRoomData(rooms[roomID]);
            setRoomCapacity(rooms[roomID].capacity || 4);
          } else {
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

  // Show loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Jika room penuh dan user akses lewat link jangan render room
  if (!isRoomAccessible) {
    return null;
  }

  if (!roomData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  const isSinglePlayer = roomData.isSinglePlayer || roomID === "room5";

  const playerArray = Array.from({ length: roomCapacity }, () => null);

  // Place players in their positions
  players.forEach((player) => {
    playerArray[player.position] = player;
  });

  // Render player cards
  const playerCards = isSinglePlayer ? (
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
    playerArray.map((player, index) => {
      if (player) {
        return (
          <CardPlayer
            key={`${player.uid}-${index}`}
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
        );
      } else {
        return (
          <CardPlayer
            key={`not-available-${index}`}
            isAvailable={false}
            playerIndex={index}
          />
        );
      }
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
            onClick={() =>
              navigate(`/${gameID}/${topicID}/${roomID}/${getGamePath(gameID)}`)
            }
          >
            <Image className="icon-start me-2" src={PlayGameIcon} />
            Start Game
          </button>
        </Col>
      </Row>
      {!isSinglePlayer && (
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
