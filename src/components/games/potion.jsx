import React, { useState, useEffect } from "react";
import { Image, Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  getPotionData,
  saveNewPotionData,
} from "../../services/itemsDataServices";
import useAuth from "../../hooks/useAuth";
import "../../style/components/games/potion.css";

function Potion({ onUsePotion, isUsable }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [potionCount, setPotionCount] = useState(0);
  const [potionName, setPotionName] = useState("");
  const [potionImage, setPotionImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch potion data
  useEffect(() => {
    if (user) {
      const fetchPotionData = async () => {
        try {
          const potionData = await getPotionData(user.uid);
          if (potionData) {
            setPotionCount(potionData.item_count);
            setPotionName(potionData.item_name);
            setPotionImage(potionData.item_img);
          }
        } catch (error) {
          console.error("Error fetching potion data:", error);
        }
      };
      fetchPotionData();
    }
  }, [user]);

  const handleOpenModal = () => {
    if (isUsable && potionCount > 0 && !isLoading) {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setShowModal(false);
    }
  };

  const handleUsePotion = async () => {
    if (potionCount > 0 && isUsable && !isLoading) {
      setIsLoading(true);
      const newPotionCount = potionCount - 1;

      try {
        // Save new potion count first
        await saveNewPotionData(user.uid, {
          item_name: potionName,
          item_count: newPotionCount,
          item_img: potionImage,
        });

        // Update local state
        setPotionCount(newPotionCount);

        // Call parent handler
        await onUsePotion();
      } catch (error) {
        console.error("Error using potion:", error);
        alert("Gagal menggunakan potion. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
        setShowModal(false);
      }
    }
  };

  const getTooltipMessage = () => {
    if (potionCount === 0) {
      return "Anda tidak memiliki POE!";
    }
    if (!isUsable) {
      return "POE hanya bisa digunakan saat ada pertanyaan dan giliran Anda.";
    }
    return "Gunakan POE untuk melewati pertanyaan!";
  };

  const isDisabled = !isUsable || potionCount === 0 || isLoading;

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{getTooltipMessage()}</Tooltip>}
      >
        <div
          className={`potion-icon ${isDisabled ? "disabled" : ""}`}
          onClick={() => !isDisabled && handleOpenModal()}
          style={{
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.5 : 1,
          }}
        >
          <p className="potion-text">x{potionCount}</p>
          <Image
            src={potionImage}
            alt="Potion Icon"
            width={70}
            style={{
              filter: isDisabled ? "grayscale(100%)" : "none",
            }}
          />
        </div>
      </OverlayTrigger>

      <Modal
        size="md"
        show={showModal}
        onHide={handleCloseModal}
        centered
        contentClassName="modal-use-potion"
        backdrop={isLoading ? "static" : true}
        keyboard={!isLoading}
      >
        <Modal.Body className="text-center d-flex flex-column justify-content-center align-items-center gap-2">
          <Image
            src={potionImage}
            alt="Potion Image"
            className="modal-potion-image mb-2"
            width={90}
          />
          <p className="modal-text">
            Apakah kamu yakin ingin menggunakan <br />
            <span className="highlight">{potionName}</span> untuk melewati
            pertanyaan ini?
          </p>
          <div className="d-flex justify-content-center align-items-center gap-4">
            <Button
              variant="success"
              className="modal-use-potion-button yes"
              onClick={handleUsePotion}
              disabled={isLoading}
            >
              {isLoading ? "Menggunakan..." : "Ya"}
            </Button>
            <Button
              variant="danger"
              className="modal-use-potion-button no"
              onClick={handleCloseModal}
              disabled={isLoading}
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
