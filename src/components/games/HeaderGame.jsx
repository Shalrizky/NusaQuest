import { useState, useEffect, useRef } from "react";
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
  hints,
  showOffcanvas,
  setShowOffcanvas,
  onCloseOffcanvas,
}) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isSfxPlaying, setIsSfxPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const audioRef = useRef(null);
  const playlist = [song1, song2, song3];
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // Deteksi user interaction pertama kali dan auto play musik
  useEffect(() => {
    const handleFirstInteraction = async () => {
      setHasUserInteracted(true);
      
      // Auto play musik setelah user interaction pertama
      if (!hasAutoPlayed && audioRef.current) {
        try {
          await audioRef.current.play();
          setIsMusicPlaying(true);
          setHasAutoPlayed(true);
        } catch (error) {
          console.log("Auto play musik gagal:", error);
        }
      }
      
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
    };

    // Add event listeners untuk berbagai jenis interaksi
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('scroll', handleFirstInteraction); 

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
    };
  }, [hasAutoPlayed]);

  // Handle perubahan lagu
  useEffect(() => {
    if (audioRef.current && isMusicPlaying && hasUserInteracted) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentSongIndex, isMusicPlaying, hasUserInteracted]);

  const toggleMusic = async () => {
    if (!hasUserInteracted) {
      console.log("User belum berinteraksi, musik tidak bisa diputar");
      return;
    }

    try {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        await audioRef.current.play();
        setIsMusicPlaying(true);
        if (!hasAutoPlayed) {
          setHasAutoPlayed(true);
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsMusicPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    setCurrentSongIndex((prev) => (prev + 1) % playlist.length);
  };

  return (
    <>
      <Row className="align-items-center my-4">
        <Col className="d-flex justify-content-start">
          <Image
            src={btntemp}
            alt="btn temp"
            width={45}
            className="ms-3"
            onClick={() => setShowOffcanvas(true)}
            style={{ cursor: "pointer" }}
          />
        </Col>
        <Col className="d-flex justify-content-end">
          <Image
            src={isSfxPlaying ? iconsfx : iconsfxOff}
            alt="icon sfx"
            width={45}
            className="me-3"
            onClick={() => setIsSfxPlaying(!isSfxPlaying)}
            style={{ cursor: "pointer" }}
          />
          <Image
            src={isMusicPlaying ? iconmusik : iconmusikOff}
            alt="icon music"
            width={45}
            className="me-3"
            onClick={toggleMusic}
          />
        </Col>
        <audio
          ref={audioRef}
          src={playlist[currentSongIndex]}
          onEnded={handleAudioEnded}
          loop={false}
          preload="auto" 
        />
      </Row>

      <Offcanvas
        show={showOffcanvas}
        onHide={onCloseOffcanvas || (() => setShowOffcanvas(false))}
        placement="start"
        className="custom-offcanvas"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>Kumpulan Jawaban</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {hints?.length > 0 && (
            <div className="hint-section">
              <h5>Hints</h5>
              <ul className="answer-section">
                {hints.map((hint, i) => (
                  <li key={i}>
                    <strong>{i + 1}.</strong> {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default HeaderGame;