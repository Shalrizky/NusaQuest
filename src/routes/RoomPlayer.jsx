// RoomPlayer.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useUserPhoto from "../hooks/useUserPhoto";
import { fetchRooms } from "../services/roomsDataServices";
import { getUserAchievements } from "../services/achievementDataServices";
import { roomsParticipation } from "../services/roomsParticipation";
import { onValue, ref } from "firebase/database";
import { Container, Row, Col, Image, Spinner } from "react-bootstrap";
import Header from "../components/Header";
import CardPlayer from "../components/CardPlayer";
import ChatPlayer from "../components/ChatPlayer";
import PlayGameIcon from "../assets/common/play-game-icon.svg";
import "../style/routes/RoomPlayer.css";
import { database } from "../firebaseConfig";

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

  // Menambahkan pengguna ke room saat halaman dimuat
  useEffect(() => {
    if (isLoggedIn && user) {
      roomsParticipation(topicID, gameID, roomID, user, true, userPhoto);

      // Fungsi untuk menghapus pengguna dari room
      const handleLeaveRoom = () => {
        roomsParticipation(topicID, gameID, roomID, user, false, userPhoto);
      };
      window.addEventListener("beforeunload", handleLeaveRoom);

      return () => {
        window.removeEventListener("beforeunload", handleLeaveRoom);
        handleLeaveRoom();
      };
    }
  }, [isLoggedIn, user, topicID, gameID, roomID, userPhoto]);

  // Memuat data room dan validasi user login
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

  // Mengambil data player dan achievement secara individual
  useEffect(() => {
    const playersRef = ref(database, `rooms/${topicID}/${gameID}/${roomID}/players`);
    const unsubscribe = onValue(playersRef, async (snapshot) => {
      const playersData = snapshot.val() || {};
      const playersArray = await Promise.all(
        Object.values(playersData).slice(0, 4).map(async (player) => {
          const playerAchievements = await getUserAchievements(player.uid);
          const playerAchievementData = playerAchievements[gameID]?.[topicID];
          return {
            ...player,
            achievements: playerAchievementData,
            badge: playerAchievementData ? playerAchievementData.badge : null,
          };
        })
      );
      setPlayers(playersArray);
    });

    return () => unsubscribe();
  }, [topicID, gameID, roomID]);

  // Menampilkan loading spinner jika data belum siap
  if (loading || !roomData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Menampilkan placeholder atau data pemain jika kurang dari 4
  const totalSlots = 4;
  const playerCards = players
    .concat(Array(totalSlots - players.length).fill(null))
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
        />
      ) : (
        <CardPlayer key={`not-available-${index}`} isAvailable={false} />
      )
    );

  return (
    <Container fluid className="lobbyroom-container d-flex flex-column">
      <Header showLogoIcon={false} showIcons={true} showTextHeader={roomData.title} showBackIcon={true} />
      <Row className="d-flex flex-column justify-content-center align-items-center text-center">
        <Col md={12} className="desc-title">
          <p>{roomData.description}</p>
        </Col>
        <Col md={12} className="d-flex justify-content-center mt-lg-4 mb-lg-5 mb-3">
          {playerCards}
        </Col>
        <Col md={12} className="d-flex justify-content-center align-items-center mb-4">
          <button className="btn-start-game d-flex align-items-center justify-content-center">
            <Image className="icon-start me-2" src={PlayGameIcon} />
            Start Game
          </button>
        </Col>
      </Row>
      {!roomData.isSinglePlayer && (
        <ChatPlayer chat={chat} setChat={setChat} user={user} lastMessage={lastMessage} setLastMessage={setLastMessage} />
      )}
    </Container>
  );
}

export default RoomPlayer;
