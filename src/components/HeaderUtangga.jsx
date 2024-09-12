import React from "react";
import { Row, Col, Image } from "react-bootstrap";
import btntemp from "../assets/common/btnTemp.png";
import iconmusik from "../assets/common/icon_musik.png";
import iconsfx from "../assets/common/icon_sfx.png";
import "../style/components/HeaderUtangga.css";

function HeaderUtangga({ layout }) {
    //fungsi untuk mematikan atau menyalakan button//
    const handleBtnTempClick = () => {
        console.log("Button Temp clicked");
    };

    const handleMusicClick = () => {
        console.log("Music icon clicked");
    };

    const handleSfxClick = () => {
        console.log("SFX icon clicked");
    };

    return (
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
                    src={iconmusik}
                    alt="icon music"
                    width={45}
                    className="me-3"
                    onClick={handleMusicClick}
                    style={{ cursor: 'pointer' }}
                />
                <Image
                    src={iconsfx}
                    alt="icon sfx"
                    width={45}
                    className="me-3"
                    onClick={handleSfxClick}
                    style={{ cursor: 'pointer' }}
                />
            </Col>
        </Row>
    );
}

export default HeaderUtangga;
