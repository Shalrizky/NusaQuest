import { useEffect, useState } from "react";
import { Modal, CloseButton } from "react-bootstrap";
import gsap from "gsap";
import ImageLoader from "./ImageLoader"
import nucaLogo from "../../assets/common/nuca-logo.png";
import ulerTanggaLogo from "../../assets/common/uler-tangga-logo.png";
import "../../style/components/ModalGame.css";

function ModalGame({ show, onHide }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

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
      <Modal.Body className="d-flex flex-column justify-content-center align-items-center py-3 gap-5">
        <div className="d-flex justify-content-between align-items-center  pt-2 w-100 ">
          <Modal.Title className="mx-auto fw-bold text-white">
            PILIH PERMAINAN
          </Modal.Title>
          <CloseButton variant="white" aria-label="Close" onClick={onHide} />
        </div>

        <ImageLoader srcList={[ulerTanggaLogo, nucaLogo]}>
          <div className="d-flex pb-2 gap-5">
            <img
              src={ulerTanggaLogo}
              alt="Uler Tangga Logo"
              width={160}
              className={`game-image game-image-0`}
              style={{ cursor: "pointer", transform: hoveredIndex === 0 ? "scale(1.1)" : "scale(1)" }}
              onMouseEnter={() => handleMouseEnter(0)}
              onMouseLeave={() => handleMouseLeave(0)}
            />
            <img
              src={nucaLogo}
              alt="Nuca Logo"
              width={150}
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
