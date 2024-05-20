import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { useAuth } from "../util/AuthContext";
import ImageLoader from "../util/ImageLoader";
import SifLogo from "../assets/general/sif-logo.png";
import UpjLogo from "../assets/general/upj-logo.png";
import userProfile from "../assets/general/user-icon.png";
import transleteIcon from "../assets/general/translete-icon.png";

function Header({ layout, backIcon, profileText }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <Row className="py-4 px-2 d-flex align-items-center ">
      <ImageLoader
        srcList={[backIcon, UpjLogo, SifLogo, transleteIcon, userProfile]}
      >
        {layout === "profile" && backIcon && (
          <Col
            md={1}
            sm={1}
            xs={1}
            className="ps-4 d-flex justify-content-start align-items-center"
            style={{ cursor: "pointer" }}
          >
            <img
              src={backIcon}
              alt="Back Icon"
              width={30}
              onClick={handleBackClick}
            />
          </Col>
        )}

        <Col
          md={layout === "profile" ? 3 : 4}
          sm={layout === "profile" ? 3 : 4}
          xs={4}
          className="d-flex justify-content-start align-items-center"
        >
          <img src={UpjLogo} alt="UPJ Logo" className="me-4" />
          <img src={SifLogo} alt="SIF Logo" />
        </Col>

        <Col
          md={4}
          sm={4}
          xs={layout === "profile" ? 3 : 4}
          className="d-flex justify-content-center align-items-center"
        >
          <h2 className="fw-bold text-white">{profileText}</h2>
        </Col>

        <Col
          md={4}
          sm={4}
          xs={4}
          className="d-flex justify-content-end align-items-center"
        >
          <img
            src={transleteIcon}
            alt="Translate Icon"
            width={51}
            height={51}
            className="pt-1"
          />
          <img
            src={userProfile}
            alt="User Icon"
            width={45}
            height={45}
            className="ms-4"
            onClick={handleProfileClick}
            style={{ cursor: "pointer" }}
          />
        </Col>
      </ImageLoader>
    </Row>
  );
}

export default Header;
