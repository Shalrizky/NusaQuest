import React, { useState, useEffect, useRef } from "react";
import { Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { database, ref, onValue } from "../firebaseConfig";
import Room1 from "../assets/common/room-select-1.png";
import Room2 from "../assets/common/room-select-2.png";
import Room3 from "../assets/common/room-select-3.png";
import Room4 from "../assets/common/room-select-4.png";
import RoomVsAi from "../assets/common/room-select-vsAI.png";
import RoomActive1 from "../assets/common/room-select-active-1.png";
import RoomActive2 from "../assets/common/room-select-active-2.png";
import RoomActive3 from "../assets/common/room-select-active-3.png";
import RoomActive4 from "../assets/common/room-select-active-4.png";
import RoomActiveVsAi from "../assets/common/room-select-active-vsAI.png";
import { gsap } from "gsap";
import "../style/components/RoomSelect.css";

function RoomSelect({ closeRoomSelect }) {
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [roomsData, setRoomsData] = useState({});
  const roomSelectRef = useRef(null);
  const navigate = useNavigate();
  const { gameID, topicID } = useParams();

  useEffect(() => {
    const roomsRef = ref(database, `rooms/${topicID}/${gameID}`);
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setRoomsData(data);
    });

    return () => unsubscribe();
  }, [topicID, gameID]);

  useEffect(() => {
    gsap.fromTo(
      roomSelectRef.current,
      { opacity: 0, y: 0 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleRoomClick = async (roomNumber) => {
    // Jika room 5 (VS AI), langsung navigate
    if (roomNumber === 5) {
      navigate(`/${gameID}/${topicID}/room${roomNumber}`);
      return;
    }

    // Untuk room multiplayer, check kapasitas
    const roomData = roomsData[`room${roomNumber}`];
    if (roomData) {
      const currentPlayers = roomData.currentPlayers || 0;
      const capacity = roomData.capacity || 4;

      if (currentPlayers >= capacity) {
        alert("This room is full. Please choose another room.");
        return;
      }
    }

    navigate(`/${gameID}/${topicID}/room${roomNumber}`);
  };

  const roomImages = {
    1: { normal: Room1, active: RoomActive1 },
    2: { normal: Room2, active: RoomActive2 },
    3: { normal: Room3, active: RoomActive3 },
    4: { normal: Room4, active: RoomActive4 },
    5: { normal: RoomVsAi, active: RoomActiveVsAi }
  };

  return (
    <div className="room-overlay" onClick={closeRoomSelect}>
      <Row
        className="room-container"
        onClick={stopPropagation}
        ref={roomSelectRef}
      >
        <div className="room-wrapper">
          {[1, 2, 3, 4, 5].map((roomNumber) => (
            <div
              key={roomNumber}
              className="room-box"
              onMouseEnter={() => setHoveredRoom(roomNumber)}
              onMouseLeave={() => setHoveredRoom(null)}
              onClick={() => handleRoomClick(roomNumber)}
            >
              <div className="room-content">
                {/* Hanya tampilkan player counter untuk room 1-4 */}
                {roomNumber !== 5 && (
                  <div className="player-counter">
                    {(roomsData[`room${roomNumber}`]?.currentPlayers || 0)} / {(roomsData[`room${roomNumber}`]?.capacity || 4)}
                  </div>
                )}
                <img
                  src={
                    hoveredRoom === roomNumber
                      ? roomImages[roomNumber].active
                      : roomImages[roomNumber].normal
                  }
                  alt={`Room ${roomNumber}`}
                  className="room-img"
                />
              </div>
            </div>
          ))}
        </div>
      </Row>
    </div>
  );
}

export default RoomSelect;