import React from "react";
import { Row, Col, Image } from "react-bootstrap";
import btntemp from "../assets/common/btnTemp.png";
import iconmusik from "../assets/common/icon_musik.png";
import iconsfx from "../assets/common/icon_sfx.png";
import "../style/components/HeaderUtangga.css";

function HeaderUtangga({ layout }) {
    return (
        <Row className="align-items-center mt-3">
            <Col className="d-flex justify-content-start">
                <Image
                    src={btntemp}
                    alt="btn temp"
                    width={45}
                    className="ms-3" 
                />
            </Col>
            <Col className="d-flex justify-content-end">
                <Image
                    src={iconmusik}
                    alt="icon music"
                    width={45}
                    className="me-3"
                />
                <Image
                    src={iconsfx}
                    alt="icon sfx"
                    width={45}
                    className="me-3"
                />
            </Col>
        </Row>
    );
}

export default HeaderUtangga;
