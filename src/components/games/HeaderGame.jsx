import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Image, Offcanvas } from "react-bootstrap";
import btntemp from "../../assets/common/btnTemp.png";
import iconmusik from "../../assets/common/icon_musik.png";
import iconmusikOff from "../../assets/common/icon_musik_off.png";
import iconsfx from "../../assets/common/icon_sfx.png";
import iconsfxOff from "../../assets/common/icon_sfx_off.png";
import song1 from "../../assets/sound/song1.mp3";
import song2 from "../../assets/sound/song2.mp3";
import song3 from "../../assets/sound/song3.mp3";
import "../../style/components/games/HeaderGame.css";

function HeaderGame({
  toggleTemp,
  hints,
  showOffcanvas,
  setShowOffcanvas,
  onCloseOffcanvas,
}) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isSfxPlaying, setIsSfxPlaying] = useState(false); // Changed to false
  const audioRef = useRef(null);
  const playlist = [song1, song2, song3];
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch((error) => {
          console.log("Playback error:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying, currentSongIndex]);

  const handleMusicClick = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleSfxClick = () => {
    setIsSfxPlaying(!isSfxPlaying);
  };

  const handleAudioEnded = () => {
    const nextSongIndex = (currentSongIndex + 1) % playlist.length;
    setCurrentSongIndex(nextSongIndex);
  };

  const handleBtnTempClick = () => {
    setShowOffcanvas(true);
    if (toggleTemp) toggleTemp();
  };

  const handleCloseOffcanvas = () => {
    if (onCloseOffcanvas) {
      onCloseOffcanvas();
    } else {
      setShowOffcanvas(false);
    }
  };

  return (
    <Row className="align-items-center my-4">
      <Col className="d-flex justify-content-start">
        <Image
          src={btntemp}
          alt="btn temp"
          width={45}
          className="ms-3"
          onClick={handleBtnTempClick}
          style={{ cursor: "pointer" }}
        />
      </Col>
      <Col className="d-flex justify-content-end">
        <Image
          src={isSfxPlaying ? iconsfx : iconsfxOff}
          alt="icon sfx"
          width={45}
          className="me-3"
          onClick={handleSfxClick}
          style={{ cursor: "pointer" }}
        />
        <Image
          src={isMusicPlaying ? iconmusik : iconmusikOff}
          alt="icon music"
          width={45}
          className="me-3"
          onClick={handleMusicClick}
          style={{ cursor: "pointer" }}
        />
      </Col>
      <audio
        ref={audioRef}
        src={playlist[currentSongIndex]}
        onEnded={handleAudioEnded}
        autoPlay={false}
        loop={false}
      />
      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="start"
        className="custom-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Kumpulan Jawaban</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {hints && hints.length > 0 && (
            <div className="hint-section">
              <h5>Hints</h5>
              <ul className="answer-section">
                {hints.map((hint, index) => (
                  <li key={index}>
                    <strong>{index + 1}.</strong> {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </Row>
  );
}

export default HeaderGame;
