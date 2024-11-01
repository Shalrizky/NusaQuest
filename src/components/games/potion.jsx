import React, { useState } from "react";
import { Image, Modal, Button } from "react-bootstrap";
import "../../style/components/games/potion.css";
import potionIcon from "../../assets/games/Utangga/potion1.png"; // Import ikon potion

function Potion() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleUsePotion = () => {
    // Logika ketika potion digunakan
    setShowModal(false); // Tutup modal setelah klik "Ya"
    // Lanjutkan logika permainan di sini
  };

  return (
    <>
      <div className="potion-icon" onClick={handleOpenModal}>
        <p className="potion-text">x3</p>
        <Image src={potionIcon} alt="Potion Icon" width={70} />
      </div>

      {/* modal use potion */}
      <Modal
        size="md"
        show={showModal}
        onHide={handleCloseModal}
        centered
        contentClassName="modal-use-potion"
      >
        <Modal.Body className="text-center d-flex flex-column justify-content-center align-items-center gap-2">
          <Image
            src={potionIcon}
            alt="Potion Image"
            className="modal-potion-image mb-2"
            width={90}
          />
          <p className="modal-text">
            Apakah kamu yakin ingin menggunakan{" "} <br/>
            <span className="highlight">Potion</span> untuk melewati pertanyaan
            ini?
          </p>
          <div className="d-flex justify-content-center align-items-center gap-4">
            <Button
              variant="success"
              className="modal-use-potion-button yes"
              onClick={handleUsePotion}
            >
              Ya
            </Button>
            <Button
              variant="danger"
              className="modal-use-potion-button no"
              onClick={handleCloseModal}
            >
              Tidak
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Potion;
