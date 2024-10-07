import React, { useState, useEffect, useRef } from "react";
import { Row } from "react-bootstrap";
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
import "../style/components/RoomSelect.css";
import { gsap } from "gsap"; // Import GSAP

function RoomSelect({ closeRoomSelect }) {
  const [hoveredRoom, setHoveredRoom] = useState(null); // State untuk melacak hover
  const roomSelectRef = useRef(null); // Ref untuk RoomSelect container

  useEffect(() => {
    gsap.fromTo(
      roomSelectRef.current,
      { opacity: 0, y: 0 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  // Fungsi untuk menghentikan propagasi klik di dalam kontainer
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="room-overlay" onClick={closeRoomSelect}>
      <Row
        className="room-container"
        onClick={stopPropagation}
        ref={roomSelectRef}
      >
        <div className="room-wrapper">
          {/* Room 1 */}
          <div
            className="room-box mx-lg-3 mx-2"
            onMouseEnter={() => setHoveredRoom(1)}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            <img
              src={hoveredRoom === 1 ? RoomActive1 : Room1}
              alt="Room 1"
              className="room-img"
            />
          </div>

          {/* Room 2 */}
          <div
            className="room-box mx-lg-3 mx-2"
            onMouseEnter={() => setHoveredRoom(2)}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            <img
              src={hoveredRoom === 2 ? RoomActive2 : Room2}
              alt="Room 2"
              className="room-img"
            />
          </div>

          {/* Room 3 */}
          <div
            className="room-box mx-lg-3 mx-2"
            onMouseEnter={() => setHoveredRoom(3)}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            <img
              src={hoveredRoom === 3 ? RoomActive3 : Room3}
              alt="Room 3"
              className="room-img"
            />
          </div>

          {/* Room 4 */}
          <div
            className="room-box mx-lg-3 mx-2"
            onMouseEnter={() => setHoveredRoom(4)}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            <img
              src={hoveredRoom === 4 ? RoomActive4 : Room4}
              alt="Room 4"
              className="room-img"
            />
          </div>

          {/* Room Vs AI */}
          <div
            className="room-box mx-lg-3 mx-2"
            onMouseEnter={() => setHoveredRoom(5)}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            <img
              src={hoveredRoom === 5 ? RoomActiveVsAi : RoomVsAi}
              alt="Room Vs AI"
              className="room-img"
            />
          </div>
        </div>
      </Row>
    </div>
  );
}

export default RoomSelect;
