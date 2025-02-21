import React, { useEffect, useState } from "react";
import { Modal, CloseButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchGames } from "../services/gameDataServices";
import ImageUtanggaLobby from "../assets/common/uler-tangga-logo.png";
import ImageNucaLobby from "../assets/common/nuca-logo.png";
import gsap from "gsap";
import "../style/components/ModalGame.css";
//! Custom Toast Hapus jika game nusa card sudah ready
import CustomToast from "./CustomToast";

function ModalGame({ show, onHide, selectedTopic }) {
  const [games, setGames] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState(null);
  //! Componen toast hpus saat nusa card sudah ready
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames((fetchedGames) => {
      setGames(fetchedGames);
    });
  }, []);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
    const targetImg = document.querySelector(`.game-image-${index}`);
    if (targetImg) {
      gsap.to(targetImg, { scale: 1.1, duration: 0.3, ease: "power1.inOut" });
    }
  };

  const handleMouseLeave = (index) => {
    setHoveredIndex(null);
    const targetImg = document.querySelector(`.game-image-${index}`);
    if (targetImg) {
      gsap.to(targetImg, { scale: 1, duration: 0.3, ease: "power1.inOut" });
    }
  };

  const handleGameSelection = (gameID) => {
    //! Hapus condition jika game nusa card sudah ready
    if (gameID === "game2") {
      setShowToast(true);
    } else {
      navigate(`/lobby/${selectedTopic}/${gameID}`);
      onHide();
    }
  };

  return (
    <>
      <Modal
        id="modal-game"
        show={show}
        onHide={onHide}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="true"
      >
        <Modal.Body className="d-flex flex-column justify-content-center align-items-center gap-4">
          <div className="d-flex justify-content-between align-items-center w-100">
            <Modal.Title className="mx-auto fw-bold text-white">
              PILIH PERMAINAN
            </Modal.Title>
            <CloseButton variant="white" aria-label="Close" onClick={onHide} />
          </div>

          <div className="d-flex py-2 gap-5">
            {Object.keys(games).length > 0 ? (
              Object.keys(games).map((gameID, index) => (
                <div
                  key={gameID}
                  className="d-flex flex-column align-items-center"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={() => handleMouseLeave(index)}
                  onClick={() => handleGameSelection(gameID)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={gameID === "game1" ? ImageUtanggaLobby : ImageNucaLobby} 
                    alt={games[gameID].name}
                    width={150}
                    className={`game-image-${index}`}
                    style={{
                      transform:
                        hoveredIndex === index ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                  <span className="text-white fw-bold mt-2">
                    {games[gameID].name}
                  </span>
                </div>
              ))
            ) : (
              <p>No games found</p>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <CustomToast
        showToast={showToast}
        setShowToast={setShowToast}
        title="Nusa Card Game"
        body="Untuk saat ini pilihan game nusa card sedang dalam masa pengembangan, harap menunggu dan berikan kami dukungan"
        bgColor="info"
        actionType="success"
      />
    </>
  );
}

export default ModalGame;
