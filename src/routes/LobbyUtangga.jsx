import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { gsap } from "gsap";
import roomUtanggaLogo from "../assets/common/utangga-lobby-logo.png";
import "../style/routes/LobbyUtangga.css";
import Header from "../components/Header";
import RoomSelect from "../components/RoomSelect";

function LobbyUtangga() {
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
    <Container fluid className="room-utangga-container">
      <Header showLogoIcon={false} showIcons={false} showBackIcon={true} />
      <div className="content-wrapper text-white ps-2 pt-3 md-py-3">
        <Row className="heading-row">
          <Col md={12}>
            <h1 className="fw-bold">PERMAINAN ULAR TANGGA</h1>
          </Col>
        </Row>
        <Row>
          <Col md={6} className="d-flex flex-column py-4 ps-4">
            <h5 className="mb-4">Cara Bermain :</h5>
            <ol className="text-instruksi-utangga">
              <li className="mb-3">
                Pilih Room 1-4 untuk bermain dengan pemain lain (2-4 pemain)
                atau Room 5 untuk melawan AI. Setiap pemain mendapat lima Kartu
                pertanyaan, dan permainan dimulai dengan melempar dan menjawab
                pertanyaan secara bergantian.
              </li>
              <li className="mb-3">
                Permainan dimulai dengan pemain bergantian melempar dadu. Jika
                mendapat angka 6 atau berhenti di tangga/ular, pemain menjawab
                pertanyaan pilihan ganda dalam 1 menit. Jawaban benar memberi
                keuntungan seperti lemparan tambahan atau naik tangga, sementara
                jawaban salah dapat menyebabkan turun. Potion of Evasion bisa
                digunakan untuk menghindari pertanyaan.
              </li>
              <li className="mb-2">
                Permainan berakhir ketika seorang pemain mencapai kotak terakhir
                dan menjadi pemenang. Peringkat selanjutnya ditentukan
                berdasarkan posisi pemain lainnya. Pemain dapat memperoleh
                achievement dengan memenangkan lima permainan berturut-turut.
              </li>
            </ol>
            <Button className="btn-lobby-utangga" onClick={handleSelectRoomClick}>
              Select Room
            </Button>
          </Col>
          <Col md={6} className="d-flex justify-content-center pt-3">
            <img
              ref={imageRef} // Attach ref to the image
              src={roomUtanggaLogo}
              alt="Ular Tangga"
              className="img-utangga-lobby d-none d-md-block"
            />
          </Col>
        </Row>

        {/* Render RoomSelect jika showRoomSelect bernilai true */}
        {showRoomSelect && <RoomSelect closeRoomSelect={closeRoomSelect} />}
      </div>
    </Container>
  );
}

export default LobbyUtangga;
