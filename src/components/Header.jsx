import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Image } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import useUserPhoto from "../hooks/useUserPhoto";
import SifLogo from "../assets/common/sif-logo.svg";
import UpjLogo from "../assets/common/upj-logo.svg";
import transleteIcon from "../assets/common/translete-flag.svg";
import BackIcon from "../assets/common/back-icon.png";
import "../style/components/Header.css";

function BackButton({ onClick, layout }) {
  return (
    <Col
      md={layout === "home" ? 1 : 4}
      sm={1}
      xs={1}
      className="d-flex justify-content-start align-items-center ps-4"
    >
      <Image
        src={BackIcon}
        alt="Back Icon"
        width={30}
        onClick={onClick}
        style={{ cursor: "pointer" }}
      />
    </Col>
  );
}

function LogoIcons({ layout }) {
  return (
    <Col
      md={layout === "home" ? 6 : 4}
      sm={layout === "home" ? 6 : 4}
      xs={layout === "home" ? 6 : 4}
      className="d-flex justify-content-start align-items-center"
    >
      <Image src={UpjLogo} alt="UPJ Logo" className="me-3" />
      <Image src={SifLogo} alt="SIF Logo" />
    </Col>
  );
}

function TextHeader({ layout, showTextHeader }) {
  return (
    <Col
      md={4}
      sm={4}
      xs={4}
      className="d-flex justify-content-center align-items-center"
    >
      <h2 className="fw-bold text-white">{showTextHeader}</h2>
    </Col>
  );
}

function ProfileIcons({
  layout,
  userPhoto,
  handleProfileClick,
  handlePhotoError,
}) {
  return (
    <Col
      md={layout === "home" ? 6 : 4}
      sm={6}
      xs={6}
      className="d-flex justify-content-end align-items-center"
    >
      <Image
        src={transleteIcon}
        alt="Translate Icon"
        width={45}
        className="me-3"
      />
      <Image
        src={userPhoto}
        alt="Profile icon"
        width={45}
        height={45}
        className="rounded-circle"
        onClick={handleProfileClick}
        onError={handlePhotoError}
        style={{ cursor: "pointer" }}
      />
    </Col>
  );
}

function Header({
  layout,
  showTextHeader,
  showBackIcon = false,
  showLogoIcon = true,
  showIcons = true,
}) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [userPhoto, handlePhotoError] = useUserPhoto(user);

  const handleProfileClick = () => {
    navigate(isLoggedIn ? "/profile" : "/login");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <Row className={`py-4 px-2 d-flex align-items-center ${layout}-layout`}>
      {showBackIcon && <BackButton layout={layout} onClick={handleBackClick} />}
      {showLogoIcon && <LogoIcons layout={layout} />}
      {showTextHeader && (
        <TextHeader showTextHeader={showTextHeader} layout={layout} />
      )}
      {showIcons && (
        <ProfileIcons
          layout={layout}
          isLoggedIn={isLoggedIn}
          userPhoto={userPhoto}
          handleProfileClick={handleProfileClick}
          handlePhotoError={handlePhotoError}
        />
      )}
    </Row>
  );
}

export default Header;
