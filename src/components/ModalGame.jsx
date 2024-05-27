import React, { useEffect, useState } from "react";
import { Modal, CloseButton } from "react-bootstrap";
import gsap from "gsap";
import ImageLoader from "../util/ImageLoader";
import nucaLogo from "../assets/general/nuca-logo.png";
import ulerTanggaLogo from "../assets/general/uler-tangga-logo.png";
import roomBg from "../assets/general/roombg.png";
import "../style/components/ModalGame.css";
import roomUtanggaLogo from "../assets/general/roomUtangga.png"; 
import { useNavigate } from "react-router-dom";

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

  const handleKartuKlik = () => {
    navigate("/RoomUtangga");
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
      style={{ backgroundImage: `url(${roomBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Modal.Body className="d-flex flex-column justify-content-center align-items-center py-3 gap-5">
        <div className="d-flex justify-content-between align-items-center pt-2 w-100">
          <Modal.Title className="mx-auto fw-bold text-white">
            PILIH PERMAINAN
          </Modal.Title>
          <CloseButton variant="white" aria-label="Close" onClick={onHide} />
        </div>

        <ImageLoader srcList={[ulerTanggaLogo, nucaLogo, roomBg]}>
          <div className="d-flex pb-2 gap-5">
            <img
              src={ulerTanggaLogo}
              alt="Uler Tangga Logo"
              width={200}  // Sesuaikan ukuran gambar logo
              className={`game-image game-image-0`}
              style={{ cursor: "pointer", transform: hoveredIndex === 0 ? "scale(1.1)" : "scale(1)" }}
              onMouseEnter={() => handleMouseEnter(0)}
              onMouseLeave={() => handleMouseLeave(0)}
              onClick={handleKartuKlik}
            />
            <img
              src={nucaLogo}
              alt="Nuca Logo"
              width={180}  // Sesuaikan ukuran gambar logo
              className={`game-image game-image-1`}
              style={{ cursor: "pointer", transform: hoveredIndex === 1 ? "scale(1.1)" : "scale(1)" }}
              onMouseEnter={() => handleMouseEnter(1)}
              onMouseLeave={() => handleMouseLeave(1)}
            />
          </div>
        </ImageLoader>
      </Modal.Body>
    </Modal>
  );
}

export default ModalGame;