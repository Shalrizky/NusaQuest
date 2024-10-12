import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { gsap } from "gsap";
import NucaLobbyLogo from "../assets/common/nuca-lobby-logo.png";
import "../style/routes/LobbyNuca.css";
import Header from "../components/Header";
import RoomSelect from "../components/RoomSelect";

function LobbyNuca() {
  const [showRoomSelect, setShowRoomSelect] = useState(false);
  const imageRef = useRef(null);

  const handleSelectRoomClick = () => {
    setShowRoomSelect(true);
  };

  const closeRoomSelect = () => {
    setShowRoomSelect(false);
  };

  // GSAP Animation for image when component mounts
  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <Container fluid className="room-nuca-container">
      <Header showLogoIcon={false} showIcons={false} showBackIcon={true} />
      <div className="content-wrapper text-white ps-2 pt-3 md-py-3">
        <Row className="heading-row">
          <Col md={12}>
            <h1 className="fw-bold">PERMAINAN NUCA (NUSA CARD)</h1>
          </Col>
        </Row>
        <Row>
          <Col md={6} className="d-flex flex-column py-4 ps-4">
            <h5 className="mb-4">Cara Bermain :</h5>
            <ol className="text-instruksi-nuca">
              <li className="mb-3">
                Pilih Room 1-4 untuk bermain dengan pemain lain (2-4 pemain)
                atau Room 5 untuk melawan AI. Setiap pemain mendapat lima Kartu
                pertanyaan, dan permainan dimulai dengan melempar dan menjawab
                pertanyaan secara bergantian.
              </li>
              <li className="mb-3">
                Pemain memiliki waktu maksimal 1 menit untuk menjawab.
                Penggunaan "Potion of Evasion" memungkinkan pemain menghindari
                pertanyaan tanpa mengurangi jumlah Kartu, diperoleh setelah
                memenangkan tiga permainan berturut-turut.
              </li>
              <li className="mb-2">
                Permainan berakhir ketika seorang pemain menghabiskan semua
                Kartunya dan menjadi pemenang. Achievement diperoleh jika menang
                lima kali berturut-turut, dan peringkat ditentukan berdasarkan
                urutan pemain yang menghabiskan Kartunya setelah pemenang
                pertama.
              </li>
            </ol>
            <Button className="btn-lobby-nuca" onClick={handleSelectRoomClick}>
              Select Room
            </Button>
          </Col>
          <Col md={6} className="d-flex justify-content-center pt-3">
            <img
              ref={imageRef} // Attach ref to the image
              src={NucaLobbyLogo}
              alt="Nusa Quest"
              className="img-nuca-lobby d-none d-md-block"
            />
          </Col>
        </Row>

        {/* Render RoomSelect jika showRoomSelect bernilai true */}
        {showRoomSelect && <RoomSelect closeRoomSelect={closeRoomSelect} />}
      </div>
    </Container>
  );
}

export default LobbyNuca;
