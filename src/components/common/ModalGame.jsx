import React, { useEffect, useState } from "react";
import { Modal, CloseButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import nucaLogo from "../../assets/common/nuca-logo.png";
import ulerTanggaLogo from "../../assets/common/uler-tangga-logo.png";
import "../../style/components/ModalGame.css";

function ModalGame({ show, onHide }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();

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

  const handleUtanggaClick = () => {
    navigate("/LobbyUtangga");
  };
  const handleNucaClick = () => {
    navigate("/LobbyNuca");
  };

  useEffect(() => {
    return () => {
      setHoveredIndex(null);
    };
  }, []);

  return (
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
          <div className="d-flex flex-column align-items-center ">
            <img
              src={ulerTanggaLogo}
              alt="Uler Tangga Logo"
              width={160} 
              className={`game-image-0`}
              style={{ cursor: "pointer", transform: hoveredIndex === 0 ? "scale(1.1)" : "scale(1)" }}
              onMouseEnter={() => handleMouseEnter(0)}
              onMouseLeave={() => handleMouseLeave(0)}
              onClick={handleUtanggaClick}
            />
            <span className="text-white fw-bold">Ular Tangga</span>
          </div>
          <div className="d-flex flex-column align-items-center text-center pt-2 gap-2">
            <img
              src={nucaLogo}
              alt="Nuca Logo"
              width={135}  
              className={` game-image-1`}
              style={{ cursor: "pointer", transform: hoveredIndex === 1 ? "scale(1.1)" : "scale(1)" }}
              onMouseEnter={() => handleMouseEnter(1)}
              onMouseLeave={() => handleMouseLeave(1)}
              onClick={handleNucaClick}
            />
            <span className="text-white fw-bold ">Nuca</span>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ModalGame;
