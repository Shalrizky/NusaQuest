import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Image, Offcanvas } from "react-bootstrap";
import btntemp from "../../assets/common/btnTemp.png";
import iconmusik from "../../assets/common/icon_musik.png";
import iconmusikOff from "../../assets/common/icon_musik_off.png";
import iconsfx from "../../assets/common/icon_sfx.png";
import iconsfxOff from "../../assets/common/icon_sfx_off.png";
import "../../style/components/games/HeaderGame.css";

function HeaderUtangga({ layout, toggleTemp }) {
    const [isMusicPlaying, setIsMusicPlaying] = useState(true);
    const [isSfxPlaying, setIsSfxPlaying] = useState(false);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const audioRef = useRef(null);
    const sfxRef = useRef(null);

    useEffect(() => {
        // Memutar musik secara otomatis saat komponen dimuat
        if (audioRef.current) {
            audioRef.current.play().catch((error) => {
            });
        }
    }, []); // Hanya jalankan saat komponen di-mount

    const handleBtnTempClick = () => {
        setShowOffcanvas(true);
        if (toggleTemp) toggleTemp();
    };

    const handleMusicClick = () => {
        if (isMusicPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        } else {
            if (audioRef.current) {
                audioRef.current.play();
            }
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    const handleSfxClick = () => {
        if (isSfxPlaying) {
            if (sfxRef.current) {
                sfxRef.current.pause();
            }
        } else {
            if (sfxRef.current) {
                sfxRef.current.play();
            }
        }
        setIsSfxPlaying(!isSfxPlaying);
    };

    const handleCloseOffcanvas = () => setShowOffcanvas(false);

    return (
        <>
            <audio ref={audioRef} src={require("../../assets/sound/song1.mp3")} preload="auto" />
            <audio ref={audioRef} src={require("../../assets/sound/song2.mp3")} preload="auto" />
            <audio ref={audioRef} src={require("../../assets/sound/song3.MP3")} preload="auto" />
            <Row className="align-items-center mt-3">
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
                        src={isMusicPlaying ? iconmusik : iconmusikOff}
                        alt="icon music"
                        width={45}
                        className="me-3"
                        onClick={handleMusicClick}
                        style={{ cursor: "pointer" }}
                    />
                    <Image
                        src={isSfxPlaying ? iconsfx : iconsfxOff}
                        alt="icon sfx"
                        width={45}
                        className="me-3"
                        onClick={handleSfxClick}
                        style={{ cursor: "pointer" }}
                    />
                </Col>
            </Row>

            {/* Offcanvas component */}
            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start" className="custom-offcanvas">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Kumpulan Jawaban</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <h5>Makanan</h5>
                    <div className="answer-section">
                        <p>1. Makanan yang berasal dari Jawa Barat adalah <strong>Gudeg</strong>.</p>
                        <p>2. Makanan pedas yang berasal dari Jawa Barat adalah <strong>Seblak</strong>.</p>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default HeaderUtangga;
