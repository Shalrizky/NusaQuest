import React, { useState } from "react";
import { Image } from "react-bootstrap";
import "../style/components/potion.css";
import potionIcon from "../assets/games/Utangga/potion.png"; // Import icon potion

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
    // alert("Potion digunakan!");
    setShowModal(false); // Tutup modal setelah klik "Yes"
    // Di sini kamu bisa melanjutkan permainan atau melakukan aksi lainnya
  };

  return (
    <>
      <div className="potion-icon mt-3" onClick={handleOpenModal}>
        <Image src={potionIcon} alt="Potion Icon" width={100}  />
      </div>

      {/* Overlay hitam transparan dan konten modal langsung */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-simple">
            <p>Menggunakan Potion akan menyelamatkanmu dari pertanyaan ini.</p>
            <p>Apakah Kamu Yakin Ingin Menggunakan Potion?</p>
            <div className="modal-buttons">
              <button className="modal-button yes" onClick={handleUsePotion}>
                Ya
              </button>
              <button className="modal-button no" onClick={handleCloseModal}>
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Potion;
