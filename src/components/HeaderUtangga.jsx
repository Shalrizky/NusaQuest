import React, { useState, useRef } from "react";
import { Row, Col, Image } from "react-bootstrap";
import btntemp from "../assets/common/btnTemp.png";
import iconmusik from "../assets/common/icon_musik.png";
import iconmusikOff from "../assets/common/icon_musik_off.png"; // Add an icon for music off state
import iconsfx from "../assets/common/icon_sfx.png";
import iconsfxOff from "../assets/common/icon_sfx_off.png"; // Add an icon for SFX off state
import "../style/components/HeaderUtangga.css";

function HeaderUtangga({ layout, toggleTemp }) {
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [isSfxPlaying, setIsSfxPlaying] = useState(false);
    const audioRef = useRef(null);
    const sfxRef = useRef(null);

    const handleBtnTempClick = () => {
        console.log("Button Temp clicked");
        if (toggleTemp) toggleTemp();
    };

    const handleMusicClick = () => {
        if (isMusicPlaying) {
            // Pause music
            if (audioRef.current) {
                audioRef.current.pause();
            }
        } else {
            // Play music
            if (audioRef.current) {
                audioRef.current.play();
            }
        }
        // Toggle music playing state
        setIsMusicPlaying(!isMusicPlaying);
    };

    const handleSfxClick = () => {
        if (isSfxPlaying) {
            // Pause SFX
            if (sfxRef.current) {
                sfxRef.current.pause();
            }
        } else {
            // Play SFX
            if (sfxRef.current) {
                sfxRef.current.play();
            }
        }
        // Toggle SFX playing state
        setIsSfxPlaying(!isSfxPlaying);
    };

    return (
        <>
            <audio ref={audioRef} src="/audio/background-music.mp3" preload="auto" />
            <audio ref={sfxRef} src="/audio/sfx-file.mp3" preload="auto" />
            <Row className="align-items-center mt-3">
                <Col className="d-flex justify-content-start">
                    <Image
                        src={btntemp}
                        alt="btn temp"
                        width={45}
                        className="ms-3"
                        onClick={handleBtnTempClick}
                        style={{ cursor: 'pointer' }}
                    />
                </Col>
                <Col className="d-flex justify-content-end">
                    <Image
                        src={isMusicPlaying ? iconmusik : iconmusikOff}
                        alt="icon music"
                        width={45}
                        className="me-3"
                        onClick={handleMusicClick}
                        style={{ cursor: 'pointer' }}
                    />
                    <Image
                        src={isSfxPlaying ? iconsfx : iconsfxOff}
                        alt="icon sfx"
                        width={45}
                        className="me-3"
                        onClick={handleSfxClick}
                        style={{ cursor: 'pointer' }}
                    />
                </Col>
            </Row>
        </>
    );
}

export default HeaderUtangga;
