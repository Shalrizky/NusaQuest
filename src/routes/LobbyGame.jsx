import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";  
import { useParams } from "react-router-dom";
import { gsap } from "gsap";
import Header from "../components/Header";
import RoomSelect from "../components/RoomSelect";
import "../style/routes/LobbyGame.css"; 
import { fetchLobbyData } from "../services/lobbyDataServices"; 

function LobbyGame() {
  const { gameID } = useParams(); // Ambil gameID dari URL
  const [lobbyData, setLobbyData] = useState(null); 
  const [showRoomSelect, setShowRoomSelect] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    fetchLobbyData(gameID, (data) => {
      if (data) {
        setLobbyData(data); 
      } else {
        setLobbyData(null); 
      }
    });
  }, [gameID]);

  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );
    }
  }, [lobbyData]); 

  const handleSelectRoomClick = () => {
    setShowRoomSelect(true);
  };

  const closeRoomSelect = () => {
    setShowRoomSelect(false);
  };

  if (!lobbyData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="lobby-container"> 
      <Header showLogoIcon={false} showIcons={false} showBackIcon={true} />
      <div className="content-wrapper text-white ps-2 pt-3 md-py-3">
        <Row className="heading-row">
          <Col md={12}>
            <h1 className="fw-bold">{lobbyData.name}</h1>
          </Col>
        </Row>
        <Row>
          <Col md={6} className="d-flex flex-column py-4 ps-4">
            <h5 className="mb-4">Cara Bermain :</h5>
            <ol className="text-instruksi-lobby"> 
              {lobbyData.instructions.map((instruction, index) => (
                <li className="mb-3" key={index}>
                  {instruction}
                </li>
              ))}
            </ol>
            <Button className="btn-lobby mb-3" onClick={handleSelectRoomClick}> 
              Select Room
            </Button>
          </Col>
          <Col md={6} className="d-flex justify-content-center pt-4">
            <img
              ref={imageRef}
              src={lobbyData.image}
              alt={lobbyData.name}
              className="img-lobby d-none d-md-block"  
            />
          </Col>
        </Row>

        {showRoomSelect && <RoomSelect closeRoomSelect={closeRoomSelect} />}
      </div>
    </Container>
  );
}

export default LobbyGame;
